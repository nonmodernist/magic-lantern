// Check if magicLantern API is available
console.log('magicLantern API available?', window.magicLantern);

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
      checkForSelectedProfile();

  
  const testBtn = document.getElementById('test-btn');
  console.log('Test button found?', testBtn);
  
  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      console.log('Button clicked!');
      
      const status = document.getElementById('status');
      status.textContent = 'Testing connection...';
      status.className = '';
      
      try {
        const result = await window.magicLantern.testConnection();
        console.log('Test result:', result);
        
        status.innerHTML = `
          <strong>✅ Connection successful!</strong><br>
          Version: ${result.version}<br>
          Available profiles: ${result.profiles.join(', ')}
        `;
        status.className = 'success';
      } catch (error) {
        console.error('Test failed:', error);
        status.textContent = '❌ Connection failed: ' + error.message;
        status.className = 'error';
      }
    });
  }
});

// File selection
document.getElementById('select-file-btn').addEventListener('click', async () => {
  console.log('Select file button clicked');
  
  try {
    const fileData = await window.magicLantern.selectFile();
    console.log('File data received:', fileData);
    
    if (fileData) {
      // Show file info
      document.getElementById('file-info').style.display = 'block';
      document.getElementById('file-name').textContent = fileData.name;
      document.getElementById('film-count').textContent = fileData.filmCount;
      document.getElementById('preview-content').textContent = fileData.preview.join('\n');
      
      // Store the file path for later use
      window.selectedFilePath = fileData.path;
      window.totalFilms = fileData.filmCount;
      
      // Show config section
      console.log('Trying to show config section...');
      const configSection = document.getElementById('config-section');
      console.log('Config section element:', configSection);
      
      if (configSection) {
        configSection.style.display = 'block';
        console.log('Config section display set to block');
      } else {
        console.error('Config section not found!');
      }
      
      // Update search summary
      updateSearchSummary();
    }
  } catch (error) {
    console.error('File selection error:', error);
    alert('Error selecting file: ' + error.message);
  }
});

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
  summary.style.display = 'block';
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

// Update summary when dropdowns change
document.getElementById('corpus-select').addEventListener('change', updateSearchSummary);
document.getElementById('profile-select').addEventListener('change', updateSearchSummary);


document.getElementById('run-search-btn').addEventListener('click', async () => {
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
  document.getElementById('config-section').style.display = 'none';
  document.getElementById('progress-section').style.display = 'block';
  
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

    // Add this check for cancellation
if (results.cancelled) {
  console.log('Search was cancelled');
  // The UI is already reset by the cancel button handler
  return;
}
    
// In the run-search click handler, update the results storage
if (results.success) {
    // Store the single file path for the results viewer
    localStorage.setItem('searchResultsPath', results.searchResultsPath);
    localStorage.setItem('searchTimestamp', results.timestamp);
    
    // Navigate to results page
    window.location.href = '../search-results/index.html';
} else {
    alert('Search completed but no results found');
}
    
  } catch (error) {
    console.error('Search error:', error);
    alert('Search failed: ' + error.message);
    
    // Reset UI
    document.getElementById('progress-section').style.display = 'none';
    document.getElementById('config-section').style.display = 'block';
  }
});

document.getElementById('test-real-search-btn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.textContent = 'Running real search test... This may take a minute...';
  status.className = '';
  
  try {
    const result = await window.magicLantern.testRealSearch();
    
    if (result.success) {
      status.innerHTML = `
        <strong>✅ Real search successful!</strong><br>
        Films processed: ${result.results.length}<br>
        First film: ${result.results[0]?.film?.title || 'Unknown'}<br>
        Total sources found: ${result.results[0]?.totalUniqueSources || 0}<br>
        <details style="margin-top: 10px;">
          <summary>View raw results (click to expand)</summary>
          <pre style="background: #f5f5f5; padding: 10px; margin-top: 10px; max-height: 300px; overflow-y: auto; font-size: 12px;">${JSON.stringify(result.results[0], null, 2)}</pre>
        </details>
      `;
      status.className = 'success';
    } else {
      status.innerHTML = `❌ Search failed: ${result.error}`;
      status.className = 'error';
    }
  } catch (error) {
    status.textContent = '❌ Error: ' + error.message;
    status.className = 'error';
  }
});

// Track some key metrics as we parse
let currentMetrics = {
  currentFilm: '',
  strategiesRun: 0,
  resultsFound: 0,
  searchesDone: 0
};


