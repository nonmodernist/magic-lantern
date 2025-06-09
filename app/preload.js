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
    // Read results file method
    readResultsFile: (filePath) => {
      console.log('readResultsFile called with:', filePath);
      return ipcRenderer.invoke('read-results-file', filePath);
    },
    // NEW: Find recent results method
    findRecentResults: () => {
      console.log('findRecentResults called from renderer');
      return ipcRenderer.invoke('find-recent-results');
    },
    // Listen for progress updates
    onSearchProgress: (callback) => {
      ipcRenderer.on('search-progress', (event, data) => callback(data));
    },
    stopSearch: () => {
      console.log('stopSearch called from renderer');
      return ipcRenderer.invoke('stop-search');
    },

    // app/preload.js
// Add these to the contextBridge.exposeInMainWorld('magicLantern', { ... }) object:

getProfiles: () => {
  console.log('getProfiles called from renderer');
  return ipcRenderer.invoke('get-profiles');
},
getProfile: (profileKey) => {
  console.log('getProfile called with:', profileKey);
  return ipcRenderer.invoke('get-profile', profileKey);
},
saveProfile: (profileData) => {
  console.log('saveProfile called with:', profileData);
  return ipcRenderer.invoke('save-profile', profileData);
},
testProfile: (profileData) => {
  console.log('testProfile called with:', profileData);
  return ipcRenderer.invoke('test-profile', profileData);
},
  });
  
  console.log('Context bridge exposed successfully');
} catch (error) {
  console.error('Failed to expose context bridge:', error);
}