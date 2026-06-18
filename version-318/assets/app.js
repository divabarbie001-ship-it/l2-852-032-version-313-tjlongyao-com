(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var navLinks = document.querySelector('.nav-links');

    if (menuButton && navLinks) {
        menuButton.addEventListener('click', function () {
            var expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            navLinks.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function go(step) {
            show(index + step);
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                go(1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                go(-1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                go(1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    function runSearch(value) {
        var keyword = String(value || '').trim().toLowerCase();
        var cards = document.querySelectorAll('[data-filter-card]');
        cards.forEach(function (card) {
            var text = String(card.getAttribute('data-search') || '').toLowerCase();
            card.classList.toggle('is-hidden-card', keyword && text.indexOf(keyword) === -1);
        });
    }

    document.querySelectorAll('[data-live-search]').forEach(function (input) {
        input.addEventListener('input', function () {
            runSearch(input.value);
        });
    });

    document.querySelectorAll('[data-search-token]').forEach(function (button) {
        button.addEventListener('click', function () {
            var token = button.getAttribute('data-search-token') || '';
            var input = document.querySelector('[data-live-search]');
            if (input) {
                input.value = token;
            }
            runSearch(token);
        });
    });

    window.SitePlayer = {
        mount: function (playerId, src) {
            var root = document.getElementById(playerId);
            if (!root) {
                return;
            }

            var video = root.querySelector('video');
            var cover = root.querySelector('.player-cover');
            var toggle = root.querySelector('.player-toggle');
            var mute = root.querySelector('.player-mute');
            var full = root.querySelector('.player-full');
            var hls = null;
            var ready = false;

            function attach() {
                if (ready || !video) {
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else {
                    video.src = src;
                }

                ready = true;
            }

            function play() {
                attach();
                if (cover) {
                    cover.classList.add('is-hidden');
                }
                video.controls = true;
                var action = video.play();
                if (action && action.catch) {
                    action.catch(function () {});
                }
            }

            function pause() {
                if (video) {
                    video.pause();
                }
            }

            function refresh() {
                var playing = video && !video.paused;
                root.classList.toggle('is-playing', playing);
                if (toggle) {
                    toggle.textContent = playing ? 'Ⅱ' : '▶';
                }
            }

            if (cover) {
                cover.addEventListener('click', play);
            }

            if (toggle) {
                toggle.addEventListener('click', function () {
                    if (video.paused) {
                        play();
                    } else {
                        pause();
                    }
                });
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        play();
                    } else {
                        pause();
                    }
                });
                video.addEventListener('play', refresh);
                video.addEventListener('pause', refresh);
                video.addEventListener('ended', refresh);
            }

            if (mute) {
                mute.addEventListener('click', function () {
                    video.muted = !video.muted;
                    mute.textContent = video.muted ? '🔇' : '🔈';
                });
            }

            if (full) {
                full.addEventListener('click', function () {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else if (root.requestFullscreen) {
                        root.requestFullscreen();
                    }
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hls && hls.destroy) {
                    hls.destroy();
                }
            });
        }
    };
})();
