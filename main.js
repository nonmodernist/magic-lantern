const { app, BrowserWindow, ipcMain } = require('electron');
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