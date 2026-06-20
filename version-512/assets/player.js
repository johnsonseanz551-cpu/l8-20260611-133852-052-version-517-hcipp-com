import { H as Hls } from "./hls.js";

document.addEventListener("DOMContentLoaded", function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var message = player.querySelector("[data-player-message]");
    var stream = video ? video.getAttribute("data-stream") : "";
    var hlsInstance = null;
    var started = false;

    function showMessage(text) {
      if (!message) {
        return;
      }

      message.textContent = text;
      message.classList.add("is-visible");
    }

    function hideMessage() {
      if (!message) {
        return;
      }

      message.textContent = "";
      message.classList.remove("is-visible");
    }

    function revealVideo() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function playVideo() {
      if (!video) {
        return;
      }

      video.play().catch(function () {
        showMessage("请点击视频继续播放");
      });
    }

    function attachStream() {
      if (!video || !stream) {
        showMessage("播放暂时不可用，请稍后重试");
        return;
      }

      revealVideo();
      hideMessage();

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        playVideo();
        return;
      }

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, playVideo);
        hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            showMessage("播放加载失败，请刷新后重试");
          }
        });
        return;
      }

      video.src = stream;
      playVideo();
    }

    function start() {
      if (started) {
        playVideo();
        return;
      }

      started = true;
      attachStream();
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!started) {
          start();
          return;
        }

        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });

      video.addEventListener("emptied", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    }
  });
});
