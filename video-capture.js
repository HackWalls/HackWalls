function VideoCapture (video, overlay) {
  this.isStreaming = false;
  this.video = video;
  this.overlay = overlay;
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

VideoCapture.prototype.resizeOverlay = function() {
  /*
  var ratio = this.video.videoWidth / this.video.videoHeight;


  if (this.video.offsetWidth / this.video.offsetHeight < ratio) { // horizontal
    this.overlay.style.width = this.video.offsetWidth + 'px';
    var trueHeight = this.video.offsetWidth / ratio;
    var difference = this.video.offsetHeight - trueHeight;
    this.overlay.style.height = trueHeight + 'px';
    this.overlay.style.top = difference / 2 + 'px';
    this.overlay.style.left = '0px';



  } else { // vertical
    this.overlay.style.height = this.video.offsetHeight + 'px';
    var trueWidth = this.video.offsetHeight * ratio;
    var difference = this.video.offsetWidth - trueWidth;
    this.overlay.style.width = trueWidth + 'px';
    this.overlay.style.left = difference / 2 + 'px';
    this.overlay.style.top = '0px';
  }
*/

}
