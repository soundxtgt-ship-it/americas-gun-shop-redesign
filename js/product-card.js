/* product-card.js — renders a product card + sample-availability badge.
   Shared by the homepage featured rail and the shop listing grid. */

(function (global) {
  'use strict';

  const CATEGORY_ICONS = {
    handguns: '<path d="M2 12h13a3 3 0 0 0 3-3V7"/><path d="M15 8h5l2 4-2 1H15z"/><path d="M2 12v3a2 2 0 0 0 2 2h2"/>',
    'rifles-shotguns': '<path d="M2 18 18 6"/><path d="M14 4l6 4-3 4"/><path d="M4 20l2-4"/>',
    ammunition: '<rect x="7" y="2" width="10" height="20" rx="4"/><path d="M7 9h10"/>',
    'optics-accessories': '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    'nfa-suppressors': '<path d="M3 12l3-3h12l3 3-3 3H6z"/><path d="M6 9v6M18 9v6"/>',
    'used-consignment': '<path d="M17 2l4 4-4 4"/><path d="M3 12v-2a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 12v2a4 4 0 0 1-4 4H3"/>',
  };

  function stockBadge(product) {
    if (product.stock === 0) {
      return '<span class="badge badge-out">Sample: unavailable</span>';
    }
    if (product.stock <= 3) {
      return '<span class="badge badge-low"><span class="dot"></span>Sample: ' + product.stock + ' available</span>';
    }
    return '<span class="badge badge-live"><span class="dot"></span>Sample: ' + product.stock + ' available</span>';
  }

  function card(product, rootPath) {
    const root = rootPath || './';
    const icon = CATEGORY_ICONS[product.category] || '';
    const isRegulated = window.AGS.isRegulated(product);
    const escapeHTML = window.AGSUtils.escapeHTML;
    const escapeAttr = window.AGSUtils.escapeAttr;
    const safeId = escapeAttr(product.id);
    const safeName = escapeHTML(product.name);
    const safeNameAttr = escapeAttr(product.name);
    const safeBrand = escapeHTML(product.brand);
    const safeCaliber = product.caliber ? escapeHTML(product.caliber) : '';
    const conditionBadge = product.condition === 'used'
      ? '<span class="badge badge-used">Used</span>'
      : '<span class="badge badge-new">New</span>';

    return `
      <article class="product-card" data-product-id="${safeId}">
        <a class="product-card-media" href="${root}pages/product.html?id=${encodeURIComponent(product.id)}" aria-label="View details for ${safeNameAttr}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">${icon}</svg>
        </a>
        <div class="product-card-body">
          <div class="product-card-top">
            ${conditionBadge}
            ${product.category === 'nfa-suppressors' && isRegulated ? '<span class="badge badge-nfa">NFA item</span>' : ''}
          </div>
          <a class="product-card-title" href="${root}pages/product.html?id=${encodeURIComponent(product.id)}">${safeName}</a>
          <p class="product-card-meta">${safeBrand}${safeCaliber ? ' &middot; ' + safeCaliber : ''}</p>
          <div class="product-card-price-row">
            <span class="product-card-price tabular">${window.AGS.formatPrice(product.price)}</span>
          </div>
          <div class="product-card-stock-row">
            ${stockBadge(product)}
            <span class="sync-note">Confirm with shop</span>
          </div>
          ${product.stock === 0
            ? '<button class="btn btn-secondary btn-block btn-sm" type="button" disabled>Currently unavailable</button>'
            : isRegulated
              ? `<a class="btn btn-secondary btn-block btn-sm" href="${root}pages/product.html?id=${encodeURIComponent(product.id)}">View pickup details</a>`
              : `<button class="btn btn-primary btn-block btn-sm" type="button" data-add-to-cart="${safeId}">Save to pickup list</button>`}
        </div>
      </article>
    `;
  }

  global.AGSProductCard = { render: card, stockBadge, CATEGORY_ICONS };
})(window);
