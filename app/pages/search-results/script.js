// app/pages/search-results/script.js - Revised version

let searchResults = null;
let selectedSources = new Map();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing results viewer...');
    loadResults();
    setupEventListeners();
});

// Clean up on page unload
window.addEventListener('beforeunload', cleanup);
window.addEventListener('pagehide', cleanup);

function cleanup() {
    if (selectedSources) {
        selectedSources.clear();
    }
    searchResults = null;
}

// Setup all event listeners
function setupEventListeners() {
    // Checkbox change handler
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox' && e.target.name === 'source') {
            handleSourceSelection(e.target);
        }
    });

    // Navigation click cleanup
    document.addEventListener('click', (e) => {
        if (e.target.matches('nav a, nav a *')) {
            cleanup();
        }
    });
}

// Load results from storage or file
async function loadResults() {
    try {
        const resultsPath = localStorage.getItem('searchResultsPath');

        if (resultsPath && window.magicLantern) {
            console.log('Loading results from:', resultsPath);
            const results = await window.magicLantern.readResultsFile(resultsPath);
            
            if (results && results.length > 0) {
                displayResults(results);
            } else {
                tryLoadRecentResults();
            }
        } else {
            tryLoadRecentResults();
        }
    } catch (error) {
        console.error('Error loading results:', error);
        showError(error.message);
    }
}

async function tryLoadRecentResults() {
    if (window.magicLantern) {
        console.log('Looking for recent results...');
        const recentResults = await window.magicLantern.findRecentResults();
        if (recentResults) {
            displayResults(recentResults);
        } else {
            showNoResultsMessage();
        }
    } else {
        // Fallback for testing
        console.log('Using mock data for testing');
        displayResults(getMockSearchResults());
    }
}

// Display error message
function showError(message) {
    const container = document.getElementById('film-results-container');
    container.innerHTML = `
        <div class="error-message">
            <h3>Error Loading Results</h3>
            <p>${message}</p>
            <button onclick="window.location.href='../home/'">Back to Search</button>
        </div>
    `;
}

// Display no results message
function showNoResultsMessage() {
    const container = document.getElementById('film-results-container');
    container.innerHTML = `
        <div class="notice">
            <h3>No Results Found</h3>
            <p>Please run a search from the home page first.</p>
            <button onclick="window.location.href='../home/'">Go to Search</button>
        </div>
    `;
}

// Main display function
function displayResults(results) {
    searchResults = results;
    
    updateSummaryStats(results);
    displayFilmResults(results);
    populateJumpList(results);
    updateSelectionUI();
}

// Update summary statistics
function updateSummaryStats(results) {
    let totalSources = 0;
    let uniqueSources = 0;
    let treasuresCount = 0;

    results.forEach(filmResult => {
        totalSources += filmResult.sources?.length || 0;
        uniqueSources += filmResult.totalUniqueSources || filmResult.sources?.length || 0;
        
        filmResult.sources?.forEach(source => {
            if (source.scoring?.finalScore >= 80) {
                treasuresCount++;
            }
        });
    });

    // Update summary displays
    updateElement('films-count', results.length);
    updateElement('sources-count', totalSources);
    updateElement('unique-count', uniqueSources);
    updateElement('treasures-count', treasuresCount);
    
    // Update timestamp
    const timestamp = localStorage.getItem('searchTimestamp') || new Date().toISOString();
    updateElement('results-timestamp', formatDate(timestamp));
}

// Display all film results
function displayFilmResults(results) {
    const container = document.getElementById('film-results-container');
    container.innerHTML = '';
    
    results.forEach((filmResult, index) => {
        const filmElement = createFilmElement(filmResult, index);
        container.appendChild(filmElement);
    });
}

