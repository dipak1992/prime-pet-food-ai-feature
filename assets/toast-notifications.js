/**
 * Shopify Custom Toast Notification System
 * - Max 2 visible toasts at any time
 * - FIFO (First-In-First-Out) auto-dismiss after min 6 seconds
 * - Smooth reordering and layout collapse on manual/auto dismissal
 */
class ToastManager {
  constructor(maxVisible = 2, minDisplayTime = 6000) {
    this.maxVisible = maxVisible;
    this.minDisplayTime = minDisplayTime;
    this.queue = [];
    this.activeToasts = []; // Array of objects: { element, startTime, id }
    this.container = null;
    this.processInterval = null;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.show = this.show.bind(this);
    this.processQueue = this.processQueue.bind(this);
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.init);
    } else {
      this.init();
    }
  }

  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
    
    // Monitor queue and active toasts for replacement logic
    if (!this.processInterval) {
      this.processInterval = setInterval(this.processQueue, 500);
    }
  }

  /**
   * Show a toast notification
   * @param {string} title - The title of the toast
   * @param {string} description - The description/message
   * @param {string} image - Image URL
   * @param {string} type - The type of toast (for styling)
   */
  show(title, description, image = '', type = 'default') {
    const toast = {
      id: Date.now() + Math.random(),
      title,
      description,
      image,
      type
    };

    this.queue.push(toast);
    this.processQueue();
  }

  processQueue() {
    // If we have room and items in queue, show them
    if (this.activeToasts.length < this.maxVisible && this.queue.length > 0) {
      const toast = this.queue.shift();
      this.renderToast(toast);
      return;
    }

    // If we are at max capacity and have items waiting, check if oldest can be retired
    if (this.activeToasts.length >= this.maxVisible && this.queue.length > 0) {
      const oldestToast = this.activeToasts[0];
      const currentTime = Date.now();
      const elapsed = currentTime - oldestToast.startTime;

      // Only dismiss the oldest if it has been visible for the minimum time
      if (elapsed >= this.minDisplayTime) {
        this.hideToast(oldestToast.element);
      }
    }
  }

  renderToast(toast) {
    if (!this.container) this.init();

    const toastElement = document.createElement('div');
    toastElement.className = `toast-notification toast-notification--${toast.type}`;
    toastElement.dataset.id = toast.id;

    // Use a wrapper for the height collapse animation
    toastElement.innerHTML = `
      <div class="toast-inner">
        ${toast.image ? `<div class="toast-image-container"><img class="toast-image" src="${toast.image}" alt=""></div>` : ''}
        <div class="toast-content-wrapper">
          <h4 class="toast-title">${toast.title}</h4>
          <p class="toast-description">${toast.description}</p>
        </div>
        <button class="toast-close" aria-label="Close notification">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    `;

    // Manual Close handler
    const closeBtn = toastElement.querySelector('.toast-close');
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.hideToast(toastElement);
    });

    // Add to container (flex-direction: column-reverse handles the bottom-up stacking)
    this.container.appendChild(toastElement);
    
    // Track timing and reference
    this.activeToasts.push({
      element: toastElement,
      startTime: Date.now(),
      id: toast.id
    });

    // Trigger entrance animation
    requestAnimationFrame(() => {
      toastElement.classList.add('show');
    });
  }

  hideToast(toastElement) {
    if (toastElement.classList.contains('hide')) return;

    // Mark for exit animation
    toastElement.classList.remove('show');
    toastElement.classList.add('hide');

    // Wait for animation to finish before DOM removal
    const onAnimationEnd = (e) => {
      // Ensure we only trigger on the main transition
      if (e.propertyName === 'opacity' || e.propertyName === 'transform' || e.propertyName === 'margin-bottom') {
        toastElement.removeEventListener('transitionend', onAnimationEnd);
        
        if (toastElement.parentNode) {
          toastElement.remove();
          // Remove from active tracking
          this.activeToasts = this.activeToasts.filter(t => t.element !== toastElement);
          // Immediately check if a queued item can now enter
          this.processQueue();
        }
      }
    };

    toastElement.addEventListener('transitionend', onAnimationEnd);
  }
}

// Global initialization
if (!window.Toast) {
  window.Toast = new ToastManager(2, 6000);
}
