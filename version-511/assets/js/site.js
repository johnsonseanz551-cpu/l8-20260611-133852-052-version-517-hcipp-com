(() => {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', () => {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach((hero) => {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        const showSlide = (index) => {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });

        if (slides.length > 1) {
            setInterval(() => showSlide(current + 1), 5000);
        }
    });

    const searchField = document.querySelector('[data-search-field]');
    const typeFilter = document.querySelector('[data-type-filter]');
    const yearFilter = document.querySelector('[data-year-filter]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const emptyState = document.querySelector('[data-empty-state]');

    if (searchField && cards.length) {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q) {
            searchField.value = q;
        }

        const applyFilter = () => {
            const query = searchField.value.trim().toLowerCase();
            const typeValue = typeFilter ? typeFilter.value : '';
            const yearValue = yearFilter ? yearFilter.value : '';
            let visible = 0;

            cards.forEach((card) => {
                const keywords = (card.dataset.keywords || '').toLowerCase();
                const title = (card.dataset.title || '').toLowerCase();
                const type = card.dataset.type || '';
                const year = card.dataset.year || '';
                const matchQuery = !query || keywords.includes(query) || title.includes(query);
                const matchType = !typeValue || type.includes(typeValue);
                const matchYear = !yearValue || year.includes(yearValue);
                const show = matchQuery && matchType && matchYear;

                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        };

        searchField.addEventListener('input', applyFilter);
        if (typeFilter) {
            typeFilter.addEventListener('change', applyFilter);
        }
        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilter);
        }
        applyFilter();
    }
})();