// Create a film result element (no templates)
function createFilmElement(filmResult, index) {
    const film = filmResult.film;
    const article = document.createElement('article');
    article.className = 'film-result';
    article.id = `film-${index}`;
    
    // Film header
    const header = document.createElement('header');
    header.innerHTML = `
        <div>
            <h3>${film.title} (${film.year})</h3>
            <p>${formatFilmMeta(film)}</p>
        </div>
        <data class="sources-count">${filmResult.totalUniqueSources} sources</data>
    `;
    article.appendChild(header);
    
    // Strategy summary (if available)
    if (filmResult.searchStrategySummary) {
        const strategySection = createStrategySection(filmResult.searchStrategySummary);
        article.appendChild(strategySection);
    }
    
    // Sources section
    const sourcesSection = document.createElement('section');
    sourcesSection.className = 'sources-section';
    sourcesSection.innerHTML = '<h4>Sources Found</h4>';
    
    const sourcesContainer = document.createElement('div');
    sourcesContainer.className = 'sources-container';
    
    // Add sources (limited by view settings)
    const sourcesToShow = filmResult.sources.slice(0, getSourcesLimit());
    sourcesToShow.forEach(source => {
        const sourceElement = createSourceElement(source, film);
        sourcesContainer.appendChild(sourceElement);
    });
    
    // Add show more button if needed
    if (filmResult.sources.length > sourcesToShow.length) {
        const showMoreBtn = createShowMoreButton(filmResult, film, sourcesToShow.length);
        sourcesContainer.appendChild(showMoreBtn);
    }
    
    sourcesSection.appendChild(sourcesContainer);
    article.appendChild(sourcesSection);
    
    return article;
}

