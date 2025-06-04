const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script running');

contextBridge.exposeInMainWorld('magicLantern', {
  testConnection: () => {
    console.log('testConnection called from renderer');
    return ipcRenderer.invoke('test-connection');
  }
});

console.log('Context bridge exposed');