(function () {
  function initPlayer(sourceUrl) {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("playButton");
    var shell = document.querySelector(".video-shell");
    var hlsInstance = null;
    var isReady = false;

    if (!video || !sourceUrl) {
      return;
    }

    function prepare() {
      if (isReady) {
        return;
      }
      isReady = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function start() {
      prepare();
      if (shell) {
        shell.classList.add("is-playing");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (shell) {
            shell.classList.remove("is-playing");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });

    video.addEventListener("pause", function () {
      if (shell && video.currentTime === 0) {
        shell.classList.remove("is-playing");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initPlayer = initPlayer;
})();
