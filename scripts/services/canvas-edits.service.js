'use strict'

const gImgs = [
  { id: 1, url: '1.jpg', keywords: ['trump', 'politics'] },
  { id: 2, url: '2.jpg', keywords: ['cute', 'puppies', 'dog', 'pet'] },
  { id: 3, url: '3.jpg', keywords: ['cute', 'puppies', 'dog', 'pet', 'baby'] },
  { id: 4, url: '4.jpg', keywords: ['cute', 'cat', 'kittens', 'pet'] },
  { id: 5, url: '5.jpg', keywords: ['cute', 'baby', 'kid', 'child'] },
  { id: 6, url: '6.jpg', keywords: ['funny', 'men', 'explain', 'joke'] },
  { id: 7, url: '7.jpg', keywords: ['cute', 'baby', 'kid', 'child'] },
  { id: 8, url: '8.jpg', keywords: ['explain', 'men', 'funny', 'classic'] },
  { id: 9, url: '9.jpg', keywords: ['cute', 'baby', 'kid', 'child'] },
  { id: 10, url: '10.jpg', keywords: ['obama', 'politics', 'funny', 'face'] },
  { id: 11, url: '11.jpg', keywords: ['gay', 'men', 'kiss', 'sport', 'funny'] },
  { id: 12, url: '12.jpg', keywords: ['explain', 'men', 'you', 'tv'] },
  { id: 13, url: '13.jpg', keywords: ['men', 'celeb', 'you'] },
  { id: 14, url: '14.jpg', keywords: ['matrix', 'pill', 'glasses', 'neo', 'men'] },
  { id: 15, url: '15.jpg', keywords: ['got', 'tv', 'okay', 'men'] },
  { id: 16, url: '16.jpg', keywords: ['tv', 'space', 'classic', 'men'] },
  { id: 17, url: '17.jpg', keywords: ['asshole', 'men', 'russia', 'politics'] },
  { id: 18, url: '18.jpg', keywords: ['buzz', 'toy', 'explain', 'classic'] },

]
var gMeme = {
  selectedImgId: 5,
  selectedLineIdx: 0,
  lines: [{ txt: 'I sometimes eat Falafel', size: 20, color: 'red' }],
}
var gKeywordSearchCountMap = { funny: 12, cat: 16, baby: 2 }

function loadImages() {
  let htmlStr = ''
  //let htmlStr = '<li><label for="input-file" id="drop-area"><input onchange="onImgInput(event)" name="image-upload" type="file" accept="image/*" /><div id="image-view"><img src="Media/icon.png" alt=""></div></label></li>'
  gImgs.forEach((img) => {
    htmlStr += `<li><img onclick="setImage(this)" src="Media/Square/${img.url}" alt="${img.keywords.join('-')}" /></li>`
  })
  return htmlStr
}

//<li><img onclick="setImage(this)" src="/Media/win.jpeg" alt="" /></li>

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
