const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const fs = require('fs')
const {homedir} = require('os')
const path = require('path')
const imageResizer = require('resize-img')
const {JsonEditor} = require('./modules/JsonEditor')
const {__IMAGE_EXTENSIONS} = require('./global_variables.js')

let win

function createWindow (size = {width: 600, height: 700}, file_address = __dirname + '/src/index.html') {
    win = new BrowserWindow({
        width: size.width,
        height: size.height,
        webPreferences: {
            nodeIntegration: true,
            preload: __dirname + '/src/js/preload.js'
        }
    })

    win.loadFile(file_address)
}

function main () {
    // Init Set Data
    JsonEditor.get('./database.json', ({target_image_path}) => {
        if (!target_image_path || target_image_path == null || target_image_path == null) {
            JsonEditor.edit('./database.json', undefined, {target_image_path: path.join(homedir(), '/Desktop/')})
        }
    })

    // Init Send Event
    JsonEditor.get(path.join(__dirname, '/database.json'), ({target_image_path}) => win.webContents.send('TARGET_IMAGE_PATH', target_image_path))
    
    // IpcMain
    ipcMain.on('OPEN_DIALOG', () => {
        dialog.showOpenDialog({
            title: 'Select Image',
            buttonLabel: 'Select',
            path: homedir() + '/Desktop',
            filters: [
                {
                    name: 'Image file',
                    extensions: __IMAGE_EXTENSIONS
                }
            ]
        }).then(file => {
            if (file.filePaths[0]) win.webContents.send('IMAGE', file.filePaths[0])
        })
    })
    
    ipcMain.on('RESIZE_IMAGE', (e, options) => {
        if (options.size.width != '' && options.size.height != '') {
            if (/\d/.test(options.size.width) && /\d/.test(options.size.height)) {
                const new_image_data = imageResizer(fs.readFileSync(options.image_path), {
                    width: options.size.width,
                    height: options.size.height
                })
                const new_image_name = Math.floor(1 + Math.random() * 999999999)
    
                new_image_data.then(data => {
                    JsonEditor.get(path.join(__dirname, '/database.json'), ({target_image_path}) => {
                        fs.writeFile(path.join(target_image_path, new_image_name + path.extname(options.image_path)), data, err => {
                            if (err) win.webContents.send('NOTIFICATION', {message: 'Target path not exist!', type: 'error'})
                            else win.webContents.send('NOTIFICATION', {message: 'The image resized.', type: 'success'})
                        })
                    })
                })
            } else win.webContents.send('NOTIFICATION', {message: 'Input value is not valid!', type: 'error'})

        } else win.webContents.send('NOTIFICATION', {message: 'The input value is empty!', type: 'error'})
    })

    ipcMain.on('CHANGE_TARGET_IMAGE_PATH', (e, target_path) => JsonEditor.edit('./database.json', undefined, {target_image_path: target_path}))
}

app.on('ready', async () => {
    await createWindow()
    win.webContents.on('did-finish-load', () => main())
})

