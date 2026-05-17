/**
 * animations.js — Vila Vaila
 * Scroll-triggered reveal animations via IntersectionObserver
 * Counter animations for stats
 * Parallax effect for banner
 */

(function () {
  'use strict';

  // ── Scroll reveal ────────────────────────────────────────────
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-fade');

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // ── Counter animation ────────────────────────────────────────
  const counters = document.querySelectorAll('.stat__number[data-target]');

  if (counters.length > 0) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => countObserver.observe(counter));
  }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1600;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quart
      const eased    = 1 - Math.pow(1 - progress, 4);
      const current  = Math.round(eased * target);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // ── Parallax banner ──────────────────────────────────────────
  const parallaxImg = document.getElementById('parallaxImg');

  if (parallaxImg) {
    let ticking = false;

    function updateParallax() {
      const banner = parallaxImg.closest('.parallax-banner');
      if (!banner) return;

      const rect   = banner.getBoundingClientRect();
      const viewH  = window.innerHeight;

      if (rect.bottom < 0 || rect.top > viewH) return;

      const relPos = (rect.top / viewH);
      const offset = relPos * 80;

      parallaxImg.style.transform = `translateY(${offset}px)`;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    updateParallax();
  }

  // ── Feature line reveal ──────────────────────────────────────
  const features = document.querySelectorAll('.feature');

  if (features.length > 0) {
    const featureObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const line = entry.target.querySelector('.feature__line');
            if (line) {
              setTimeout(() => {
                line.style.width = '40px';
              }, 300);
            }
          }
        });
      },
      { threshold: 0.4 }
    );

    features.forEach((f) => featureObserver.observe(f));
  }

})();