// Create source element
function createSourceElement(source, film) {
    const article = document.createElement('article');
    article.className = 'source';
    article.dataset.score = source.scoring?.finalScore || 0;
    
    // Checkbox
    const checkboxDiv = document.createElement('div');
    checkboxDiv.className = 'source-select';
    checkboxDiv.innerHTML = `
        <input type="checkbox" 
               id="source-${source.id}" 
               name="source" 
               value="${source.id}"
               data-film-title="${film.title}"
               data-film-year="${film.year}">
        <label for="source-${source.id}">Select</label>
    `;
    
    // Source content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'source-content';
    
    // Header with publication and score
    const publication = source.scoring?.publication || extractPublicationFromId(source.id);
    const score = source.scoring?.finalScore?.toFixed(1) || '—';
    
    contentDiv.innerHTML = `
        <header>
            <h4>${formatPublicationName(publication)}</h4>
            <p>${extractDateFromSource(source)} • Page ${extractPageNumber(source.id)}</p>
            ${source.foundBy ? `<span class="strategy-tag">${formatStrategyName(source.foundBy)}</span>` : ''}
        </header>
        <blockquote class="excerpt">
            ${formatExcerpt(extractExcerpt(source))}
        </blockquote>
        <footer>
            <a role="source-button" href="${source.links?.self || `https://lantern.mediahist.org/catalog/${source.id}`}" 
               target="_blank">View on Lantern →</a>
            ${extractInternetArchiveUrl(source) ? 
                `<a role="source-button" href="${extractInternetArchiveUrl(source)}" target="_blank">Internet Archive →</a>` : ''}
        </footer>
    `;
    
    // Score badge
    const scoreBadge = document.createElement('data');
    scoreBadge.className = 'score';
    scoreBadge.value = score;
    scoreBadge.textContent = `${score}`;
    
    article.appendChild(checkboxDiv);
    article.appendChild(contentDiv);
    article.appendChild(scoreBadge);
    
    return article;
}

// Create strategy summary section
function createStrategySection(strategySummary) {
    const section = document.createElement('section');
    section.className = 'strategy-summary';
    section.innerHTML = '<h4>Search Strategy Performance</h4>';
    
    const container = document.createElement('div');
    container.className = 'strategy-bars';
    
    const maxCount = Math.max(...Object.values(strategySummary));
    
    Object.entries(strategySummary)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([strategy, count]) => {
            const bar = createStrategyBar(strategy, count, maxCount);
            container.appendChild(bar);
        });
    
    section.appendChild(container);
    return section;
}

// Create strategy bar
function createStrategyBar(strategy, count, maxCount) {
    const div = document.createElement('div');
    div.className = 'strategy-bar';
    
    const widthPercent = (count / maxCount * 100);
    
    div.innerHTML = `
        <span class="strategy-name">${formatStrategyName(strategy)}</span>
        <div class="strategy-fill">
            <div class="strategy-fill-bar" style="width: ${widthPercent}%"></div>
        </div>
        <span class="strategy-count">${count}</span>
    `;
    
    return div;
}

// Create show more button
function createShowMoreButton(filmResult, film, currentCount) {
    const button = document.createElement('button');
    button.className = 'show-more-btn';
    button.textContent = `Show ${filmResult.sources.length - currentCount} More Sources`;
    button.onclick = () => showMoreSources(button, filmResult, film);
    return button;
}

// Handle source selection
function handleSourceSelection(checkbox) {
    const sourceId = checkbox.value;
    
    if (checkbox.checked) {
        const sourceData = findSourceById(sourceId);
        if (sourceData) {
            selectedSources.set(sourceId, {
                ...sourceData.source,
                filmTitle: checkbox.dataset.filmTitle,
                filmYear: checkbox.dataset.filmYear
            });
        }
    } else {
        selectedSources.delete(sourceId);
    }
    
    updateSelectionUI();
}

// Update selection UI
function updateSelectionUI() {
    const count = selectedSources.size;
    
    updateElement('selected-count', count);
    updateElement('export-selected-btn output', count);
    
    const exportBtn = document.getElementById('export-selected-btn');
    if (exportBtn) {
        exportBtn.disabled = count === 0;
    }
    
    // Update select/clear all buttons
    const totalCheckboxes = document.querySelectorAll('input[name="source"]').length;
    const selectAllBtn = document.getElementById('select-all-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    
    if (selectAllBtn && clearAllBtn) {
        selectAllBtn.hidden = count === totalCheckboxes;
        clearAllBtn.hidden = count === 0;
    }
}

// Populate jump list
function populateJumpList(results) {
    const select = document.querySelector('#jump-list select');
    if (!select) return;
    
    select.innerHTML = '';
    results.forEach((result, index) => {
        const option = document.createElement('option');
        option.value = `film-${index}`;
        option.textContent = `${result.film.title} (${result.film.year})`;
        select.appendChild(option);
    });
}

// Helper functions
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatFilmMeta(film) {
    const parts = [];
    if (film.author && film.author !== '-') parts.push(`Author: ${film.author}`);
    if (film.director && film.director !== '-') parts.push(`Director: ${film.director}`);
    if (film.studio && film.studio !== '-') parts.push(`Studio: ${film.studio}`);
    return parts.join(' | ');
}

function getSourcesLimit() {
    const slider = document.getElementById('sources-limit');
    return slider ? parseInt(slider.value) : 10;
}

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

// Extract functions (keep your existing implementations)
function extractPublicationFromId(id) {
    // Your existing implementation
    const patterns = {
        'variety': /variety/i,
        'filmdaily': /filmdaily/i,
        'motionpictureher': /motionpictureher/i,
        // ... rest of your patterns
    };
    
    for (const [name, pattern] of Object.entries(patterns)) {
        if (pattern.test(id)) {
            return name;
        }
    }
    return 'unknown';
}

function formatPublicationName(name) {
    // Your existing implementation
    const names = {
        'variety': 'Variety',
        'filmdaily': 'Film Daily',
        // ... rest of your mappings
    };
    return names[name] || name.charAt(0).toUpperCase() + name.slice(1);
}

function extractDateFromSource(source) {
    // Your existing implementation
    if (source.attributes?.dateString?.attributes?.value) {
        return source.attributes.dateString.attributes.value;
    }
    return 'Date unknown';
}

function extractPageNumber(id) {
    // Your existing implementation
    const match = id.match(/_(\d+)$/);
    return match ? match[1] : '—';
}

function extractInternetArchiveUrl(source) {
    // Your existing implementation
    if (source.attributes?.read_search_highlighting?.attributes?.value) {
        const match = source.attributes.read_search_highlighting.attributes.value.match(/href="([^"]+)"/);
        return match ? match[1] : null;
    }
    return null;
}

function extractExcerpt(source) {
    // Your existing implementation
    if (source.attributes?.body?.attributes?.value) {
        return source.attributes.body.attributes.value;
    }
    return source.body || source.snippet || 'No preview available';
}

function formatExcerpt(excerpt) {
    // Your existing implementation
    if (!excerpt) return '<em>No preview available</em>';
    
    let formatted = excerpt.substring(0, 300);
    if (excerpt.length > 300) {
        formatted += '...';
    }
    return formatted;
}

function formatStrategyName(strategy) {
    // Your existing implementation
    return strategy
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

// Window functions for onclick handlers
window.loadResultsFile = loadResultsFile;
window.selectAll = selectAll;
window.clearAll = clearAll;
window.exportSelected = exportSelected;
window.exportAll = exportAll;
window.jumpToFilm = jumpToFilm;
// ... add other window functions

// Your existing functions (loadResultsFile, selectAll, etc.)
// Keep all these as they are, just make sure they're defined

function getMockSearchResults() {
    // Your existing mock data function
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
                "author_title": 13
            },
            sources: [
                {
                    id: "variety137-1939-08_0054",
                    attributes: {
                        dateString: { attributes: { value: "August 1939" } },
                        body: { attributes: { value: "THE WIZARD OF OZ is a magnificent achievement..." } }
                    },
                    links: { self: "https://lantern.mediahist.org/catalog/variety137-1939-08_0054" },
                    foundBy: "author_title",
                    scoring: {
                        finalScore: 95.5,
                        publication: "variety"
                    }
                }
            ]
        }
    ];
}

// Export/Action functions that were missing
function exportAll() {
    if (!searchResults) return;
    
    const dataStr = JSON.stringify(searchResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `magic-lantern-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

function selectAll() {
    document.querySelectorAll('input[name="source"]').forEach(checkbox => {
        if (!checkbox.checked) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}

function clearAll() {
    document.querySelectorAll('input[name="source"]').forEach(checkbox => {
        if (checkbox.checked) {
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}

function exportSelected() {
    if (selectedSources.size === 0) {
        alert('No sources selected for export');
        return;
    }
    
    // Group by film
    const groupedByFilm = {};
    for (const [id, source] of selectedSources) {
        const filmKey = `${source.filmTitle} (${source.filmYear})`;
        if (!groupedByFilm[filmKey]) {
            groupedByFilm[filmKey] = [];
        }
        groupedByFilm[filmKey].push(source);
    }
    
    const exportData = {
        exportDate: new Date().toISOString(),
        exportType: 'selected_sources',
        totalSelected: selectedSources.size,
        filmCount: Object.keys(groupedByFilm).length,
        sourcesByFilm: groupedByFilm
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `selected-sources-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    if (confirm(`Exported ${selectedSources.size} sources! Clear selections?`)) {
        clearAll();
    }
}

function jumpToFilm(filmId) {
    const element = document.getElementById(filmId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function showMoreSources(button, filmResult, film) {
    const container = button.parentElement;
    const existingCount = container.querySelectorAll('.source').length;
    
    // Add remaining sources
    filmResult.sources.slice(existingCount).forEach(source => {
        const sourceElement = createSourceElement(source, film);
        container.insertBefore(sourceElement, button);
    });
    
    // Remove button
    button.remove();
}

// Load results file function
async function loadResultsFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const content = await file.text();
            const results = JSON.parse(content);
            
            if (!Array.isArray(results) || !results[0]?.film) {
                throw new Error('Invalid Magic Lantern results file format');
            }
            
            displayResults(results);
            
            // Update UI
            document.getElementById('loaded-file-info').hidden = false;
            document.getElementById('loaded-filename').textContent = file.name;
            localStorage.removeItem('searchResultsPath');
            
        } catch (error) {
            alert('Error loading file: ' + error.message);
        }
    };
    
    input.click();
}