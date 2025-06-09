// app/pages/search-results/script.js - Fixed version

let searchResults = null;

// Load results when page loads
window.addEventListener('DOMContentLoaded', () => {
    loadResults();
});

async function loadResults() {
    try {
        const resultsPath = localStorage.getItem('searchResultsPath');

        if (resultsPath && window.magicLantern) {
            // Load results using IPC
            console.log('Loading results from:', resultsPath);
            const results = await window.magicLantern.readResultsFile(resultsPath);

            if (results && results.length > 0) {
                displayResults(results);
            } else {
                // Try to find the most recent results file
                const recentResults = await window.magicLantern.findRecentResults();
                if (recentResults) {
                    displayResults(recentResults);
                } else {
                    showNoResultsMessage();
                }
            }
        } else {
            // No path saved, try to find recent results
            console.log('No results path in localStorage, checking for recent files...');
            const recentResults = await window.magicLantern.findRecentResults();
            if (recentResults) {
                displayResults(recentResults);
            } else {
                // Fallback to mock data for testing
                console.log('No results found, using mock data');
                displayResults(getMockSearchResults());
            }
        }
    } catch (error) {
        console.error('Error loading results:', error);
        document.getElementById('film-results-container').innerHTML =
            '<div class="notice-box" style="border-color: var(--error-border); background: var(--error-bg);">' +
            '<p><strong>Error loading results:</strong> ' + error.message + '</p>' +
            '</div>';
    }
}

function showNoResultsMessage() {
    document.getElementById('film-results-container').innerHTML =
        '<div class="notice-box">' +
        '<p><strong>No search results found.</strong> Please run a search from the home page first.</p>' +
        '<button class="btn btn-primary" onclick="window.location.href=\'../home/index.html\'">Go to Search</button>' +
        '</div>';
}

function displayResults(results) {
    searchResults = results;

    // Update header timestamp
    const timestamp = localStorage.getItem('searchTimestamp') || new Date().toISOString();
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('results-timestamp').textContent = formattedDate;

    // Update summary statistics
    let totalSources = 0;
    let uniqueSources = 0;
    let treasuresCount = 0;

    results.forEach(filmResult => {
        totalSources += filmResult.sources.length;
        uniqueSources += filmResult.totalUniqueSources || filmResult.sources.length;

        // Count sources with high scores as "treasures" for now
        filmResult.sources.forEach(source => {
            if (source.scoring && source.scoring.finalScore >= 80) {
                treasuresCount++;
            }
        });
    });

    document.getElementById('films-count').textContent = results.length;
    document.getElementById('sources-count').textContent = totalSources;
    document.getElementById('unique-count').textContent = uniqueSources;
    document.getElementById('treasures-count').textContent = treasuresCount;

    // Display film results
    const container = document.getElementById('film-results-container');
    container.innerHTML = '';

    results.forEach(filmResult => {
        const filmElement = createFilmSection(filmResult);
        container.appendChild(filmElement);
    });

    // Animate the strategy bars after a short delay
    setTimeout(() => {
        document.querySelectorAll('.strategy-fill-bar').forEach(bar => {
            bar.style.width = bar.getAttribute('data-width');
        });
    }, 100);
}

