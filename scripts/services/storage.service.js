'use strict'
const KEY = 'savedMemesDB'

function saveMemesToStorage(content) {
    saveToStorage(KEY, content)
}

function saveToStorage(key, val) {
    localStorage.setItem(key, JSON.stringify(val))
}

function loadFromStorage(key) {
    var val = localStorage.getItem(key)
    return JSON.parse(val)
}