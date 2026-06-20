(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var query = new URLSearchParams(window.location.search).get('q') || '';
  var filterInput = document.querySelector('[data-filter-input]');
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var empty = document.querySelector('[data-empty-state]');

  var normalize = function (value) {
    return (value || '').toString().trim().toLowerCase();
  };

  var applyFilter = function () {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(filterInput ? filterInput.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-filter-text'));
      var matched = !keyword || text.indexOf(keyword) !== -1;

      filterSelects.forEach(function (select) {
        var value = normalize(select.value);
        var key = select.getAttribute('data-filter-select');
        var target = normalize(card.getAttribute(key));

        if (value && target.indexOf(value) === -1) {
          matched = false;
        }
      });

      card.classList.toggle('hidden-by-filter', !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  };

  if (filterInput) {
    if (query) {
      filterInput.value = query;
    }

    filterInput.addEventListener('input', applyFilter);
  }

  filterSelects.forEach(function (select) {
    select.addEventListener('change', applyFilter);
  });

  applyFilter();
})();
