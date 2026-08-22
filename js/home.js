/* home.js — homepage-specific rendering: category grid + featured products */

document.addEventListener('DOMContentLoaded', function () {
  const CATEGORY_COPY = {
    handguns: 'Compacts, carry pistols, and duty sidearms.',
    'rifles-shotguns': 'Bolt guns, ARs, pumps, and field shotguns.',
    ammunition: 'Range and defensive loads in common calibers.',
    'optics-accessories': 'Scopes, holsters, lights, cleaning gear.',
    'nfa-suppressors': 'Suppressors, mounts, and related sample listings.',
    'used-consignment': 'Sample trade-in and consignment listings.',
  };

  const categoryGrid = document.getElementById('category-grid');
  if (categoryGrid) {
    categoryGrid.innerHTML = window.AGS.CATEGORIES.map((cat) => {
      const count = window.AGS.PRODUCTS.filter((p) => p.category === cat.id && p.stock > 0).length;
      const icon = window.AGSProductCard.CATEGORY_ICONS[cat.id];
      return `
        <a class="category-card" href="./pages/shop.html?cat=${cat.id}">
          <svg class="category-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">${icon}</svg>
          <h3>${window.AGSUtils.escapeHTML(cat.label)}</h3>
          <p>${CATEGORY_COPY[cat.id]}</p>
          <span class="category-card-count">
            <span>${count} sample listings</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </span>
        </a>
      `;
    }).join('');
  }

  const featuredEl = document.getElementById('featured-products');
  if (featuredEl) {
    // Choose one representative sample per category for variety.
    const seen = new Set();
    const featured = window.AGS.PRODUCTS
      .filter((p) => {
        if (seen.has(p.category)) return false;
        seen.add(p.category);
        return true;
      })
      .slice(0, 6);
    featuredEl.innerHTML = featured.map((p) => window.AGSProductCard.render(p, './')).join('');

    featuredEl.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-add-to-cart]');
      if (!btn) return;
      const product = window.AGS.getProduct(btn.getAttribute('data-add-to-cart'));
      if (!product) return;
      const result = window.AGSCart.add(product, 1);
      if (!result.ok) return;
      const original = btn.textContent;
      btn.textContent = 'Saved ✓';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 1200);
    });
  }
});
