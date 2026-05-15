if (!customElements.get('cart-remove-button')) {
  class CartRemoveButton extends HTMLElement {
    constructor() {
      super();
      this.initialized = false;
    }

    connectedCallback() {
      this.init();
    }

    init() {
      if (this.initialized) return;
      this.initialized = true;
      this.addEventListener('click', (event) => {
        event.preventDefault();
        const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
        if (cartItems) cartItems.updateQuantity(this.dataset.index, 0);
      });
    }
  }

  customElements.define('cart-remove-button', CartRemoveButton);
}

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.lineItemStatusElement =
      document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');
    this.cartDrawer = document.querySelector('cart-drawer');

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener('change', debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.init();

    if (this.cartUpdateUnsubscriber) return;
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-items') {
        return;
      }
      this.onCartUpdate();
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  resetQuantityInput(id) {
    const input = this.querySelector(`#Quantity-${id}`);
    if (!input) return;
    input.value = input.getAttribute('value');
    this.isEnterPressed = false;
  }

  setValidity(event, index, message) {
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(index);
    event.target.select();
  }

  validateQuantity(event) {
    const inputValue = parseInt(event.target.value);
    const index = event.target.dataset.index;
    let message = '';

    if (Number.isNaN(inputValue)) {
      message = window.cartStrings?.error || 'Enter a valid quantity.';
    } else if (inputValue > 0 && inputValue < event.target.dataset.min) {
      message = window.quickOrderListStrings.min_error.replace('[min]', event.target.dataset.min);
    } else if (inputValue > parseInt(event.target.max)) {
      message = window.quickOrderListStrings.max_error.replace('[max]', event.target.max);
    } else if (inputValue % parseInt(event.target.step) !== 0) {
      message = window.quickOrderListStrings.step_error.replace('[step]', event.target.step);
    }

    if (message) {
      this.setValidity(event, index, message);
    } else {
      event.target.setCustomValidity('');
      event.target.reportValidity();
      this.updateQuantity(
        index,
        inputValue,
        document.activeElement.getAttribute('name'),
        event.target.dataset.quantityVariantId
      );
    }
  }

  onChange(event) {
    this.validateQuantity(event);
  }

  onCartUpdate() {
    if (this.tagName === 'CART-DRAWER-ITEMS') {
      fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const selectors = ['cart-drawer-items', '.cart-drawer__footer'];
          for (const selector of selectors) {
            const targetElement = document.querySelector(selector);
            const sourceElement = html.querySelector(selector);
            if (targetElement && sourceElement) {
              targetElement.replaceWith(sourceElement);
            }
          }
          this.cartDrawer?.removeDeleteTabIndex();
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      fetch(`${routes.cart_url}?section_id=main-cart`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const sourceQty = html.querySelector('cart-items');
          if (sourceQty) this.innerHTML = sourceQty.innerHTML;
          window.renderSelects();
          window.loadDesktopOnlyTemplates();
          this.cartDrawer?.removeDeleteTabIndex();
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: 'main-cart',
        selector: '.js-cart-items',
      },
      {
        id: 'cart-summary',
        section: 'main-cart',
        selector: '.js-subtotal',
      },
      {
        id: 'cart-summary',
        section: 'main-cart',
        selector: '.js-free-shipping-bar',
      },
      {
        id: 'cart-summary',
        section: 'main-cart',
        selector: '.cart__recommendations',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section',
      }
    ];
  }

  getUniqueSectionsToRender(sectionsToRender) {
    const uniqueSections = [];
    const seen = new Set();

    sectionsToRender.forEach((section) => {
      const key = `${section.id}:${section.section}:${section.selector}`;
      if (seen.has(key)) return;
      seen.add(key);
      uniqueSections.push(section);
    });

    return uniqueSections;
  }

  updateQuantity(line, quantity, name, variantId) {
    this.enableLoading(line);

    let sectionsToRender = [];

    const cartDrawerItems = document.querySelector('cart-drawer-items');
    if (cartDrawerItems && typeof cartDrawerItems.getSectionsToRender === 'function') {
      sectionsToRender = [...sectionsToRender, ...cartDrawerItems.getSectionsToRender()];
    }

    const cartItems = document.querySelector('cart-items');
    if (cartItems && typeof cartItems.getSectionsToRender === 'function') {
      sectionsToRender = [...sectionsToRender, ...cartItems.getSectionsToRender()];
    }
    sectionsToRender = this.getUniqueSectionsToRender(sectionsToRender);

    const body = JSON.stringify({
      line,
      quantity,
      sections: [...new Set(sectionsToRender.map((section) => section.section))],
      sections_url: window.location.pathname,
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        const quantityElement =
            document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);
        const items = document.querySelectorAll('.cart-item, .ypc-cart-item');

        if (parsedState.errors) {
          if (quantityElement) quantityElement.value = quantityElement.getAttribute('value');
          this.updateLiveRegions(line, parsedState.errors);
          return;
        }

        this.renderContents(parsedState, sectionsToRender);

        const updatedValue = parsedState.items[line - 1] ? parsedState.items[line - 1].quantity : undefined;
        let message = '';
        if (quantityElement && items.length === parsedState.items.length && updatedValue !== parseInt(quantityElement.value)) {
          if (typeof updatedValue === 'undefined') {
            message = window.cartStrings.error;
          } else {
            message = window.cartStrings.quantityError.replace('[quantity]', updatedValue);
          }
        }
        this.updateLiveRegions(line, message);
        const cartDrawerWrapper = document.querySelector('cart-drawer');

        const lineItem =
            document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper
              ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`))
              : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'));
        } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'));
        }
        window.renderSelects();
        window.loadDesktopOnlyTemplates();

        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items', cartData: parsedState, variantId: variantId });
      })
      .catch((err) => {
        console.warn(err);
        this.querySelectorAll('.loading__spinner').forEach((spinner) => spinner.classList.add('hidden', 'spinning-complete'));
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        if (errors) errors.textContent = 'We couldn\u2019t update your cart. Please try again.';
      })
      .finally(() => {
        this.cartDrawer?.removeDeleteTabIndex();
        this.disableLoading(line);
      });
  }

  renderContents(parsedState, sectionsToRender) {
    if (!sectionsToRender) sectionsToRender = this.getSectionsToRender();

    this.classList.toggle('is-empty', parsedState.item_count === 0);
    const cartDrawerWrapper = document.querySelector('cart-drawer');
    const cart = document.getElementById('main-cart');

    if (cart) cart.classList.toggle('is-empty', parsedState.item_count === 0);
    if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

    sectionsToRender.forEach((section) => {
      const sectionHtml = parsedState.sections && parsedState.sections[section.section];
      const container = document.getElementById(section.id);
      if (!sectionHtml || !container) return;

      const newHtml = this.getSectionInnerHTML(
          sectionHtml,
          section.selector
      );

      if (newHtml) {
        const elementToReplace = container.querySelector(section.selector) || container;

        // Prevent a flash of content with recommendations
        const oldRecommendations = elementToReplace.querySelector('product-recommendations');
        if (oldRecommendations) {
          const newRecommendations = newHtml.querySelector('product-recommendations');
          if (newRecommendations) {
            newRecommendations.innerHTML = oldRecommendations.innerHTML;
          }
        }

        // Animate free shipping progress bar from old number to new number
        const oldFreeShippingBar = elementToReplace.querySelector('.free-shipping-bar');
        if (oldFreeShippingBar) {
          const oldProgress = oldFreeShippingBar.style.getPropertyValue('--shipping-bar-width');
          const newFreeShippingBar = newHtml.querySelector('.free-shipping-bar');
          if (newFreeShippingBar) {
            const newProgress = newFreeShippingBar.style.getPropertyValue('--shipping-bar-width');
            newFreeShippingBar.style.setProperty('--shipping-bar-width', oldProgress);

            setTimeout(() => {
              elementToReplace.querySelector('.free-shipping-bar')?.style
                .setProperty('--shipping-bar-width', newProgress);
            }, 0);
          }
        }

        elementToReplace.innerHTML = newHtml.innerHTML;
        window.loadTemplateContent(elementToReplace);
      }
    });

    // Re-initialize swipe-to-remove on new cart items
    if (window.initCartSwipeRemove) window.initCartSwipeRemove();
  }

  updateLiveRegions(line, message) {
    const lineItemError =
      document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (lineItemError) lineItemError.querySelector('.cart-item__error-text').textContent = message;

    if (this.lineItemStatusElement) this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus =
      document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    if (!cartStatus) return;
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    html = html.replace(/<template\b[^>]*>|<\/template>/g, '');
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    if (mainCartItems) mainCartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading__spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading__spinner`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));

    document.activeElement.blur();
    if (this.lineItemStatusElement) this.lineItemStatusElement.setAttribute('aria-hidden', false);

    this.closest('cart-drawer')?.classList.add('closable-element--no-trans');
  }

  disableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    if (mainCartItems) mainCartItems.classList.remove('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading__spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading__spinner`);

    cartItemElements.forEach((overlay) => overlay.classList.add('hidden'));
    cartDrawerItemElements.forEach((overlay) => overlay.classList.add('hidden'));

    window.requestAnimationFrame(() => {
      this.closest('cart-drawer')?.classList.remove('closable-element--no-trans');
    });
  }
}

