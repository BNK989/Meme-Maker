'use strict'

var gImgs = [{ id: 1, url: 'img/1.jpg', keywords: ['funny', 'cat'] }]
var gMeme = {
  selectedImgId: 5,
  selectedLineIdx: 0,
  lines: [{ txt: 'I sometimes eat Falafel', size: 20, color: 'red' }],
}
var gKeywordSearchCountMap = { funny: 12, cat: 16, baby: 2 }

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

function isEventTouch(type){
  return ['touchstart', 'touchmove', 'touchend'].includes(type)
}