// app/pages/search-results/script.js - Updated for classless HTML

let searchResults = null;
let selectedSources = new Map();

// Add cleanup function
function cleanup() {
    if (selectedSources) {
        selectedSources.clear();
    }
    searchResults = null;
}

// Add event listener for page unload
window.addEventListener('beforeunload', cleanup);
window.addEventListener('pagehide', cleanup);

// Also cleanup when navigating away using the navigation
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.closest('nav')) {
        cleanup();
    }
});

// Show the guide for first-time users
function checkShowGuide() {
    const hasSeenGuide = localStorage.getItem('hasSeenResultsGuide');
    const dontShowAgain = localStorage.getItem('dontShowResultsGuide');
    
    if (!hasSeenGuide && !dontShowAgain && searchResults && searchResults.length > 0) {
        document.getElementById('next-steps-guide').removeAttribute('hidden');
        localStorage.setItem('hasSeenResultsGuide', 'true');
        
        // Smooth scroll to guide
        setTimeout(() => {
            document.getElementById('next-steps-guide').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 500);
    }
}

// Dismiss the guide
function dismissGuide() {
    const dontShow = document.getElementById('dont-show-guide').checked;
    if (dontShow) {
        localStorage.setItem('dontShowResultsGuide', 'true');
    }
    
    document.getElementById('next-steps-guide').setAttribute('hidden', '');
}

// Load results when page loads
window.addEventListener('DOMContentLoaded', () => {
    loadResults();
    setupCheckboxHandlers();
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
            '<aside role="alert" style="border-color: #B44A4A; background: #F8F0F0;">' +
            '<p><strong>Error loading results:</strong> ' + error.message + '</p>' +
            '</aside>';
    }
}

// Load results from file
function loadResultsFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const content = await file.text();
            const results = JSON.parse(content);
            
            // Validate it's a Magic Lantern results file
            if (!Array.isArray(results) || !results[0]?.film) {
                throw new Error('Invalid Magic Lantern results file format');
            }
            
            // Display the results
            displayResults(results);
            
            // Show file info
            document.getElementById('loaded-file-info').removeAttribute('hidden');
            document.getElementById('loaded-filename').textContent = file.name;
            
            // Clear any localStorage references since we're viewing a loaded file
            localStorage.removeItem('searchResultsPath');
            
        } catch (error) {
            alert('Error loading file: ' + error.message);
        }
    };
    
    input.click();
}

function showNoResultsMessage() {
    const container = document.getElementById('film-results-container');
    container.removeAttribute('data-loading');
    container.innerHTML =
        '<aside role="note">' +
        '<p><strong>No search results found.</strong> Please run a search from the home page first.</p>' +
        '<button onclick="window.location.href=\'../home/index.html\'">Go to Search</button>' +
        '</aside>';
}

function displayResults(results) {
    searchResults = results;
    checkShowGuide();

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

        // Count sources with high scores as "treasures"
        filmResult.sources.forEach(source => {
            if (source.scoring && source.scoring.finalScore >= 80) {
                treasuresCount++;
            }
        });
    });

    document.getElementById('films-count').textContent = results.length;
    document.getElementById('sources-count').textContent = totalSources;

    // Display film results
    const container = document.getElementById('film-results-container');
    container.removeAttribute('data-loading');
    container.innerHTML = '';

    results.forEach(filmResult => {
        const filmElement = createFilmSection(filmResult);
        container.appendChild(filmElement);
    });

    // Animate the strategy meters after a short delay
    setTimeout(() => {
        document.querySelectorAll('meter').forEach(meter => {
            const value = meter.getAttribute('data-value');
            if (value) {
                meter.value = value;
            }
        });
    }, 100);
}

