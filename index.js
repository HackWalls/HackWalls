
(function() {
  var $ = function(id){return document.getElementById(id)}
  // GLOBALS!
  // change this to update the strokes
  window.paintConfig = {
    color: 'blue',
    strokeWidth: 15
  }
  window.hammer = new Hammer(document.querySelector('#main'))

  // not globals :(
  var gWidth = 1000;//window.innerWidth > 0 ? window.innerWidth : screen.width
  var gHeight = 1000;//window.innerHeight > 0 ? window.innerHeight : screen.height
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
      room: 'hackAR5',
      url: 'https://yjs.dbis.rwth-aachen.de:5078'//'http://134.61.141.107:1234'//'https://yjs.dbis.rwth-aachen.de:5078'
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

  var yPath = false
  // listen to events...
  hammer.on('pan', function (event) {
    var xPos = event.center.x
    var yPos = event.center.y

    var main = document.querySelector('#main');
    xPos-=main.offsetLeft;
    yPos-=main.offsetTop;
    //xPos/=  document.getElementById("c").getAttribute("width") / document.getElementById("main").offsetWidth;
    //yPos /=  document.getElementById("c").getAttribute("height")/ document.getElementById("main").offsetHeight;
    var w = document.getElementById("c").getBoundingClientRect().width;
    var h = document.getElementById("c").getBoundingClientRect().height;
    xPos *= 1000/w
    yPos *= 1000/h

    //console.log(w);

    if(window.superTransfromMatrix){


      var newPos = window.superTransfromMatrix.transformInverse(xPos, yPos);
      xPos=newPos[0];
      yPos=newPos[1];
    }


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
    if (event.isFinal) {
      yPath = false
    }
  })
  fabric.Object.prototype.transparentCorners = false
})()
