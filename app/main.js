const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let currentSearchProcess = null;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('app/pages/home/index.html');

  // Open DevTools in development
  if (process.env.NODE_ENV !== 'production') {
    mainWindow.webContents.openDevTools();
  }
}

// Handle test connection
ipcMain.handle('test-connection', async () => {
  console.log('test-connection handler called');

  try {
    // Test that we can access Magic Lantern
    const path = require('path');
    const magicLanternPath = path.join(__dirname, '..', 'core', 'magic-lantern-v5.js');

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(magicLanternPath)) {
      throw new Error('Magic Lantern core not found at: ' + magicLanternPath);
    }

    // Try to require it
    const UnifiedMagicLantern = require('../core/magic-lantern-v5');

    return {
      success: true,
      message: 'Magic Lantern core loaded successfully!',
      version: 'v5',
      profiles: ['default', 'adaptation-studies', 'labor-history', 'early-cinema', 'regional-reception']
    };
  } catch (error) {
    console.error('Handler error:', error);
    throw new Error(`Failed to load Magic Lantern: ${error.message}`);
  }
});

// Handle file selection
ipcMain.handle('select-file', async () => {
  console.log('select-file handler called');

  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Film CSV File',
    properties: ['openFile'],
    filters: [
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    console.log('File selected:', filePath);

    // Read the file to get a preview
    const fs = require('fs');
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim().split('\n');
      const headers = lines[0];
      const filmCount = lines.length - 1; // Subtract header row

      return {
        path: filePath,
        name: path.basename(filePath),
        headers: headers,
        filmCount: filmCount,
        preview: lines.slice(0, 4) // First 3 films + header
      };
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  return null;
});

ipcMain.handle('stop-search', async () => {
  console.log('Stop search requested');

  if (currentSearchProcess) {
    console.log('Killing search process...');
    currentSearchProcess.kill();
    currentSearchProcess = null;
    return { success: true };
  } else {
    console.log('No search process running');
    return { success: false, error: 'No search running' };
  }
});

ipcMain.handle('run-search', async (event, filePath, corpus, profile) => {
  console.log('Starting search with:', { filePath, corpus, profile });

  const { spawn } = require('child_process');
  const fs = require('fs');

  return new Promise((resolve, reject) => {
    // Spawn the process
    const child = spawn('node', [
      'magic-lantern-v5.js',
      filePath,
      `--corpus=${corpus}`,
      `--profile=${profile}`
    ], {
      cwd: path.join(__dirname, '..', 'core')  // Change working directory to core/    
    });

    // Keep track of this process so we can stop it later
    currentSearchProcess = child;

    let output = '';
    let errorOutput = '';

    // Capture stdout for progress
    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      console.log(chunk);

      // Send progress updates based on console output
      if (chunk.includes('🔍')) {
        mainWindow.webContents.send('search-progress', {
          status: 'Searching...',
          detail: chunk.trim(),
          percent: 30
        });
      } else if (chunk.includes('📊 Scoring')) {
        mainWindow.webContents.send('search-progress', {
          status: 'Scoring results...',
          detail: chunk.trim(),
          percent: 60
        });
      // } else if (chunk.includes('📚 Fetching full text')) {
      //   mainWindow.webContents.send('search-progress', {
      //     status: 'Fetching full text...',
      //     detail: chunk.trim(),
      //     percent: 80
      //   });
      } else if (chunk.includes('💾')) {
        mainWindow.webContents.send('search-progress', {
          status: 'Saving results...',
          detail: chunk.trim(),
          percent: 90
        });
      }
    });

    // Capture stderr
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('Stderr:', data.toString());
    });

    // Handle process exit
    child.on('exit', (code) => {
      console.log(`Search process exited with code ${code}`);
      console.log('Was currentSearchProcess null?', currentSearchProcess === null);

      // Clear our reference since the process ended
      currentSearchProcess = null;

      // Check if this was a cancellation (code will be null if process was killed)
      if (code === null) {
        console.log('Search was cancelled by user');
        // Don't reject, just resolve with a cancelled status
        resolve({
          success: false,
          cancelled: true,
          message: 'Search cancelled by user'
        });
        return;
      }

      // If code is NOT 0, it's an error
      if (code !== 0) {
        reject(new Error(`Search failed with exit code ${code}: ${errorOutput}`));
        return;
      }

      // If we get here, code is 0, which means success!
      console.log('Search completed successfully, finding results files...');


      // Find the results files
      try {
        const resultsDir = path.join(__dirname, '..', 'results');
        if (!fs.existsSync(resultsDir)) {
          reject(new Error('Results directory not found'));
          return;
        }

        const files = fs.readdirSync(resultsDir);

        // Sort files by timestamp (newest first)
        const sortedFiles = files
          .filter(f => f.endsWith('.json'))
          .sort((a, b) => {
            const statsA = fs.statSync(path.join(resultsDir, a));
            const statsB = fs.statSync(path.join(resultsDir, b));
            return statsB.mtime - statsA.mtime;
          });

        // Find the most recent comprehensive and full-text files
    const searchResultsFile = sortedFiles.find(f => f.includes('search-results'));

    if (!searchResultsFile) {
        reject(new Error('No search results file found'));
        return;
    }

        // Send completion with file paths
        mainWindow.webContents.send('search-progress', {
          status: 'Complete!',
          percent: 100
        });

    resolve({
        success: true,
        searchResultsPath: path.join(resultsDir, searchResultsFile),
        timestamp: new Date().toISOString()
    });

      } catch (error) {
        reject(new Error('Failed to find results: ' + error.message));
      }
    });

    // Handle process errors
    child.on('error', (error) => {
      console.error('Failed to start search process:', error);
      reject(new Error('Failed to start search: ' + error.message));
    });
  });
});

