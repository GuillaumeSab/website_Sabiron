(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      window.scrollTo({ top: Number(savedScroll), behavior: reducedMotion ? 'auto' : 'instant' });
    }
    document.querySelectorAll('.language-switcher a').forEach((link) => link.addEventListener('click', () => {
      sessionStorage.setItem('portfolio-language-scroll', String(window.scrollY));
    }));

    const travelMap = document.querySelector('[data-travel-map]');
    if (travelMap) {
      const locations = JSON.parse(travelMap.dataset.locations || '[]');
      const positions = {
        CAN: [19, 30], USA: [23, 44], CHL: [28, 74], ALB: [52, 38], DNK: [50, 30],
        NOR: [48, 23], SWE: [51, 25], ITA: [53, 43], GRC: [55, 45], TUN: [48, 51],
        MAR: [43, 52], EGY: [59, 53], TUR: [59, 42], IND: [70, 52], CHN: [78, 40], KOR: [84, 41],
      };
      const language = document.documentElement.lang;
      const detail = document.createElement('p');
      detail.className = 'travel-map-detail';
      detail.setAttribute('aria-live', 'polite');
      detail.textContent = language === 'fr' ? 'Sélectionnez un pays pour afficher sa catégorie.' : 'Select a country to view its category.';
      const points = document.createElement('div');
      points.className = 'travel-map-points';
      locations.forEach((location) => {
        const point = positions[location.code];
        if (!point) return;
        const button = document.createElement('button');
        const personal = location.category === 'personal-travel';
        const name = location[`name_${language}`] || location.name_en;
        const category = personal
          ? (language === 'fr' ? 'Voyage personnel' : 'Personal travel')
          : (language === 'fr' ? 'Études' : 'Education');
        button.type = 'button';
        button.className = `travel-point ${personal ? 'is-personal' : 'is-education'}`;
        button.style.left = `${point[0]}%`;
        button.style.top = `${point[1]}%`;
        button.setAttribute('aria-label', `${name} — ${category}`);
        button.dataset.travelName = name;
        button.dataset.travelCategory = category;
        button.addEventListener('click', () => {
          points.querySelectorAll('.travel-point').forEach((item) => item.classList.remove('is-selected'));
          button.classList.add('is-selected');
          detail.textContent = `${name} — ${category}`;
        });
        points.append(button);
      });
      travelMap.replaceChildren(points, detail);
    }

    const lists = document.querySelectorAll('.publications-shell ul');
    lists.forEach((list) => {
      const heading = list.previousElementSibling?.textContent || '';
      const type = /Journal|revue/i.test(heading) ? 'paper' : /Conference|Conférence/i.test(heading) ? 'conference' : /Book|ouvrage/i.test(heading) ? 'book' : /Patent|Brevet/i.test(heading) ? 'patent' : /Thesis|Thèse/i.test(heading) ? 'thesis' : 'media';
      [...list.children].forEach((entry) => {
        entry.dataset.publicationType = type;
        entry.dataset.publicationYear = entry.textContent.match(/\b(?:19|20)\d{2}\b/)?.[0] || '0';
      });
      [...list.children].sort((a, b) => Number(b.dataset.publicationYear) - Number(a.dataset.publicationYear)).forEach((entry) => list.append(entry));
    });
    document.querySelectorAll('[data-publication-filter]').forEach((button) => button.addEventListener('click', () => {
      const selected = button.dataset.publicationFilter;
      document.querySelectorAll('.publications-shell li[data-publication-type]').forEach((entry) => { entry.hidden = selected !== 'all' && entry.dataset.publicationType !== selected; });
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
        selected.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    }

    const menuButton = document.querySelector('[data-menu-button]');
    const menu = document.querySelector('[data-site-menu]');
    if (menuButton && menu) {
      const closeMenu = () => { menu.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); };
      menuButton.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('is-open');
        menuButton.setAttribute('aria-expanded', String(isOpen));
      });
      menu.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', closeMenu));
      document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
    }

    const backToTop = document.querySelector('[data-back-to-top]');
    if (backToTop) {
      const updateBackToTop = () => backToTop.classList.toggle('is-visible', window.scrollY > 500);
      window.addEventListener('scroll', updateBackToTop, { passive: true });
      updateBackToTop();
      backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));
    }

    const dialog = document.querySelector('[data-media-dialog]');
    const container = document.querySelector('[data-media-container]');
    const title = document.querySelector('[data-media-title]');
    const close = document.querySelector('[data-media-close]');
    let mediaTrigger = null;
    const closeMedia = () => dialog?.close();
    const openMedia = (kind, source, label, trigger) => {
      if (!dialog || !container || !source) return;
      mediaTrigger = trigger;
      if (title) title.textContent = label || (kind === 'video' ? 'Video' : 'Image');
      const element = document.createElement(kind === 'video' ? 'iframe' : 'img');
      if (kind === 'video') {
        element.src = `${source}?autoplay=1`;
        element.title = label || '';
        element.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
        element.allowFullscreen = true;
      } else {
        element.src = source;
        element.alt = label || '';
        element.className = 'media-dialog-image';
      }
      container.replaceChildren(element);
      dialog.showModal();
      close?.focus();
    };
    document.querySelectorAll('[data-video-button]').forEach((button) => button.addEventListener('click', () => {
      openMedia('video', button.dataset.videoSrc, button.dataset.videoTitle, button);
    }));
    document.querySelectorAll('.project-visual').forEach((image) => {
      image.classList.add('is-zoomable');
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', `${image.alt}. ${document.documentElement.lang === 'fr' ? 'Agrandir l’image' : 'Open larger image'}`);
      const showImage = () => openMedia('image', image.currentSrc || image.src, image.alt, image);
      image.addEventListener('click', showImage);
      image.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showImage(); }
      });
    });
    close?.addEventListener('click', closeMedia);
    dialog?.addEventListener('click', (event) => { if (event.target === dialog) closeMedia(); });
    dialog?.addEventListener('close', () => {
      container?.replaceChildren();
      mediaTrigger?.focus();
      mediaTrigger = null;
    });

    document.querySelectorAll('[data-contact-form]').forEach((form) => form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = form.querySelector('[data-contact-status]');
      const button = form.querySelector('button[type="submit"]');
      const french = document.documentElement.lang === 'fr';
      if (button) button.disabled = true;
      if (status) status.textContent = french ? 'Envoi en cours…' : 'Sending…';
      try {
        const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Form submission failed');
        form.reset();
        if (status) status.textContent = french ? 'Merci, votre message a bien été envoyé.' : 'Thank you, your message has been sent.';
      } catch (_) {
        if (status) status.textContent = french ? 'L’envoi a échoué. Réessayez dans un instant.' : 'Sending failed. Please try again shortly.';
      } finally { if (button) button.disabled = false; }
    }));
  });
})();
