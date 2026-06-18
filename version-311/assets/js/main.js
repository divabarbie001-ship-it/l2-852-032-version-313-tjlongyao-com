document.addEventListener("DOMContentLoaded", function () {
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero-slider]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    if (slides.length > 1) {
      var timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-slide")) || 0);
          restart();
        });
      });
    }
  }

  document.querySelectorAll(".search-panel").forEach(function (panel) {
    var input = panel.querySelector("[data-filter-keyword]");
    var region = panel.querySelector("[data-filter-region]");
    var year = panel.querySelector("[data-filter-year]");
    var category = panel.querySelector("[data-filter-category]");
    var scope = panel.parentElement;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var queryText = params.get("q");

    if (input && queryText) {
      input.value = queryText;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      var key = normalize(input ? input.value : "");
      var regionValue = normalize(region ? region.value : "");
      var yearValue = normalize(year ? year.value : "");
      var categoryValue = category ? category.value : "all";

      cards.forEach(function (card) {
        var search = normalize(card.getAttribute("data-search"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardCategory = card.getAttribute("data-category") || "";
        var matched = true;

        if (key && search.indexOf(key) === -1) {
          matched = false;
        }

        if (regionValue && cardRegion.indexOf(regionValue) === -1) {
          matched = false;
        }

        if (yearValue && cardYear.indexOf(yearValue) === -1) {
          matched = false;
        }

        if (categoryValue !== "all" && categoryValue !== cardCategory) {
          matched = false;
        }

        card.classList.toggle("is-hidden", !matched);
      });
    }

    [input, region, year, category].forEach(function (item) {
      if (item) {
        item.addEventListener("input", applyFilter);
        item.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  });
});
