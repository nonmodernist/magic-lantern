document.getElementById('test-btn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.textContent = 'Testing connection...';
  status.className = '';
  
  try {
    const result = await window.magicLantern.testConnection();
    status.innerHTML = `
      <strong>✅ Connection successful!</strong><br>
      Version: ${result.version}<br>
      Available profiles: ${result.profiles.join(', ')}
    `;
    status.className = 'success';
  } catch (error) {
    status.textContent = '❌ Connection failed: ' + error.message;
    status.className = 'error';
  }
});

// Check if magicLantern API is available
console.log('magicLantern API available?', window.magicLantern);

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  
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

// Update file selection to show config section
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
      document.getElementById('config-section').style.display = 'block';
      
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
    
    if (results.success) {
      // Store the file paths for the results viewer
      localStorage.setItem('comprehensiveResultsPath', results.comprehensivePath);
      if (results.fullTextPath) {
        localStorage.setItem('fullTextResultsPath', results.fullTextPath);
      }
      localStorage.setItem('searchTimestamp', results.timestamp);
      
      // Navigate to results page
      window.location.href = 'comprehensive-results.html';
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
  
  if (data.detail) {
    // Append to details
    const time = new Date().toLocaleTimeString();
    progressDetails.innerHTML += `[${time}] ${data.detail}<br>`;
    progressDetails.scrollTop = progressDetails.scrollHeight;
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