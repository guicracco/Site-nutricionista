document.addEventListener('DOMContentLoaded', () => {

  /* =====================================================
     ANO NO RODAPÉ
     ===================================================== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =====================================================
     HEADER: encolhe ao rolar
     ===================================================== */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* =====================================================
     MENU MOBILE
     ===================================================== */
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('nav-open');
      menuToggle.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        header.classList.remove('nav-open');
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* =====================================================
     SCROLL REVEAL + CONTADORES + BARRAS + SCAN
     ===================================================== */
  const revealTargets = document.querySelectorAll('[data-reveal]');
  const countTargets = document.querySelectorAll('[data-count]');
  const barTargets = document.querySelectorAll('.report-bar');
  const scanTarget = document.querySelector('.bio-scan');

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');

      if (entry.target.hasAttribute('data-count')) {
        animateCount(entry.target);
      }
      io.unobserve(entry.target);
    });
  }, { threshold: 0.35 });

  revealTargets.forEach(el => io.observe(el));
  countTargets.forEach(el => io.observe(el));

  const barIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        barIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  barTargets.forEach(el => barIo.observe(el));

  if (scanTarget) {
    const scanIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          scanIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    scanIo.observe(scanTarget);
  }

  /* =====================================================
     COMPARADOR ANTES / DEPOIS (arrastar)
     ===================================================== */
  const compare = document.getElementById('compareSlider');
  const compareBefore = document.getElementById('compareBefore');
  const compareHandle = document.getElementById('compareHandle');

  if (compare && compareBefore && compareHandle) {
    let dragging = false;

    function setPosition(clientX) {
      const rect = compare.getBoundingClientRect();
      let percent = ((clientX - rect.left) / rect.width) * 100;
      percent = Math.max(6, Math.min(94, percent));
      compareBefore.style.width = percent + '%';
      compareHandle.style.left = percent + '%';
    }

    function startDrag(e) {
      dragging = true;
      compare.classList.add('is-dragging');
      moveFromEvent(e);
    }
    function stopDrag() {
      dragging = false;
      compare.classList.remove('is-dragging');
    }
    function moveFromEvent(e) {
      if (!dragging && e.type !== 'mousedown' && e.type !== 'touchstart') return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(clientX);
    }

    compare.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', (e) => { if (dragging) moveFromEvent(e); });
    window.addEventListener('mouseup', stopDrag);

    compare.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', (e) => { if (dragging) moveFromEvent(e); }, { passive: true });
    window.addEventListener('touchend', stopDrag);

    compare.addEventListener('click', (e) => setPosition(e.clientX));
  }

  /* =====================================================
     CARROSSEL DE DEPOIMENTOS
     ===================================================== */
  const track = document.getElementById('testimonialTrack');
  const dotsWrap = document.getElementById('testimonialDots');

  if (track && dotsWrap) {
    const slides = track.children;
    let index = 0;
    let autoTimer;

    for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Ir para depoimento ' + (i + 1));
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
    const dots = dotsWrap.children;

    function goTo(i) {
      index = i;
      track.style.transform = `translateX(-${index * 100}%)`;
      Array.from(dots).forEach((d, di) => d.classList.toggle('is-active', di === index));
    }

    function next() {
      goTo((index + 1) % slides.length);
    }

    const prevButton = document.querySelector('.testimonial-arrow-prev');
    const nextButton = document.querySelector('.testimonial-arrow-next');
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;

    function clampIndex(i) {
      return (i + slides.length) % slides.length;
    }

    function setTrackPosition(deltaX) {
      const width = track.clientWidth;
      track.style.transform = `translateX(${Math.min(0, Math.max(-width * (slides.length - 1), -index * width + deltaX))}px)`;
    }

    function startDrag(event) {
      stopAuto();
      isDragging = true;
      track.classList.add('is-dragging');
      startX = event.type.startsWith('mouse') ? event.clientX : event.touches[0].clientX;
    }

    function moveDrag(event) {
      if (!isDragging) return;
      const clientX = event.type.startsWith('mouse') ? event.clientX : event.touches[0].clientX;
      const deltaX = clientX - startX;
      setTrackPosition(deltaX);
    }

    function endDrag(event) {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('is-dragging');
      const clientX = event.type.startsWith('mouse') ? event.clientX : event.changedTouches[0].clientX;
      const deltaX = clientX - startX;
      const threshold = track.clientWidth * 0.2;

      if (deltaX > threshold) {
        goTo(clampIndex(index - 1));
      } else if (deltaX < -threshold) {
        goTo(clampIndex(index + 1));
      } else {
        goTo(index);
      }

      startAuto();
    }

    track.addEventListener('touchstart', startDrag, { passive: true });
    track.addEventListener('touchmove', moveDrag, { passive: true });
    track.addEventListener('touchend', endDrag);
    track.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', endDrag);
    track.addEventListener('mouseleave', () => {
      if (isDragging) endDrag(new MouseEvent('mouseup', { clientX: startX }));
    });

    if (prevButton && nextButton) {
      prevButton.addEventListener('click', () => goTo(clampIndex(index - 1)));
      nextButton.addEventListener('click', next);
    }

    function startAuto() {
      autoTimer = setInterval(next, 6000);
    }
    function stopAuto() {
      clearInterval(autoTimer);
    }

    startAuto();
    track.parentElement.addEventListener('mouseenter', stopAuto);
    track.parentElement.addEventListener('mouseleave', startAuto);
  }

  /* =====================================================
     ACORDEÃO DE PERGUNTAS FREQUENTES
     ===================================================== */
  const accordion = document.getElementById('accordion');
  if (accordion) {
    const items = accordion.querySelectorAll('.accordion-item');
    items.forEach(item => {
      const trigger = item.querySelector('.accordion-trigger');
      const panel = item.querySelector('.accordion-panel');

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        items.forEach(other => {
          other.classList.remove('is-open');
          other.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
          other.querySelector('.accordion-panel').style.maxHeight = null;
        });

        if (!isOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  }

  /* =====================================================
     FORMULÁRIO DE CONTATO (validação + feedback)
     ===================================================== */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    const phoneField = form.querySelector('#whatsapp');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('.field').forEach(field => field.classList.remove('is-invalid'));

      const nome = form.querySelector('#nome');
      if (!nome.value.trim()) {
        nome.closest('.field').classList.add('is-invalid');
        valid = false;
      }

      const whatsapp = form.querySelector('#whatsapp');
      const digits = whatsapp.value.replace(/\D/g, '');
      if (digits.length < 10) {
        whatsapp.closest('.field').classList.add('is-invalid');
        valid = false;
      }

      const objetivo = form.querySelector('#objetivo');
      if (!objetivo.value) {
        objetivo.closest('.field').classList.add('is-invalid');
        valid = false;
      }

      if (!valid) {
        formSuccess.classList.remove('is-visible');
        return;
      }

      formSuccess.classList.add('is-visible');
      form.reset();
    });

    if (phoneField) {
      phoneField.addEventListener('input', () => {
        let digits = phoneField.value.replace(/\D/g, '').slice(0, 11);
        let formatted = digits;
        if (digits.length > 2) formatted = `(${digits.slice(0,2)}) ${digits.slice(2)}`;
        if (digits.length > 7) formatted = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
        phoneField.value = formatted;
      });
    }
  }

});
