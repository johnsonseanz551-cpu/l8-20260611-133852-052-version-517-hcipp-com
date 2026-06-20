import { H as Hls } from './hls.js';

document.querySelectorAll('[data-player]').forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const stream = player.dataset.stream;
    let hls = null;

    const attachStream = () => {
        if (!video || !stream) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== stream) {
                video.src = stream;
            }
            return;
        }

        if (Hls && Hls.isSupported()) {
            if (!hls) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            }
            return;
        }

        if (video.src !== stream) {
            video.src = stream;
        }
    };

    const startPlayback = () => {
        attachStream();
        player.classList.add('is-playing');
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                player.classList.remove('is-playing');
            });
        }
    };

    if (button && video) {
        button.addEventListener('click', startPlayback);
    }

    if (video) {
        video.addEventListener('click', () => {
            if (video.paused) {
                startPlayback();
            }
        });
        video.addEventListener('play', () => {
            player.classList.add('is-playing');
        });
        video.addEventListener('pause', () => {
            if (!video.currentTime) {
                player.classList.remove('is-playing');
            }
        });
    }
});
