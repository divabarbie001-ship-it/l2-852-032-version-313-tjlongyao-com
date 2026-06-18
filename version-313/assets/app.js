(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('opacity-100', i === index);
        slide.classList.toggle('opacity-0', i !== index);
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('bg-amber-500', i === index);
        dot.classList.toggle('bg-white/50', i !== index);
        dot.classList.toggle('w-8', i === index);
        dot.classList.toggle('w-3', i !== index);
      });
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        stop();
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        stop();
        show(index + 1);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        stop();
        show(i);
      });
    });
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute('data-filter-panel');
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) {
        scope = document;
      }
      var searchInput = panel.querySelector('[data-filter-search]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var genreSelect = panel.querySelector('[data-filter-genre]');
      var empty = document.querySelector('[data-filter-empty="' + scopeSelector + '"]');
      var params = new URLSearchParams(window.location.search);
      if (searchInput && params.get('q')) {
        searchInput.value = params.get('q');
      }

      function apply() {
        var query = normalize(searchInput ? searchInput.value : '');
        var region = normalize(regionSelect ? regionSelect.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var genre = normalize(genreSelect ? genreSelect.value : '');
        var items = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var visible = 0;
        items.forEach(function (item) {
          var haystack = normalize([
            item.getAttribute('data-title'),
            item.getAttribute('data-region'),
            item.getAttribute('data-year'),
            item.getAttribute('data-genre'),
            item.getAttribute('data-tags')
          ].join(' '));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (region && normalize(item.getAttribute('data-region')) !== region) {
            ok = false;
          }
          if (year && normalize(item.getAttribute('data-year')) !== year) {
            ok = false;
          }
          if (genre && normalize(item.getAttribute('data-genre')).indexOf(genre) === -1 && normalize(item.getAttribute('data-tags')).indexOf(genre) === -1) {
            ok = false;
          }
          item.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [searchInput, regionSelect, yearSelect, genreSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.play-overlay');
      var src = player.getAttribute('data-stream');
      var hls = null;
      var prepared = false;
      if (!video || !src) {
        return;
      }

      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      function play() {
        prepare();
        if (button) {
          button.classList.add('is-hidden');
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }
      player.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        play();
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (!video.ended && button) {
          button.classList.remove('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
