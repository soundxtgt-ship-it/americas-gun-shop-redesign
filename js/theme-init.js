/* theme-init.js — applies a saved theme before styles paint. */

(function () {
  'use strict';
  try {
    const saved = localStorage.getItem('ags-theme');
    const theme = saved === 'dark' || saved === 'light'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (_error) {
    // Storage can be unavailable in privacy modes and sandboxed embeds.
  }
})();
