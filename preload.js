const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  saveColor: (color) => ipcRenderer.send("save-color", color),
  scanMusicFolder: (folderPath) => ipcRenderer.send('scanMusicFolder', folderPath),
  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.send("maximize"),
  unmaximize: () => ipcRenderer.send("unmaximize"),
  isMaximized: () => ipcRenderer.invoke("ismaximized"),
});