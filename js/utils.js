/* utils.js — shared escaping, validation, and external destinations. */

(function (global) {
  'use strict';

  const OFFICIAL_SHOP_URL = 'https://shop.americasgunshop.us/';
  const OFFICIAL_CONTACT_URL = 'https://shop.americasgunshop.us/contact-us';

  function escapeHTML(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeInteger(value, fallback = 0) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function focusStatus(element) {
    if (!element) return;
    element.classList.add('is-visible');
    element.setAttribute('tabindex', '-1');
    element.focus({ preventScroll: true });
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  global.AGSUtils = {
    OFFICIAL_SHOP_URL,
    OFFICIAL_CONTACT_URL,
    escapeHTML,
    escapeAttr: escapeHTML,
    safeInteger,
    focusStatus,
  };
})(window);
