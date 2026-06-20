(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!opened));
      menu.hidden = opened;
    });
  }

  function setupFilters() {
    var forms = document.querySelectorAll("[data-filter-form]");
    forms.forEach(function (form) {
      var scope = form.closest("main") || document;
      var cards = Array.prototype.slice.call(
        scope.querySelectorAll(".searchable-card"),
      );
      var empty = scope.querySelector(".empty-state");
      var searchInput = form.querySelector("[data-search-input]");
      var typeFilter = form.querySelector("[data-type-filter]");
      var categoryFilter = form.querySelector("[data-category-filter]");
      var yearFilter = form.querySelector("[data-year-filter]");

      function applyFilters() {
        var query = normalize(searchInput && searchInput.value);
        var type = normalize(typeFilter && typeFilter.value);
        var category = normalize(categoryFilter && categoryFilter.value);
        var year = normalize(yearFilter && yearFilter.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-title"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }
          if (category && cardCategory !== category) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      form.addEventListener("input", applyFilters);
      form.addEventListener("change", applyFilters);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilters();
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && searchInput) {
        searchInput.value = q;
      }
      applyFilters();
    });
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-video");
    var overlay = document.getElementById("player-overlay");
    var attached = false;
    var hlsInstance = null;

    if (!video || !overlay || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function startPlayback() {
      attachSource();
      overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupFilters();
  });
})();
