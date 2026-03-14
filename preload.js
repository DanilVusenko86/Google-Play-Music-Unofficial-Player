const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('modules', {
    scanFolder: (folderList, subDir) => ipcRenderer.invoke('scanFolder', folderList, subDir),
    getMetadata: (filePath) => ipcRenderer.invoke('getMetadata', filePath),
    selectFolder: () => ipcRenderer.invoke('selectFolder'),

    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close:    () => ipcRenderer.send('window:close'),
});