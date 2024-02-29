'use strict'

/** @type {HTMLElement} */

function loadImages(val) {
  const imagesHTML = mainGalleryloadImages(val)

  const elGalleryUl = document.querySelector('.gallery ul')
  elGalleryUl.innerHTML = imagesHTML
}

function loadWordCloud() {
  const worldCloudHTML = createWordCloud()

  const elCloud = document.querySelector('.wordclouds')
  elCloud.innerHTML = worldCloudHTML
}

function wordcloudClick(el) {
  loadImages(el.innerText)
  const elSearchBox = document.querySelector('.search-input')
  elSearchBox.value = el.innerText

  const other = document.querySelectorAll('.activeTerm')
  other.forEach(elm => elm.classList.remove('activeTerm'))
  el.classList.add('activeTerm')
  
}
