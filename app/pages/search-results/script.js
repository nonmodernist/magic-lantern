// app/pages/search-results/script.js

let comprehensiveResults = null;
let fullTextResults = null;

// Load results when page loads
window.addEventListener('DOMContentLoaded', () => {
    loadResults();
});

async function loadResults() {
    try {
        const timestamp = localStorage.getItem('searchTimestamp');
        const resultsPath = localStorage.getItem('searchResultsPath');
        
        if (resultsPath && window.magicLantern) {
            // Load real results using IPC
            console.log('Loading results from:', resultsPath);
            const results = await window.magicLantern.readResultsFile(resultsPath);
            
            // Try to load full text results if available
            if (fullTextPath) {
                try {
                    fullTextResults = await window.magicLantern.readResultsFile(fullTextPath);
                } catch (error) {
                    console.log('No full text results available');
                }
            }
            
            displayResults(results);
        } else {
            // Fallback to mock data for testing
            console.log('No results path found, using mock data');
            displayResults(getMockComprehensiveResults());
        }
    } catch (error) {
        console.error('Error loading results:', error);
        document.getElementById('film-results-container').innerHTML = 
            '<div class="notice-box" style="border-color: var(--error-border); background: var(--error-bg);">' +
            '<p><strong>Error loading results:</strong> ' + error.message + '</p>' +
            '</div>';
    }
}

function displayResults(results) {
    comprehensiveResults = results;
    
    // Update header timestamp
    const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('results-timestamp').textContent = timestamp;
    
    // Update summary statistics
    let totalSources = 0;
    let uniqueSources = 0;
    let treasures = 0;
    
    results.forEach(filmResult => {
        totalSources += filmResult.sources.length;
        uniqueSources += filmResult.totalUniqueSources || filmResult.sources.length;
        
        // Count treasures if we have full text data
        if (fullTextResults) {
            const filmFullText = fullTextResults.find(f => 
                f.film.title === filmResult.film.title && 
                f.film.year === filmResult.film.year
            );
            if (filmFullText && filmFullText.treasures) {
                treasures += filmFullText.treasures.filter(t => t.finalScore > 80).length;
            }
        }
    });
    
    document.getElementById('films-count').textContent = results.length;
    document.getElementById('sources-count').textContent = totalSources;
    document.getElementById('unique-count').textContent = uniqueSources;
    document.getElementById('treasures-count').textContent = treasures;
    
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
        const sourceCard = createSourceCard(source);
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

function createSourceCard(source) {
    const template = document.getElementById('source-item-template');
    const card = template.content.cloneNode(true);
    
    // Set score
    const score = source.scoring ? source.scoring.finalScore.toFixed(1) : '—';
    card.querySelector('.score-badge').textContent = `SCORE: ${score}`;
    
    // Set publication
    const publication = extractPublicationFromId(source.id);
    card.querySelector('.publication-name').textContent = publication;
    
    // Set metadata
    const date = extractDateFromSource(source);
    const foundBy = source.foundBy || 'unknown';
    card.querySelector('.source-meta').innerHTML = `
        ${date} • Page ${extractPageNumber(source.id)}
        <span class="found-by-badge">${formatStrategyName(foundBy)}</span>
    `;
    
    // Set excerpt
    const excerpt = extractExcerpt(source);
    if (excerpt) {
        card.querySelector('.source-excerpt').innerHTML = formatExcerpt(excerpt);
    } else {
        card.querySelector('.source-excerpt').style.display = 'none';
    }
    
    // Set links
    const lanternUrl = source.links?.self || '#';
    const iaUrl = extractInternetArchiveUrl(source);
    
    const primaryLink = card.querySelector('.source-link.primary');
    primaryLink.href = lanternUrl;
    
    const iaLink = card.querySelectorAll('.source-link')[1];
    if (iaUrl) {
        iaLink.href = iaUrl;
    } else {
        iaLink.style.display = 'none';
    }
    
    return card;
}

// Helper functions
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

function extractExcerpt(source) {
    if (source.attributes?.body?.attributes?.value) {
        return source.attributes.body.attributes.value;
    }
    return null;
}

function extractInternetArchiveUrl(source) {
    if (source.attributes?.read_search_highlighting?.attributes?.value) {
        const match = source.attributes.read_search_highlighting.attributes.value.match(/href="([^"]+)"/);
        return match ? match[1] : null;
    }
    return null;
}

function formatExcerpt(excerpt) {
    // Limit length
    let formatted = excerpt.substring(0, 300);
    if (excerpt.length > 300) {
        formatted += '...';
    }
    
    // The excerpt might already have <em> tags from Lantern
    return formatted;
}

function formatStrategyName(strategy) {
    return strategy
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

// Export results function
function exportResults() {
    if (!comprehensiveResults) return;
    
    const dataStr = JSON.stringify(comprehensiveResults, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
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
    const filmResult = comprehensiveResults.find(r => 
        r.film.title === filmTitle && r.film.year === filmYear
    );
    
    if (!filmResult) return;
    
    const container = button.closest('.sources-container');
    const existingCards = container.querySelectorAll('.source-card').length;
    
    // Add remaining sources
    filmResult.sources.slice(existingCards).forEach(source => {
        const sourceCard = createSourceCard(source);
        container.insertBefore(sourceCard, button.parentElement);
    });
    
    // Remove the show more button
    button.parentElement.remove();
}

// Mock data function for testing
function getMockComprehensiveResults() {
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
                        body: { 
                            attributes: { 
                                value: "Metro's '<em>The</em> <em>Wizard</em> <em>of</em> <em>Oz</em>' is a magnificent fantasy, brilliantly conceived and executed. L. Frank Baum's beloved children's classic comes to life with Technicolor splendor..." 
                            } 
                        },
                        read_search_highlighting: {
                            attributes: {
                                value: '<a target="_blank" href="http://archive.org/stream/variety137-1939-08#page/n54/mode/2up/search/&quot;The Wizard of Oz&quot;">Read in Context</a>'
                            }
                        }
                    },
                    links: { self: "https://lantern.mediahist.org/catalog/variety137-1939-08_0054" },
                    foundBy: "author_title",
                    scoring: { finalScore: 95.5 }
                }
            ]
        }
    ];
}