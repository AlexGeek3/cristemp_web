
/* ── MENÚ MÓVIL (hamburguesa) ── */
(function () {
  const toggle = document.querySelector('.nav__toggle');
  const list   = document.querySelector('.nav__list');
  if (!toggle || !list) return;

  toggle.addEventListener('click', () => {
    const isOpen = list.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  list.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      list.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ── DROPDOWN DE CONTACTO (tap en mobile) ── */
(function () {
  const group = document.querySelector('.header__contact-group');
  if (!group) return;
  const btn = group.querySelector('.nav__cta');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    group.classList.toggle('is-open');
  });

  document.addEventListener('click', () => group.classList.remove('is-open'));
})();

/* ── HERO: ya no es carrusel, imagen fija con <picture> ── */
/* (lógica de slides eliminada — no aplica más) */

/* ── REVEAL DE FEATURES AL SCROLL (productos.html) ── */
(function () {
  const features = document.querySelectorAll('.feature');
  if (!features.length) return;

  if (!('IntersectionObserver' in window)) {
    features.forEach(f => f.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.25 });
  features.forEach(f => observer.observe(f));
})();

/* ── NAV STICKY DE PRODUCTOS: resaltar sección activa + smooth scroll ── */
(function () {
  const navItems = document.querySelectorAll('.prod-nav__item');
  const sections = document.querySelectorAll('.feature');
  const prodNav  = document.querySelector('.prod-nav');
  const header   = document.querySelector('.header');
  if (!navItems.length || !sections.length || !prodNav || !header) return;

  if ('IntersectionObserver' in window) {
    const map = {};
    navItems.forEach(item => { map[item.getAttribute('href').slice(1)] = item; });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        if (entry.isIntersecting && map[id]) {
          navItems.forEach(i => i.classList.remove('is-active'));
          map[id].classList.add('is-active');
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  navItems.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY
        - prodNav.offsetHeight - header.offsetHeight + 4;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── GALERÍA DE OBRAS: scroll reveal + lightbox (obras.html) ── */
(function () {
  const galleryItems = document.querySelectorAll('.gallery__item');
  const lightbox = document.getElementById('lightbox');
  if (!galleryItems.length || !lightbox) return;

  // Scroll reveal
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          observer.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px', threshold: 0.15 });

    galleryItems.forEach(item => revealObserver.observe(item));
  } else {
    galleryItems.forEach(item => item.classList.add('reveal-active'));
  }

  // Lightbox — las imágenes se toman del propio DOM, no de un array fijo
  const images = Array.from(galleryItems).map(item => item.querySelector('img')?.src || '');

  const lbImg     = document.getElementById('lbImg');
  const lbCounter = document.getElementById('lbCounter');
  const lbClose   = document.getElementById('lbClose');
  const lbPrev    = document.getElementById('lbPrev');
  const lbNext    = document.getElementById('lbNext');
  let current = 0;

  function open(i) {
    current = i;
    lbImg.src = images[current];
    lbCounter.textContent = (current + 1) + ' / ' + images.length;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function prev() { current = (current - 1 + images.length) % images.length; open(current); }
  function next() { current = (current + 1) % images.length; open(current); }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => open(+item.dataset.index));
  });

  lbClose?.addEventListener('click', close);
  lbPrev?.addEventListener('click', prev);
  lbNext?.addEventListener('click', next);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
})();

/* ── FORMULARIO DE CONTACTO (nosotros.html) — envío vía Formspree ── */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const btn = document.getElementById('contactFormBtn');
  const msg = document.getElementById('contactFormMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const originalBtnText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Enviando...';
    msg.style.display = 'none';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        msg.textContent = '¡Gracias! Tu consulta fue enviada correctamente. Te contactaremos pronto.';
        msg.style.color = '#1a9c4a';
        msg.style.display = 'block';
        form.reset();
      } else {
        throw new Error('Error en el envío');
      }
    } catch (err) {
      msg.textContent = 'Hubo un problema al enviar tu consulta. Por favor, escribinos directamente por WhatsApp.';
      msg.style.color = '#cc1b1b';
      msg.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = originalBtnText;
    }
  });
})();
