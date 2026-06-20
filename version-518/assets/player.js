(function () {
  var video = document.querySelector('#moviePlayer');
  var button = document.querySelector('[data-play-url]');
  var cover = document.querySelector('[data-player-cover]');
  var status = document.querySelector('[data-player-status]');
  var hlsInstance = null;

  if (!video || !button) {
    return;
  }

  var source = button.getAttribute('data-play-url') || '';

  var setStatus = function (text) {
    if (status) {
      status.textContent = text;
    }
  };

  var hideCover = function () {
    if (cover) {
      cover.classList.add('hidden');
    }
  };

  var startPlayback = function () {
    if (!source) {
      setStatus('播放线路正在准备');
      return;
    }

    setStatus('正在打开影片');

    if (hlsInstance) {
      try {
        hlsInstance.destroy();
      } catch (error) {
        hlsInstance = null;
      }
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
        hideCover();
        video.play().catch(function () {
          setStatus('点击播放按钮继续观看');
        });
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放遇到问题，请稍后重试');
          try {
            hlsInstance.destroy();
          } catch (error) {
            hlsInstance = null;
          }
        }
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        hideCover();
        video.play().catch(function () {
          setStatus('点击播放按钮继续观看');
        });
      }, { once: true });
      return;
    }

    video.src = source;
    video.load();
    hideCover();
  };

  button.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (!video.src) {
      startPlayback();
    }
  });
})();
