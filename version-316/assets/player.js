(function () {
    window.MoviePlayer = {
        init: function (src) {
            var video = document.querySelector("[data-player-video]");
            var button = document.querySelector("[data-player-start]");
            if (!video || !src) {
                return;
            }
            var loaded = false;
            function attach() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    video._hls = hls;
                    return;
                }
                video.src = src;
            }
            function start() {
                attach();
                if (button) {
                    button.classList.add("is-hidden");
                }
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }
            if (button) {
                button.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (!loaded) {
                    start();
                }
            });
        }
    };
})();
