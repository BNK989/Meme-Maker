'use strict'

/** @type {HTMLElement} */

function loadImages(val) {
  const imagesHTML = mainGalleryloadImages(val)

  const elGalleryUl = document.querySelector('.gallery ul')
  elGalleryUl.innerHTML = imagesHTML
}

function loadWordCloud(maxWords) {
  const worldCloudHTML = createWordCloud(maxWords)

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


// Mini gallery scroller 
let imageContainer = document.querySelector('ul.img-selector');
let isDragging = false;
let startPosition = 0;
let scrollLeft = 0;

imageContainer.addEventListener('mousedown', (e) => {
  isDragging = true;
  startPosition = e.clientX;
  scrollLeft = imageContainer.scrollLeft;
});

imageContainer.addEventListener('mouseup', () => {
  isDragging = false;
});

imageContainer.addEventListener('mouseleave', () => {
  isDragging = false;
});

imageContainer.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const delta = e.clientX - startPosition;
  imageContainer.scrollLeft = scrollLeft - delta;
});

// For touch devices
imageContainer.addEventListener('touchstart', (e) => {
  isDragging = true;
  startPosition = e.touches[0].clientX;
  scrollLeft = imageContainer.scrollLeft;
});

imageContainer.addEventListener('touchend', () => {
  isDragging = false;
});

imageContainer.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  const delta = e.touches[0].clientX - startPosition;
  imageContainer.scrollLeft = scrollLeft - delta;
});