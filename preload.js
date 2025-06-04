const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script running');



contextBridge.exposeInMainWorld('magicLantern', {
  testConnection: () => {
    console.log('testConnection called from renderer');
    return ipcRenderer.invoke('test-connection');
  },
  selectFile: () => {
    console.log('selectFile called from renderer');
    return ipcRenderer.invoke('select-file');
  },
  runSearch: (filePath, corpus, profile) => {
    console.log('runSearch called with:', { filePath, corpus, profile });
    return ipcRenderer.invoke('run-search', filePath, corpus, profile);
  },
  // ADD THIS NEW METHOD
  testRealSearch: () => {
    console.log('testRealSearch called from renderer');
    return ipcRenderer.invoke('test-real-search');
  },
  // Listen for progress updates
  onSearchProgress: (callback) => {
    ipcRenderer.on('search-progress', (event, data) => callback(data));
  }
});

console.log('Context bridge exposed');