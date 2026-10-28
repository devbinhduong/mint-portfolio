(() => {
  const nav = document.querySelector('.nav-links');
  const toggle = document.querySelector('.menu-toggle');
  const progress = document.querySelector('.scroll-progress span');
  const year = document.getElementById('year');
  const cursor = document.querySelector('.cursor');
  const contactDialog = document.querySelector('.contact-dialog');
  const contactForm = document.querySelector('.contact-form');
  const contactStatus = document.querySelector('.contact-form-status');
  if (year) year.textContent = new Date().getFullYear();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smoothScroll = !reduceMotion && window.Lenis && window.gsap && window.ScrollTrigger
    ? new Lenis({ autoRaf: false, smoothWheel: true, anchors: true, lerp: .1 })
    : null;

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  if (contactDialog && contactForm && contactStatus) {
    const closeButton = contactDialog.querySelector('.contact-dialog-close');
    const submitButton = contactForm.querySelector('.contact-form-submit');

    document.querySelectorAll('[data-open-contact]').forEach(button => {
      button.addEventListener('click', () => {
        contactDialog.showModal();
        smoothScroll?.stop();
      });
    });

    closeButton?.addEventListener('click', () => contactDialog.close());
    contactDialog.addEventListener('click', event => {
      if (event.target === contactDialog) contactDialog.close();
    });
    contactDialog.addEventListener('close', () => smoothScroll?.start());

    contactForm.addEventListener('submit', async event => {
      event.preventDefault();
      contactStatus.classList.remove('is-success');

      const accessKey = contactForm.elements.access_key.value;
      if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
        contactStatus.textContent = 'The form is not connected yet. Please add your Web3Forms access key to enable submissions.';
        return;
      }

      if (!contactForm.reportValidity()) return;

      submitButton.disabled = true;
      submitButton.textContent = 'Sending…';
      contactStatus.textContent = '';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' },
          credentials: 'omit'
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          contactStatus.textContent = result.message || 'Your message could not be sent. Please try again.';
          return;
        }

        contactForm.reset();
        contactStatus.textContent = 'Thanks — your message has been sent. I’ll be in touch soon.';
        contactStatus.classList.add('is-success');
      } catch {
        contactStatus.textContent = 'Unable to reach the form service. Check your connection and try again.';
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Send project enquiry <span aria-hidden="true">↗</span>';
      }
    });
  }

  let progressFrame = 0;
  const updateProgress = () => {
    if (!progress) return;
    if (progressFrame) return;
    progressFrame = window.requestAnimationFrame(() => {
      progressFrame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const amount = max > 0 ? window.scrollY / max : 0;
      progress.style.transform = `scaleX(${amount})`;
      document.querySelector('.site-header')?.classList.toggle('is-scrolled', window.scrollY > 24);
    });
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  const projectCarousel = document.querySelector('.project-carousel');
  const carouselToggle = projectCarousel?.querySelector('.project-carousel-toggle');
  if (projectCarousel && window.Swiper) {
    projectCarousel.classList.add('is-enhanced');
    const projectSwiper = new Swiper(projectCarousel.querySelector('.project-swiper'), {
      slidesPerView: 'auto',
      centeredSlides: true,
      loop: true,
      speed: 700,
      spaceBetween: 18,
      autoplay: reduceMotion ? false : {
        delay: 3600,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      navigation: {
        nextEl: projectCarousel.querySelector('.project-carousel-next'),
        prevEl: projectCarousel.querySelector('.project-carousel-prev')
      },
      pagination: {
        el: projectCarousel.querySelector('.project-carousel-pagination'),
        clickable: true
      },
      keyboard: { enabled: true },
      a11y: { enabled: true },
      breakpoints: {
        701: { spaceBetween: 28 }
      }
    });

    if (carouselToggle) {
      const updateToggle = () => {
        const isRunning = projectSwiper.autoplay.running;
        carouselToggle.textContent = isRunning ? 'PAUSE' : 'PLAY';
        carouselToggle.setAttribute('aria-label', isRunning ? 'Pause autoplay' : 'Start autoplay');
      };

      updateToggle();
      carouselToggle.addEventListener('click', () => {
        if (projectSwiper.autoplay.running) {
          projectSwiper.autoplay.stop();
        } else {
          projectSwiper.autoplay.start();
        }
        updateToggle();
      });
    }
  }

  if (cursor && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', e => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    }, { passive: true });
    document.querySelectorAll('a, button, .tilt-card').forEach(el => {
      el.addEventListener('pointerenter', () => cursor.classList.add('active'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('active'));
    });
  }

  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .12;
        const y = (e.clientY - r.top - r.height / 2) * .12;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
    document.querySelectorAll('.tilt-card').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        el.style.setProperty('--pointer-x', `${(x + .5) * 100}%`);
        el.style.setProperty('--pointer-y', `${(y + .5) * 100}%`);
        el.style.transform = `perspective(1200px) rotateY(${x * 2.5}deg) rotateX(${-y * 2.5}deg) scale(1.005)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
  }

  if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  if (smoothScroll) {
    smoothScroll.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => smoothScroll.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const intro = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: .1 });
  intro.from('.site-header .wordmark-glyph', {
    yPercent: 120, rotateX: -75, opacity: 0, duration: .85, stagger: .075, ease: 'back.out(1.7)'
  }, 0)
    .from('.site-header .wordmark-registered', {
      scale: 0, rotation: -30, opacity: 0, duration: .4, ease: 'back.out(2)'
    }, .35)
    .from('.site-header .wordmark-dot', {
      scale: 0, opacity: 0, duration: .4, ease: 'back.out(2)'
    }, .45)
    .from('.hero-topline > span', { y: 12, opacity: 0, duration: .6, stagger: .12 }, 0)
    .from('.hero-kicker', { y: 15, opacity: 0, duration: .6 }, '-=.3')
    .from('.title-line', { yPercent: 120, rotate: 3, duration: 1.15, stagger: .13 }, '-=.25')
    .from('.hero-bottom, .hero-footer', { y: 16, opacity: 0, duration: .65, stagger: .1 }, '-=.45')
    .from('.hero-art .art-core', { scale: .5, opacity: 0, rotate: -30, duration: .9, ease: 'back.out(1.5)' }, '-=.8')
    .from('.floating-chip', { scale: .7, opacity: 0, duration: .7, stagger: .16, ease: 'back.out(1.4)' }, '-=.45')
    .from('.orbit', { scale: .7, opacity: 0, duration: 1, stagger: .12 }, '-=.7');

  gsap.to('.site-header .wordmark-dot', {
    scale: 1.35, duration: 1.15, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.5
  });

  const brand = document.querySelector('.site-header .wordmark');
  if (brand) {
    const brandLetters = brand.querySelectorAll('.wordmark-glyph');
    brand.addEventListener('pointerenter', () => {
      gsap.fromTo(brandLetters, { yPercent: 0 }, {
        yPercent: -18, duration: .18, stagger: .035, yoyo: true, repeat: 1, ease: 'power2.out'
      });
    });
  }

  gsap.to('.hero-art .art-core', {
    y: -9, duration: 2.3, repeat: -1, yoyo: true, ease: 'sine.inOut'
  });
  gsap.to('.art-curve', {
    x: -25, y: 10, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut'
  });
  gsap.to('.hero-title em', {
    color: '#ff6a3d', duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut'
  });

  gsap.utils.toArray('.section-head, .work-intro, .expertise-heading, .project-cta').forEach(el => {
    gsap.from(el, {
      y: 30, opacity: 0, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  gsap.utils.toArray('.skill-card').forEach((card, i) => {
    gsap.from(card, {
      y: 45, opacity: 0, rotateX: 5, duration: .75, delay: (i % 3) * .08,
      ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 90%', once: true }
    });
  });

  gsap.from('.about-title-wrap h2', {
    y: 70, opacity: 0, duration: 1, ease: 'power4.out',
    scrollTrigger: { trigger: '.about', start: 'top 70%', once: true }
  });
  gsap.from('.about-copy > *', {
    y: 20, opacity: 0, duration: .65, stagger: .12, ease: 'power2.out',
    scrollTrigger: { trigger: '.about-copy', start: 'top 82%', once: true }
  });
  gsap.from('.contact-content h2', {
    y: 80, opacity: 0, duration: 1, ease: 'power4.out',
    scrollTrigger: { trigger: '.contact', start: 'top 70%', once: true }
  });

  gsap.to('.about-stamp', {
    rotation: 25, ease: 'none',
    scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: 1 }
  });
})();