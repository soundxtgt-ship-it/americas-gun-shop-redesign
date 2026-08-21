/* product-card.js — renders a product card + live-stock badge.
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
      return '<span class="badge badge-out">Out of stock</span>';
    }
    if (product.stock <= 3) {
      return '<span class="badge badge-low"><span class="dot" style="background:currentColor;width:6px;height:6px;border-radius:50%;"></span>Only ' + product.stock + ' left</span>';
    }
    return '<span class="badge badge-live"><span class="dot"></span>' + product.stock + ' in stock</span>';
  }

  function trendIcon(trend) {
    if (trend === 'up') return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
    if (trend === 'down') return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M7 7l10 10M9 17H17V9"/></svg>';
    return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M5 12h14"/></svg>';
  }

  function card(product, rootPath) {
    const root = rootPath || './';
    const icon = CATEGORY_ICONS[product.category] || '';
    const isRegulated = window.AGS.isRegulated(product.category);
    const conditionBadge = product.condition === 'used'
      ? '<span class="badge badge-used">Used</span>'
      : '<span class="badge badge-new">New</span>';
    const trendColor = product.trend === 'up' ? 'var(--color-success)' : product.trend === 'down' ? 'var(--color-error)' : 'var(--color-text-faint)';

    return `
      <article class="product-card" data-product-id="${product.id}">
        <a class="product-card-media" href="${root}pages/product.html?id=${product.id}" aria-label="View details for ${product.name}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">${icon}</svg>
        </a>
        <div class="product-card-body">
          <div class="product-card-top">
            ${conditionBadge}
            ${product.category === 'nfa-suppressors' ? '<span class="badge badge-nfa">NFA item</span>' : ''}
          </div>
          <a class="product-card-title" href="${root}pages/product.html?id=${product.id}">${product.name}</a>
          <p class="product-card-meta">${product.brand}${product.caliber ? ' &middot; ' + product.caliber : ''}</p>
          <div class="product-card-price-row">
            <span class="product-card-price tabular">${window.AGS.formatPrice(product.price)}</span>
            <span class="product-card-rating" aria-label="Rated ${product.rating} out of 5 from ${product.reviewCount} reviews">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01z"/></svg>
              ${product.rating}
            </span>
          </div>
          <div class="product-card-stock-row">
            ${stockBadge(product)}
            <span class="sync-note" style="color:${trendColor}">${trendIcon(product.trend)} synced ${product.syncMinutes}m ago</span>
          </div>
          ${isRegulated
            ? `<a class="btn btn-secondary btn-block btn-sm" href="${root}pages/product.html?id=${product.id}">Reserve &amp; complete in-store</a>`
            : `<button class="btn btn-primary btn-block btn-sm" type="button" data-add-to-cart="${product.id}">Add to cart</button>`}
        </div>
      </article>
    `;
  }

  global.AGSProductCard = { render: card, stockBadge, CATEGORY_ICONS };
})(window);
