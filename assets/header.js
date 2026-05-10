class Header extends HTMLElement {
  constructor() {
    super();
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  connectedCallback() {
    // Desktop elements
    this.desktopHeader = this.querySelector('.header-desktop');
    this.desktopSearchTrigger = this.querySelector('.header__search-trigger-desktop');
    this.desktopSearchInput = this.querySelector('.header__search-input-desktop');
    this.desktopSearchForm = this.querySelector('.header__search-form-desktop');

    // Mobile elements
    this.mobileHeader = this.querySelector('.header-mobile');
    this.mobileSearchTrigger = this.querySelector('.header__search-trigger-mobile');
    this.mobileSearchClose = this.querySelector('.header-mobile__search-close');
    this.mobileSearchInput = this.querySelector('.header-mobile__search-input');

    // Burger Drawer elements
    this.burgerToggle = this.querySelector('.header__burger-toggle');
    this.drawer = this.querySelector('.header__drawer');
    this.drawerClose = this.querySelector('.header__drawer-close');
    this.drawerOverlay = this.querySelector('.header__drawer-overlay');

    // Desktop Search listeners
    if (this.desktopSearchTrigger) {
      this.desktopSearchTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.desktopHeader) {
          this.desktopHeader.classList.add('search-active');
          if (this.desktopSearchInput) {
            setTimeout(() => this.desktopSearchInput.focus(), 400);
          }
        }
      });
    }

    // Click outside to close desktop search
    document.addEventListener('click', (event) => {
      if (this.desktopHeader && this.desktopHeader.classList.contains('search-active')) {
        const isClickInside = (this.desktopSearchInput && this.desktopSearchInput.contains(event.target)) || 
                             (this.desktopSearchForm && this.desktopSearchForm.contains(event.target));
        
        if (!isClickInside) {
          this.desktopHeader.classList.remove('search-active');
        }
      }
    });

    // Mobile Search listeners
    if (this.mobileSearchTrigger) {
      this.mobileSearchTrigger.addEventListener('click', () => {
        if (this.mobileHeader) {
          this.mobileHeader.classList.toggle('search-active');
          if (this.mobileHeader.classList.contains('search-active') && this.mobileSearchInput) {
            setTimeout(() => this.mobileSearchInput.focus(), 300);
          }
        }
      });
    }
    if (this.mobileSearchClose) {
      this.mobileSearchClose.addEventListener('click', () => {
        if (this.mobileHeader) {
          this.mobileHeader.classList.remove('search-active');
        }
      });
    }

    // Burger Menu listeners
    if (this.burgerToggle) {
      this.burgerToggle.addEventListener('click', this.openDrawer.bind(this));
    }
    if (this.drawerClose) {
      this.drawerClose.addEventListener('click', this.closeDrawer.bind(this));
    }
    if (this.drawerOverlay) {
      this.drawerOverlay.addEventListener('click', this.closeDrawer.bind(this));
    }

    // Mobile Drawer Toggles
    this.drawerToggles = this.querySelectorAll('.header__drawer-toggle');
    this.drawerToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const submenu = toggle.closest('.header__drawer-item-header').nextElementSibling;
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        
        toggle.setAttribute('aria-expanded', !isExpanded);
        if (submenu) {
          submenu.classList.toggle('is-open');
        }
      });
    });

    // Scroll handler for other scripts expecting .scrolled-past-header
    this.headerSection = this.closest('.shopify-section');
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > 100) {
        if (this.headerSection) this.headerSection.classList.add('scrolled-past-header');
        this.classList.add('is-scrolled');
      } else {
        if (this.headerSection) this.headerSection.classList.remove('scrolled-past-header');
        this.classList.remove('is-scrolled');
      }
    }, { passive: true });

    document.addEventListener('click', this.handleDocumentClick);
    document.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleDocumentClick);
    document.removeEventListener('keydown', this.handleKeydown);
  }

  handleDocumentClick(event) {
    if (!this.drawer?.classList.contains('is-active')) return;
    if (event.target.closest('.header__drawer-content')) return;
    if (event.target.closest('.header__burger-toggle')) return;

    this.closeDrawer();
  }

  handleKeydown(event) {
    if (event.key === 'Escape' && this.drawer?.classList.contains('is-active')) {
      this.closeDrawer();
    }
  }

  openDrawer(event) {
    event?.preventDefault();

    if (this.drawer) {
      this.drawer.classList.add('is-active');
      this.drawer.setAttribute('aria-hidden', 'false');
      this.burgerToggle?.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      document.body.classList.add('header-drawer-open');
      this.mobileHeader?.classList.remove('search-active');
    }
  }

  closeDrawer() {
    if (this.drawer) {
      this.drawer.classList.remove('is-active');
      this.drawer.setAttribute('aria-hidden', 'true');
      this.burgerToggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      document.body.classList.remove('header-drawer-open');
    }
  }
}

if (!customElements.get('main-header')) {
  customElements.define('main-header', Header);
}
