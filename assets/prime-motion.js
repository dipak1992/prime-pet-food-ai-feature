/**
 * Prime Pet Food — Premium Motion System
 * Uses Motion One / Framer Motion DOM (vanilla JS) via local prime-motion-vendor.js
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
  // Both the vendor script and this script use `defer`, which guarantees in-order
  // execution per the HTML spec. However, to guard against any race condition
  // (asset cache miss, slow network, browser quirk), we defer the Motion check
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

  // ─── Universal Section Registration ──────────────────────────────────────
  // Homepage sections declare motion hooks directly in Liquid. Most product,
  // cart, collection, editorial, and ad-landing sections do not. This lightweight
  // registration pass gives those pages the same reveal system without requiring
  // duplicated data attributes across every template.
  function isEligibleAutoMotionTarget(el) {
    if (!el || el.nodeType !== 1) return false;

    if (
      el.matches('.ph-reveal, .pm-reveal, [data-motion], [data-motion-stagger], .is-visible') ||
      el.closest(
        'cart-drawer, .cart-drawer, .header__drawer, .header-drawer, ' +
        '.menu-drawer, #menu-drawer, .mobile-menu, .psatc, .prime-sticky-atc, ' +
        '.shopify-payment-button, .chat-widget, [aria-hidden="true"], [hidden]'
      )
    ) {
      return false;
    }

    return true;
  }

  function markRevealTargets(selectors, delayStep) {
    document.querySelectorAll(selectors).forEach(function (el, index) {
      if (!isEligibleAutoMotionTarget(el)) return;

      el.setAttribute('data-motion', 'reveal');
      el.setAttribute('data-motion-auto', 'true');
      el.setAttribute('data-motion-kind', el.getAttribute('data-motion-kind') || 'section');
      neutralizeNativeScrollTrigger(el);
      if (delayStep && index > 0) {
        el.setAttribute('data-motion-delay', String(Math.min(index * delayStep, 240)));
      }
    });
  }

  function markStaggerTargets(selectors) {
    document.querySelectorAll(selectors).forEach(function (el) {
      if (!isEligibleAutoMotionTarget(el)) return;
      if (!el.children || !el.children.length) return;

      el.setAttribute('data-motion-stagger', 'true');
      el.setAttribute('data-motion-auto', 'true');
      el.setAttribute('data-motion-kind', el.getAttribute('data-motion-kind') || 'cards');
      neutralizeNativeScrollTrigger(el);
    });
  }

  function markImageTargets(selectors) {
    document.querySelectorAll(selectors).forEach(function (el) {
      if (!isEligibleAutoMotionTarget(el)) return;

      el.setAttribute('data-motion', 'image-reveal');
      el.setAttribute('data-motion-auto', 'true');
      el.setAttribute('data-motion-kind', 'image');
      neutralizeNativeScrollTrigger(el);
    });
  }

  function markTextTargets(selectors) {
    document.querySelectorAll(selectors).forEach(function (el) {
      if (!isEligibleAutoMotionTarget(el)) return;

      el.setAttribute('data-motion', 'reveal');
      el.setAttribute('data-motion-auto', 'true');
      el.setAttribute('data-motion-kind', 'text');
      el.setAttribute('data-motion-delay', el.getAttribute('data-motion-delay') || '80');
      neutralizeNativeScrollTrigger(el);
    });
  }

  function markGenericSectionTargets() {
    var sectionShells = document.querySelectorAll(
      'main .shopify-section > section, ' +
      'main .shopify-section > div:not([id^="shopify-block-"])'
    );

    sectionShells.forEach(function (section, index) {
      if (!isEligibleAutoMotionTarget(section)) return;
      if (section.closest('#shopify-section-header, #shopify-section-footer')) return;
      if (section.querySelector('.ph-reveal, .pm-reveal, [data-motion], [data-motion-stagger]')) return;
      if (section.offsetHeight < 80) return;

      section.setAttribute('data-motion', 'reveal');
      section.setAttribute('data-motion-auto', 'true');
      section.setAttribute('data-motion-kind', 'section');
      neutralizeNativeScrollTrigger(section);
      section.setAttribute('data-motion-delay', String(Math.min(index * 25, 160)));
    });
  }

  function registerUniversalMotionTargets() {
    markRevealTargets(
      [
        // Product pages
        '.ypc-product-hero__media',
        '.ypc-product-hero__content',
        '.ypc-tabs-recos__left',
        '.ypc-tabs-recos__right',
        '.related-products',
        'product-recommendations',

        // Cart and account-style pages
        '.ypc-cart__hero',
        '.ypc-cart__main',
        '.ypc-cart__summary',
        '.customer',

        // Collections and standard editorial sections
        '.collection-hero__text-wrapper',
        '.collection-hero__image-container',
        '.prime-collection-hero__content',
        '.prime-collection-hero__media',
        '.main-page-title',
        '.page-title',
        '.page-header',

        // Paid landing pages
        '.prime-ad-landing__hero-media',
        '.prime-ad-landing__hero-copy',
        '.prime-ad-landing__problem-solution',
        '.prime-ad-landing__proof-band',
        '.prime-ad-landing__offer',
        '.prime-ad-landing__objections',
        '.prime-ad-landing__final',

        // SEO/storytelling/custom pages
        '.seo-chew__hero',
        '.seo-chew__section',
        '.prime-wholesale__hero',
        '.prime-wholesale__section',
        '.prime-yak-process__hero',
        '.prime-yak-process__section',
        '.prime-yak-process__step',
        '.pav2-hero__copy',
        '.pav2-hero__media',
        '.pav2-section',

        // Theme generic content sections
        '.rich-text',
        '.image-with-text',
        '.multicolumn',
        '.collapsible-content',
        '.testimonials',
        '.scroll-trigger.animate--fade-in',
        '.scroll-trigger.animate--slide-in'
      ].join(', '),
      45
    );

    markStaggerTargets(
      [
        '.ypc-product-hero__thumb-row',
        '.ypc-product-hero__options',
        '.ypc-tabs-recos__nav',
        '.ypc-tabs-recos__products',
        '.ypc-cart-items',
        '.related-products .grid',
        '.product-grid',
        '.collection .grid',
        '.prime-ad-landing__review-grid',
        '.prime-ad-landing__microproof',
        '.seo-chew__cards',
        '.seo-chew__links',
        '.prime-wholesale__cards',
        '.prime-wholesale__steps',
        '.prime-yak-process__timeline',
        '.pav2-grid',
        '.multicolumn-list',
        '.testimonial-list',
        '.responsive-grid',
        '.card-grid',
        '.slider:not(.slider--mobile)'
      ].join(', ')
    );

    markTextTargets(
      [
        'main .shopify-section h2',
        'main .shopify-section h3',
        '.section-title',
        '.section-text',
        '.section-content__heading',
        '.section-content__text',
        '.ypc-product-hero__title',
        '.ypc-product-hero__subtitle',
        '.ypc-tabs-recos__reco-heading',
        '.prime-ad-landing__subhead',
        '.prime-wholesale__lede',
        '.seo-chew__lede'
      ].join(', ')
    );

    markImageTargets(
      [
        'main .shopify-section picture',
        'main .shopify-section .media',
        'main .shopify-section .image-wrapper',
        'main .shopify-section .image-with-text__media',
        'main .shopify-section .collection-hero__image-container',
        '.ypc-product-hero__main-image-wrap',
        '.ypc-cart-item__image-wrap',
        '.prime-ad-landing__hero-media',
        '.prime-ad-landing__offer-media',
        '.prime-wholesale__hero-media',
        '.prime-yak-process__hero-media',
        '.prime-yak-process__step-media',
        '.seo-chew__media',
        '.pav2-hero__media'
      ].join(', ')
    );

    markGenericSectionTargets();
  }

  function isInInitialViewport(el) {
    var rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
  }

  function isNearViewport(el, buffer) {
    var rect = el.getBoundingClientRect();
    var threshold = typeof buffer === 'number' ? buffer : 160;
    return rect.top < window.innerHeight + threshold && rect.bottom > -threshold;
  }

  function neutralizeNativeScrollTrigger(el) {
    if (!el || !el.classList || !el.classList.contains('scroll-trigger')) return;

    el.classList.remove('scroll-trigger--offscreen');
    el.classList.add('scroll-trigger--cancel');
  }

  function revealElementImmediately(el) {
    neutralizeNativeScrollTrigger(el);
    el.classList.add('is-visible');
    el.style.opacity = '';
    el.style.transform = '';

    if (el.hasAttribute('data-motion-stagger')) {
      Array.from(el.children).forEach(function (child) {
        child.style.opacity = '';
        child.style.transform = '';
      });
    }
  }

  function getRevealProfile(el) {
    var kind = el.getAttribute('data-motion-kind') || 'section';

    if (kind === 'text') {
      return {
        y: isMobile ? 10 : 14,
        duration: isMobile ? 0.32 : 0.38,
        delayOffset: 0.02
      };
    }

    if (kind === 'image') {
      return {
        y: 0,
        scale: 1.03,
        duration: isMobile ? 0.42 : 0.56,
        delayOffset: 0.1
      };
    }

    return {
      y: isMobile ? 12 : 16,
      duration: isMobile ? 0.36 : 0.46,
      delayOffset: 0
    };
  }

  // ─── Scroll Reveal System ─────────────────────────────────────────────────
  function initScrollReveals() {
    var selectors = '.ph-reveal, .pm-reveal, [data-motion="reveal"]';
    var elements  = document.querySelectorAll(selectors);

    if (!elements.length) return;

    elements.forEach(function (el) {
      // Skip if already visible (e.g. above the fold)
      if (el.classList.contains('is-visible')) return;

      // Auto-registered targets are added after first paint. Do not hide and
      // replay content already visible in the initial viewport; that reads as
      // a page-refresh blink. Below-fold targets still animate on scroll.
      if (el.getAttribute('data-motion-auto') === 'true' && isInInitialViewport(el)) {
        revealElementImmediately(el);
        return;
      }

      var profile    = getRevealProfile(el);
      var delay      = (parseFloat(el.getAttribute('data-motion-delay') || '0') / 1000) + profile.delayOffset;
      var hasStagger = el.hasAttribute('data-motion-stagger');

      var revealDistance = profile.y;
      var childDistance  = isMobile ? 12 : 16;
      var observerMargin = isMobile ? '0px 0px -20px 0px' : '0px 0px -60px 0px';

      // Set initial state via JS (overrides CSS for Motion-controlled elements)
      el.style.opacity   = '0';
      el.style.transform = 'translateY(' + revealDistance + 'px)';

      inView(el, function () {
        if (hasStagger) {
          // Stagger children
          var children = Array.from(el.children);
          if (children.length) {
            children.forEach(function (child) {
              child.style.opacity   = '0';
              child.style.transform = 'translateY(' + childDistance + 'px)';
            });

            animate(
              children,
              { opacity: 1, transform: 'translateY(0px)' },
              {
                duration: isMobile ? 0.36 : 0.44,
                easing:   tokens.easing.out,
                delay:    stagger(0.06, { start: delay + 0.08 })
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
            duration: profile.duration,
            easing:   tokens.easing.out,
            delay:    delay
          }
        ).then(function () {
          el.classList.add('is-visible');
          el.style.willChange = 'auto';
        });

        return false; // fire once
      }, { margin: observerMargin });
    });

    // Also handle [data-motion-stagger] parent containers
    var staggerParents = document.querySelectorAll('[data-motion-stagger]:not(.ph-reveal):not(.pm-reveal)');
    staggerParents.forEach(function (parent) {
      var children = Array.from(parent.children);
      if (!children.length) return;
      if (parent.classList.contains('is-visible')) return;

      if (parent.getAttribute('data-motion-auto') === 'true' && isInInitialViewport(parent)) {
        revealElementImmediately(parent);
        return;
      }

      children.forEach(function (child) {
        child.style.opacity   = '0';
        child.style.transform = 'translateY(' + (isMobile ? 12 : 16) + 'px)';
      });

      inView(parent, function () {
        animate(
          children,
          { opacity: 1, transform: 'translateY(0px)' },
          {
            duration: isMobile ? 0.36 : 0.44,
            easing:   tokens.easing.out,
            delay:    stagger(0.06, { start: 0.12 })
          }
        );
        parent.classList.add('is-visible');
        return false;
      }, { margin: isMobile ? '0px 0px -20px 0px' : '0px 0px -60px 0px' });
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
    if (!document.querySelector('cart-drawer')) return;

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

  // ─── Image Reveal ─────────────────────────────────────────────────────────
  function initImageReveal() {
    var images = document.querySelectorAll(
      '[data-motion="image-reveal"], .ph-lifestyle-img, .ph-ingredient-img'
    );

    images.forEach(function (img) {
      if (img.classList.contains('is-visible')) return;

      if (img.getAttribute('data-motion-auto') === 'true' && isInInitialViewport(img)) {
        revealElementImmediately(img);
        return;
      }

      img.style.opacity   = '0';
      img.style.transform = 'scale(1.03)';

      inView(img, function () {
        animate(
          img,
          { opacity: [0, 1], scale: [1.03, 1] },
          {
            duration: isMobile ? 0.42 : 0.56,
            easing:   tokens.easing.gentle,
            delay:    0.1
          }
        ).then(function () {
          img.classList.add('is-visible');
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

  // ─── Init ─────────────────────────────────────────────────────────────────
  function init() {
    // Guard: Motion must be resolved before any animation calls
    if (!resolveMotion()) {
      console.warn('[PrimeMotion] window.Motion not available at init — falling back to CSS-only animations');
      // Ensure all reveal elements are visible so content is never hidden
      revealMotionContent();
      return;
    }

    var shouldAnimate = applyMobileOptimizations();
    if (!shouldAnimate) {
      revealMotionContent();
      return;
    }

    registerUniversalMotionTargets();
    initScrollReveals();
    initHeroEntrance();
    initStatCounters();
    initProductCardHover();
    initNavMotion();
    initCartMotion();
    initButtonMotion();
    initHeroParallax();
    initImageReveal();
  }

  function bootstrap() {
    if (resolveMotion()) {
      // Motion vendor already executed — run immediately
      init();
    } else {
      // Vendor hasn't executed yet (race condition). Poll up to 2s then fall back.
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

    // Safety net: after 3 seconds, reveal only stale targets that are in or near
    // the current viewport. Do not reveal the entire below-fold page, otherwise
    // users get no motion when they eventually scroll.
    setTimeout(function () {
      var hidden = document.querySelectorAll(
        '.ph-reveal:not(.is-visible), .pm-reveal:not(.is-visible), [data-motion="reveal"]:not(.is-visible), [data-motion-stagger]:not(.is-visible)'
      );
      var staleVisibleTargets = Array.from(hidden).filter(function (el) {
        return isNearViewport(el, 180);
      });

      if (!staleVisibleTargets.length) return;

      console.warn('[PrimeMotion] Safety net: force-revealing ' + staleVisibleTargets.length + ' stale in-view element(s)');
      staleVisibleTargets.forEach(revealElementImmediately);
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
