(() => {
  const ready = (callback) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', callback)
    : callback();

  ready(() => {
    document.querySelectorAll('[data-current-year]').forEach((element) => {
        element.textContent = String(new Date().getFullYear());
    });

    const savedScroll = sessionStorage.getItem('portfolio-language-scroll');
    if (savedScroll && !window.location.hash) {
      sessionStorage.removeItem('portfolio-language-scroll');
      requestAnimationFrame(() => window.scrollTo(0, Number(savedScroll)));
    }
    document.querySelectorAll('.language-switcher a').forEach((link) => link.addEventListener('click', () => {
      sessionStorage.setItem('portfolio-language-scroll', String(window.scrollY));
    }));

    const lists = document.querySelectorAll('.publications-shell ul');
    lists.forEach((list) => {
      const heading = list.previousElementSibling?.textContent || '';
      const type = /Journal|revue/i.test(heading) ? 'paper' : /Conference|Conférence/i.test(heading) ? 'conference' : /Book|ouvrage/i.test(heading) ? 'book' : /Thesis|Thèse/i.test(heading) ? 'thesis' : 'media';
      [...list.children].forEach((entry) => {
        entry.dataset.publicationType = type;
        const match = entry.textContent.match(/\b(?:19|20)\d{2}\b/);
        entry.dataset.publicationYear = match ? match[0] : '0';
      });
      [...list.children]
        .sort((a, b) => Number(b.dataset.publicationYear) - Number(a.dataset.publicationYear))
        .forEach((entry) => list.append(entry));
    });
    document.querySelectorAll('[data-publication-filter]').forEach((button) => button.addEventListener('click', () => {
      const selected = button.dataset.publicationFilter;
      document.querySelectorAll('.publications-shell li[data-publication-type]').forEach((entry) => entry.hidden = selected !== 'all' && entry.dataset.publicationType !== selected);
      lists.forEach((list) => {
        const visible = [...list.children].some((entry) => !entry.hidden);
        list.hidden = !visible;
        if (list.previousElementSibling) list.previousElementSibling.hidden = !visible;
      });
      document.querySelectorAll('[data-publication-filter]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
    }));

    const requestedPaper = new URLSearchParams(window.location.search).get('paper');
    if (requestedPaper) {
      const selected = [...document.querySelectorAll('.reference-item')].find((item) => item.querySelector('.reference-title')?.textContent.trim() === requestedPaper);
      if (selected) {
        selected.open = true;
        requestAnimationFrame(() => selected.scrollIntoView({ block: 'center' }));
      }
    }

    document.querySelectorAll('.publication-carousel').forEach((carousel) => {
      let paused = false;
      let dragging = false;
      let moved = false;
      let startX = 0;
      let startScroll = 0;
      const step = () => {
        if (!paused && !dragging && carousel.scrollWidth > carousel.clientWidth) {
          const limit = carousel.scrollWidth - carousel.clientWidth;
          carousel.scrollLeft = carousel.scrollLeft >= limit - 1 ? 0 : carousel.scrollLeft + 0.55;
        }
        requestAnimationFrame(step);
      };
      carousel.addEventListener('mouseenter', () => { paused = true; });
      carousel.addEventListener('mouseleave', () => { paused = false; });
      carousel.addEventListener('wheel', (event) => {
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
          event.preventDefault();
          carousel.scrollLeft += event.deltaY;
        }
      }, { passive: false });
      carousel.addEventListener('pointerdown', (event) => {
        dragging = true;
        moved = false;
        paused = true;
        startX = event.clientX;
        startScroll = carousel.scrollLeft;
        carousel.setPointerCapture(event.pointerId);
      });
      carousel.addEventListener('pointermove', (event) => {
        if (dragging) {
          const distance = event.clientX - startX;
          if (Math.abs(distance) > 6) moved = true;
          carousel.scrollLeft = startScroll - distance;
        }
      });
      const stopDragging = () => { dragging = false; paused = false; };
      carousel.addEventListener('pointerup', stopDragging);
      carousel.addEventListener('pointercancel', stopDragging);
      carousel.querySelectorAll('.publication-slide').forEach((slide) => {
        slide.tabIndex = 0;
        slide.setAttribute('role', 'link');
        const openPublication = () => {
          if (moved) return;
          const target = new URL('publications/', window.location.href);
          target.searchParams.set('lang', document.documentElement.lang);
          target.searchParams.set('paper', slide.querySelector('h3')?.textContent.trim() || '');
          window.location.assign(target.href);
        };
        slide.addEventListener('click', openPublication);
        slide.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPublication(); }
        });
      });
      requestAnimationFrame(step);
    });

    const menuButton = document.querySelector('[data-menu-button]');
    const menu = document.querySelector('[data-site-menu]');
    if (menuButton && menu) {
      const closeMenu = () => {
        menu.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
      };
      menuButton.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('is-open');
        menuButton.setAttribute('aria-expanded', String(isOpen));
      });
      menu.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', closeMenu));
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
      });
    }

    const backToTop = document.querySelector('[data-back-to-top]');
    if (backToTop) {
      const updateBackToTop = () => backToTop.classList.toggle('is-visible', window.scrollY > 500);
      window.addEventListener('scroll', updateBackToTop, { passive: true });
      updateBackToTop();
      backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    const dialog = document.querySelector('[data-video-dialog]');
    const container = document.querySelector('[data-video-container]');
    const close = document.querySelector('[data-video-close]');
    document.querySelectorAll('[data-video-button]').forEach((button) => button.addEventListener('click', () => {
      if (!dialog || !container) return;
      container.innerHTML = '<iframe src="' + button.dataset.videoSrc + '?autoplay=1" title="' + button.dataset.videoTitle + '" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      dialog.showModal();
    }));
    const closeVideo = () => {
      if (!dialog) return;
      dialog.close();
      if (container) container.replaceChildren();
    };
    close?.addEventListener('click', closeVideo);
    dialog?.addEventListener('close', () => container?.replaceChildren());

    const travelMap = document.querySelector('.travel-map svg');
    if (travelMap) {
      const fr = document.documentElement.lang === 'fr';
      const places = fr
        ? ['Amérique du Nord', 'Europe et Scandinavie', 'Afrique du Nord', 'Méditerranée et Balkans', 'Inde', 'Asie de l’Est', 'Asie du Sud-Est']
        : ['North America', 'Europe and Scandinavia', 'North Africa', 'Mediterranean and Balkans', 'India', 'East Asia', 'Southeast Asia'];
      travelMap.innerHTML = `
        <title id="travel-map-title">${fr ? 'Carte de mes voyages' : 'Travel map'}</title>
        <desc id="travel-map-desc">${fr ? 'Carte mondiale stylisée de régions visitées lors de voyages personnels.' : 'Stylised world map of regions visited during personal travel.'}</desc>
        <path d="M28 58 66 30l55-5 36 20 12 30-21 21-30-7-18 18-42-2-28-20Z"/>
        <path d="m130 107 24 11 12 32-10 40-17 34-9-42 7-35-16-23Z"/>
        <path d="m213 38 23-20 30 7 15 20-14 12-27-3-13 17-18-12Z"/>
        <path d="m236 75 37-7 25 20-7 39-21 29-20-25 4-29-18-12Z"/>
        <path d="m281 53 48-23 82 7 31 18 60 6 20 23-30 14-24 25-41-3-28 15-37-5-26 14-35-17-23-34Z"/>
        <path d="m436 164 42 5 18 19-21 16-39-10-12-18Z"/>
        <g class="map-labels" aria-hidden="true"><text x="63" y="105">North America</text><text x="132" y="222">South America</text><text x="265" y="45">Europe</text><text x="250" y="165">Africa</text><text x="365" y="82">Asia</text><text x="444" y="218">Australia</text></g>
        <g class="map-markers">
          <g tabindex="0" role="button" data-map-place="${places[0]}"><title>${places[0]}</title><circle cx="94" cy="72" r="7"/></g>
          <g tabindex="0" role="button" data-map-place="${places[1]}"><title>${places[1]}</title><circle cx="273" cy="53" r="7"/></g>
          <g tabindex="0" role="button" data-map-place="${places[2]}"><title>${places[2]}</title><circle cx="258" cy="102" r="7"/></g>
          <g tabindex="0" role="button" data-map-place="${places[3]}"><title>${places[3]}</title><circle cx="292" cy="79" r="7"/></g>
          <g tabindex="0" role="button" data-map-place="${places[4]}"><title>${places[4]}</title><circle cx="367" cy="104" r="7"/></g>
          <g tabindex="0" role="button" data-map-place="${places[5]}"><title>${places[5]}</title><circle cx="438" cy="87" r="7"/></g>
          <g tabindex="0" role="button" data-map-place="${places[6]}"><title>${places[6]}</title><circle cx="418" cy="124" r="7"/></g>
        </g>`;
    }

    const mapStatus = document.querySelector('[data-map-status]');
    document.querySelectorAll('[data-map-place]').forEach((marker) => {
      const announce = () => { if (mapStatus) mapStatus.textContent = marker.dataset.mapPlace; };
      marker.addEventListener('click', announce);
      marker.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); announce(); }
      });
    });
  });
})();
