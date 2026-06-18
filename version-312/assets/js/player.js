(function () {
  var video = document.querySelector('[data-player-video]');
  var trigger = document.querySelector('[data-player-trigger]');

  if (!video) {
    return;
  }

  var stream = video.getAttribute('data-video');
  var hls = null;
  var started = false;

  function startVideo() {
    if (!stream) {
      return;
    }

    if (trigger) {
      trigger.classList.add('is-hidden');
    }

    if (started) {
      video.play().catch(function () {});
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = stream;
    video.play().catch(function () {});
  }

  if (trigger) {
    trigger.addEventListener('click', startVideo);
  }

  video.addEventListener('click', function () {
    if (!started || video.paused) {
      startVideo();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
