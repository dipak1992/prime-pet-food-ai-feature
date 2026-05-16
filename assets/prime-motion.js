/**
 * Prime Pet Food — Premium Motion System
 * Uses Motion One (vanilla JS) via window.Motion (CDN UMD bundle)
 * CDN: https://cdn.jsdelivr.net/npm/motion@11/dist/motion.min.js
 * Respects prefers-reduced-motion
 *
 * /assets/prime-motion.js
 */

(function () {
  'use strict';

  // ─── Reduced Motion Guard ─────────────────────────────────────────────────
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealMotionContent() {
    document.querySelectorAll('.pm-reveal, .ph-reveal, [data-motion="reveal"], [data-motion-stagger]').forEach(function (el) {
      el.classList.add('is-visible');
      el.style.opacity = '';
      el.style.transform = '';
    });

    document.querySelectorAll('[data-motion-stagger] > *').forEach(function (child) {
      child.style.opacity = '';
      child.style.transform = '';
    });
  }

  if (prefersReducedMotion) {
    // Make all Motion-controlled content immediately visible
    revealMotionContent();
    return;
  }

  // ─── Motion Library Bootstrap ─────────────────────────────────────────────
  // Both the CDN script and this script use `defer`, which guarantees in-order
  // execution per the HTML spec. However, to guard against any race condition
  // (CDN cache miss, slow network, browser quirk), we defer the Motion check
  // until DOMContentLoaded rather than checking at parse time.
  // If Motion still isn't available by then, we retry with a short poll so
  // CSS-only fallbacks remain visible.

  var Motion, animate, scroll, inView, stagger;

  function resolveMotion() {
    if (typeof window.Motion !== 'undefined') {
      Motion  = window.Motion;
      animate = Motion.animate;
      scroll  = Motion.scroll;
      inView  = Motion.inView;
      stagger = Motion.stagger;
      return true;
    }
    return false;
  }

  // ─── Motion Tokens ────────────────────────────────────────────────────────
  var tokens = {
    duration: {
      instant:   0.08,
      fast:      0.15,
      normal:    0.25,
      slow:      0.4,
      narrative: 0.6,
      hero:      0.8
    },
    easing: {
      out:    [0.0, 0.0, 0.2, 1.0],
      in:     [0.4, 0.0, 1.0, 1.0],
      inOut:  [0.4, 0.0, 0.2, 1.0],
      spring: { type: 'spring', stiffness: 300, damping: 30 },
      gentle: [0.25, 0.46, 0.45, 0.94]
    },
    stagger: {
      fast:   0.04,
      normal: 0.06,
      slow:   0.08
    }
  };

  // ─── Mobile detection ─────────────────────────────────────────────────────
  var isMobile = false;
  var isLowPower = false;

  function applyMobileOptimizations() {
    isMobile = window.innerWidth < 768 || navigator.maxTouchPoints > 0;

    // Check save-data preference
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && connection.saveData) {
      isLowPower = true;
      console.info('[PrimeMotion] Save-data mode detected — animations disabled');
      return false; // signal to abort all animations
    }

    if (isMobile) {
      // Reduce stagger on mobile
      tokens.stagger.normal = 0.04;
      tokens.stagger.slow   = 0.05;
      // Reduce reveal distance
      tokens.duration.slow  = 0.3;
    }

    return true;
  }

  // ─── Scroll Reveal System ─────────────────────────────────────────────────
  function initScrollReveals() {
    var selectors = '.ph-reveal, .pm-reveal, [data-motion="reveal"]';
    var elements  = document.querySelectorAll(selectors);

    if (!elements.length) return;

    elements.forEach(function (el) {
      // Skip if already visible (e.g. above the fold)
      if (el.classList.contains('is-visible')) return;

      var delay      = parseFloat(el.getAttribute('data-motion-delay') || '0') / 1000;
      var hasStagger = el.hasAttribute('data-motion-stagger');

      // Set initial state via JS (overrides CSS for Motion-controlled elements)
      el.style.opacity   = '0';
      el.style.transform = 'translateY(24px)';

      inView(el, function () {
        if (hasStagger) {
          // Stagger children
          var children = Array.from(el.children);
          if (children.length) {
            children.forEach(function (child) {
              child.style.opacity   = '0';
              child.style.transform = 'translateY(16px)';
            });

            animate(
              children,
              { opacity: 1, transform: 'translateY(0px)' },
              {
                duration: tokens.duration.slow,
                easing:   tokens.easing.out,
                delay:    stagger(tokens.stagger.normal, { start: delay })
              }
            );
            el.classList.add('is-visible');
          }
        }

        // Animate the container itself
        animate(
          el,
          { opacity: 1, transform: 'translateY(0px)' },
          {
            duration: tokens.duration.slow,
            easing:   tokens.easing.out,
            delay:    delay
          }
        ).then(function () {
          el.classList.add('is-visible');
          el.style.willChange = 'auto';
        });

        return false; // fire once
      }, {
        margin: '0px 0px -60px 0px'
      });
    });

    // Also handle [data-motion-stagger] parent containers
    var staggerParents = document.querySelectorAll('[data-motion-stagger]:not(.ph-reveal):not(.pm-reveal)');
    staggerParents.forEach(function (parent) {
      var children = Array.from(parent.children);
      if (!children.length) return;

      children.forEach(function (child) {
        child.style.opacity   = '0';
        child.style.transform = 'translateY(16px)';
      });

      inView(parent, function () {
        animate(
          children,
          { opacity: 1, transform: 'translateY(0px)' },
          {
            duration: tokens.duration.slow,
            easing:   tokens.easing.out,
            delay:    stagger(tokens.stagger.normal)
          }
        );
        parent.classList.add('is-visible');
        return false;
      }, {
        margin: '0px 0px -60px 0px'
      });
    });
  }

  // ─── Hero Entrance Animation ──────────────────────────────────────────────
  function initHeroEntrance() {
    var badge    = document.querySelector('.ph-hero__social-badge, .ph-hero-badge');
    var headline = document.querySelector('.ph-hero h1, .ph-hero-headline');
    var sub      = document.querySelector('.ph-hero p:not(.ph-hero__micro), .ph-hero-sub');
    var cta      = document.querySelector('.ph-hero .ph-actions, .ph-hero-cta');
    var micro    = document.querySelector('.ph-hero__micro');
    var proof    = document.querySelector('.ph-hero__proof');
    var image    = document.querySelector('.ph-hero__media, .ph-hero-image');

    // Animate hero image (subtle scale reveal)
    if (image) {
      image.style.opacity = '0';
      animate(
        image,
        { opacity: [0, 1], scale: [1.04, 1] },
        { duration: tokens.duration.hero, easing: tokens.easing.gentle, delay: 0 }
      );
    }

    // Stagger hero text elements
    var textElements = [badge, headline, sub, cta, micro, proof].filter(Boolean);
    var delays       = [0, 0.1, 0.25, 0.38, 0.48, 0.52];

    textElements.forEach(function (el, i) {
      if (!el) return;
      el.style.opacity   = '0';
      el.style.transform = 'translateY(28px)';

      animate(
        el,
        { opacity: [0, 1], transform: ['translateY(28px)', 'translateY(0px)'] },
        {
          duration: tokens.duration.slow,
          easing:   tokens.easing.out,
          delay:    delays[i] || i * 0.1
        }
      ).then(function () {
        el.style.willChange = 'auto';
      });
    });
  }

  // ─── Stat Counter Enhancement ─────────────────────────────────────────────
  function initStatCounters() {
    var counters = document.querySelectorAll('[data-ph-count], .ph-stat-number, stat-counter');
    if (!counters.length) return;

    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-ph-count') || el.textContent.replace(/[^0-9.]/g, ''));
      var suffix = el.getAttribute('data-ph-suffix') || '';
      var prefix = el.getAttribute('data-ph-prefix') || '';

      if (isNaN(target)) return;

      // Store original text as fallback
      var originalText = el.textContent;

      inView(el, function () {
        var startTime = null;
        var duration  = 1200; // ms

        function easeOutQuart(t) {
          return 1 - Math.pow(1 - t, 4);
        }

        function tick(timestamp) {
          if (!startTime) startTime = timestamp;
          var elapsed  = timestamp - startTime;
          var progress = Math.min(elapsed / duration, 1);
          var eased    = easeOutQuart(progress);
          var current  = Math.round(eased * target);

          // Format with commas for large numbers
          var formatted = target >= 1000
            ? current.toLocaleString()
            : current.toString();

          el.textContent = prefix + formatted + suffix;

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = prefix + (target >= 1000 ? target.toLocaleString() : target) + suffix;
          }
        }

        requestAnimationFrame(tick);
        return false; // fire once
      }, {
        margin: '0px 0px -40px 0px'
      });
    });
  }

  // ─── Product Card Hover ───────────────────────────────────────────────────
  function initProductCardHover() {
    if (isMobile) return; // Skip hover effects on touch devices

    var cards = document.querySelectorAll(
      '.ph-product-card, .prime-home-product-card, .card-product, .ph-ingredient-card'
    );

    cards.forEach(function (card) {
      var img = card.querySelector('img');

      card.addEventListener('mouseenter', function () {
        animate(
          card,
          { y: -4 },
          { duration: tokens.duration.normal, easing: tokens.easing.out }
        );
        if (img) {
          animate(
            img,
            { scale: 1.04 },
            { duration: tokens.duration.slow, easing: tokens.easing.gentle }
          );
        }
      });

      card.addEventListener('mouseleave', function () {
        animate(
          card,
          { y: 0 },
          { duration: tokens.duration.normal, easing: tokens.easing.in }
        );
        if (img) {
          animate(
            img,
            { scale: 1 },
            { duration: tokens.duration.normal, easing: tokens.easing.in }
          );
        }
      });
    });
  }

  // ─── Navigation Motion ────────────────────────────────────────────────────
  function initNavMotion() {
    // Target the inner header element, not the Shopify section wrapper.
    // #shopify-section-header is a <div> wrapper; the actual header is inside it.
    var header = document.querySelector(
      '.site-header, header[role="banner"], ' +
      '#shopify-section-header .header-wrapper, ' +
      '#shopify-section-header header'
    );
    if (!header) return;

    var lastScrollY    = 0;
    var isHidden       = false;
    var scrollThreshold = 80;
    var ticking        = false;

    // Add scrolled class for background fade
    function updateHeaderState() {
      var currentScrollY = window.scrollY;
      var scrollDelta    = currentScrollY - lastScrollY;

      // Add scrolled background
      if (currentScrollY > 20) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }

      // Hide on scroll down past threshold, show on scroll up
      if (currentScrollY > scrollThreshold) {
        if (scrollDelta > 8 && !isHidden) {
          // Scrolling down — hide header
          isHidden = true;
          animate(
            header,
            { y: '-100%' },
            { duration: tokens.duration.normal, easing: tokens.easing.in }
          );
        } else if (scrollDelta < -4 && isHidden) {
          // Scrolling up — show header
          isHidden = false;
          animate(
            header,
            { y: '0%' },
            { duration: tokens.duration.slow, easing: tokens.easing.out }
          );
        }
      } else if (isHidden) {
        isHidden = false;
        animate(
          header,
          { y: '0%' },
          { duration: tokens.duration.fast, easing: tokens.easing.out }
        );
      }

      lastScrollY = currentScrollY;
      ticking     = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateHeaderState);
        ticking = true;
      }
    }, { passive: true });
  }

  // ─── Cart Drawer Motion ───────────────────────────────────────────────────
  function initCartMotion() {
    var drawer  = document.querySelector('cart-drawer, #cart-drawer, .cart-drawer');
    var overlay = document.querySelector('.drawer__overlay, #Drawer-Overlay, .cart-overlay');

    if (!drawer && !overlay) return;

    // Listen for Shopify theme pub/sub cart events
    function onCartOpen() {
      if (drawer) {
        drawer.style.visibility = 'visible';
        animate(
          drawer,
          { x: ['100%', '0%'] },
          { duration: 0.35, easing: tokens.easing.out }
        );
      }
      if (overlay) {
        overlay.style.display = 'block';
        animate(
          overlay,
          { opacity: [0, 1] },
          { duration: tokens.duration.normal, easing: tokens.easing.out }
        );
      }
    }

    function onCartClose() {
      if (drawer) {
        animate(
          drawer,
          { x: ['0%', '100%'] },
          { duration: tokens.duration.normal, easing: tokens.easing.in }
        ).then(function () {
          drawer.style.visibility = 'hidden';
        });
      }
      if (overlay) {
        animate(
          overlay,
          { opacity: [1, 0] },
          { duration: tokens.duration.fast, easing: tokens.easing.in }
        ).then(function () {
          overlay.style.display = 'none';
        });
      }
    }

    // Shopify theme pub/sub events
    document.addEventListener('cart:open',  onCartOpen);
    document.addEventListener('cart:close', onCartClose);

    // Also listen for custom events from Ignite theme
    document.addEventListener('on:cart-drawer:open',  onCartOpen);
    document.addEventListener('on:cart-drawer:close', onCartClose);

    // Animate cart item removal — avoid animating `height` (GPU-unsafe layout property).
    // Instead collapse via maxHeight (CSS-animatable) and use overflow:hidden on the item.
    document.addEventListener('cart:item-removed', function (e) {
      var item = e.detail && e.detail.element;
      if (!item) return;

      // Capture current height before animating so we can collapse from it
      var currentHeight = item.offsetHeight;
      item.style.overflow = 'hidden';
      item.style.maxHeight = currentHeight + 'px';

      animate(
        item,
        { opacity: 0, x: 20 },
        { duration: tokens.duration.normal, easing: tokens.easing.in }
      );
      // Collapse height separately via CSS transition (not Motion, avoids layout thrash)
      requestAnimationFrame(function () {
        item.style.transition = 'max-height ' + tokens.duration.normal + 's ' + 'cubic-bezier(0.4,0,1,1)';
        item.style.maxHeight = '0px';
        item.style.marginBlockStart = '0';
        item.style.marginBlockEnd = '0';
        item.style.paddingBlockStart = '0';
        item.style.paddingBlockEnd = '0';
        setTimeout(function () { item.remove(); }, tokens.duration.normal * 1000 + 50);
      });
    });

    // Animate cart item addition (pulse)
    document.addEventListener('cart:item-added', function (e) {
      var item = e.detail && e.detail.element;
      if (!item) return;

      item.style.opacity   = '0';
      item.style.transform = 'translateX(-12px)';
      animate(
        item,
        { opacity: [0, 1], x: [-12, 0] },
        { duration: tokens.duration.slow, easing: tokens.easing.out }
      );
    });
  }

  // ─── Button Interactions ──────────────────────────────────────────────────
  function initButtonMotion() {
    var btns = document.querySelectorAll(
      '.btn, .button, [type="submit"], .prime-btn, .ph-cta-btn, .ph-button, .ph-sticky-bar__btn'
    );

    btns.forEach(function (btn) {
      // Skip buttons inside forms that might have their own state
      if (btn.disabled) return;

      btn.addEventListener('mousedown', function () {
        // Fixed: was incorrectly using `tokens.duration.instant` (a number, always truthy)
        // as the scale value. Scale should always be 0.97 on press.
        animate(
          btn,
          { scale: 0.97 },
          { duration: tokens.duration.instant, easing: tokens.easing.in }
        );
      });

      btn.addEventListener('mouseup', function () {
        animate(
          btn,
          { scale: 1 },
          { duration: tokens.duration.fast, easing: tokens.easing.out }
        );
      });

      btn.addEventListener('mouseleave', function () {
        animate(
          btn,
          { scale: 1 },
          { duration: tokens.duration.fast, easing: tokens.easing.out }
        );
      });

      // Touch support
      btn.addEventListener('touchstart', function () {
        animate(btn, { scale: 0.97 }, { duration: tokens.duration.instant });
      }, { passive: true });

      btn.addEventListener('touchend', function () {
        animate(btn, { scale: 1 }, { duration: tokens.duration.fast, easing: tokens.easing.out });
      }, { passive: true });
    });
  }

  // ─── Parallax Hero Image ──────────────────────────────────────────────────
  function initHeroParallax() {
    if (isMobile) return; // Disable parallax on mobile

    var heroMedia = document.querySelector('.ph-hero__media, .ph-hero-bg');
    var heroSection = document.querySelector('.ph-hero');

    if (!heroMedia || !heroSection) return;

    // Use a dedicated inner wrapper for parallax to avoid conflicting with the
    // hero entrance animation that also sets `transform` on heroMedia.
    // We drive parallax via a CSS custom property instead of direct transform.
    var heroImg = heroMedia.querySelector('img');
    if (!heroImg) return;

    // Use scroll() to drive parallax on the img element (not the media container)
    scroll(
      function (progress) {
        // Map 0→1 scroll progress to 0→60px translateY
        // The hero image already has a CSS animation (ph-hero-drift); we use
        // a CSS variable so the CSS animation and parallax compose cleanly.
        var yOffset = progress * 60;
        heroImg.style.setProperty('--parallax-y', yOffset + 'px');
      },
      {
        target: heroSection,
        offset: ['start start', 'end start']
      }
    );
  }

  // ─── Section Transitions ──────────────────────────────────────────────────
  function initSectionTransitions() {
    var sections = document.querySelectorAll(
      '.ph-outcomes, .ph-products, .ph-quiz, .ph-reviews, .ph-ingredients, ' +
      '.ph-craft, .ph-guarantee, .ph-fit, .ph-vet, .ph-faq, .ph-close, ' +
      '.ph-subscribe, .ph-compare, .ph-routine'
    );

    sections.forEach(function (section) {
      // Animate section heading
      var heading = section.querySelector('h2');
      var kicker  = section.querySelector('.ph-kicker');
      var body    = section.querySelector('p:not(.ph-kicker)');

      if (heading) {
        heading.style.opacity   = '0';
        heading.style.transform = 'translateY(20px)';

        inView(heading, function () {
          animate(
            heading,
            { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0px)'] },
            { duration: tokens.duration.slow, easing: tokens.easing.out }
          ).then(function () {
            heading.style.willChange = 'auto';
          });
          return false;
        }, { margin: '0px 0px -40px 0px' });
      }

      if (kicker) {
        kicker.style.opacity = '0';
        inView(kicker, function () {
          animate(
            kicker,
            { opacity: [0, 1] },
            { duration: tokens.duration.normal, easing: tokens.easing.out }
          );
          return false;
        }, { margin: '0px 0px -20px 0px' });
      }

      // Stagger grid children
      var grids = section.querySelectorAll(
        '.ph-outcomes__grid, .ph-product-grid, .ph-ingredients__grid, ' +
        '.ph-reviews__grid, .ph-fit__grid, .ph-routine__grid'
      );

      grids.forEach(function (grid) {
        var children = Array.from(grid.children);
        if (!children.length) return;

        children.forEach(function (child) {
          child.style.opacity   = '0';
          child.style.transform = 'translateY(20px)';
        });

        inView(grid, function () {
          animate(
            children,
            { opacity: 1, transform: 'translateY(0px)' },
            {
              duration: tokens.duration.slow,
              easing:   tokens.easing.out,
              delay:    stagger(tokens.stagger.normal)
            }
          );
          return false;
        }, { margin: '0px 0px -60px 0px' });
      });
    });
  }

  // ─── Image Reveal ─────────────────────────────────────────────────────────
  function initImageReveal() {
    var images = document.querySelectorAll(
      '[data-motion="image-reveal"], .ph-lifestyle-img, .ph-ingredient-img'
    );

    images.forEach(function (img) {
      img.style.opacity   = '0';
      img.style.transform = 'scale(1.04)';

      inView(img, function () {
        animate(
          img,
          { opacity: [0, 1], scale: [1.04, 1] },
          {
            duration: tokens.duration.narrative,
            easing:   tokens.easing.gentle
          }
        ).then(function () {
          img.style.willChange = 'auto';
        });
        return false;
      }, { margin: '0px 0px -40px 0px' });
    });

    // Also handle ingredient card images
    var ingredientImgs = document.querySelectorAll('.ph-ingredient-card img');
    ingredientImgs.forEach(function (img, i) {
      img.style.opacity   = '0';
      img.style.transform = 'scale(1.06)';

      inView(img, function () {
        animate(
          img,
          { opacity: [0, 1], scale: [1.06, 1] },
          {
            duration: tokens.duration.narrative,
            easing:   tokens.easing.gentle,
            delay:    i * tokens.stagger.slow
          }
        );
        return false;
      }, { margin: '0px 0px -40px 0px' });
    });
  }

  // ─── Trust Bar Animation ──────────────────────────────────────────────────
  function initTrustBar() {
    var trustBar = document.querySelector('.ph-trust-bar');
    if (!trustBar) return;

    var stats = trustBar.querySelectorAll('.ph-trust-bar__stat');
    if (!stats.length) return;

    stats.forEach(function (stat) {
      stat.style.opacity   = '0';
      stat.style.transform = 'translateY(12px)';
    });

    inView(trustBar, function () {
      animate(
        Array.from(stats),
        { opacity: 1, transform: 'translateY(0px)' },
        {
          duration: tokens.duration.normal,
          easing:   tokens.easing.out,
          delay:    stagger(tokens.stagger.fast)
        }
      );
      return false;
    }, { margin: '0px 0px -20px 0px' });
  }

  // ─── Review Card Carousel Hint ────────────────────────────────────────────
  function initReviewMotion() {
    var reviewCards = document.querySelectorAll('.ph-review-card');
    if (!reviewCards.length) return;

    reviewCards.forEach(function (card) {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(16px)';
    });

    var reviewGrid = document.querySelector('.ph-reviews__grid');
    if (!reviewGrid) return;

    inView(reviewGrid, function () {
      animate(
        Array.from(reviewCards),
        { opacity: 1, transform: 'translateY(0px)' },
        {
          duration: tokens.duration.slow,
          easing:   tokens.easing.out,
          delay:    stagger(tokens.stagger.normal)
        }
      );
      return false;
    }, { margin: '0px 0px -60px 0px' });
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  function init() {
    // Guard: Motion must be resolved before any animation calls
    if (!resolveMotion()) {
      console.warn('[PrimeMotion] window.Motion not available at init — falling back to CSS-only animations');
      // Ensure all reveal elements are visible so content is never hidden
      document.querySelectorAll('.pm-reveal, .ph-reveal, [data-motion="reveal"]').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var shouldAnimate = applyMobileOptimizations();
    if (!shouldAnimate) return;

    initScrollReveals();
    initHeroEntrance();
    initStatCounters();
    initProductCardHover();
    initNavMotion();
    initCartMotion();
    initButtonMotion();
    initHeroParallax();
    initSectionTransitions();
    initImageReveal();
    initTrustBar();
    initReviewMotion();
  }

  function bootstrap() {
    if (resolveMotion()) {
      // Motion CDN already executed — run immediately
      init();
    } else {
      // CDN hasn't executed yet (race condition). Poll up to 2s then fall back.
      console.info('[PrimeMotion] window.Motion not yet available — polling…');
      var attempts = 0;
      var maxAttempts = 20; // 20 × 100ms = 2s
      var poll = setInterval(function () {
        attempts++;
        if (resolveMotion()) {
          clearInterval(poll);
          console.info('[PrimeMotion] window.Motion resolved after ' + attempts + ' poll(s)');
          init();
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
          console.warn('[PrimeMotion] window.Motion never loaded — CSS-only fallback active');
          revealMotionContent();
        }
      }, 100);
    }

    // Safety net: after 3 seconds, force-reveal any elements that are still
    // hidden. Covers edge cases: save-data mode aborting init(), IntersectionObserver
    // threshold never firing on short mobile screens, or any other silent failure.
    setTimeout(function () {
      var hidden = document.querySelectorAll(
        '.ph-reveal:not(.is-visible), .pm-reveal:not(.is-visible), [data-motion="reveal"]:not(.is-visible), [data-motion-stagger]:not(.is-visible)'
      );
      if (hidden.length) {
        console.warn('[PrimeMotion] Safety net: force-revealing ' + hidden.length + ' still-hidden element(s)');
        revealMotionContent();
      }
    }, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  // Re-init on Shopify section load (theme editor)
  if (typeof Shopify !== 'undefined' && Shopify.designMode) {
    document.addEventListener('shopify:section:load', function () {
      setTimeout(bootstrap, 100);
    });
  }

})();
