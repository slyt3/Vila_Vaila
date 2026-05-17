/**
 * gallery.js — Vila Vaila
 * Lightbox for gallery-preview (index) and gallery-page
 * Filter tabs for gallery.html
 * Lazy load images with fade-in
 */

(function () {
  'use strict';

  // ── Collect all gallery items on the page ────────────────────
  let galleryItems = [];
  let currentIndex = 0;

  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxCap   = document.getElementById('lightboxCaption');
  const lightboxLoader= document.getElementById('lightboxLoader');
  const closeBtn      = document.getElementById('lightboxClose');
  const prevBtn       = document.getElementById('lightboxPrev');
  const nextBtn       = document.getElementById('lightboxNext');

  if (!lightbox) return;

  // ── Build items array ────────────────────────────────────────
  function buildGalleryItems() {
    const selector = '.gallery-preview__item[data-src], .gallery-page__item[data-src]';
    const nodes    = document.querySelectorAll(selector);

    galleryItems = Array.from(nodes)
      .filter((n) => !n.classList.contains('is-hidden'))
      .map((n) => ({
        src:     n.dataset.src,
        caption: n.dataset.caption || '',
        node:    n,
      }));

    nodes.forEach((node, idx) => {
      node.addEventListener('click', () => {
        // Recalculate in case filter changed
        buildGalleryItems();
        const clickedSrc = node.dataset.src;
        const i = galleryItems.findIndex((item) => item.src === clickedSrc);
        openLightbox(i >= 0 ? i : 0);
      });
    });
  }

  buildGalleryItems();

  // ── Open / close ─────────────────────────────────────────────
  function openLightbox(index) {
    currentIndex = index;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    loadImage(currentIndex);
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.classList.remove('is-loaded');
    lightboxImg.src = '';
  }

  function loadImage(index) {
    const item = galleryItems[index];
    if (!item) return;

    lightboxImg.classList.remove('is-loaded');
    if (lightboxLoader) lightboxLoader.style.display = 'flex';

    const img = new Image();
    img.onload = () => {
      lightboxImg.src     = item.src;
      lightboxImg.alt     = item.caption;
      if (lightboxLoader) lightboxLoader.style.display = 'none';
      requestAnimationFrame(() => lightboxImg.classList.add('is-loaded'));
    };
    img.onerror = () => {
      lightboxImg.src = item.src;
      if (lightboxLoader) lightboxLoader.style.display = 'none';
      lightboxImg.classList.add('is-loaded');
    };
    img.src = item.src;

    if (lightboxCap) {
      lightboxCap.textContent = item.caption
        ? `${item.caption}  ·  ${index + 1} / ${galleryItems.length}`
        : `${index + 1} / ${galleryItems.length}`;
    }
  }

  function navigate(dir) {
    currentIndex = (currentIndex + dir + galleryItems.length) % galleryItems.length;
    loadImage(currentIndex);
  }

  // ── Event listeners ──────────────────────────────────────────
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn)  prevBtn.addEventListener('click', () => navigate(-1));
  if (nextBtn)  nextBtn.addEventListener('click', () => navigate(1));

  // Close on backdrop click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Touch/swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) navigate(delta < 0 ? 1 : -1);
  }, { passive: true });


  // ── Gallery page filter tabs ─────────────────────────────────
  const filterBtns = document.querySelectorAll('.gallery-page__filter');
  const gridItems  = document.querySelectorAll('.gallery-page__item');

  if (filterBtns.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        filterBtns.forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');

        gridItems.forEach((item) => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.classList.remove('is-hidden');
          } else {
            item.classList.add('is-hidden');
          }
        });

        // Rebuild gallery array after filter change
        buildGalleryItems();
      });
    });
  }


  // ── Lazy load with fade-in ───────────────────────────────────
  const lazyImgs = document.querySelectorAll('.gallery-page__item img, .gallery-preview__item img');

  if ('IntersectionObserver' in window && lazyImgs.length > 0) {
    const imgObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
            // If already loaded (cached)
            if (img.complete) img.classList.add('is-loaded');
            imgObserver.unobserve(img);
          }
        });
      },
      { rootMargin: '200px' }
    );

    lazyImgs.forEach((img) => imgObserver.observe(img));
  } else {
    lazyImgs.forEach((img) => img.classList.add('is-loaded'));
  }

})();
