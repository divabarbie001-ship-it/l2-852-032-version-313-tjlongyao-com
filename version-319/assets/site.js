
(function () {
  var root = document.body ? document.body.getAttribute('data-root') || './' : './';

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function imagePath(movie) {
    return './' + movie.imageIndex + '.jpg';
  }

  function detailPath(movie) {
    return './' + movie.detailPath;
  }

  function categoryPath(movie) {
    return './category/' + movie.categorySlug + '.html';
  }

  function initHeader() {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    function updateHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 12) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (toggle && panel && header) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
        header.classList.toggle('is-open');
      });
    }
  }

  function submitSearch(form) {
    var input = form.querySelector('input[name="q"]');
    var query = input ? input.value.trim() : '';
    window.location.href = root + 'search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
  }

  function initSearchForms() {
    document.querySelectorAll('[data-search-form], [data-search-form-inline]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        submitSearch(form);
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        var value = Number(thumb.getAttribute('data-hero-thumb')) || 0;
        show(value);
        stop();
      });
      thumb.addEventListener('mouseleave', start);
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    start();
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-page]').forEach(function (scope) {
      var input = scope.querySelector('[data-filter-keyword]');
      var year = scope.querySelector('[data-filter-year]');
      var region = scope.querySelector('[data-filter-region]');
      var reset = scope.querySelector('[data-filter-reset]');
      var count = scope.querySelector('[data-filter-count]');
      var list = scope.querySelector('[data-filter-list]') || document;
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

      function value(el) {
        return el ? el.value.trim().toLowerCase() : '';
      }

      function apply() {
        var keyword = value(input);
        var selectedYear = value(year);
        var selectedRegion = value(region);
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var cardYear = String(card.getAttribute('data-year') || '').toLowerCase();
          var cardRegion = String(card.getAttribute('data-region') || '').toLowerCase();
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            matched = false;
          }
          if (selectedRegion && cardRegion !== selectedRegion) {
            matched = false;
          }

          card.classList.toggle('is-hidden-by-filter', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible;
        }
      }

      [input, year, region].forEach(function (el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (year) {
            year.value = '';
          }
          if (region) {
            region.value = '';
          }
          apply();
        });
      }
    });
  }

  async function getHlsClass() {
    if (window.Hls) {
      return window.Hls;
    }
    var module = await import('./hls-dru42stk.js');
    return module.H;
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('[data-player-start]');
      var errorBox = shell.querySelector('[data-player-error]');
      var src = shell.getAttribute('data-src');
      var attached = false;
      var hlsInstance = null;

      function showError(message) {
        if (errorBox) {
          errorBox.textContent = message;
          errorBox.classList.add('is-visible');
        }
      }

      async function attach() {
        if (attached || !video || !src) {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          attached = true;
          return;
        }

        try {
          var HlsClass = await getHlsClass();
          if (HlsClass && HlsClass.isSupported()) {
            hlsInstance = new HlsClass({
              enableWorker: true,
              lowLatencyMode: false
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            hlsInstance.on(HlsClass.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                if (data.type === HlsClass.ErrorTypes.NETWORK_ERROR) {
                  hlsInstance.startLoad();
                } else if (data.type === HlsClass.ErrorTypes.MEDIA_ERROR) {
                  hlsInstance.recoverMediaError();
                } else {
                  showError('播放加载失败，请刷新页面重试');
                }
              }
            });
            attached = true;
            return;
          }
          showError('当前浏览器暂不支持该视频播放');
        } catch (error) {
          showError('播放器初始化失败，请刷新页面重试');
        }
      }

      async function start() {
        if (!video) {
          return;
        }
        await attach();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            start();
          } else {
            video.pause();
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  async function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var title = document.querySelector('[data-search-title]');
    var summary = document.querySelector('[data-search-summary]');
    var inlineForm = document.querySelector('[data-search-form-inline]');

    if (inlineForm) {
      var inlineInput = inlineForm.querySelector('input[name="q"]');
      if (inlineInput) {
        inlineInput.value = query;
      }
    }

    if (!query) {
      return;
    }

    var module = await import('./search-index.js');
    var keyword = query.toLowerCase();
    var matched = module.MOVIES.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.category]
        .join(' ')
        .toLowerCase()
        .indexOf(keyword) !== -1;
    });

    if (title) {
      title.textContent = '“' + query + '”的搜索结果';
    }

    if (summary) {
      summary.textContent = '共找到 ' + matched.length + ' 部匹配内容。';
    }

    results.innerHTML = matched.slice(0, 240).map(function (movie) {
      return '<article class="movie-card">'
        + '<a class="poster-frame" href="' + escapeHtml(detailPath(movie)) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">'
        + '<img src="' + escapeHtml(imagePath(movie)) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
        + '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>'
        + '<span class="poster-play">▶</span>'
        + '</a>'
        + '<div class="movie-card-body">'
        + '<div class="movie-card-top">'
        + '<a class="movie-title" href="' + escapeHtml(detailPath(movie)) + '">' + escapeHtml(movie.title) + '</a>'
        + '<span class="score">' + Number(movie.score).toFixed(1) + '</span>'
        + '</div>'
        + '<p>' + escapeHtml(movie.oneLine) + '</p>'
        + '<div class="movie-meta">'
        + '<span>' + escapeHtml(movie.region) + '</span>'
        + '<span>' + escapeHtml(movie.year) + '</span>'
        + '<a href="' + escapeHtml(categoryPath(movie)) + '">' + escapeHtml(movie.category) + '</a>'
        + '</div>'
        + '</div>'
        + '</article>';
    }).join('');
  }

  function initImageFallback() {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.opacity = '0';
      }, { once: true });
    });
  }

  ready(function () {
    initHeader();
    initSearchForms();
    initHero();
    initFilters();
    initPlayers();
    initSearchPage();
    initImageFallback();
  });
}());
