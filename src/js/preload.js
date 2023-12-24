const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, payload) => ipcRenderer.send(channel, payload),
    on: (channel, callback) => ipcRenderer.on(channel, callback)
})
