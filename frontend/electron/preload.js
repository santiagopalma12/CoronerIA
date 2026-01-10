const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getAppPath: () => ipcRenderer.invoke('get-app-path'),

    // API para el backend
    onTranscriptionPartial: (callback) => {
        ipcRenderer.on('transcription:partial', (event, text) => callback(text));
    },
    onTranscriptionFinal: (callback) => {
        ipcRenderer.on('transcription:final', (event, text) => callback(text));
    }
});
