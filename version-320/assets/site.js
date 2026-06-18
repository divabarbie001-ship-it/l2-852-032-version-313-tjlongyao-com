(function () {
  var root = document.body.getAttribute("data-root") || "./";

  function bySelector(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function createResult(entry) {
    var link = document.createElement("a");
    link.className = "search-item";
    link.href = root + entry.url;

    var thumb = document.createElement("span");
    thumb.className = "search-thumb";

    var img = document.createElement("img");
    img.src = root + entry.cover;
    img.alt = entry.title;
    img.onerror = function () {
      img.remove();
    };
    thumb.appendChild(img);

    var text = document.createElement("span");
    var title = document.createElement("span");
    title.className = "search-title";
    title.textContent = entry.title;
    var meta = document.createElement("span");
    meta.className = "search-meta";
    meta.textContent = [entry.year, entry.region, entry.type].filter(Boolean).join(" · ");
    text.appendChild(title);
    text.appendChild(meta);

    link.appendChild(thumb);
    link.appendChild(text);
    return link;
  }

  bySelector("[data-global-search]").forEach(function (input) {
    var box = input.parentElement.querySelector("[data-search-results]");
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      box.innerHTML = "";
      if (!keyword || !window.searchIndex) {
        box.classList.remove("is-open");
        return;
      }
      var hits = window.searchIndex.filter(function (entry) {
        return entry.text.indexOf(keyword) !== -1;
      }).slice(0, 8);
      hits.forEach(function (entry) {
        box.appendChild(createResult(entry));
      });
      box.classList.toggle("is-open", hits.length > 0);
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        var first = box.querySelector("a");
        if (first) {
          window.location.href = first.href;
        }
      }
    });
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".global-search") && !event.target.closest(".mobile-search")) {
      bySelector("[data-search-results]").forEach(function (box) {
        box.classList.remove("is-open");
      });
    }
  });

  var toggle = document.querySelector("[data-mobile-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  bySelector("[data-local-filter]").forEach(function (panel) {
    var input = panel.querySelector("[data-filter-input]");
    var type = panel.querySelector("[data-filter-type]");
    var list = panel.parentElement.querySelector("[data-filter-list]");
    if (!list) {
      return;
    }
    var cards = bySelector("[data-movie-card]", list);

    function apply() {
      var keyword = (input.value || "").trim().toLowerCase();
      var selectedType = type.value;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-tags") || "").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var matchText = !keyword || text.indexOf(keyword) !== -1;
        var matchType = !selectedType || cardType === selectedType;
        card.classList.toggle("is-hidden", !(matchText && matchType));
      });
    }

    input.addEventListener("input", apply);
    type.addEventListener("change", apply);
  });

  bySelector("[data-hero]").forEach(function (hero) {
    var slides = bySelector("[data-hero-slide]", hero);
    var dots = bySelector("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  });
})();
