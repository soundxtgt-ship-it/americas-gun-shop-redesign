/* partials.js — shared header & footer injected into every page.
   Uses document.currentScript-relative paths so pages in /pages/ and the
   root index.html both resolve assets correctly via a `data-root` attribute
   on <body>. */

(function () {
  'use strict';

  const root = document.body.getAttribute('data-root') || './';
  const page = document.body.getAttribute('data-page') || '';

  const navItems = [
    { href: 'index.html', page: 'home', label: 'Home' },
    { href: 'pages/shop.html', page: 'shop', label: 'Shop' },
    { href: 'pages/services.html', page: 'services', label: 'Services' },
    { href: 'pages/store-ops.html', page: 'store-ops', label: 'How It Works' },
    { href: 'pages/about.html', page: 'about', label: 'About' },
    { href: 'pages/contact.html', page: 'contact', label: 'Contact' },
  ];

  function link(item) {
    const href = root + item.href;
    const current = item.page === page ? ' aria-current="page"' : '';
    return `<a href="${href}"${current}>${item.label}</a>`;
  }

  const headerHTML = `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header">
      <div class="container header-bar">
        <a class="brand" href="${root}index.html" aria-label="America's Gun Shop home">
          <svg class="brand-logo" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M24 3 L43 9.5 V21.5 C43 33.5 35.5 41.5 24 45 C12.5 41.5 5 33.5 5 21.5 V9.5 Z" fill="currentColor" opacity="0.07"/>
            <path d="M24 3 L43 9.5 V21.5 C43 33.5 35.5 41.5 24 45 C12.5 41.5 5 33.5 5 21.5 V9.5 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M24 13.5 L27.4 20.6 L35 21.7 L29.5 27 L30.8 34.7 L24 31.1 L17.2 34.7 L18.5 27 L13 21.7 L20.6 20.6 Z" fill="currentColor"/>
          </svg>
          <span class="brand-name"><strong>America&rsquo;s Gun Shop</strong><span>West Chester, PA</span></span>
        </a>
        <nav class="main-nav" id="main-nav" aria-label="Primary">
          ${navItems.map(link).join('\n')}
        </nav>
        <div class="header-actions">
          <a class="header-tel" href="tel:+16105560223" aria-label="Call the shop at 610-556-0223">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>(610) 556-0223</span>
          </a>
          <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch to light mode">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
          <div class="icon-btn-wrap">
            <a class="btn-icon" href="${root}pages/shop.html#cart" aria-label="View saved pickup list, 0 items" id="cart-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            </a>
            <span class="cart-badge-count" id="cart-count" hidden>0</span>
          </div>
          <button class="nav-toggle" type="button" id="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="main-nav">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
        </div>
      </div>
    </header>
  `;

  const footerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col footer-brand">
            <svg class="footer-logo" width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <path d="M24 3 L43 9.5 V21.5 C43 33.5 35.5 41.5 24 45 C12.5 41.5 5 33.5 5 21.5 V9.5 Z" fill="currentColor" opacity="0.07"/>
              <path d="M24 3 L43 9.5 V21.5 C43 33.5 35.5 41.5 24 45 C12.5 41.5 5 33.5 5 21.5 V9.5 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M24 13.5 L27.4 20.6 L35 21.7 L29.5 27 L30.8 34.7 L24 31.1 L17.2 34.7 L18.5 27 L13 21.7 L20.6 20.6 Z" fill="currentColor"/>
            </svg>
            <p>Firearms, ammunition, gunsmithing, transfers, trade-ins, and training in West Chester and Chester County.</p>
            <p class="footer-license">CMMB Tactical, LLC &middot; FFL #8-23-029-01-8F-17224<br>Dealer in Firearms / Gunsmith &middot; Active through Jun 1, 2028</p>
          </div>
          <div class="footer-col">
            <h4>Shop</h4>
            <ul role="list">
              <li><a href="${root}pages/shop.html?cat=handguns">Handguns</a></li>
              <li><a href="${root}pages/shop.html?cat=rifles-shotguns">Rifles &amp; Shotguns</a></li>
              <li><a href="${root}pages/shop.html?cat=ammunition">Ammunition</a></li>
              <li><a href="${root}pages/shop.html?cat=optics-accessories">Optics &amp; Accessories</a></li>
              <li><a href="${root}pages/shop.html?cat=nfa-suppressors">NFA / Suppressors</a></li>
              <li><a href="${root}pages/shop.html?cat=used-consignment">Used &amp; Consignment</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Services</h4>
            <ul role="list">
              <li><a href="${root}pages/services.html#ffl-transfer">FFL Transfers</a></li>
              <li><a href="${root}pages/services.html#gunsmithing">Gunsmithing</a></li>
              <li><a href="${root}pages/services.html#trade-in">Cash for Your Guns</a></li>
              <li><a href="${root}pages/services.html#classes">Classes &amp; Training</a></li>
              <li><a href="${root}pages/store-ops.html">How inventory works</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Visit</h4>
            <ul role="list">
              <li><a href="${root}pages/about.html">1313 West Chester Pike, Ste 300<br>West Chester, PA 19382</a></li>
              <li><a href="tel:+16105560223">(610) 556-0223</a></li>
              <li><a href="${root}pages/about.html#hours">Tue&ndash;Fri 10am&ndash;5pm, Sat 10am&ndash;3pm</a></li>
              <li><a href="${root}pages/contact.html">Contact options</a></li>
              <li><a href="${root}pages/privacy.html">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 CMMB Tactical, LLC, d/b/a America&rsquo;s Gun Shop. This redesigned catalog is a preview and does not process transactions.</p>
          <p>All firearm sales subject to PA/federal law, NICS/PA-PICS background check &amp; ATF Form 4473 at pickup.</p>
        </div>
      </div>
    </footer>
  `;

  const headerMount = document.getElementById('site-header');
  const footerMount = document.getElementById('site-footer');
  if (headerMount) headerMount.innerHTML = headerHTML;
  if (footerMount) footerMount.innerHTML = footerHTML;

  // Nav toggle (mobile)
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    const mobileQuery = window.matchMedia('(max-width: 900px)');

    function setMenu(open, returnFocus) {
      const isOpen = mobileQuery.matches && open;
      mainNav.classList.toggle('is-open', isOpen);
      document.body.classList.toggle('nav-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      if (mobileQuery.matches) {
        mainNav.setAttribute('aria-hidden', String(!isOpen));
        mainNav.inert = !isOpen;
      } else {
        mainNav.removeAttribute('aria-hidden');
        mainNav.inert = false;
      }
      if (isOpen) {
        const firstLink = mainNav.querySelector('a');
        if (firstLink) firstLink.focus();
      }
      if (!isOpen && returnFocus) navToggle.focus();
    }

    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    mainNav.addEventListener('click', function (e) {
      if (e.target.closest('a') && mobileQuery.matches) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false, true);
        return;
      }
      if (e.key === 'Tab' && navToggle.getAttribute('aria-expanded') === 'true') {
        const focusable = [...mainNav.querySelectorAll('a[href]'), navToggle];
        const currentIndex = focusable.indexOf(document.activeElement);
        const nextIndex = e.shiftKey
          ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
          : (currentIndex < 0 || currentIndex === focusable.length - 1 ? 0 : currentIndex + 1);
        e.preventDefault();
        focusable[nextIndex].focus();
      }
    });
    const handleViewportChange = () => setMenu(false);
    if (typeof mobileQuery.addEventListener === 'function') mobileQuery.addEventListener('change', handleViewportChange);
    else mobileQuery.addListener(handleViewportChange);
    setMenu(false);
  }

  // Dark/light theme toggle
  (function () {
    const t = document.querySelector('[data-theme-toggle]');
    const r = document.documentElement;
    const colorQuery = matchMedia('(prefers-color-scheme: dark)');
    let d = colorQuery.matches ? 'dark' : 'light';
    if (r.getAttribute('data-theme')) d = r.getAttribute('data-theme');
    r.setAttribute('data-theme', d);
    function paint() {
      if (!t) return;
      t.setAttribute('aria-label', 'Switch to ' + (d === 'dark' ? 'light' : 'dark') + ' mode');
      t.innerHTML =
        d === 'dark'
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
    paint();
    if (t) {
      t.addEventListener('click', function () {
        d = d === 'dark' ? 'light' : 'dark';
        r.setAttribute('data-theme', d);
        try { localStorage.setItem('ags-theme', d); } catch (_error) {}
        paint();
      });
    }
    const handleColorChange = (event) => {
      let saved = null;
      try { saved = localStorage.getItem('ags-theme'); } catch (_error) {}
      if (saved === 'dark' || saved === 'light') return;
      d = event.matches ? 'dark' : 'light';
      r.setAttribute('data-theme', d);
      paint();
    };
    if (typeof colorQuery.addEventListener === 'function') colorQuery.addEventListener('change', handleColorChange);
    else colorQuery.addListener(handleColorChange);
  })();

  // Keep the device-saved pickup-list count visible across pages.
  function updateCartBadge() {
    const countEl = document.getElementById('cart-count');
    const linkEl = document.getElementById('cart-link');
    if (!countEl || !window.AGSCart) return;
    const count = window.AGSCart.count();
    countEl.textContent = String(count);
    countEl.hidden = count === 0;
    if (linkEl) linkEl.setAttribute('aria-label', 'View saved pickup list, ' + count + (count === 1 ? ' item' : ' items'));
  }
  window.addEventListener('ags:cart-change', updateCartBadge);
  document.addEventListener('DOMContentLoaded', updateCartBadge);
  updateCartBadge();
})();
