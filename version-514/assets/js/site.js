(function () {
  "use strict";

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initNavigation() {
    var toggle = qs("[data-nav-toggle]");
    var mobileNav = qs("[data-mobile-nav]");

    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = qsa("[data-hero-slide]", hero);
    var dotsWrap = qs("[data-hero-dots]", hero);
    var current = 0;
    var timer = null;

    if (slides.length <= 1 || !dotsWrap) {
      return;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      qsa(".hero-dot", dotsWrap).forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    slides.forEach(function (_, index) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "hero-dot";
      dot.setAttribute("aria-label", "切换推荐" + (index + 1));
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
      dotsWrap.appendChild(dot);
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    qsa("[data-filter-panel]").forEach(function (panel) {
      var section = panel.closest("section") || document;
      var cards = qsa("[data-movie-card]", section);
      var search = qs("[data-search-input]", panel);
      var type = qs("[data-type-filter]", panel);
      var year = qs("[data-year-filter]", panel);

      function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
      }

      function apply() {
        var keyword = normalize(search && search.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);

        cards.forEach(function (card) {
          var title = normalize(card.getAttribute("data-title"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var region = normalize(card.getAttribute("data-region"));
          var genre = normalize(card.getAttribute("data-genre"));
          var text = [title, cardType, cardYear, region, genre].join(" ");
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedType = !typeValue || cardType.indexOf(typeValue) !== -1;
          var matchedYear = !yearValue || cardYear.indexOf(yearValue) !== -1;

          card.style.display = matchedKeyword && matchedType && matchedYear ? "" : "none";
        });
      }

      [search, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function initPlayers() {
    qsa("[data-player]").forEach(function (player) {
      var video = qs("video", player);
      var button = qs("[data-play-button]", player);
      var stream = player.getAttribute("data-stream");
      var readyPromise = null;
      var hlsInstance = null;

      if (!video || !button || !stream) {
        return;
      }

      function prepareStream() {
        if (readyPromise) {
          return readyPromise;
        }

        readyPromise = new Promise(function (resolve) {
          var resolved = false;

          function done() {
            if (!resolved) {
              resolved = true;
              resolve();
            }
          }

          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            video.load();
            video.addEventListener("loadedmetadata", done, { once: true });
            window.setTimeout(done, 500);
            return;
          }

          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);

            if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
              hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, done);
            }

            window.setTimeout(done, 1200);
            return;
          }

          video.src = stream;
          video.load();
          video.addEventListener("loadedmetadata", done, { once: true });
          window.setTimeout(done, 700);
        });

        return readyPromise;
      }

      function play() {
        button.classList.add("is-hidden");
        video.controls = true;

        prepareStream().then(function () {
          var playTask = video.play();

          if (playTask && typeof playTask.catch === "function") {
            playTask.catch(function () {
              button.classList.remove("is-hidden");
            });
          }
        });
      }

      button.addEventListener("click", play);

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });
})();
