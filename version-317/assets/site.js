(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      slides[index].classList.remove("active");
      if (dots[index]) {
        dots[index].classList.remove("active");
      }
      index = (next + slides.length) % slides.length;
      slides[index].classList.add("active");
      if (dots[index]) {
        dots[index].classList.add("active");
      }
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(dotIndex);
        start();
      });
    });
    start();
  }

  function setupFilters() {
    var input = document.querySelector(".filter-input");
    var region = document.querySelector(".filter-region");
    var year = document.querySelector(".filter-year");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    if (!cards.length || (!input && !region && !year)) {
      return;
    }
    function fillSelect(select, key) {
      if (!select || select.options.length > 1) {
        return;
      }
      var values = cards.map(function (card) {
        return card.getAttribute(key) || "";
      }).filter(Boolean).filter(function (value, idx, arr) {
        return arr.indexOf(value) === idx;
      }).sort().reverse();
      values.forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }
    fillSelect(region, "data-region");
    fillSelect(year, "data-year");
    function apply() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var selectedRegion = region ? region.value : "";
      var selectedYear = year ? year.value : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardRegion = card.getAttribute("data-region") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matched = true;
        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (selectedRegion && cardRegion !== selectedRegion) {
          matched = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }
        card.classList.toggle("hidden-card", !matched);
      });
    }
    [input, region, year].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
  }

  function setupSearchPage() {
    var list = window.MOVIE_INDEX || [];
    var container = document.getElementById("searchResults");
    var input = document.getElementById("searchInput");
    var hint = document.getElementById("searchHint");
    if (!container || !input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function card(item) {
      var tags = item.tags.slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "<article class=\"movie-card\" data-title=\"" + escapeHtml(item.title) + "\">" +
        "<a class=\"card-link\" href=\"" + item.path + "\">" +
        "<span class=\"poster-frame\"><img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\" decoding=\"async\"></span>" +
        "<span class=\"card-content\">" +
        "<span class=\"card-meta\">" + escapeHtml(item.region + " · " + item.year + " · " + item.type) + "</span>" +
        "<strong>" + escapeHtml(item.title) + "</strong>" +
        "<span class=\"card-desc\">" + escapeHtml(item.oneLine) + "</span>" +
        "<span class=\"tag-row\">" + tags + "</span>" +
        "</span></a></article>";
    }
    function escapeHtml(value) {
      return String(value).replace(/[&<>\"]/g, function (ch) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[ch];
      });
    }
    function render() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        container.innerHTML = "";
        if (hint) {
          hint.textContent = "输入关键词即可开始浏览匹配内容。";
        }
        return;
      }
      var terms = q.split(/\s+/).filter(Boolean);
      var results = list.filter(function (item) {
        var haystack = item.search.toLowerCase();
        return terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
      }).slice(0, 120);
      container.innerHTML = results.map(card).join("");
      if (hint) {
        hint.textContent = results.length ? "已找到匹配内容，可继续调整关键词。" : "没有找到完全匹配的内容，可尝试更短的关键词。";
      }
    }
    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    setupNav();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