// handler to read results files
ipcMain.handle('read-results-file', async (event, filePath) => {
  const fs = require('fs');

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found: ' + filePath);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading results file:', error);
    throw error;
  }
});


ipcMain.handle('get-profiles', async () => {
  const profileLoader = require('../core/config/profiles');
  return profileLoader.list();
});

ipcMain.handle('get-profile', async (event, profileKey) => {
  const profileLoader = require('../core/config/profiles');
  return profileLoader.load(profileKey);
});

ipcMain.handle('save-profile', async (event, profileData) => {
  const fs = require('fs');
  const path = require('path');

  try {
    // Generate filename from profile name
    const filename = profileData.name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') + '.profile.js';

    const filePath = path.join(__dirname, '..', 'core', 'config', 'profiles', filename);

    // Generate the profile code
    const code = generateProfileCode(profileData);

    fs.writeFileSync(filePath, code);

    // Reload profiles
    delete require.cache[require.resolve('../core/config/profiles')];

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('test-profile', async (event, profileData) => {
  // Run a minimal test with the profile
  try {
    // Create temporary profile
    const tempProfile = { ...profileData };

    // Run on single test film
    const testFilm = {
      title: "The Wizard of Oz",
      year: "1939",
      author: "L. Frank Baum",
      director: "Victor Fleming",
      studio: "Metro-Goldwyn-Mayer"
    };

    // Use the strategy generator with this profile
    const SearchStrategyGenerator = require('../core/lib/search-strategy-generator');
    const generator = new SearchStrategyGenerator();
    generator.strategyWeights = profileData.searchStrategies.weights;

    const strategies = generator.generateAllStrategies(testFilm);

    return {
      success: true,
      strategiesGenerated: strategies.length,
      topStrategies: strategies.slice(0, 5).map(s => ({
        type: s.type,
        query: s.query,
        weight: s.profileWeight || 1.0
      }))
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// handler to test a real search
ipcMain.handle('test-real-search', async () => {
  const { exec } = require('child_process');
  const fs = require('fs');

  console.log('Starting real search test...');

  return new Promise((resolve) => {
    // Make sure we have a test CSV file
    const testCsvPath = path.join(__dirname, '..', 'core', 'data', 'films.csv');

    if (!fs.existsSync(testCsvPath)) {
      resolve({
        success: false,
        error: 'Test CSV file not found at core/data/films.csv'
      });
      return;
    }

    // Run Magic Lantern with minimal settings
    const command = `node magic-lantern-v5.js "${testCsvPath}" --corpus=test`;
    console.log('Executing:', command);

    exec(command, {
      cwd: path.join(__dirname, '..', 'core'),
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer for output
    }, (error, stdout, stderr) => {
      if (error) {
        console.error('Exec error:', error);
        resolve({
          success: false,
          error: error.message
        });
        return;
      }

      if (stderr) {
        console.error('Stderr:', stderr);
      }

      console.log('Search completed, checking for results...');

      try {
        // Check if results directory exists
        const resultsDir = path.join(__dirname, '..', 'results');
        if (!fs.existsSync(resultsDir)) {
          resolve({
            success: false,
            error: 'Results directory not created'
          });
          return;
        }

        // Find the most recent results file
        const files = fs.readdirSync(resultsDir);
        const searchResultFiles = files.filter(f =>
          f.includes('search-results') && f.endsWith('.json')
        );

        if (searchResultFiles.length === 0) {
          resolve({
            success: false,
            error: 'No results files found'
          });
          return;
        }

        // Get the most recent file
        searchResultFiles.sort();
        const latestFile = searchResultFiles[searchResultFiles.length - 1];
        const resultsPath = path.join(resultsDir, latestFile);

        console.log('Reading results from:', resultsPath);

        const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

        resolve({
          success: true,
          results: results,
          outputPath: resultsPath
        });

      } catch (parseError) {
        console.error('Parse error:', parseError);
        resolve({
          success: false,
          error: 'Failed to parse results: ' + parseError.message
        });
      }
    });
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


ipcMain.handle('find-recent-results', async () => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const resultsDir = path.join(__dirname, '..', 'results');
    
    if (!fs.existsSync(resultsDir)) {
      return null;
    }
    
    const files = fs.readdirSync(resultsDir);
    
    // Find all search results files
    const searchResultFiles = files.filter(f => 
      f.includes('search-results') && f.endsWith('.json')
    );
    
    if (searchResultFiles.length === 0) {
      return null;
    }
    
    // Sort by modification time to get the most recent
    const sortedFiles = searchResultFiles
      .map(file => ({
        name: file,
        path: path.join(resultsDir, file),
        time: fs.statSync(path.join(resultsDir, file)).mtime
      }))
      .sort((a, b) => b.time - a.time);
    
    // Read and return the most recent file
    const mostRecentPath = sortedFiles[0].path;
    const content = fs.readFileSync(mostRecentPath, 'utf8');
    
    // Also save the path to help future loads
    return JSON.parse(content);
    
  } catch (error) {
    console.error('Error finding recent results:', error);
    return null;
  }
});