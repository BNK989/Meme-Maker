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
  {
    id: 14,
    url: '14.jpg',
    keywords: ['matrix', 'pill', 'glasses', 'neo', 'men'],
  },
  { id: 15, url: '15.jpg', keywords: ['got', 'tv', 'okay', 'men'] },
  { id: 16, url: '16.jpg', keywords: ['tv', 'space', 'classic', 'men'] },
  { id: 17, url: '17.jpg', keywords: ['asshole', 'men', 'russia', 'politics'] },
  { id: 18, url: '18.jpg', keywords: ['buzz', 'toy', 'explain', 'classic'] },
]

function mainGalleryloadImages(searchTerm) {
  //let htmlStr = '<li><div id="drop-area" class="drop-area"><img id="uploaded-image"> <span>ADD IMAGE</span></div></li>'
  let htmlStr = ''
  let res
  if (searchTerm) {
    const regex = new RegExp(searchTerm.toLowerCase(), 'g')
    res = gImgs.filter((img) => {
      return img.keywords.find((keyword) => regex.test(keyword))
    })
  } else {
    res = gImgs
  }
  res.forEach((img) => {
    htmlStr += `<li><img onclick="setImage(this);toggleGallery()" src="Media/Square/${
      img.url
    }" alt="${img.keywords.join('-')}" /></li>`
  })
  return htmlStr
}
