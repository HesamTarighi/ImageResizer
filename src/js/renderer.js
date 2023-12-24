document.addEventListener('DOMContentLoaded', main)

function isEmptyImage () {
    const src = document.getElementById('image').getAttribute('src')
    const is_empty =
        src == "" ||
        src == null ||
        src == undefined;

    return is_empty
}

function main () {
    checkImageStatus()
}

function openDialog () {
    ipcRenderer.send('OPEN_DIALOG')
}

function addImage (image_path) {
    const img_el = document.getElementById('image')

    img_el.setAttribute('src', image_path)

    checkImageStatus()
}

function checkImageStatus () {
    const empty_picture__select_button = document.getElementById('empty_picture-select_button')
    const image_box = document.getElementById('image_box')
    const real_image_size = document.getElementById('real_image_size')
    const inputs_box = document.getElementById('inputs_box')

    if (isEmptyImage()) {
        empty_picture__select_button.style.display = 'block'
        image_box.style.display = 'none'
        real_image_size.style.display = 'none'
        inputs_box.style.display = 'none'
    }
    else {
        image_box.style.display = 'block'
        real_image_size.style.display = 'block'
        inputs_box.style.display = 'block'
        empty_picture__select_button.style.display = 'none'
    }
}

function resizeImage() {
    if (!isEmptyImage()) {
        const image_path = document.getElementById('image').getAttribute('src')
        const width = document.getElementById('width_inp').value
        const height = document.getElementById('height_inp').value
    
        ipcRenderer.send('RESIZE_IMAGE', {image_path: image_path, size: {width: Number(width), height: Number(height)}})
    }
}

function showTargetImagePath (path) {
    const target_image_path_el = document.getElementById('target_image_path')

    target_image_path_el.value = path
}

function changeTargetImagePath () {
    const target_image_path_el = document.getElementById('target_image_path')

    ipcRenderer.send('CHANGE_TARGET_IMAGE_PATH', target_image_path_el.value)
}

// IpcRenderer
ipcRenderer.on('IMAGE', (e, image_path) => addImage(image_path))
ipcRenderer.on('TARGET_IMAGE_PATH', (e, path) => showTargetImagePath(path))
ipcRenderer.on('NOTIFICATION', (e, {type, message}) => {
    alertify[type](message)
})