function createSourceCard(source, film) {
    const template = document.getElementById('source-item-template');
    const card = template.content.cloneNode(true);

    // Create a checkbox container at the top of the card
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'source-checkbox-container';
    checkboxContainer.innerHTML = `
        <input type="checkbox" 
            class="source-checkbox" 
            id="source-${source.id}"
            data-source-id="${source.id}"
            data-film-title="${film.title}">
        <label for="source-${source.id}">Save</label>
    `;

    // Insert checkbox as first element in the card
    const sourceCard = card.querySelector('.source-card');
    sourceCard.insertBefore(checkboxContainer, sourceCard.firstChild);

    // Set score
    const score = source.scoring ? source.scoring.finalScore.toFixed(1) : '—';
    card.querySelector('.score-badge').textContent = `SCORE: ${score}`;

    // Set publication
    const publication = source.scoring?.publication || extractPublicationFromId(source.id);
    card.querySelector('.publication-name').textContent = formatPublicationName(publication);

    // Set metadata
    const date = extractDateFromSource(source);
    const foundBy = source.foundBy || 'unknown';
    card.querySelector('.source-meta').innerHTML = `
        ${date} • Page ${extractPageNumber(source.id)}
        <span class="found-by-badge">${formatStrategyName(foundBy)}</span>
    `;

    // Set excerpt - FIXED to show the actual excerpt from search results
    const excerptDiv = card.querySelector('.source-excerpt');
    const excerpt = extractExcerpt(source);

    if (excerpt) {
        // We have an excerpt from the search results
        excerptDiv.innerHTML = formatExcerpt(excerpt);
    } else if (source.fullText && source.fullTextFetched) {
        // Future: when full text is fetched
        excerptDiv.innerHTML = formatExcerpt(source.fullText.substring(0, 300));
    } else {
        // No excerpt available
        excerptDiv.innerHTML = '<em>No preview available</em>';
        excerptDiv.style.opacity = '0.6';
    }

    // Set links
    const lanternUrl = source.links?.self || `https://lantern.mediahist.org/catalog/${source.id}`;
    const iaUrl = extractInternetArchiveUrl(source);

    const primaryLink = card.querySelector('.source-link.primary');
    primaryLink.href = lanternUrl;

    const iaLink = card.querySelectorAll('.source-link')[1];
    if (iaUrl) {
        iaLink.href = iaUrl;
    } else {
        iaLink.style.display = 'none';
    }

    // Update "Fetch Full Text" button for future functionality
    const fetchButton = card.querySelector('.fetch-full-text');
    if (source.fullTextFetched) {
        fetchButton.textContent = 'Full Text Available';
        fetchButton.disabled = true;
        fetchButton.style.opacity = '0.6';
    } else {
        // For now, disable since feature not implemented
        fetchButton.textContent = 'Fetch Full Text (Coming Soon)';
        fetchButton.disabled = true;
        fetchButton.style.opacity = '0.6';
        // Future: fetchButton.onclick = () => fetchFullText(source.id, film);
    }

    return card;
}

