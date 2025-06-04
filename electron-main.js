const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  console.log('🚀 Creating Electron window...')
  
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  
  win.loadFile('ui/index.html')
  
  // Open DevTools for debugging
  win.webContents.openDevTools()
  
  console.log('✅ Window created and loading UI...')
}

app.whenReady().then(() => {
  console.log('⚡ Electron app is ready')
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})