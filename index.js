
(function() {
  var $ = function(id){return document.getElementById(id)};

  function computeBezierCourve(yarray) {
    var array = yarray.toArray().map(function (c) {
      return [c[0]*gWidth, c[1]*gHeight] // relative coordinates to absolute coordinates
    })
    if (array.length > 1) {
      var path = ['M', array[0][0], array[0][1]]
      for (var i = 1; i < array.length - 1; i++) {
        path.push(['Q', array[i-1][0], array[i-1][1], array[i][0], array[i][1]])
      }
      path.push(['L', array[array.length - 1][0], array[array.length - 1][1]])
      return path
    } else {
      return []
    }
  }

  var gWidth = window.innerWidth > 0 ? window.innerWidth : screen.width
  var gHeight = window.innerHeight > 0 ? window.innerHeight : screen.height
  var canvas = this.__canvas = new fabric.Canvas('c', {
    // isDrawingMode: true,
    width: gWidth,
    height: gHeight
  })
  canvas.selection = false;

  Y({
    db: {
      name: 'memory'
    },
    connector: {
      name: 'webrtc',
      room: 'hackAR'
    },
    sourceDir: '/bower_components',
    share: {
      drawings: 'Array' // y.share.textarea is of type Y.Text
    }
  }).then(function (y) {
    window.y = y

    function drawElement (t) {
      if (t instanceof Y.Array.typeDefinition.class) {
        var path = new fabric.Path()
        path.selectable = false
        path.path = computeBezierCourve(t)
        path.fill = null
        path.stroke = 'blue'
        canvas.add(path)
        t.observe(function (events) {
          console.log('#1')
          events.forEach(function (e) {
            path.path = computeBezierCourve(t)
            var dims = path._parseDimensions()
            path.setWidth(dims.width)
            path.setHeight(dims.height)
            path.pathOffset.x = path.width/2
            path.pathOffset.y = path.height/2
            path.setCoords()
            canvas.renderAll()
          })
        })
      }
    }

    for (var i = 0; i < y.share.drawings.length; i++) {
      y.share.drawings.get(i).then(drawElement)
    }
    y.share.drawings.observe(function (events) {
      events.forEach(function (e) {
        e.value().then(function (t) {
          drawElement(t)
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
      yPath.insert(0, [[event.e.x / gWidth, event.e.y / gHeight]])
    })
  })
  canvas.on('mouse:up', function () {
    yPath = null 
  })
  canvas.on('mouse:move', function (event) {
    if (!!yPath) {
      console.log('move')
      yPath.push([[event.e.x / gWidth, event.e.y / gHeight]])
    }
  })
  fabric.Object.prototype.transparentCorners = false;

  if (fabric.PatternBrush) {
    var vLinePatternBrush = new fabric.PatternBrush(canvas);
    vLinePatternBrush.getPatternSrc = function() {
      var patternCanvas = fabric.document.createElement('canvas')
      patternCanvas.width = patternCanvas.height = 10
      var ctx = patternCanvas.getContext('2d')

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(10, 5);
      ctx.closePath();
      ctx.stroke();

      return patternCanvas;
    };

    var hLinePatternBrush = new fabric.PatternBrush(canvas);
    hLinePatternBrush.getPatternSrc = function() {

      var patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 10;
      var ctx = patternCanvas.getContext('2d');

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(5, 10);
      ctx.closePath();
      ctx.stroke();

      return patternCanvas;
    };

    var squarePatternBrush = new fabric.PatternBrush(canvas);
    squarePatternBrush.getPatternSrc = function() {

      var squareWidth = 10, squareDistance = 2;

      var patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
      var ctx = patternCanvas.getContext('2d');

      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, squareWidth, squareWidth);

      return patternCanvas;
    };

    var diamondPatternBrush = new fabric.PatternBrush(canvas);
    diamondPatternBrush.getPatternSrc = function() {

      var squareWidth = 10, squareDistance = 5;
      var patternCanvas = fabric.document.createElement('canvas');
      var rect = new fabric.Rect({
        width: squareWidth,
        height: squareWidth,
        angle: 45,
        fill: this.color
      });

      var canvasWidth = rect.getBoundingRectWidth();

      patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
      rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

      var ctx = patternCanvas.getContext('2d');
      rect.render(ctx);

      return patternCanvas;
    }
  }

  if (canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.color = 'blue';
    canvas.freeDrawingBrush.width = 1;
    canvas.freeDrawingBrush.shadowBlur = 0;
  }
})();