
var tracker = new tracking.ColorTracker(['yellow'])

var video = document.querySelector('#video')
navigator.getMedia = (navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia);
  navigator.getMedia({
    video: { frameRate: { ideal: 10, max: 15 }, width: gWidth, height: gHeight },
    audio: false
  },
  function(stream) {
    if (navigator.mozGetUserMedia) {
      video.mozSrcObject = stream;
    } else {
      var vendorURL = window.URL || window.webkitURL;
      video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
    }
    video.play();
  },
  function(err) {
    console.log("An error occured! " + err);
  }
);

tracking.track('#video', tracker, {camera: true})

var canvas = document.querySelector('#transformableCanvas')
canvas.style.positon = 'absolute'

var offset = {
  x: 0,
  y: 0
}
var center = {
  x: gWidth / 2,
  y: gHeight / 2
}
var scale = 1
var angle = 0
window.transformCoordinates = function transformCoordinates (c) {
  var res = {
    x: center.x - (center.x - c.x) / (Math.cos(angle / 180 * Math.PI) * scale) - offset.x,
    y: center.y - (center.y - c.y) / scale - offset.y
  }
  console.log(c, res)
  return res
  /*
  return {
    x: (c.x - offset.x) / scale,
    y: (c.y - offset.y) / scale
  }*/
}

function setCenter (c) {
  center = c
  offset = {
    x: Math.floor(c.x - gWidth/2),
    y: Math.floor(c.y - gHeight/2)
  }
  canvas.style.left = offset.x+'px'
  canvas.style.top = offset.y+'px'
  return c
}

function setRotation (degree) {
  angle = degree
  canvas.style.transform = 'rotateY('+degree+'deg)'
}
// d is between 0 and 1
function setDistance (d) {
  scale = d
  canvas.style.transform = 'scale(' + d + ')'
}

function toCoordinate (rect) {
  return {
    x: rect.x + rect.width/2,
    y: rect.y + rect.height/2,
    width: rect.width,
    height: rect.height
  }
}

tracker.on('track', function (event) {
  if (event.data.length === 1) {
    event.data.map(toCoordinate).map(setCenter).map(function (c) {
      var distanceAB = Math.abs(c.width) * 7 / gWidth
      console.log('distance', distanceAB)
      setDistance(distanceAB)
    })
    
  } else if (event.data.length === 3) {
    var coords = event.data.map(toCoordinate).sort(function (a, b) {
      return a.x < a.b
    })
    setCenter(coords[2])
    var a = coords[0].width
    var b = coords[2].width
    // var a = Math.sqrt(Math.pow(coords[0].x - coords[1].x, 2) + Math.pow(coords[0].y - coords[1].y, 2))
    // var b = Math.sqrt(Math.pow(coords[2].x - coords[1].x, 2) + Math.pow(coords[2].y - coords[1].y, 2))
    /*
    if (a > b) {
      angle = Math.acos(b / a) / Math.PI * 180
      console.log('left', a, b, Math.acos(b / a))
    } else {
      angle = - Math.acos(coords[1].width / coords[1].height) / Math.PI * 180
      console.log('right', a, b, Math.acos(a / b))
    }*/
    var angle = Math.acos(Math.min(1, Math.pow(coords[1].width / coords[1].height, 2))) / Math.PI * 180
    if (a > b) {
      angle *= -1
    }
    console.log(angle)
    setRotation(angle)
    var distanceAB = Math.abs(coords[0].x - coords[2].x) * 10 / gWidth
    console.log('distance', distanceAB)
    setDistance(distanceAB)
  } else {
    // console.log('number of events: ', event.data.length)
  }
})
