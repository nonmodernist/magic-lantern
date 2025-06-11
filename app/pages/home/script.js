// Check if magicLantern API is available
console.log('magicLantern API available?', window.magicLantern);

// Track some key metrics as we parse
let currentMetrics = {
  currentFilm: '',
  strategiesRun: 0,
  resultsFound: 0,
  searchesDone: 0
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  
  // Check if user has used the tool before
  const hasUsedBefore = localStorage.getItem('hasUsedMagicLantern');
  if (!hasUsedBefore) {
    // Show welcome wizard for first-time users
    document.getElementById('welcome-wizard').removeAttribute('hidden');
  }
  
  checkForSelectedProfile();
  setupEventListeners();
});

function setupEventListeners() {
  // File selection
  const selectFileBtn = document.getElementById('select-file-btn');
  if (selectFileBtn) {
    selectFileBtn.addEventListener('click', selectFile);
  }

  // Config changes
  const corpusSelect = document.getElementById('corpus-select');
  const profileSelect = document.getElementById('profile-select');
  
  if (corpusSelect) {
    corpusSelect.addEventListener('change', updateSearchSummary);
  }
  
  if (profileSelect) {
    profileSelect.addEventListener('change', updateSearchSummary);
  }

  // Run search button
  const runSearchBtn = document.getElementById('run-search-btn');
  if (runSearchBtn) {
    runSearchBtn.addEventListener('click', runSearch);
  }

  // Cancel button
  const cancelBtn = document.getElementById('cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', cancelSearch);
  }
}

// Wizard functions
function selectResearchProfile(profile) {
  // Set the profile in the dropdown
  const profileSelect = document.getElementById('profile-select');
  if (profileSelect) {
    profileSelect.value = profile;
    // Trigger change event to update description
    profileSelect.dispatchEvent(new Event('change'));
  }
  
  // Hide wizard
  document.getElementById('welcome-wizard').setAttribute('hidden', '');
  
  // Store that user has used the tool
  localStorage.setItem('hasUsedMagicLantern', 'true');
  localStorage.setItem('selectedProfile', profile);
}

function showAdvancedProfiles() {
  // Hide wizard and navigate to profile selector
  document.getElementById('welcome-wizard').setAttribute('hidden', '');
  localStorage.setItem('hasUsedMagicLantern', 'true');
  window.location.href = '../profile-selector/index.html';
}

function skipWizard() {
  document.getElementById('welcome-wizard').setAttribute('hidden', '');
  localStorage.setItem('hasUsedMagicLantern', 'true');
}

// File selection
async function selectFile() {
  console.log('Select file button clicked');

  try {
    const fileData = await window.magicLantern.selectFile();
    console.log('File data received:', fileData);

    if (fileData) {
      // Show file info
      const fileInfo = document.getElementById('file-info');
      fileInfo.removeAttribute('hidden');
      
      document.getElementById('file-name').textContent = fileData.name;
      document.getElementById('film-count').textContent = fileData.filmCount;
      document.getElementById('preview-content').textContent = fileData.preview.join('\n');

      // Store the file path for later use
      window.selectedFilePath = fileData.path;
      window.totalFilms = fileData.filmCount;

      // Show config section
      const configSection = document.getElementById('config-section');
      if (configSection) {
        configSection.removeAttribute('hidden');
        console.log('Config section shown');
      }

      // Update search summary
      updateSearchSummary();
    }
  } catch (error) {
    console.error('File selection error:', error);
    alert('Error selecting file: ' + error.message);
  }
}

// Update summary when config changes
function updateSearchSummary() {
  const corpus = document.getElementById('corpus-select').value;
  const profile = document.getElementById('profile-select').value;
  const summary = document.getElementById('search-summary');

  let filmsToProcess = window.totalFilms || 0;
  if (corpus === 'test' || corpus === 'single') {
    filmsToProcess = 1;
  } else if (corpus === 'medium') {
    filmsToProcess = Math.min(20, filmsToProcess);
  }

  const profileNames = {
    'default': 'Default',
    'adaptation-studies': 'Adaptation Studies',
    'labor-history': 'Labor History',
    'early-cinema': 'Early Cinema',
    'regional-reception': 'Regional Reception',
  };

  summary.innerHTML = `
    <strong>Ready to search:</strong><br>
    📽️ Films to process: ${filmsToProcess} of ${window.totalFilms}<br>
    🔍 Profile: ${profileNames[profile]}<br>
    ⏱️ Estimated time: ${estimateTime(filmsToProcess, corpus)}
  `;
  summary.removeAttribute('hidden');
}

