'use strict'

/** @type {HTMLImageElement} */

function loadImages(val) {
  const imagesHTML = mainGalleryloadImages(val)

  const elGalleryUl = document.querySelector('.gallery ul')
  elGalleryUl.innerHTML = imagesHTML
}

function onSearch(val) {
  loadImages(val)
}
