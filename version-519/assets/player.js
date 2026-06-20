(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  var tryPlay = function (video) {
    var result = video.play();

    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  };

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var source = player.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    var start = function () {
      if (!video || !source) {
        return;
      }

      if (cover) {
        cover.classList.add('is-hidden');
        cover.setAttribute('aria-hidden', 'true');
      }

      video.controls = true;

      if (loaded) {
        tryPlay(video);
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          tryPlay(video);
        }, { once: true });
        tryPlay(video);
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          tryPlay(video);
        });
        return;
      }

      video.src = source;
      tryPlay(video);
    };

    if (cover) {
      cover.addEventListener('click', function (event) {
        event.preventDefault();
        start();
      });
    }

    player.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();
