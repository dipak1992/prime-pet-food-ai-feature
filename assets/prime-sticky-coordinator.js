(function() {
  'use strict';

  function updateStickyState() {
    if (window.innerWidth > 768) return;
    var visible = Array.prototype.filter.call(document.querySelectorAll('.ph-sticky-bar, .ca-sticky-cta, .prime-sticky-atc, .pss-mobile-cta'), function(el) {
      return el.offsetParent !== null || el.classList.contains('ph-sticky-bar--visible') || el.classList.contains('ca-sticky-cta--visible');
    });

    visible.forEach(function(el, index) {
      if (index === visible.length - 1) {
        el.removeAttribute('data-prime-sticky-muted');
      } else {
        el.setAttribute('data-prime-sticky-muted', 'true');
      }
    });
  }

  var style = document.createElement('style');
  style.textContent = '[data-prime-sticky-muted="true"]{opacity:0!important;pointer-events:none!important;transform:translateY(120%)!important;}';
  document.head.appendChild(style);

  window.addEventListener('scroll', updateStickyState, { passive: true });
  window.addEventListener('resize', updateStickyState);
  document.addEventListener('DOMContentLoaded', updateStickyState);
  setInterval(updateStickyState, 1200);
})();
