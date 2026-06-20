(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));
  filterInputs.forEach(function (input) {
    var list = document.querySelector('[data-filter-list]');
    var empty = document.querySelector('[data-empty-state]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial && !input.value) {
      input.value = initial;
    }
    var applyFilter = function () {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    };
    input.addEventListener('input', applyFilter);
    applyFilter();
  });

  Array.prototype.slice.call(document.images).forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.opacity = '0';
    });
  });
})();
