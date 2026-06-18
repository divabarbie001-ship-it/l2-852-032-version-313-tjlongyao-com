(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function text(card) {
        return [
            card.dataset.title || "",
            card.dataset.year || "",
            card.dataset.region || "",
            card.dataset.genre || ""
        ].join(" ").toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        function show(index) {
            slides[current].classList.remove("is-active");
            current = (index + slides.length) % slides.length;
            slides[current].classList.add("is-active");
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
            });
        }
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var sort = panel.querySelector("[data-sort-select]");
            var count = panel.querySelector("[data-result-count]");
            var grid = document.querySelector("[data-card-grid]");
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".searchable-card"));
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            if (panel.hasAttribute("data-url-query") && input && initial) {
                input.value = initial;
            }
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var match = !query || text(card).indexOf(query) !== -1;
                    card.classList.toggle("is-hidden", !match);
                    if (match) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = "匹配 " + visible + " 部";
                }
            }
            function reorder() {
                var mode = sort ? sort.value : "score";
                cards.sort(function (a, b) {
                    if (mode === "title") {
                        return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
                    }
                    if (mode === "year") {
                        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                    }
                    return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
                });
                cards.forEach(function (card) {
                    grid.appendChild(card);
                });
                apply();
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            if (sort) {
                sort.addEventListener("change", reorder);
            }
            reorder();
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