// Updated extract excerpt function to properly get the excerpt
function extractExcerpt(source) {
    // Check for body text in attributes (this is where Lantern puts the excerpt)
    if (source.attributes?.body?.attributes?.value) {
        return source.attributes.body.attributes.value;
    }

    // Check for body text at top level (older format)
    if (source.body) {
        return source.body;
    }

    // Check for snippet or highlight
    if (source.snippet) {
        return source.snippet;
    }

    // Check for highlighting in search results
    if (source.attributes?.read_search_highlighting?.attributes?.value) {
        // Extract any visible text from the highlighting HTML
        const match = source.attributes.read_search_highlighting.attributes.value.match(/>([^<]+)</);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

// Keep the rest of the functions as they are...
function createFilmSection(filmResult) {
    const template = document.getElementById('film-result-template');
    const filmSection = template.content.cloneNode(true);

    const film = filmResult.film;

    // Set film information
    filmSection.querySelector('.film-title').textContent = `${film.title} (${film.year})`;

    const metaParts = [];
    if (film.author && film.author !== '-') metaParts.push(`Author: ${film.author}`);
    if (film.director && film.director !== '-') metaParts.push(`Director: ${film.director}`);
    if (film.studio && film.studio !== '-') metaParts.push(`Studio: ${film.studio}`);

    filmSection.querySelector('.film-meta').textContent = metaParts.join(' | ');
    filmSection.querySelector('.sources-badge').textContent = `${filmResult.totalUniqueSources} SOURCES`;

    // Create strategy bars
    if (filmResult.searchStrategySummary) {
        const barsContainer = filmSection.querySelector('.strategy-bars');
        const maxCount = Math.max(...Object.values(filmResult.searchStrategySummary));

        Object.entries(filmResult.searchStrategySummary)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .forEach(([strategy, count]) => {
                const bar = createStrategyBar(strategy, count, maxCount);
                barsContainer.appendChild(bar);
            });
    }

    // Create source cards
    const sourcesContainer = filmSection.querySelector('.sources-container');
    const sourcesToShow = filmResult.sources.slice(0, 10);

    sourcesToShow.forEach(source => {
        const sourceCard = createSourceCard(source, film);
        sourcesContainer.appendChild(sourceCard);
    });

    // Add "show more" button if needed
    if (filmResult.sources.length > 10) {
        const showMoreDiv = document.createElement('div');
        showMoreDiv.className = 'show-more-container';
        showMoreDiv.innerHTML = `
            <button class="show-more-btn" onclick="showMoreSources(this, '${film.title}', '${film.year}')">
                Show ${filmResult.sources.length - 10} More Sources
            </button>
        `;
        sourcesContainer.appendChild(showMoreDiv);
    }

    return filmSection;
}

// Keep all other existing functions unchanged...
function createStrategyBar(strategy, count, maxCount) {
    const bar = document.createElement('div');
    bar.className = 'strategy-bar';

    const widthPercent = (count / maxCount * 100);

    bar.innerHTML = `
        <div class="strategy-name">${formatStrategyName(strategy)}</div>
        <div class="strategy-fill">
            <div class="strategy-fill-bar" 
                 style="width: 0%;" 
                 data-width="${widthPercent}%"></div>
        </div>
        <div class="strategy-count">${count}</div>
    `;

    return bar;
}

function extractPublicationFromId(id) {
    const patterns = {
        'variety': /variety/i,
        'filmdaily': /filmdaily/i,
        'motionpictureher': /motionpictureher/i,
        'motionpicturedai': /motionpicturedai/i,
        'boxoffice': /boxoffice/i,
        'photoplay': /photoplay/i,
        'modernscreen': /modernscreen/i,
        'hollywood': /hollywood/i,
        'movingpicture': /movingpicture/i,
        'motography': /motography/i,
        'exhibitors': /exhibitors/i,
        'wids': /wids/i
    };

    for (const [name, pattern] of Object.entries(patterns)) {
        if (pattern.test(id)) {
            return formatPublicationName(name);
        }
    }

    return 'Unknown Publication';
}

function formatPublicationName(name) {
    const names = {
        'variety': 'Variety',
        'filmdaily': 'Film Daily',
        'motionpictureher': 'Motion Picture Herald',
        'motionpicturedai': 'Motion Picture Daily',
        'boxoffice': 'Boxoffice',
        'photoplay': 'Photoplay',
        'modernscreen': 'Modern Screen',
        'hollywood': 'Hollywood',
        'movingpicture': 'Moving Picture World',
        'motography': 'Motography',
        'exhibitors': 'Exhibitors Herald',
        'wids': 'Wid\'s'
    };

    return names[name] || name.charAt(0).toUpperCase() + name.slice(1);
}

function extractDateFromSource(source) {
    if (source.attributes?.dateString?.attributes?.value) {
        return source.attributes.dateString.attributes.value;
    }
    if (source.attributes?.date?.attributes?.value) {
        return source.attributes.date.attributes.value;
    }
    return 'Date unknown';
}

function extractPageNumber(id) {
    const match = id.match(/_(\d+)$/);
    return match ? match[1] : '—';
}

function extractInternetArchiveUrl(source) {
    if (source.attributes?.read_search_highlighting?.attributes?.value) {
        const match = source.attributes.read_search_highlighting.attributes.value.match(/href="([^"]+)"/);
        return match ? match[1] : null;
    }
    return null;
}

function formatExcerpt(excerpt) {
    if (!excerpt) return '';

    // Limit length
    let formatted = excerpt.substring(0, 300);
    if (excerpt.length > 300) {
        formatted += '...';
    }

    // The excerpt might already have <em> tags from Lantern for highlighting
    // Make sure they're preserved
    return formatted;
}

function formatStrategyName(strategy) {
    return strategy
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

// Export results function
function exportResults() {
    if (!searchResults) return;

    const dataStr = JSON.stringify(searchResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `magic-lantern-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Generate report function (placeholder)
function generateReport() {
    alert('Report generation coming soon! For now, use Export JSON.');
}

// Show more sources
function showMoreSources(button, filmTitle, filmYear) {
    const filmResult = searchResults.find(r =>
        r.film.title === filmTitle && r.film.year === filmYear
    );

    if (!filmResult) return;

    const container = button.closest('.sources-container');
    const existingCards = container.querySelectorAll('.source-card').length;

    // Add remaining sources
    filmResult.sources.slice(existingCards).forEach(source => {
        const sourceCard = createSourceCard(source, filmResult.film);
        container.insertBefore(sourceCard, button.parentElement);
    });

    // Remove the show more button
    button.parentElement.remove();
}

// Future functionality placeholder
async function fetchFullText(sourceId, film) {
    // This will be implemented when selective full text fetching is added
    console.log('Full text fetching will be implemented in a future version');
    alert('Full text fetching will be available in a future update');
}

// Mock data function updated for new structure
function getMockSearchResults() {
    return [
        {
            film: {
                title: "The Wizard of Oz",
                year: "1939",
                author: "L. Frank Baum",
                director: "Victor Fleming",
                studio: "Metro-Goldwyn-Mayer"
            },
            totalUniqueSources: 62,
            searchStrategySummary: {
                "exact_title": 20,
                "title_no_article": 5,
                "author_title": 13,
                "director_title": 6,
                "studio_title": 18
            },
            sources: [
                {
                    id: "variety137-1939-08_0054",
                    attributes: {
                        dateString: { attributes: { value: "August 1939" } },
                        body: { attributes: { value: "THE WIZARD OF OZ is a magnificent achievement in technicolor fantasy, bringing L. Frank Baum's beloved story to vibrant life with exceptional performances and groundbreaking special effects..." } },
                        read_search_highlighting: {
                            attributes: {
                                value: '<a target="_blank" href="http://archive.org/stream/variety137-1939-08#page/n54/mode/2up/search/&quot;The Wizard of Oz&quot;">Read in Context</a>'
                            }
                        }
                    },
                    links: { self: "https://lantern.mediahist.org/catalog/variety137-1939-08_0054" },
                    foundBy: "author_title",
                    scoring: {
                        finalScore: 95.5,
                        publication: "variety"
                    },
                    fullText: null,
                    fullTextFetched: false,
                    fullTextFetchedAt: null
                }
            ]
        }
    ];
}

// Track selections
let selectedSources = new Map();

// Update selection count when checkboxes change
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('source-checkbox')) {
        const sourceId = e.target.dataset.sourceId;
        const filmTitle = e.target.dataset.filmTitle;
        
        if (e.target.checked) {
            // Find the source data
            const sourceData = findSourceById(sourceId);
            selectedSources.set(sourceId, {
                ...sourceData,
                filmTitle: filmTitle
            });
        } else {
            selectedSources.delete(sourceId);
        }
        
        updateSelectionUI();
    }
});

function updateSelectionUI() {
    const count = selectedSources.size;
    document.getElementById('selected-count').textContent = count;
    document.getElementById('export-selected-btn').style.display = count > 0 ? 'inline-block' : 'none';
}

function findSourceById(sourceId) {
    // Search through your searchResults to find the source
    for (const result of searchResults) {
        const source = result.sources.find(s => s.id === sourceId);
        if (source) return source;
    }
    return null;
}

function exportSelected() {
    if (selectedSources.size === 0) return;
    
    // Convert Map to array for export
    const selectedArray = Array.from(selectedSources.values());
    
    // Create a nice export object
    const exportData = {
        exportDate: new Date().toISOString(),
        totalSelected: selectedArray.length,
        sources: selectedArray
    };
    
    // Download as JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `magic-lantern-selections-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    // Optional: Clear selections after export
    if (confirm('Export complete! Clear all selections?')) {
        selectedSources.clear();
        document.querySelectorAll('.source-checkbox').forEach(cb => cb.checked = false);
        updateSelectionUI();
    }
}

function selectAll() {
    // Get all checkboxes
    const checkboxes = document.querySelectorAll('.source-checkbox');
    
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            checkbox.checked = true;
            // Trigger change event to update selection tracking
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    
    // Update UI
    document.getElementById('select-all-btn').style.display = 'none';
    document.getElementById('clear-all-btn').style.display = 'inline-block';
}

function clearAll() {
    // Get all checkboxes
    const checkboxes = document.querySelectorAll('.source-checkbox');
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkbox.checked = false;
            // Trigger change event to update selection tracking
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    
    // Update UI
    document.getElementById('clear-all-btn').style.display = 'none';
    document.getElementById('select-all-btn').style.display = 'inline-block';
}

// Update the updateSelectionUI function to handle the buttons better
function updateSelectionUI() {
    const count = selectedSources.size;
    const totalCheckboxes = document.querySelectorAll('.source-checkbox').length;
    
    document.getElementById('selected-count').textContent = count;
    document.getElementById('export-selected-btn').style.display = count > 0 ? 'inline-block' : 'none';
    
    // Show/hide select all vs clear all based on current state
    if (count === 0) {
        document.getElementById('select-all-btn').style.display = 'inline-block';
        document.getElementById('clear-all-btn').style.display = 'none';
    } else if (count === totalCheckboxes) {
        document.getElementById('select-all-btn').style.display = 'none';
        document.getElementById('clear-all-btn').style.display = 'inline-block';
    } else {
        // Some selected - show both
        document.getElementById('select-all-btn').style.display = 'inline-block';
        document.getElementById('clear-all-btn').style.display = 'inline-block';
    }
}