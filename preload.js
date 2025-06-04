const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script running');

try {
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
    testRealSearch: () => {
      console.log('testRealSearch called from renderer');
      return ipcRenderer.invoke('test-real-search');
    },
    // Add this new method
    readResultsFile: (filePath) => {
      console.log('readResultsFile called with:', filePath);
      return ipcRenderer.invoke('read-results-file', filePath);
    },
    // Listen for progress updates
    onSearchProgress: (callback) => {
      ipcRenderer.on('search-progress', (event, data) => callback(data));
    }
  });
  
  console.log('Context bridge exposed successfully');
} catch (error) {
  console.error('Failed to expose context bridge:', error);
}