function createSourceCard(source, film) {
    const template = document.getElementById('source-item-template');
    const card = template.content.cloneNode(true);

    // Set checkbox data
    const checkbox = card.querySelector('input[type="checkbox"]');
    checkbox.id = `source-${source.id}`;
    checkbox.setAttribute('data-source-id', source.id);
    checkbox.setAttribute('data-film-title', film.title);

    // Set score
    const score = source.scoring ? source.scoring.finalScore.toFixed(1) : '—';
    card.querySelector('[data-score]').textContent = `SCORE: ${score}`;

    // Set publication
    const publication = source.scoring?.publication || extractPublicationFromId(source.id);
    card.querySelector('[data-publication]').textContent = formatPublicationName(publication);

    // Set metadata
    const date = extractDateFromSource(source);
    const foundBy = source.foundBy || 'unknown';
    card.querySelector('[data-meta]').innerHTML = `
        ${date} • Page ${extractPageNumber(source.id)} • 
        <em>${formatStrategyName(foundBy)}</em>
    `;

    // Set excerpt
    const excerptElement = card.querySelector('[data-excerpt]');
    const excerpt = extractExcerpt(source);

    if (excerpt) {
        excerptElement.innerHTML = formatExcerpt(excerpt);
    } else if (source.fullText && source.fullTextFetched) {
        excerptElement.innerHTML = formatExcerpt(source.fullText.substring(0, 300));
    } else {
        excerptElement.innerHTML = '<em>No preview available</em>';
        excerptElement.style.opacity = '0.6';
    }

    // Set links
    const lanternUrl = source.links?.self || `https://lantern.mediahist.org/catalog/${source.id}`;
    const iaUrl = extractInternetArchiveUrl(source);

    const lanternLink = card.querySelector('[data-link="lantern"]');
    lanternLink.href = lanternUrl;

    const iaLink = card.querySelector('[data-link="archive"]');
    if (iaUrl) {
        iaLink.href = iaUrl;
    } else {
        iaLink.style.display = 'none';
    }

    // Update "Fetch Full Text" button for future functionality
    const fetchButton = card.querySelector('[data-fetch]');
    if (source.fullTextFetched) {
        fetchButton.textContent = 'Full Text Available';
        fetchButton.disabled = true;
    } else {
        fetchButton.textContent = 'Fetch Full Text (Coming Soon)';
        fetchButton.disabled = true;
    }

    return card;
}

function createFilmSection(filmResult) {
    const template = document.getElementById('film-result-template');
    const filmSection = template.content.cloneNode(true);

    const film = filmResult.film;

    // Set film information
    filmSection.querySelector('[data-film-title]').textContent = `${film.title} (${film.year})`;

    const metaParts = [];
    if (film.author && film.author !== '-') metaParts.push(`Author: ${film.author}`);
    if (film.director && film.director !== '-') metaParts.push(`Director: ${film.director}`);
    if (film.studio && film.studio !== '-') metaParts.push(`Studio: ${film.studio}`);

    filmSection.querySelector('[data-film-meta]').textContent = metaParts.join(' | ');
    filmSection.querySelector('[data-sources-count]').textContent = `${filmResult.totalUniqueSources} SOURCES`;

    // Create strategy bars
    if (filmResult.searchStrategySummary) {
        const barsContainer = filmSection.querySelector('[data-list="strategies"]');
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
    const sourcesContainer = filmSection.querySelector('[data-list="sources"]');
    const sourcesToShow = filmResult.sources.slice(0, 10);

    sourcesToShow.forEach(source => {
        const sourceCard = createSourceCard(source, film);
        sourcesContainer.appendChild(sourceCard);
    });

    // Add "show more" button if needed
    if (filmResult.sources.length > 10) {
        const showMoreDiv = document.createElement('div');
        showMoreDiv.setAttribute('data-show-more', '');
        showMoreDiv.innerHTML = `
            <button onclick="showMoreSources(this, '${film.title}', '${film.year}')">
                Show ${filmResult.sources.length - 10} More Sources
            </button>
        `;
        sourcesContainer.appendChild(showMoreDiv);
    }

    return filmSection;
}

function createStrategyBar(strategy, count, maxCount) {
    const bar = document.createElement('div');
    const widthPercent = (count / maxCount * 100);

    bar.innerHTML = `
        <label>${formatStrategyName(strategy)}</label>
        <meter min="0" max="${maxCount}" value="0" data-value="${count}"></meter>
        <data>${count}</data>
    `;

    return bar;
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
    URL.revokeObjectURL(url);
}

// Show more sources
function showMoreSources(button, filmTitle, filmYear) {
    const filmResult = searchResults.find(r =>
        r.film.title === filmTitle && r.film.year === filmYear
    );

    if (!filmResult) return;

    const container = button.closest('[data-list="sources"]');
    const existingCards = container.querySelectorAll('[data-source="true"]').length;

    // Add remaining sources
    filmResult.sources.slice(existingCards).forEach(source => {
        const sourceCard = createSourceCard(source, filmResult.film);
        container.insertBefore(sourceCard, button.parentElement);
    });

    // Remove the show more button
    button.parentElement.remove();
}

// Track selections
function setupCheckboxHandlers() {
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox' && e.target.hasAttribute('data-source-id')) {
            const sourceId = e.target.getAttribute('data-source-id');
            const filmTitle = e.target.getAttribute('data-film-title');
            
            if (e.target.checked) {
                const sourceData = findSourceById(sourceId);
                if (sourceData) {
                    selectedSources.set(sourceId, {
                        ...sourceData.source,
                        filmTitle: sourceData.filmTitle,
                        filmYear: sourceData.filmYear
                    });
                }
            } else {
                selectedSources.delete(sourceId);
            }
            
            updateSelectionUI();
        }
    });
}

