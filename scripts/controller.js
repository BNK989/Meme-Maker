'use strict'
/** @type {HTMLCanvasElement} */

let gCanvas
let gCtx
const gTexts = []
let gIsClicking = false
let gCurrTextIdx = 0
const gGrabOffset = { x: 0, y: 0 }
let gExpandArea = 3
//const gTouchEvs = ['touchstart', 'touchmove', 'touchend']

let gCurrImg

window.onload = function () {
  gCanvas = document.getElementById('main-canvas')
  gCtx = gCanvas.getContext('2d')
  gCanvas.width = window.innerWidth / 2
  gCanvas.height = window.innerHeight - 160

  const firstText = new Text('CREATE YOUR OWN MEME', 20, 60, 30)
  gTexts.push(firstText)
  firstText.writeText()
  firstText.makeRectAround()

  addListeners()
  loadImages()
  addImages()
  loadWordCloud(3)
  resizeCanvas()
}

function addListeners() {
  gCanvas.ontouchstart = onDown

  gCanvas.onmousemove = mouseMove
  gCanvas.ontouchmove = mouseMove

  gCanvas.onmouseup = onUp
  gCanvas.ontouchend = onUp

  window.addEventListener('resize', resizeCanvas)
  setTimeout(addDragAndDrop, 99)
}

function resizeCanvas(ratio){
  if(window.innerWidth < 701){//mobile
    if(!ratio){
    gCanvas.width = window.innerWidth / 1.2
    gCanvas.height = window.innerHeight - 200
    } else {
    gCanvas.width = window.innerWidth / 1.2
    gCanvas.height = gCanvas.width / ratio
    }//desktop
  } else {
    if(!ratio){
    gCanvas.width = window.innerWidth / 2.2
    gCanvas.height = window.innerHeight - 200
  } else {
    gCanvas.width = window.innerWidth / 2.8
    gCanvas.height = gCanvas.width / ratio
  }
 }
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
  const imgHTML = loadMiniGalImages()
  const elUl = document.querySelector('ul.img-selector')
  elUl.innerHTML = imgHTML
  const firstImg = document.querySelectorAll('ul.img-selector img')[1]
  firstImg.onload = () => setImage(firstImg)
}

function setImage(elImg) {
  gCurrImg = elImg
  const aspectRatio = gCurrImg.width / gCurrImg.height
  resizeCanvas(aspectRatio)

  gCtx.drawImage(gCurrImg, 0, 0, gCanvas.width, gCanvas.height)
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
      RerenderCanvas(false)
      // _resetCanvas()
      // gTexts[idx].writeText()
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
    fontResize(-0.1)
  } else {
    fontResize(0.1)
  }
  gGrabOffset.prevX = x
}

function fontResize(val) {
  gTexts[gCurrTextIdx].fontSize += val
  RerenderCanvas(true)
}

function onSetFontFamily(fontFam) {
  gTexts[gCurrTextIdx].fontFam = fontFam
  RerenderCanvas(true)
}

function onSetTextColor(color) {
  gTexts[gCurrTextIdx].fillStyle = color
  RerenderCanvas(true)
}

function onSetStrokeColor(color) {
  gTexts[gCurrTextIdx].strokeStyle = color
  RerenderCanvas(true)
}

function RerenderCanvas(withRect = false) {
  _resetCanvas()
  if (!gCurrTextIdx) return
  const text = gTexts[gCurrTextIdx]
  text.writeText()
  if (withRect) text.makeRectAround()
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
  RerenderCanvas(true)
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
  RerenderCanvas(true)
  onTextSelect(gCurrTextIdx)
}

function onDownloadImg(elLink) {
  const imgContent = gCanvas.toDataURL('image/jpeg')
  elLink.href = imgContent
  modal('Meme Downloaded')
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

function toggleGallery(className) {
  const reqContent = document.querySelector(`.${className}`)
  const allShowingSec = document.querySelectorAll('.overlay')

  allShowingSec.forEach(sec => sec.classList.add('hide'))
  reqContent.classList.remove('hide')
}

function scrollMiniGal() {
  const el = document.querySelector('ul.img-selector')
  el.scroll({
    left: 100,
    behavior: 'smooth',
  })
}

function modal(text){
  const elModal = document.querySelector('.modal')
  elModal.innerText = text
  elModal.classList.remove('hide')
  setTimeout(()=>{
    elModal.classList.add('hide')
  },3500)
}