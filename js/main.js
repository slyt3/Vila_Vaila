/**
 * main.js — Vila Vaila
 * Navigation behaviour (scroll, hide/show, mobile overlay)
 * Hero slideshow
 * Form submission
 * Smooth scroll for anchor links
 */

(function () {
  'use strict';

  // ── Navigation ───────────────────────────────────────────────
  const nav        = document.getElementById('nav');
  const navToggle  = document.getElementById('navToggle');
  const navOverlay = document.getElementById('navOverlay');

  let lastScrollY     = 0;
  let scrollThreshold = 60;
  let isNavOpen       = false;

  function updateNav() {
    const current = window.scrollY;

    if (current > scrollThreshold) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }

    // Hide nav on scroll down, show on scroll up (only after threshold)
    if (current > 200) {
      if (current > lastScrollY + 8) {
        nav.classList.add('nav--hidden');
      } else if (current < lastScrollY - 4) {
        nav.classList.remove('nav--hidden');
      }
    } else {
      nav.classList.remove('nav--hidden');
    }

    lastScrollY = current;
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // ── Mobile menu ──────────────────────────────────────────────
  function openNav() {
    isNavOpen = true;
    navToggle.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navOverlay.classList.add('is-open');
    navOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  // Exposed globally so inline onclick handlers in HTML can call it
  window.closeNav = function () {
    isNavOpen = false;
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navOverlay.classList.remove('is-open');
    navOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      if (isNavOpen) {
        window.closeNav();
      } else {
        openNav();
      }
    });
  }

  // Close mobile nav on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isNavOpen) window.closeNav();
  });


  // ── Hero slideshow ───────────────────────────────────────────
  const slides    = document.querySelectorAll('.hero__slide');
  const dots      = document.querySelectorAll('.hero__dot');
  let   slideIdx  = 0;
  let   slideTimer;

  function goToSlide(index) {
    slides[slideIdx].classList.remove('is-active');
    dots[slideIdx]?.classList.remove('is-active');

    slideIdx = (index + slides.length) % slides.length;

    slides[slideIdx].classList.add('is-active');
    dots[slideIdx]?.classList.add('is-active');
  }

  function nextSlide() {
    goToSlide(slideIdx + 1);
  }

  function startSlideshow() {
    if (slides.length < 2) return;
    slideTimer = setInterval(nextSlide, 8000);
  }

  function stopSlideshow() {
    clearInterval(slideTimer);
  }

  if (slides.length > 0) {
    startSlideshow();

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        stopSlideshow();
        goToSlide(parseInt(dot.dataset.index, 10));
        startSlideshow();
      });
    });

    // Pause on hover
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      heroEl.addEventListener('mouseenter', stopSlideshow);
      heroEl.addEventListener('mouseleave', startSlideshow);
    }
  }


  // ── Smooth scroll for anchor links ───────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      window.closeNav();

      const offset = nav ? nav.offsetHeight : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  // ── Contact form ─────────────────────────────────────────────
  const form        = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    // Set minimum check-in date to today
    const checkinInput  = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');

    const today = new Date().toISOString().split('T')[0];
    if (checkinInput)  checkinInput.min  = today;
    if (checkoutInput) checkoutInput.min = today;

    // Update checkout min when checkin changes
    if (checkinInput && checkoutInput) {
      checkinInput.addEventListener('change', () => {
        checkoutInput.min = checkinInput.value;
        if (checkoutInput.value && checkoutInput.value < checkinInput.value) {
          checkoutInput.value = '';
        }
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Simulate submission — replace with real endpoint as needed
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled    = true;
      }

      setTimeout(() => {
        form.style.display = 'none';
        if (formSuccess) {
          formSuccess.style.display = 'block';
        }
      }, 1200);
    });
  }


  // ── Prevent nav scroll-hide on gallery page ──────────────────
  // Gallery page always shows scrolled nav (set via class in HTML)
  if (document.querySelector('.gallery-page')) {
    nav.classList.add('nav--scrolled');
  }

})();