function estimateTime(films, corpus) {
  const minutesPerFilm = corpus === 'single' ? 5 : corpus === 'test' ? 2 : 3;
  const totalMinutes = films * minutesPerFilm;

  if (totalMinutes < 60) {
    return `${totalMinutes} minutes`;
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
}

async function runSearch() {
  const corpus = document.getElementById('corpus-select').value;
  const profile = document.getElementById('profile-select').value;

  if (!window.selectedFilePath) {
    alert('Please select a CSV file first');
    return;
  }

  console.log('Starting search:', {
    file: window.selectedFilePath,
    corpus,
    profile
  });

  // Hide config, show progress
  document.getElementById('config-section').setAttribute('hidden', '');
  document.getElementById('progress-section').removeAttribute('hidden');

  try {
    // Set up progress listener
    window.magicLantern.onSearchProgress((data) => {
      console.log('Progress update:', data);
      updateProgress(data);
    });

    // Run the search
    const results = await window.magicLantern.runSearch(
      window.selectedFilePath,
      corpus,
      profile
    );

    console.log('Search complete!', results);

    if (results.cancelled) {
      console.log('Search was cancelled');
      return;
    }

    if (results.success) {
      localStorage.setItem('searchResultsPath', results.searchResultsPath);
      localStorage.setItem('searchTimestamp', results.timestamp);
      window.location.href = '../search-results/index.html';
    } else {
      alert('Search completed but no results found');
    }

  } catch (error) {
    console.error('Search error:', error);
    alert('Search failed: ' + error.message);

    // Reset UI
    document.getElementById('progress-section').setAttribute('hidden', '');
    document.getElementById('config-section').removeAttribute('hidden');
  }
}

// Update progress display
function updateProgress(data) {
  const progressBar = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const progressDetails = document.getElementById('progress-details');

  if (data.percent) {
    progressBar.value = data.percent;
  }

  if (data.status) {
    progressText.textContent = data.status;
  }

  if (data.detail) {
    // Add to console output
    progressDetails.textContent += data.detail + '\n';
    progressDetails.scrollTop = progressDetails.scrollHeight;

    // Track metrics
    if (data.detail.includes('🎭 COMPREHENSIVE SEARCH:')) {
      const match = data.detail.match(/🎭 COMPREHENSIVE SEARCH: (.+?) \(/);
      currentMetrics.currentFilm = match ? match[1] : '';
      currentMetrics.strategiesRun = 0;
      currentMetrics.resultsFound = 0;
    }

    if (data.detail.includes('🔍 [') && data.detail.includes(']')) {
      currentMetrics.searchesDone++;
      currentMetrics.strategiesRun++;
    }

    if (data.detail.includes('✅ Found')) {
      const match = data.detail.match(/Found (\d+) results/);
      if (match) {
        const count = parseInt(match[1]);
        currentMetrics.resultsFound += count;
      }
    }
  }
}

function checkForSelectedProfile() {
  const selectedProfile = localStorage.getItem('selectedProfile');

  if (selectedProfile) {
    const profileDropdown = document.getElementById('profile-select');
    if (profileDropdown) {
      profileDropdown.value = selectedProfile;
      const event = new Event('change');
      profileDropdown.dispatchEvent(event);
    }

    localStorage.removeItem('selectedProfile');
    console.log(`Profile "${selectedProfile}" selected from Profile Selector`);
  }
}

async function cancelSearch() {
  console.log('Cancel button clicked');

  const result = await window.magicLantern.stopSearch();

  if (result.success) {
    // Hide progress, show config
    document.getElementById('progress-section').setAttribute('hidden', '');
    document.getElementById('config-section').removeAttribute('hidden');

    // Reset progress bar
    document.getElementById('progress-fill').value = 0;
    document.getElementById('progress-text').textContent = 'Search cancelled';
    document.getElementById('progress-details').textContent += '\n\nSearch cancelled by user';
  }
}

// Generate sample CSV
function generateSampleCSV() {
  const csv = `title,year,author,director,studio
"The Wizard of Oz",1939,"L. Frank Baum","Victor Fleming","Metro-Goldwyn-Mayer"
"Little Women",1933,"Louisa May Alcott","George Cukor","RKO Pictures"
"Gone with the Wind",1939,"Margaret Mitchell","Victor Fleming","Selznick International Pictures"`;

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample-films.csv';
  a.click();
  URL.revokeObjectURL(url);
}