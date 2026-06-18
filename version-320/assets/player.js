function createPlayer(options) {
  var video = document.getElementById(options.videoId);
  var overlay = document.getElementById(options.overlayId);
  var button = document.getElementById(options.buttonId);
  var source = options.source;
  var bound = false;
  var hls = null;

  function bind() {
    if (bound || !video) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      video.src = source;
    }
    bound = true;
  }

  function start() {
    bind();
    if (overlay) {
      overlay.hidden = true;
    }
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (overlay) {
          overlay.hidden = false;
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      start();
    });
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.hidden = false;
      }
    });
  }

  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
