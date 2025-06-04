const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

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

  mainWindow.loadFile('ui/index.html');
  
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
    const magicLanternPath = path.join(__dirname, 'magic-lantern-v5.js');
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(magicLanternPath)) {
      throw new Error('Magic Lantern core not found at: ' + magicLanternPath);
    }
    
    // Try to require it
    const UnifiedMagicLantern = require('./magic-lantern-v5');
    
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

// Handle search execution
ipcMain.handle('run-search', async (event, filePath, corpus, profile) => {
  console.log('Starting search with:', { filePath, corpus, profile });
  
  try {
    // Import Magic Lantern
    const UnifiedMagicLantern = require('./magic-lantern-v5');
    
    // Create instance with selected options
    const lantern = new UnifiedMagicLantern(corpus, profile);
    
    // Send progress update
    mainWindow.webContents.send('search-progress', {
      status: 'Loading Magic Lantern...',
      percent: 10
    });
    
    // For now, let's just simulate a search
    // In the real implementation, we'd need to modify Magic Lantern to emit progress events
    
    mainWindow.webContents.send('search-progress', {
      status: 'Reading CSV file...',
      detail: `Loading films from ${path.basename(filePath)}`,
      percent: 20
    });
    
    // Simulate some progress
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    mainWindow.webContents.send('search-progress', {
      status: 'Searching...',
      detail: 'Generating search strategies...',
      percent: 50
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    mainWindow.webContents.send('search-progress', {
      status: 'Processing results...',
      detail: 'Scoring and ranking...',
      percent: 80
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    mainWindow.webContents.send('search-progress', {
      status: 'Complete!',
      percent: 100
    });
    
    // Return mock results for now
    return {
      success: true,
      filmsProcessed: 1,
      totalResults: 42,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
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