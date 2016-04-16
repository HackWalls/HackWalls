function VideoCapture (video, canvas, overlay) {
  this.isStreaming = false;
  this.video = video;
  this.overlay = overlay;
  this.transformCorners = null;
  this.context = canvas.getContext("2d");
  navigator.getMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);
    navigator.getMedia({
      video: true,
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

  var self = this;
  video.addEventListener('canplay', function(ev) {
    if (!self.streaming) {
      self.streaming = true;
      self.resizeOverlay();
    }
  }, false);

  window.onresize = function(event) {
    self.resizeOverlay();
  };
}

VideoCapture.prototype.setTransformation = function(corners) {
  console.log(corners);
  this.transformCorners= [corners[0].x,corners[0].y,corners[1].x,corners[1].y,corners[2].x,corners[2].y,corners[3].x,corners[3].y];
  this.resizeOverlay();
}

VideoCapture.prototype.resizeOverlay = function() {
  if (this.transformCorners == null)
    return;

  var offsetTop = (gHeight - this.video.videoHeight)/2;
  var offsetLeft = (gWidth - this.video.videoWidth)/2;

  this.overlay.height = gHeight + "px";
  this.overlay.width = this.overlay.height + "px";
  this.overay.top = offsetTop + "px";
  this.overlay.left = offsetLeft + "px";

  var srcCorners = [0, offsetLeft, 0, this.video.videoWeight-offsetLeft, this.video.videoHeight, offsetLeft, this.video.videoHeight, gWidththis.video.videoWeight-offsetLeft];
  var perspT = PerspT(srcCorners, this.transformCorners);

  this.overlay.style.transform = "matrix3d("+perspT.coeffs.join(",")+")";
  this.overlay.style.transformOrigin = '0 0';
}

VideoCapture.prototype.getImageData = function() {
  if (this.streaming) {
    this.context.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);
    var data = this.context.getImageData(0, 0, this.video.videoWidth, this.video.videoHeight);
    return data;
  } else {
    return null;
  }

}

var video = new VideoCapture(document.getElementById("video"), document.getElementById("videoCanvas"), document.getElementById("canvas"));
updateCorners(video.setTransformation);


function updateCorners(callback) {
  var detector = new AR.Detector();
  var currentCorners = [{
    x: 0,
    y: 0
  }, {
    x: 0,
    y: 0
  }, {
    x: 0,
    y: 0
  }, {
    x: 0,
    y: 0
  }]


  function getCorners(markers) {
    var scaleX = 1; //video.videoWidth/video.offsetWidth;
    var scaleY = 1 //video.videoHeight/video.offsetHeight;


    var ratio = video.videoWidth / video.videoHeight;
    if (video.offsetWidth / video.offsetHeight < ratio) {
      var trueHeight = video.offsetWidth / ratio;

      scaleY = trueHeight / video.videoHeight;
      scaleX = video.offsetWidth / video.videoWidth;

    } else {
      var trueWidth = video.offsetHeight * ratio;
      scaleX = trueWidth / video.videoWidth;
      scaleY = video.offsetHeight / video.videoHeight;
    }

    if (markers !== null && markers.length >= 1) {
      var corners = markers[0].corners;

      for (j = 0; j < corners.length; ++j) {

        corners[j].x = corners[j].x * scaleX;
        corners[j].y = corners[j].y * scaleY;
      }

    }

    return corners;


  }
/*
  function drawCorners(markers) {
    var corners, corner, i, j;
    var context = overlayCanvas.getContext("2d");
    context.lineWidth = 3;
    overlayCanvas.height = overlay.offsetHeight;
    overlayCanvas.width = overlay.offsetWidth;

    context.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);


    for (i = 0; i < markers.length; ++i) {


      context.strokeStyle = "red";
      context.beginPath();
      corners=markers[0].corners;

      for (j = 0; j < corners.length; ++j) {
        corner = corners[j];
        context.moveTo(corner.x, corner.y);
        corner = corners[(j + 1) % corners.length];
        context.lineTo(corner.x, corner.y);

      }

      context.stroke();
      context.closePath();

    }
  }
*/


  setInterval(function() {
    var data = video.getImageData();
    if (data == null) {
      return;
    }
    var markers = detector.detect(data);

    var temp = getCorners(markers);

    console.log(temp);

    if (temp) {
      var difference = Math.abs(temp[0].x - currentCorners[0].x);

      if (difference > 50 && difference < 400) {
        currentCorners = temp;
        callback(currentCorners);
      }

    }

  //  drawCorners(markers);
  }, 500);
}
