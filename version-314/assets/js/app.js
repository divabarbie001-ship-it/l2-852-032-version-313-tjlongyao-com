(function () {
    var root = document.documentElement.getAttribute('data-root') || '';
    var movies = window.MOVIES_INDEX || [];

    function byId(id) {
        return document.getElementById(id);
    }

    function htmlEscape(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function prefixed(path) {
        return root + path;
    }

    function setupMobileNav() {
        var button = byId('menu-toggle');
        var nav = byId('mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHeroSlider() {
        var hero = document.querySelector('[data-hero-slider]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('active', itemIndex === index);
            });
        }
        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener('click', function () {
                show(itemIndex);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function movieCard(movie) {
        return '' +
            '<article class="movie-card">' +
                '<a href="' + prefixed(movie.url) + '">' +
                    '<div class="poster-wrap">' +
                        '<img src="' + prefixed(movie.image) + '" alt="' + htmlEscape(movie.title) + '" loading="lazy" decoding="async">' +
                        '<div class="poster-overlay">' +
                            '<span class="type-pill">' + htmlEscape(movie.type) + '</span>' +
                            '<span class="score-pill">' + htmlEscape(movie.year) + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="card-body">' +
                        '<h3 class="card-title">' + htmlEscape(movie.title) + '</h3>' +
                        '<div class="card-meta"><span>' + htmlEscape(movie.region) + '</span><span>' + htmlEscape(movie.genre) + '</span></div>' +
                        '<p class="card-line">' + htmlEscape(movie.oneLine) + '</p>' +
                    '</div>' +
                '</a>' +
            '</article>';
    }

    function searchMovies(query) {
        var keyword = String(query || '').trim().toLowerCase();
        if (!keyword) {
            return [];
        }
        return movies.filter(function (movie) {
            var text = [movie.title, movie.region, movie.genre, movie.year, movie.type, movie.tags, movie.oneLine].join(' ').toLowerCase();
            return text.indexOf(keyword) !== -1;
        });
    }

    function setupSuggestions() {
        Array.prototype.slice.call(document.querySelectorAll('[data-suggest-input]')).forEach(function (input) {
            var box = input.parentElement.querySelector('.search-suggestions');
            if (!box) {
                return;
            }
            input.addEventListener('input', function () {
                var result = searchMovies(input.value).slice(0, 6);
                if (!input.value.trim() || result.length === 0) {
                    box.classList.remove('open');
                    box.innerHTML = '';
                    return;
                }
                box.innerHTML = result.map(function (movie) {
                    return '<a href="' + prefixed(movie.url) + '">' + htmlEscape(movie.title) + ' <small>' + htmlEscape(movie.year) + ' · ' + htmlEscape(movie.region) + '</small></a>';
                }).join('');
                box.classList.add('open');
            });
            document.addEventListener('click', function (event) {
                if (!input.parentElement.contains(event.target)) {
                    box.classList.remove('open');
                }
            });
        });
    }

    function setupCardFilters() {
        var filterInput = document.querySelector('[data-filter-input]');
        if (!filterInput) {
            return;
        }
        var yearSelect = document.querySelector('[data-year-select]');
        var regionSelect = document.querySelector('[data-region-select]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-title]'));
        var emptyState = byId('empty-state');
        function apply() {
            var keyword = filterInput.value.trim().toLowerCase();
            var year = yearSelect ? yearSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var shown = 0;
            cards.forEach(function (card) {
                var text = [card.dataset.title, card.dataset.genre, card.dataset.tags, card.dataset.region, card.dataset.year].join(' ').toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !year || card.dataset.year === year;
                var matchRegion = !region || card.dataset.region === region;
                var visible = matchKeyword && matchYear && matchRegion;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    shown += 1;
                }
            });
            if (emptyState) {
                emptyState.style.display = shown ? 'none' : 'block';
            }
        }
        filterInput.addEventListener('input', apply);
        if (yearSelect) {
            yearSelect.addEventListener('change', apply);
        }
        if (regionSelect) {
            regionSelect.addEventListener('change', apply);
        }
    }

    function setupSearchPage() {
        var grid = byId('search-result-grid');
        if (!grid) {
            return;
        }
        var input = byId('search-page-input');
        var empty = byId('search-empty');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input) {
            input.value = query;
        }
        function render(value) {
            var result = value.trim() ? searchMovies(value) : movies.slice(0, 60);
            grid.innerHTML = result.slice(0, 240).map(movieCard).join('');
            if (empty) {
                empty.style.display = result.length ? 'none' : 'block';
            }
        }
        render(query);
        if (input) {
            input.addEventListener('input', function () {
                render(input.value);
            });
        }
    }

    var hlsScriptLoading = false;
    var hlsCallbacks = [];

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        hlsCallbacks.push(callback);
        if (hlsScriptLoading) {
            return;
        }
        hlsScriptLoading = true;
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
        script.onload = function () {
            hlsCallbacks.splice(0).forEach(function (item) {
                item();
            });
        };
        script.onerror = function () {
            hlsCallbacks.splice(0).forEach(function (item) {
                item(new Error('hls load failed'));
            });
        };
        document.head.appendChild(script);
    }

    function playVideo(shell) {
        var video = shell.querySelector('video');
        var source = video ? video.getAttribute('data-source') : '';
        if (!video || !source) {
            return;
        }
        shell.classList.add('playing');
        video.setAttribute('controls', 'controls');
        if (video.dataset.ready === '1') {
            video.play().catch(function () {});
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.dataset.ready = '1';
            video.play().catch(function () {});
            return;
        }
        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.dataset.ready = '1';
                    video.play().catch(function () {});
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        hls.destroy();
                        video.src = source;
                        video.dataset.ready = '1';
                    }
                });
            } else {
                video.src = source;
                video.dataset.ready = '1';
                video.play().catch(function () {});
            }
        });
    }

    function setupPlayers() {
        Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
            var button = shell.querySelector('.play-button');
            shell.addEventListener('click', function () {
                playVideo(shell);
            });
            if (button) {
                button.addEventListener('click', function (event) {
                    event.stopPropagation();
                    playVideo(shell);
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNav();
        setupHeroSlider();
        setupSuggestions();
        setupCardFilters();
        setupSearchPage();
        setupPlayers();
    });
})();
