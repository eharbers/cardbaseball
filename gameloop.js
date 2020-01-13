
var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d")
var width
var height

var resize = function() {
  width = window.innerWidth * 2
  height = window.innerHeight * 2
  canvas.width = width
  canvas.height = height
}
window.onresize = resize
resize()

ctx.fillStyle = 'red'

var state = {
  x: (width / 2),
  y: (height / 2),
  pressedKeys: {
    left: false,
    right: false,
    up: false,
    down: false
  }
}

function update(progress) {
  if (state.pressedKeys.left) {
    state.x -= progress
  }
  if (state.pressedKeys.right) {
    state.x += progress
  }
  if (state.pressedKeys.up) {
    state.y -= progress
  }
  if (state.pressedKeys.down) {
    state.y += progress
  }

  if (state.x > width) {
    state.x -= width
  }
  else if (state.x < 0) {
    state.x += width
  }
  if (state.y > height) {
    state.y -= height
  }
  else if (state.y < 0) {
    state.y += height
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height)

  ctx.fillRect(state.x - 10, state.y - 10, 20, 20)
}

function loop(timestamp) {
  var progress = timestamp - lastRender

  update(progress)
  draw()
  
  lastRender = timestamp
  window.requestAnimationFrame(loop)
}
var lastRender = 0
window.requestAnimationFrame(loop)

var keyMap = {
  68: 'right',
  65: 'left',
  87: 'up',
  83: 'down'
}
function keydown(event) {
  var key = keyMap[event.keyCode]
  state.pressedKeys[key] = true
}
function keyup(event) {
  var key = keyMap[event.keyCode]
  state.pressedKeys[key] = false
}

window.addEventListener("keydown", keydown, false)
window.addEventListener("keyup", keyup, false)

