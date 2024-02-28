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

  setImage(document.querySelector('.default-img'))
  const temp = new Text('CREATE YOUR OWN MEME', 20, 60, 30)
  gTexts.push(temp)
  temp.writeText()
  temp.makeRectAround()

  addListeners()
}

function addListeners() {
  gCanvas.ontouchstart = onDown

  gCanvas.onmousemove = mouseMove
  gCanvas.ontouchmove = mouseMove

  gCanvas.onmouseup = onUp
  gCanvas.ontouchend = onUp
  const dropArea = document.getElementById('drop-area')

  dropArea.addEventListener('dragover', function (e) {
    e.preventDefault()
  })

  dropArea.addEventListener('drop', function (e) {
    e.preventDefault()
    loadImageFromInput(e)
  })
}

window.addEventListener('resize', function () {
  gCanvas.width = window.innerWidth / 2
  gCanvas.height = window.innerHeight - 160
})

function setImage(elImg) {
  gCurrImg = elImg
  const aspectRatio = gCurrImg.width / gCurrImg.height
  gCanvas.height = gCanvas.width / aspectRatio

  gCtx.drawImage(gCurrImg, 0, 0, gCanvas.width, gCanvas.height)
  gTexts.forEach((text) => text.writeText())
}

class Text {
  #ctx
  constructor(str, x = 20, y = 60, fontSize = 30, fontFam = 'Impact') {
    this.#ctx = gCtx
    this.str = str
    this.pos = { x: x, y: y }
    this.rectPos = { x: this.x - 10, y: this.y - this.fontSize }
    this.fontSize = fontSize
    this.#ctx.font = `${this.fontSize}px ${this.fontFam}`
    this.width = this.#ctx.measureText(this.str).width + 20
    this.height = this.fontSize * 1.2
    this.reSizeDot = { x: this.width * 1.03, y: this.fontSize * 2.2 }
    this.r = 6
  }

  writeText() {
    this.#ctx.font = `${this.fontSize}px Impact`
    this.#ctx.fillStyle = 'white'
    this.#ctx.lineWidth = 5
    this.#ctx.strokeText(this.str, this.pos.x, this.pos.y)
    this.#ctx.fillText(this.str, this.pos.x, this.pos.y)
    this.height = this.fontSize * 1.2
    this.width = this.#ctx.measureText(this.str).width + 20
    this.#ctx.lineWidth = 1
  }

  makeRectAround() {
    this.rectPos = { x: this.pos.x - 10, y: this.pos.y - this.fontSize }
    this.#ctx.setLineDash([10])
    this.#ctx.beginPath()
    this.#ctx.rect(this.rectPos.x, this.rectPos.y, this.width, this.height)
    this.#ctx.stroke()
    this.reSizeDot.x = this.rectPos.x + this.width
    this.reSizeDot.y = this.rectPos.y + this.height
    this.makeResizeDot()
  }

  makeResizeDot() {
    this.#ctx.beginPath()
    this.#ctx.setLineDash([1])
    this.#ctx.arc(this.reSizeDot.x, this.reSizeDot.y, this.r, 0, 2 * Math.PI)
    this.#ctx.closePath()
    this.makeResizeTriangle()
  }

  makeResizeTriangle() {
    this.#ctx.beginPath()
    this.#ctx.moveTo(this.reSizeDot.x, this.reSizeDot.y)
    this.#ctx.lineTo(this.reSizeDot.x, this.reSizeDot.y - 12)
    this.#ctx.lineTo(this.reSizeDot.x - 12, this.reSizeDot.y)
    this.#ctx.closePath()
    this.#ctx.fill()
    this.#ctx.stroke()
  }
}

let mouseMove = (e) => {
  e.preventDefault()
  const pos = getEventPos(e)
  //gTexts.find((text, idx) => {
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
    } else if (idx === 1) {
      _resetCanvas()
      gTexts[idx].writeText()
      gCanvas.style.cursor = 'initial'
      gCanvas.onmousedown = null
    }
  }//)
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

let onUp = (e) => {
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
  gCanvas.height = (img.naturalHeight / img.naturalWidth) * gCanvas.width
  gCtx.drawImage(img, 0, 0, gCanvas.width, gCanvas.height)
}

function onAddText() {
  const newText = new Text('test')
  newText.writeText()
  newText.makeRectAround()
  gTexts.push(newText)
}

// ===== local functions ====== //
function _resetCanvas() {
  gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height)
  if (gCurrImg) setImage(gCurrImg)
}
