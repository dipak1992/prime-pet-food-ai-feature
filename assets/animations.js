const SCROLL_ANIMATION_TRIGGER_CLASSNAME = 'scroll-trigger';
const SCROLL_ANIMATION_OFFSCREEN_CLASSNAME = 'scroll-trigger--offscreen';
const SCROLL_ZOOM_IN_TRIGGER_CLASSNAME = 'animate--zoom-in';
const SCROLL_ANIMATION_CANCEL_CLASSNAME = 'scroll-trigger--cancel';

// ─── Prime Motion coexistence check ──────────────────────────────────────────
// If window.Motion (local Motion vendor asset) is loaded, let prime-motion.js handle
// .ph-reveal and .pm-reveal elements. This file keeps handling .scroll-trigger
// elements (Shopify Ignite native system) as a separate, non-conflicting layer.
//
// IMPORTANT: Both this file and the Motion vendor script load with `defer`, so
// evaluation order is not guaranteed. We must NOT evaluate window.Motion at
// parse time — instead we check it lazily inside initializeScrollAnimationTrigger()
// which runs on DOMContentLoaded (after all deferred scripts have executed).
// The constant below is intentionally removed; use the helper function instead.
function isPrimeMotionActive() {
  return typeof window.Motion !== 'undefined';
}

// Scroll in animation logic
function onIntersection(elements, observer) {
  elements.forEach((element, index) => {
    if (element.isIntersecting) {
      const elementTarget = element.target;
      if (elementTarget.classList.contains(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME)) {
        elementTarget.classList.remove(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
        if (elementTarget.hasAttribute('data-cascade'))
          elementTarget.style.setProperty('--animation-order', index);

        // Enhanced data-cascade stagger: support data-cascade-delay attribute
        if (elementTarget.hasAttribute('data-cascade')) {
          const cascadeDelay = elementTarget.getAttribute('data-cascade-delay');
          if (cascadeDelay) {
            elementTarget.style.setProperty('--animation-delay', cascadeDelay + 'ms');
          }
        }
      }
      observer.unobserve(elementTarget);
    } else {
      element.target.classList.add(SCROLL_ANIMATION_OFFSCREEN_CLASSNAME);
      element.target.classList.remove(SCROLL_ANIMATION_CANCEL_CLASSNAME);
    }
  });
}

function initializeScrollAnimationTrigger(rootEl = document, isDesignModeEvent = false) {
  const animationTriggerElements = Array.from(rootEl.getElementsByClassName(SCROLL_ANIMATION_TRIGGER_CLASSNAME));
  if (animationTriggerElements.length === 0) return;

  if (isDesignModeEvent) {
    animationTriggerElements.forEach((element) => {
      element.classList.add('scroll-trigger--design-mode');
    });
    return;
  }

  // Filter out .ph-reveal and .pm-reveal elements when Motion One is active
  // to prevent double-animation conflicts. Check is deferred to call-time
  // (not parse-time) to avoid a race condition with the Motion vendor defer script.
  const elementsToObserve = isPrimeMotionActive()
    ? animationTriggerElements.filter((el) =>
        !el.classList.contains('ph-reveal') &&
        !el.classList.contains('pm-reveal') &&
        !el.hasAttribute('data-motion')
      )
    : animationTriggerElements;

  if (elementsToObserve.length === 0) return;

  const observer = new IntersectionObserver(onIntersection, {
    rootMargin: '0px 0px -70px 0px',
  });
  elementsToObserve.forEach((element) => observer.observe(element));
}

// Zoom in animation logic
// function initializeScrollZoomAnimationTrigger() {
//   if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
//
//   const animationTriggerElements = Array.from(document.getElementsByClassName(SCROLL_ZOOM_IN_TRIGGER_CLASSNAME));
//
//   if (animationTriggerElements.length === 0) return;
//
//   const scaleAmount = 0.2 / 100;
//
//   animationTriggerElements.forEach((element) => {
//     let elementIsVisible = false;
//     const observer = new IntersectionObserver((elements) => {
//       elements.forEach((entry) => {
//         elementIsVisible = entry.isIntersecting;
//       });
//     });
//     observer.observe(element);
//
//     element.style.setProperty('--zoom-in-ratio', 1 + scaleAmount * percentageSeen(element));
//
//     window.addEventListener(
//       'scroll',
//       throttle(() => {
//         if (!elementIsVisible) return;
//
//         element.style.setProperty('--zoom-in-ratio', 1 + scaleAmount * percentageSeen(element));
//       }),
//       { passive: true }
//     );
//   });
// }

function percentageSeen(element) {
  const viewportHeight = window.innerHeight;
  const scrollY = window.scrollY;
  const elementPositionY = element.getBoundingClientRect().top + scrollY;
  const elementHeight = element.offsetHeight;

  if (elementPositionY > scrollY + viewportHeight) {
    // If we haven't reached the image yet
    return 0;
  } else if (elementPositionY + elementHeight < scrollY) {
    // If we've completely scrolled past the image
    return 100;
  }

  // When the image is in the viewport
  const distance = scrollY + viewportHeight - elementPositionY;
  let percentage = distance / ((viewportHeight + elementHeight) / 100);
  return Math.round(percentage);
}

window.addEventListener('DOMContentLoaded', () => {
  initializeScrollAnimationTrigger();
  // initializeScrollZoomAnimationTrigger();
});

if (Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => initializeScrollAnimationTrigger(event.target, true));
  document.addEventListener('shopify:section:reorder', () => initializeScrollAnimationTrigger(document, true));
}
