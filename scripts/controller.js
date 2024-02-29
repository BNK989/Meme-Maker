'use strict'
/** @type {HTMLCanvasElement} */

let gCanvas
let gCtx
const gTexts = []
let gIsClicking = false
let gCurrTextIdx = NaN
const gGrabOffset = { x: 0, y: 0 }
let gExpandArea = 3
//const gTouchEvs = ['touchstart', 'touchmove', 'touchend']

let gCurrImg

window.onload = function () {
  gCanvas = document.getElementById('main-canvas')
  gCtx = gCanvas.getContext('2d')
  gCanvas.width = window.innerWidth / 2
  gCanvas.height = window.innerHeight - 160

  const temp = new Text('CREATE YOUR OWN MEME', 20, 60, 30)
  gTexts.push(temp)
  temp.writeText()
  temp.makeRectAround()

  addListeners()
  addImages()
}

function addListeners() {
  gCanvas.ontouchstart = onDown

  gCanvas.onmousemove = mouseMove
  gCanvas.ontouchmove = mouseMove

  gCanvas.onmouseup = onUp
  gCanvas.ontouchend = onUp

  window.addEventListener('resize', function () {
    gCanvas.width = window.innerWidth / 2.2
    gCanvas.height = window.innerHeight - 200
  })
  setTimeout(addDragAndDrop, 99)
}

function addDragAndDrop() {
  const dropArea = document.getElementById('drop-area')
  const uploadedImage = document.getElementById('uploaded-image')

  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault()
    dropArea.classList.add('active')
  })

  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('active')
  })

  dropArea.addEventListener('drop', (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    const reader = new FileReader()

    reader.onload = () => {
      uploadedImage.src = reader.result
      uploadedImage.style.display = 'block'
    }
    uploadedImage.onload = () => setImage(uploadedImage)

    reader.readAsDataURL(file)
    dropArea.classList.remove('active')
  })

  dropArea.addEventListener('click', () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      const reader = new FileReader()

      reader.onload = () => {
        uploadedImage.src = reader.result
        uploadedImage.style.display = 'block'
      }
      uploadedImage.onload = () => setImage(uploadedImage)

      reader.readAsDataURL(file)
    }
    input.click()
  })
}

function addImages() {
  const imgHTML = loadImages()
  const elUl = document.querySelector('ul.img-selector')
  elUl.innerHTML = imgHTML
  const firstImg = document.querySelectorAll('ul.img-selector img')[1]
  firstImg.onload = () => setImage(firstImg)
}

function setImage(elImg) {
  gCurrImg = elImg
  const aspectRatio = gCurrImg.width / gCurrImg.height
  gCanvas.width = window.innerWidth / 2.8
  gCanvas.height = gCanvas.width  / aspectRatio
  

  gCtx.drawImage(gCurrImg, 0, 0, gCanvas.width , gCanvas.height  )
  gTexts.forEach((text) => text.writeText())
}

const mouseMove = (e) => {
  e.preventDefault()
  const pos = getEventPos(e)
  for (let idx = 0; idx < gTexts.length; idx++) {
    if (isMouseOnRect(pos.x, pos.y, gTexts[idx])) {
      gCanvas.onmousedown = onDown
      gCurrTextIdx = idx
      gCanvas.style.cursor = 'grab'
      gTexts[idx].makeRectAround()
      gExpandArea = 10
      if (isMouseOnCircle(pos.x, pos.y, gTexts[idx])) {
        gCanvas.style.cursor = 'nwse-resize'
        if (gIsClicking) onResize(pos, gTexts[idx])
        return
      }
      if (gIsClicking || isEventTouch(e.type)) {
        move(pos, gTexts[idx])
        onTextSelect(idx)
      }
      return
    } else if (idx === gTexts.length - 1) {
      _resetCanvas()
      gTexts[idx].writeText()
      gCanvas.style.cursor = 'initial'
      gCanvas.onmousedown = null
    }
  }
}

const onDown = (e) => {
  const pos = getEventPos(e)
  gGrabOffset.x = pos.x - gTexts[gCurrTextIdx].pos.x
  gGrabOffset.y = pos.y - gTexts[gCurrTextIdx].pos.y

  e.preventDefault()
  gIsClicking = true
}

function move({ x, y }, text) {
  gCanvas.style.cursor = 'grabbing'
  _resetCanvas()
  text.pos.x = x - gGrabOffset.x
  text.pos.y = y - gGrabOffset.y
  text.writeText()
  text.makeRectAround()
}

const onUp = (e) => {
  e.preventDefault()
  gIsClicking = false
  gExpandArea = 3
}

function onResize({ x }, text) {
  if (gGrabOffset.prevX > x) {
    text.fontSize -= 0.1
  } else {
    text.fontSize += 0.1
  }
  gGrabOffset.prevX = x
  _resetCanvas()
  text.writeText()
  text.makeRectAround()
}

function onImgInput(e) {
  loadImageFromInput(e)
}

function renderImg(img) {
  gCurrImg = img
  _resetCanvas()
}

function onTextSelect(idx) {
  const elTextInput = document.getElementById('text-field')
  elTextInput.value = gTexts[idx].str
}

function onTextInputChange(el) {
  const canvasText = gTexts[gCurrTextIdx]
  if (!el.value || !canvasText) return
  canvasText.str = el.value
  _resetCanvas()
  canvasText.writeText()
  canvasText.makeRectAround()
}

function onAddText() {
  const newText = new Text('CLICK TO EDIT')
  newText.writeText()
  newText.makeRectAround()
  gTexts.push(newText)
  gCurrTextIdx = gTexts.length - 1
  onTextSelect(gCurrTextIdx)
}

function onRemoveText() {
  if (gTexts.length === 1) return
  gTexts.splice(gCurrTextIdx, 1)
  _resetCanvas()
  document.getElementById('text-field').value = ''
}

function onSwitchText() {
  const len = gTexts.length
  if (len === 1) return
  if (gCurrTextIdx < len - 1) {
    gCurrTextIdx++
  } else {
    gCurrTextIdx = 0
  }
  _resetCanvas()
  gTexts[gCurrTextIdx].makeRectAround()
  onTextSelect(gCurrTextIdx)
}

function onDownloadImg(elLink) {
  const imgContent = gCanvas.toDataURL('image/jpeg')
  elLink.href = imgContent
}

function onSave() {
  const memeObjToSave = {
    img: JSON.stringify(gCurrImg),
    text: gTexts,
  }
  console.log(memeObjToSave.img)
  saveMemesToStorage(memeObjToSave)
}

function onLoadSavedMeme() {
  const memeFromMemory = loadFromStorage(KEY)
  console.log(memeFromMemory)
}

// ===== local functions ====== //
function _resetCanvas() {
  gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height)
  if (gCurrImg) setImage(gCurrImg)
}

function toggleGallery() {
  const elGallery = document.querySelector('section.gallery-overlay').classList
  const elCanvas = document.querySelector('main.main-body').classList
  console.log(elGallery.contains('hide'))
  if (!elGallery.contains('hide')) {
    elGallery.add('hide')
    elCanvas.remove('hide')
  } else {
    elGallery.remove('hide')
    elCanvas.add('hide')
  }
}
