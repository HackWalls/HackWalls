
(function() {
  var $ = function(id){return document.getElementById(id)}
  // change this to update the strokes
  window.paintConfig = {
    color: 'blue',
    strokeWidth: 15
  }

  var gWidth = window.innerWidth > 0 ? window.innerWidth : screen.width
  var gHeight = window.innerHeight > 0 ? window.innerHeight : screen.height
  var canvas = this.__canvas = new fabric.Canvas('c', {
    // isDrawingMode: true,
    width: gWidth,
    height: gHeight
  })
  canvas.selection = false

  Y({
    db: {
      name: 'memory'
    },
    connector: {
      name: 'webrtc',
      room: 'hackAR3'
    },
    sourceDir: '/yjs',
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
          events.forEach(function (e) {
            computePath(path, t)
          })
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

  var yPath = null
  canvas.on('mouse:down', function (event) {
    var pos = y.share.drawings.length
    y.share.drawings.insert(pos, [Y.Array])
    y.share.drawings.get(pos).then(function (array) {
      yPath = array
      var strokeWidth = paintConfig.strokeWidth
      yPath.insert(0, [{
        color: paintConfig.color,
        strokeWidth: strokeWidth
      }, [(event.e.x - strokeWidth) / gWidth, (event.e.y - strokeWidth) / gHeight]])
    })
  })
  canvas.on('mouse:up', function () {
    yPath = null
  })
  canvas.on('mouse:move', function (event) {
    if (!!yPath) {
      var strokeWidth = yPath.get(0).strokeWidth
      yPath.push([[(event.e.x - strokeWidth) / gWidth, (event.e.y - strokeWidth) / gHeight]])
    }
  })
  fabric.Object.prototype.transparentCorners = false

})();
