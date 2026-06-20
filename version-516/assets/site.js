(function () {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function initSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
    forms.forEach(function (form) {
      var input = form.querySelector("[data-search-input]");
      var panel = form.querySelector("[data-search-results]");
      if (!input || !panel) {
        return;
      }
      function render() {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          panel.classList.remove("is-open");
          panel.innerHTML = "";
          return;
        }
        var movies = window.MOVIE_INDEX || [];
        var results = movies.filter(function (movie) {
          return movie.search.indexOf(query) !== -1;
        }).slice(0, 12);
        if (!results.length) {
          panel.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
          panel.classList.add("is-open");
          return;
        }
        panel.innerHTML = results.map(function (movie) {
          return '<a class="search-result-item" href="./' + escapeHtml(movie.file) + '">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">' +
            '<span><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span></span>' +
            '</a>';
        }).join("");
        panel.classList.add("is-open");
      }
      input.addEventListener("input", render);
      input.addEventListener("focus", render);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var first = panel.querySelector("a");
        if (first) {
          window.location.href = first.getAttribute("href");
        }
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function initLocalFilters() {
    var tools = document.querySelector("[data-local-tools]");
    if (!tools) {
      return;
    }
    var buttons = Array.prototype.slice.call(tools.querySelectorAll("[data-local-filter]"));
    var input = tools.querySelector("[data-local-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var active = "all";
    function matchesFilter(card) {
      var type = card.getAttribute("data-type") || "";
      var region = card.getAttribute("data-region") || "";
      var year = card.getAttribute("data-year") || "";
      if (active === "all") {
        return true;
      }
      if (active === "movie") {
        return type.indexOf("电影") !== -1;
      }
      if (active === "series") {
        return type.indexOf("剧") !== -1 || type.indexOf("电视剧") !== -1;
      }
      if (active === "domestic") {
        return /中国|国产|大陆|香港|台湾|华语|内地/.test(region);
      }
      if (active === "global") {
        return !/中国|国产|大陆|香港|台湾|华语|内地/.test(region);
      }
      return year.indexOf(active) !== -1;
    }
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var search = (card.getAttribute("data-search") || "").toLowerCase();
        var visible = matchesFilter(card) && (!query || search.indexOf(query) !== -1);
        card.classList.toggle("is-hidden", !visible);
      });
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        active = button.getAttribute("data-local-filter") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        apply();
      });
    });
    if (input) {
      input.addEventListener("input", apply);
    }
    apply();
  }

  function setupVideo(video, streamUrl) {
    if (!video || !streamUrl || video.getAttribute("data-ready") === "true") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.setAttribute("data-ready", "true");
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      video.setAttribute("data-ready", "true");
      return;
    }
    video.src = streamUrl;
    video.setAttribute("data-ready", "true");
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-movie-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("[data-video]");
      var button = player.querySelector("[data-play-button]");
      var message = player.querySelector("[data-player-message]");
      var streamUrl = player.getAttribute("data-stream-url") || "";
      function play() {
        setupVideo(video, streamUrl);
        if (button) {
          button.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            if (message) {
              message.textContent = "点击播放按钮开始观看";
            }
          });
        }
      }
      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          if (button) {
            button.classList.add("is-hidden");
          }
          if (message) {
            message.textContent = "";
          }
        });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initSearch();
    initLocalFilters();
    initPlayers();
  });
})();
