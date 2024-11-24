const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    compile: async () =>
        ipcRenderer.invoke('compile', ""),
    select_file: async () =>
        ipcRenderer.invoke('select_file', ""),
});
