const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  /* selectFolder: () => ipcRenderer.invoke("select-folder"),
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath), */
  saveConfig: (filePath, data) =>
    ipcRenderer.invoke("save-config", filePath, data),
  openConfigFile: () => ipcRenderer.invoke("open-config-file"),
  openCSVFile: () => ipcRenderer.invoke("open-csv-file"),
});