// Helper function to find a source by ID
function findSourceById(sourceId) {
    for (const result of searchResults) {
        const source = result.sources.find(s => s.id === sourceId);
        if (source) {
            return {
                source: source,
                filmTitle: result.film.title,
                filmYear: result.film.year
            };
        }
    }
    return null;
}

// Update the UI to show selection count
function updateSelectionUI() {
    const count = selectedSources.size;
    const countElement = document.getElementById('selected-count');
    const exportBtn = document.getElementById('export-selected-btn');
    const selectAllBtn = document.getElementById('select-all-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const totalCheckboxes = document.querySelectorAll('input[data-source-id]').length;
    
    if (countElement) {
        countElement.textContent = count;
    }
    
    if (exportBtn) {
        if (count > 0) {
            exportBtn.removeAttribute('hidden');
        } else {
            exportBtn.setAttribute('hidden', '');
        }
    }
    
    // Show/hide select all vs clear all based on current state
    if (count === 0) {
        selectAllBtn.removeAttribute('hidden');
        clearAllBtn.setAttribute('hidden', '');
    } else if (count === totalCheckboxes) {
        selectAllBtn.setAttribute('hidden', '');
        clearAllBtn.removeAttribute('hidden');
    } else {
        selectAllBtn.removeAttribute('hidden');
        clearAllBtn.removeAttribute('hidden');
    }
}

// Export selected sources
function exportSelected() {
    if (selectedSources.size === 0) {
        alert('No sources selected for export');
        return;
    }
    
    // Group selected sources by film
    const groupedByFilm = {};
    for (const [id, source] of selectedSources) {
        const filmKey = `${source.filmTitle} (${source.filmYear})`;
        if (!groupedByFilm[filmKey]) {
            groupedByFilm[filmKey] = [];
        }
        groupedByFilm[filmKey].push(source);
    }
    
    // Create export data
    const exportData = {
        exportDate: new Date().toISOString(),
        exportType: 'selected_sources',
        totalSelected: selectedSources.size,
        filmCount: Object.keys(groupedByFilm).length,
        sourcesByFilm: groupedByFilm
    };
    
    // Download as JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `selected-sources-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    // Optional: Clear selections after export
    setTimeout(() => {
        if (confirm(`Successfully exported ${selectedSources.size} sources! Clear all selections?`)) {
            clearAllSelections();
        }
    }, 100);
}

function selectAll() {
    const checkboxes = document.querySelectorAll('input[data-source-id]');
    
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}

function clearAll() {
    const checkboxes = document.querySelectorAll('input[data-source-id]');
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}

function clearAllSelections() {
    selectedSources.clear();
    document.querySelectorAll('input[data-source-id]').forEach(cb => cb.checked = false);
    updateSelectionUI();
}

// Keep all the helper functions unchanged
function extractExcerpt(source) {
    if (source.attributes?.body?.attributes?.value) {
        return source.attributes.body.attributes.value;
    }
    if (source.body) {
        return source.body;
    }
    if (source.snippet) {
        return source.snippet;
    }
    if (source.attributes?.read_search_highlighting?.attributes?.value) {
        const match = source.attributes.read_search_highlighting.attributes.value.match(/>([^<]+)</);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
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

    let formatted = excerpt.substring(0, 300);
    if (excerpt.length > 300) {
        formatted += '...';
    }

    return formatted;
}

function formatStrategyName(strategy) {
    return strategy
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

function fetchFullText(sourceId, film) {
    console.log('Full text fetching will be implemented in a future version');
    alert('Full text fetching will be available in a future update');
}

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