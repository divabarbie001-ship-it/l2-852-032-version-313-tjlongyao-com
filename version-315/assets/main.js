(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var yearNodes = document.querySelectorAll('[data-year]');
    yearNodes.forEach(function (node) {
      node.textContent = new Date().getFullYear();
    });

    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    initHero();
    initSearch();
    initListingFilters();
  });

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    restart();
  }

  function initSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.site-search-input'));
    if (!inputs.length || typeof SITE_MOVIE_INDEX === 'undefined') {
      return;
    }

    inputs.forEach(function (input) {
      var holder = input.parentElement;
      var panel = holder ? holder.querySelector('.site-search-results') : null;
      if (!panel) {
        return;
      }

      input.addEventListener('input', function () {
        var q = input.value.trim().toLowerCase();
        panel.innerHTML = '';
        if (!q) {
          panel.classList.remove('is-open');
          return;
        }

        var results = SITE_MOVIE_INDEX.filter(function (item) {
          return item.search.toLowerCase().indexOf(q) !== -1;
        }).slice(0, 16);

        if (!results.length) {
          panel.innerHTML = '<div class="search-result-item"><strong>暂无匹配影片</strong><span>换一个关键词继续搜索</span></div>';
          panel.classList.add('is-open');
          return;
        }

        results.forEach(function (item) {
          var a = document.createElement('a');
          a.className = 'search-result-item';
          a.href = item.url;
          a.innerHTML = '<strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.region + ' · ' + item.year + ' · ' + item.type + ' · ' + item.category) + '</span>';
          panel.appendChild(a);
        });
        panel.classList.add('is-open');
      });

      document.addEventListener('click', function (event) {
        if (!holder.contains(event.target)) {
          panel.classList.remove('is-open');
        }
      });
    });
  }

  function initListingFilters() {
    var search = document.querySelector('.listing-search');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.listing-grid .movie-card'));
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]'));
    if (!cards.length) {
      return;
    }

    var state = {
      query: '',
      year: 'all'
    };

    function apply() {
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta')).toLowerCase();
        var cardYear = card.getAttribute('data-year');
        var matchesText = !state.query || text.indexOf(state.query) !== -1;
        var matchesYear = state.year === 'all' || cardYear === state.year;
        card.classList.toggle('is-hidden-card', !(matchesText && matchesYear));
      });
    }

    if (search) {
      search.addEventListener('input', function () {
        state.query = search.value.trim().toLowerCase();
        apply();
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (btn) {
          btn.classList.remove('is-active');
        });
        button.classList.add('is-active');
        state.year = button.getAttribute('data-filter-year');
        apply();
      });
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
