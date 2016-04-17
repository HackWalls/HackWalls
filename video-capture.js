function VideoCapture (video, canvas, overlay, main) {
  this.isStreaming = false;
  this.video = video;
  this.overlay = overlay;
  this.main = main;
  this.transformCorners = null;
  this.canvas = canvas;
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


      self.canvas.setAttribute("width","100%");
      self.canvas.setAttribute("height","100%");

      self.streaming = true;
      self.resizeOverlay();

      self.canvas.width = self.video.videoWidth;
      self.canvas.height = self.video.videoHeight;

      self.context = self.canvas.getContext("2d");
    }
  }, false);

  window.onresize = function(event) {
    self.resizeOverlay();
  };
}

VideoCapture.prototype.setTransformation = function(corners) {
  this.transformCorners= [corners[0].x,corners[0].y,corners[1].x,corners[1].y,corners[2].x,corners[2].y,corners[3].x,corners[3].y];
  this.resizeOverlay();
}

VideoCapture.prototype.resizeOverlay = function() {
  var ratio = this.video.videoWidth / this.video.videoHeight;
  var width, height;

  if (this.video.offsetWidth / this.video.offsetHeight < ratio) { // horizontal
    this.main.style.width = this.video.offsetWidth + 'px';
    var trueHeight = this.video.offsetWidth / ratio;
    var difference = this.video.offsetHeight - trueHeight;
    this.main.style.height = trueHeight + 'px';
    this.main.style.top = difference / 2 + 'px';
    this.main.style.left = '0px';
    width = this.video.offsetWidth;
    height = trueHeight;
  } else { // vertical
    this.main.style.height = this.video.offsetHeight + 'px';
    var trueWidth = this.video.offsetHeight * ratio;
    var difference = this.video.offsetWidth - trueWidth;
    this.main.style.width = trueWidth + 'px';
    this.main.style.left = difference / 2 + 'px';
    this.main.style.top = '0px';
    height = this.video.offsetHeight;
    width = trueWidth;
  }

  var dim= Math.min(width,height);
  this.main.style.width = dim+"px";
  this.main.style.height = dim+"px";
  this.main.style.left = (this.video.offsetWidth-dim)/2 + "px";
  this.main.style.top = (this.video.offsetHeight-dim)/2 + "px";
  
  
  /*
  this.main.style.width = this.overlay.style.width;
  this.main.style.height = this.overlay.style.height;
  this.main.style.left = this.overlay.style.left;
  this.main.style.top = this.overlay.style.top;
  */

  if (this.transformCorners == null)
    return;

 
    
  var srcCorners = [this.overlay.offsetLeft, this.overlay.offsetTop,
    this.overlay.offsetLeft+this.overlay.offsetWidth,this.overlay.offsetTop,
    this.overlay.offsetLeft+this.overlay.offsetWidth, this.overlay.offsetTop+this.overlay.offsetHeight,
    this.overlay.offsetLeft, this.overlay.offsetTop+this.overlay.offsetHeight];

 

  var perspT = PerspT(srcCorners, this.transformCorners);
  window.superTransfromMatrix = perspT;
  var bums = [perspT.coeffs[0],perspT.coeffs[3],0,perspT.coeffs[6],
              perspT.coeffs[1],perspT.coeffs[4],0,perspT.coeffs[7],
              0,0,1,0,
              perspT.coeffs[2],perspT.coeffs[5],0,perspT.coeffs[8]
              ];

  this.overlay.style.transform = "matrix3d("+bums.join(",")+")";
  this.overlay.style.transformOrigin = '0% 0%';
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

var vid = new VideoCapture(document.getElementById("video"), document.getElementById("videoCanvas"), document.getElementById("overlay"), document.getElementById("main"));
updateCorners(function(a) {vid.setTransformation(a);});


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


      if(markers[0].id!==0){
        return null;
      }
      if(corners[1].x < corners[3].x){
        return null;
      }
      for (j = 0; j < corners.length; ++j) {

        corners[j].x = (corners[j].x) * scaleX-100;
        corners[j].y = (corners[j].y) * scaleY;
      }
      var mul= 10;
      var trans1 = {x: (corners[1].x-corners[0].x), y:(corners[1].y-corners[0].y)};
      var trans2 = {x: (corners[2].x-corners[0].x), y:(corners[2].y-corners[0].y)};
      var trans3 = {x: (corners[3].x-corners[0].x), y:(corners[3].y-corners[0].y)};
      
      corners[1].x=trans1.x*mul+corners[0].x;
      corners[2].x=trans2.x*mul+corners[0].x;
      corners[3].x=trans3.x*mul+corners[0].x;
      
      corners[1].y=trans1.y*mul+corners[0].y;
      corners[2].y=trans2.y*mul+corners[0].y;
      corners[3].y=trans3.y*mul+corners[0].y;
     
      
      
    }

    return corners;


  }

  /*function drawCorners(markers) {
    var overlayCanvas = document.getElementById("c");
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
  }*/



  setInterval(function() {
    var data = vid.getImageData();
    if (data == null) {
      return;
    }

    var markers = detector.detect(data);

    var temp = getCorners(markers);

    //console.log(temp);

    if (temp) {
      var difference = Math.abs(currentCorners[0].x -temp[0].x);

      if (difference > 1) {
        //console.log(currentCorners[0].x -temp[0].x);
        currentCorners = temp;
        callback(currentCorners);
      }

    }

    //drawCorners(markers);
  }, 200);
}