// Update progress display
function updateProgress(data) {
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const progressDetails = document.getElementById('progress-details');
  
  if (data.percent) {
    progressFill.style.width = data.percent + '%';
  }
  
  if (data.status) {
    progressText.textContent = data.status;
  }
  
  // // Update progress bar based on what we see
  // if (data.detail) {
  //   // Auto-detect progress from console output
  //   const progressMatch = data.detail.match(/📊 Progress: (\d+)\/(\d+)/);
  //   if (progressMatch) {
  //     const current = parseInt(progressMatch[1]);
  //     const total = parseInt(progressMatch[2]);
  //     const percent = (current / total) * 100;
  //     progressFill.style.width = percent + '%';
  //     progressText.textContent = `Processing Film ${current} of ${total}`;
  //   }

        // Format and colorize the console output
    const formattedLine = formatConsoleLine(data.detail);
    progressDetails.innerHTML += formattedLine;
    progressDetails.scrollTop = progressDetails.scrollHeight;

      if (data.detail) {
    // Track metrics
    if (data.detail.includes('🎭 COMPREHENSIVE SEARCH:')) {
      currentMetrics.currentFilm = data.detail.match(/SEARCH: (.+)/)?.[1] || '';
      currentMetrics.strategiesRun = 0;
      currentMetrics.resultsFound = 0;
    }
    
    if (data.detail.includes('🔍 [')) {
      currentMetrics.searchesDone++;
    }
    
    if (data.detail.includes('✅ Found')) {
      const count = parseInt(data.detail.match(/Found (\d+)/)?.[1] || 0);
      currentMetrics.resultsFound += count;
      currentMetrics.strategiesRun++;
    }
    
    // Update a simple metrics display
    updateMetricsDisplay();
  }
  }


function updateMetricsDisplay() {
  let metricsDiv = document.getElementById('search-metrics');
  if (!metricsDiv) {
    metricsDiv = document.createElement('div');
    metricsDiv.id = 'search-metrics';
    metricsDiv.style.cssText = 'text-align: center; margin: 10px 0; font-family: var(--font-mono);';
    document.querySelector('.progress-box').insertBefore(
      metricsDiv, 
      document.getElementById('progress-details')
    );
  }
  
  metricsDiv.innerHTML = `
    <strong>${currentMetrics.currentFilm}</strong><br>
    Strategies: ${currentMetrics.strategiesRun} | 
    Results: ${currentMetrics.resultsFound} | 
    Total Searches: ${currentMetrics.searchesDone}
  `;
}

function formatConsoleLine(line) {
  // Clean up and classify the line
  let cssClass = 'console-line';
  
  if (line.includes('✅ Found')) cssClass = 'console-line-success';
  else if (line.includes('🔍')) cssClass = 'console-line-search';
  else if (line.includes('======')) cssClass = 'console-line-header';
  else if (line.includes('🏆')) cssClass = 'console-line-score';
  else if (line.includes('📊 Progress:')) cssClass = 'console-line-progress';
  
  // Make emojis slightly transparent
  line = line.replace(/([\u{1F300}-\u{1F9FF}])/gu, '<span class="console-line-emoji">$1</span>');
  
  // Add timestamp
  const time = new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  
  return `<div class="${cssClass}">[${time}] ${line}</div>`;
}

function checkForSelectedProfile() {
    // Check if user selected a profile from the selector page
    const selectedProfile = localStorage.getItem('selectedProfile');

    if (selectedProfile) {
        // Update the dropdown to show the selected profile
        const profileDropdown = document.getElementById('profile-select');
        if (profileDropdown) {
            profileDropdown.value = selectedProfile;
            
            // Update the description text
            const event = new Event('change');
            profileDropdown.dispatchEvent(event);
        }
        
        // Clear after loading so they don't stick forever
        localStorage.removeItem('selectedProfile');
        
        // Optional: Show a little message
        console.log(`Profile "${selectedProfile}" selected from Profile Selector`);
    }
}

// ADD THE CANCEL BUTTON CODE HERE!
document.getElementById('cancel-btn').addEventListener('click', async () => {
  console.log('Cancel button clicked');
  
  const result = await window.magicLantern.stopSearch();
  
  if (result.success) {
    // Hide progress, show config
    document.getElementById('progress-section').style.display = 'none';
    document.getElementById('config-section').style.display = 'block';
    
    // Clear the progress bar
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-text').textContent = 'Search cancelled';
    document.getElementById('progress-details').innerHTML += '<br><strong>Search cancelled by user</strong>';
  }
});