'use strict'

var gMeme = {
  selectedImgId: 5,
  selectedLineIdx: 0,
  lines: [{ txt: 'I sometimes eat Falafel', size: 20, color: 'red' }],
}
var gKeywordSearchCountMap = { funny: 12, cat: 16, baby: 2 }

function loadMiniGalImages() {
  let htmlStr = '<li><div id="drop-area" class="drop-area"><img id="uploaded-image"> <span>ADD IMAGE</span></div></li>'
  gImgs.forEach((img) => {
    htmlStr += `<li><img onclick="setImage(this)" src="Media/Square/${img.url}" alt="${img.keywords.join('-')}" /></li>`
  })
  return htmlStr
}

class Text {
  #ctx
  constructor(str, x = 20, y = 60, fontSize = 30, fontFam = 'Impact') {
    this.#ctx = gCtx
    this.#ctx.font = `${this.fontSize}px ${this.fontFam}`
    this.#ctx.fillStyle = `${this.fillStyle}` 
    this.#ctx.strokeStyle = `${this.strokeStyle}`

    this.str = str
    this.pos = { x: x, y: y }
    this.rectPos = { x: this.x - 10, y: this.y - this.fontSize }
    this.fontSize = fontSize
    this.fontFam = fontFam
    this.fillStyle = 'white'
    this.strokeStyle = 'black'
    this.width = this.#ctx.measureText(this.str).width + 20
    this.height = this.fontSize * 1.2
    this.reSizeDot = { x: this.width * 1.03, y: this.fontSize * 2.2 }
    this.r = 6
  }

  writeText() {
    this.#ctx.font = `${this.fontSize}px ${this.fontFam}`
    this.#ctx.fillStyle = `${this.fillStyle}` 
    this.#ctx.strokeStyle = `${this.strokeStyle}`
    this.#ctx.lineWidth = 3
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

function isMouseOnRect(x, y, text) {
  return (
    x >= text.rectPos.x - gExpandArea &&
    y >= text.rectPos.y - gExpandArea &&
    x <= text.rectPos.x + text.width + gExpandArea &&
    y <= text.rectPos.y + text.height + gExpandArea
  )
}

function isMouseOnCircle(x, y, text) {
  const distance = Math.sqrt(
    (text.reSizeDot.x - x) ** 2 + (text.reSizeDot.y - y) ** 2
  )
  return distance <= text.r * gExpandArea * 1.2
}

function loadImageFromInput(e) {
  const reader = new FileReader()

  if (!e.target.files.length) {
    // drag event TODO not working ATM
    e = e.dataTransfer.files
    reader.onload = (e) => {
      const img = new Image()
      console.log(e)
      img.src = e.result
      img.onload = () => renderImg(img)
    }
    //reader.readAsDataURL(e.files[0])
  } else {
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => renderImg(img)
    }
    reader.readAsDataURL(e.target.files[0])
  }
}

function getEventPos(e) {
  let pos = {
    x: e.offsetX,
    y: e.offsetY,
  }
  if (['touchstart', 'touchmove', 'touchend'].includes(e.type)) {
    e.preventDefault()
    e = e.changedTouches[0]
    let rect = e.target.getBoundingClientRect()
    pos = {
      x: e.pageX - rect.left,
      y: e.pageY - rect.top,
    }
  }
  return pos
}

function isEventTouch(type) {
  return ['touchstart', 'touchmove', 'touchend'].includes(type)
}
