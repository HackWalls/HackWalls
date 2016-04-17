
(function() {
  var $ = function(id){return document.getElementById(id)}
  // GLOBALS!
  // change this to update the strokes
  window.paintConfig = {
    color: 'blue',
    strokeWidth: 15
  }
  window.hammer = new Hammer(document.querySelector('#main'))
  window.gWidth = window.innerWidth > 0 ? window.innerWidth : screen.width
  window.gHeight = window.innerHeight > 0 ? window.innerHeight : screen.height
  var canvas = this.__canvas = new fabric.Canvas('c', {
    // isDrawingMode: true,
    width: gWidth,
    height: gHeight
  })
  var video = document.querySelector('#video')
  // video.setAttribute('style', 'height:'+gHeight+';width:'+gWidth+';')
  video.setAttribute('width', gWidth)
  video.setAttribute('height', gHeight)
  canvas.selection = false

  Y({
    db: {
      name: 'memory'
    },
    connector: {
      name: 'webrtc',
      room: 'hackAR7',
      url: 'https://yjs.dbis.rwth-aachen.de:5078'
      // url: 'http://134.61.70.151:1234'
    },
    sourceDir: './yjs',
    share: {
      drawings: 'Array' // y.share.textarea is of type Y.Text
    }
  }).then(function (y) {
    window.y = y
    function computePath(drawingPath, yarray) {
      // array should contain additional information  (as object) as the first elemnt
      // the rest are path coordinates
      var array = yarray.toArray().map(function (c, i) {
        if (i !== 0) {
          return [c[0]*gWidth, c[1]*gHeight] // relative coordinates to absolute coordinates
        } else {
          return c
        }
      })
      var drawingPathProperties = array[0]
      // don't return anything if incomplete
      if (array.length > 2) {
        // transform path to bezier courve
        var path = [['M', array[1][0], array[1][1]]]
        for (var i = 2; i < array.length - 1; i++) {
          path.push(['Q', array[i-1][0], array[i-1][1], array[i][0], array[i][1]])
        }
        path.push(['L', array[array.length - 1][0], array[array.length - 1][1]])
        drawingPath.path = path
      } else {
        drawingPath.path = []
        drawingPathProperties = {
          color: null,
          strokeWidth: 7
        }
      }
      drawingPath.stroke = drawingPathProperties.color
      drawingPath.strokeWidth = drawingPathProperties.strokeWidth
      // render path
      var dims = drawingPath._parseDimensions()
      drawingPath.setWidth(dims.width)
      drawingPath.setHeight(dims.height)
      drawingPath.pathOffset.x = drawingPath.width/2
      drawingPath.pathOffset.y = drawingPath.height/2

      drawingPath.setCoords()
      canvas.renderAll()
    }
    function drawElement (t) {
      if (t instanceof Y.Array.typeDefinition.class) {
        var path = new fabric.Path()
        path.selectable = false
        path.fill = null
        canvas.add(path)
        computePath(path, t)
        t.observe(function (events) {
          computePath(path, t)
        })
      }
    }

    for (var i = 0; i < y.share.drawings.length; i++) {
      y.share.drawings.get(i).then(drawElement)
    }
    y.share.drawings.observe(function (events) {
      events.forEach(function (e) {
        e.values().then(function (types) {
          types.forEach(drawElement)
        })
      })
    })
  })

  var yPath = false
  // listen to events...
  var lastPos = {x: 0, y: 0}
  hammer.on('pan', function (event) {
    // only if distance > 10
    console.log('dissss tance', Math.sqrt(Math.pow(lastPos.x - event.center.x, 2) + Math.pow(lastPos.y - event.center.y, 2)))
    if (Math.sqrt(Math.pow(lastPos.x - event.center.x, 2) + Math.pow(lastPos.y - event.center.y, 2)) > 4) {
      lastPos.x = event.center.x
      lastPos.y = event.center.y
      var c = transformCoordinates(event.center)
      var xPos = c.x
      var yPos = c.y
      if (yPath === false) {
        yPath = null // trying to set yPath..
        var pos = y.share.drawings.length
        y.share.drawings.insert(pos, [Y.Array])
        y.share.drawings.get(pos).then(function (array) {
          yPath = array
          var strokeWidth = paintConfig.strokeWidth
          yPath.insert(0, [{
            color: paintConfig.color,
            strokeWidth: strokeWidth
          }, [(xPos - strokeWidth) / gWidth, (yPos - strokeWidth) / gHeight]])
        })
      } else if (yPath != null) {
        var strokeWidth = yPath.get(0).strokeWidth
        yPath.push([[(xPos - strokeWidth) / gWidth, (yPos - strokeWidth) / gHeight]])
      }
    }
    if (event.isFinal) {
      yPath = false
    }
  })
  fabric.Object.prototype.transparentCorners = false
})()