if (!customElements.get('cart-items')) {
  customElements.define('cart-items', CartItems);
}

if (!customElements.get('cart-note')) {
  customElements.define(
    'cart-note',
    class CartNote extends HTMLElement {
      constructor() {
        super();
        this.initialized = false;
      }

      connectedCallback() {
        this.init();
      }

      init() {
        if (this.initialized) return;
        this.initialized = true;
        this.addEventListener(
          'input',
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value });
            fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
          }, ON_CHANGE_DEBOUNCE_TIMER)
        );
      }
    }
  );
}

/* ─── Swipe-to-Remove for mobile cart items ─── */
(function () {
  'use strict';

  const SWIPE_THRESHOLD = 80; // px to trigger remove
  const SWIPE_MAX = 120; // max visual offset
  const SWIPE_VERTICAL_TOLERANCE = 24;
  const INTERACTIVE_SELECTOR = 'a, button, input, select, textarea, label, quantity-input, cart-remove-button, quantity-popover, summary, details';

  function isTouchLikeDevice() {
    return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  }

  function isInteractiveTarget(target) {
    return target.closest(INTERACTIVE_SELECTOR);
  }

  function removeCartItem(item) {
    const removeButton = item.querySelector('cart-remove-button');
    const cartItems = item.closest('cart-items') || document.querySelector('cart-items');

    if (removeButton?.dataset.index && cartItems && typeof cartItems.updateQuantity === 'function') {
      cartItems.updateQuantity(removeButton.dataset.index, 0);
      return;
    }

    const removeLink = item.querySelector('cart-remove-button a');
    if (removeLink) window.location.href = removeLink.href;
  }

  function initCartSwipeRemove() {
    if (!isTouchLikeDevice()) return;

    const items = document.querySelectorAll('.ypc-cart-item');
    items.forEach((item) => {
      if (item.dataset.swipeInit) return;
      item.dataset.swipeInit = '1';

      let startX = 0;
      let startY = 0;
      let currentX = 0;
      let isSwiping = false;
      let isHorizontalSwipe = false;

      item.addEventListener('touchstart', (e) => {
        if (isInteractiveTarget(e.target)) return;
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        currentX = 0;
        isSwiping = true;
        isHorizontalSwipe = false;
        item.style.transition = 'none';
      }, { passive: true });

      item.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        const touch = e.touches[0];
        const diffX = touch.clientX - startX;
        const diffY = touch.clientY - startY;

        if (!isHorizontalSwipe) {
          if (Math.abs(diffY) > SWIPE_VERTICAL_TOLERANCE && Math.abs(diffY) > Math.abs(diffX)) {
            isSwiping = false;
            item.style.transform = '';
            item.style.transition = '';
            item.style.setProperty('--swipe-progress', '0');
            return;
          }

          if (Math.abs(diffX) < 12) return;
          isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY);
        }

        if (!isHorizontalSwipe) return;

        // Only allow left swipe (negative diff)
        if (diffX > 10) {
          isSwiping = false;
          item.style.transform = '';
          item.style.transition = '';
          item.style.setProperty('--swipe-progress', '0');
          return;
        }

        currentX = Math.max(-SWIPE_MAX, diffX);
        item.style.transform = `translateX(${currentX}px)`;

        // Show red background indicator
        const progress = Math.min(1, Math.abs(currentX) / SWIPE_THRESHOLD);
        item.style.setProperty('--swipe-progress', progress);

        if (Math.abs(currentX) > 10) {
          e.preventDefault();
        }
      }, { passive: false });

      item.addEventListener('touchend', () => {
        if (!isSwiping) return;
        isSwiping = false;
        item.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease';

        if (Math.abs(currentX) >= SWIPE_THRESHOLD) {
          // Trigger remove
          item.style.transform = `translateX(-100%)`;
          item.style.opacity = '0';

          setTimeout(() => {
            removeCartItem(item);
          }, 280);
        } else {
          // Snap back
          item.style.transform = '';
          item.style.setProperty('--swipe-progress', '0');
        }

        currentX = 0;
      }, { passive: true });

      item.addEventListener('touchcancel', () => {
        isSwiping = false;
        item.style.transition = 'transform 0.3s ease';
        item.style.transform = '';
        item.style.setProperty('--swipe-progress', '0');
        currentX = 0;
      }, { passive: true });
    });
  }

  // Expose globally so renderContents can re-init after DOM update
  window.initCartSwipeRemove = initCartSwipeRemove;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartSwipeRemove);
  } else {
    initCartSwipeRemove();
  }
})();
