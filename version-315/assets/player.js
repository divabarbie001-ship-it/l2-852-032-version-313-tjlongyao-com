(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var video = document.getElementById('movie-player');
    var button = document.getElementById('movie-play-button');
    if (!video || !button || typeof PLAYER_URL === 'undefined') {
      return;
    }

    var hls = null;
    var loaded = false;

    function loadAndPlay() {
      button.classList.add('is-hidden');
      video.controls = true;
      if (loaded) {
        video.play().catch(function () {});
        return;
      }
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = PLAYER_URL;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
        return;
      }

      if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: false, backBufferLength: 90 });
        hls.loadSource(PLAYER_URL);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
        return;
      }

      video.src = PLAYER_URL;
      video.play().catch(function () {});
    }

    button.addEventListener('click', loadAndPlay);
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        loadAndPlay();
      } else {
        video.pause();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
