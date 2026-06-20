import { H as Hls } from './hls-vendor.js';

const select = (selector, root = document) => root.querySelector(selector);
const selectAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileMenu() {
  const button = select('[data-menu-button]');
  const nav = select('[data-mobile-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function setupHero() {
  const hero = select('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = selectAll('[data-hero-slide]', hero);
  const dots = selectAll('[data-hero-dot]', hero);
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(current + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  show(0);
  start();
}

function setupPlayers() {
  const frames = selectAll('[data-player]');

  frames.forEach((frame) => {
    const video = select('video[data-src]', frame);
    const button = select('[data-play-button]', frame);

    if (!video) {
      return;
    }

    const source = video.dataset.src;
    let initialized = false;

    const initialize = () => {
      if (initialized || !source) {
        return;
      }

      initialized = true;
      frame.classList.add('is-ready');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 24,
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        frame._hls = hls;
        return;
      }

      video.src = source;
    };

    const play = () => {
      initialize();
      const result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(() => {});
      }
    };

    initialize();

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('play', () => {
      frame.classList.add('is-playing');
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', () => {
      frame.classList.remove('is-playing');
    });
  });
}

function setupSearch() {
  const input = select('[data-search-input]');
  const grid = select('[data-search-grid]');
  const count = select('[data-result-count]');
  const clearButton = select('[data-clear-search]');
  const filterButtons = selectAll('[data-filter]');

  if (!input || !grid) {
    return;
  }

  const cards = selectAll('[data-card]', grid);
  let activeFilter = '';

  const normalize = (value) => (value || '').toString().trim().toLowerCase();

  const apply = () => {
    const keyword = normalize(input.value);
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags,
        card.textContent
      ].join(' '));

      const matchKeyword = !keyword || haystack.includes(keyword);
      const matchFilter = !activeFilter || haystack.includes(normalize(activeFilter));
      const show = matchKeyword && matchFilter;

      card.classList.toggle('is-hidden', !show);

      if (show) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = visible ? `当前显示 ${visible} 部影片。` : '没有匹配的影片。';
    }
  };

  input.addEventListener('input', apply);

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      input.value = '';
      activeFilter = '';
      filterButtons.forEach((button) => button.classList.toggle('is-active', !button.dataset.filter));
      input.focus();
      apply();
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || '';
      filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
      apply();
    });
  });

  apply();
}

function setupHeaderShadow() {
  const header = select('[data-header]');

  if (!header) {
    return;
  }

  const toggle = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  };

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}

setupMobileMenu();
setupHero();
setupPlayers();
setupSearch();
setupHeaderShadow();
