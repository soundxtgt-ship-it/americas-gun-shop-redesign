/* product.js — safe product-detail rendering for the catalog preview. */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  const root = document.getElementById('product-detail-root');
  const breadcrumb = document.getElementById('product-breadcrumb');
  const relatedEl = document.getElementById('related-products');
  if (!root || !breadcrumb || !relatedEl || !window.AGS || !window.AGSUtils) return;

  const escapeHTML = window.AGSUtils.escapeHTML;
  const escapeAttr = window.AGSUtils.escapeAttr;
  const id = new URLSearchParams(window.location.search).get('id');
  const product = id ? window.AGS.getProduct(id) : null;

  if (!product) {
    breadcrumb.innerHTML = '<a href="../index.html">Home</a><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg><a href="./shop.html">Catalog preview</a><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg><span aria-current="page">Not found</span>';
    root.innerHTML = '<div class="container"><div class="empty-state"><h1>Product not found</h1><p>This sample listing may have changed or the link may be incomplete.</p><a class="btn btn-primary" href="./shop.html">Return to catalog preview</a></div></div>';
    relatedEl.closest('section').hidden = true;
    document.title = "Product Not Found | America's Gun Shop";
    return;
  }

  const icon = window.AGSProductCard.CATEGORY_ICONS[product.category] || '';
  const isRegulated = window.AGS.isRegulated(product);
  const catLabel = window.AGS.categoryLabel(product.category);
  const safe = {
    name: escapeHTML(product.name),
    brand: escapeHTML(product.brand),
    caliber: product.caliber ? escapeHTML(product.caliber) : '',
    sku: escapeHTML(product.sku),
    categoryLabel: escapeHTML(catLabel),
  };

  breadcrumb.innerHTML = `
    <a href="../index.html">Home</a>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
    <a href="./shop.html">Catalog preview</a>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
    <a href="./shop.html?cat=${encodeURIComponent(product.category)}">${safe.categoryLabel}</a>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
    <span aria-current="page">${safe.name}</span>`;

  function availabilityDetail() {
    if (product.stock === 0) {
      return '<div class="stock-panel stock-panel--out"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg><div><strong>Unavailable in this sample</strong><span>Call or use the official online store to check current inventory.</span></div></div>';
    }
    const urgency = product.stock <= 3 ? 'stock-panel--low' : 'stock-panel--live';
    return `<div class="stock-panel ${urgency}"><span class="dot"></span><div><strong>Sample availability: ${product.stock}</strong><span>This preview is not connected to the store's point-of-sale system.</span></div></div>`;
  }

  root.innerHTML = `
    <div class="container product-detail-grid">
      <div class="product-detail-media">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">${icon}</svg>
      </div>
      <div class="product-detail-info">
        <div class="product-detail-top-badges">
          <span class="badge ${product.condition === 'used' ? 'badge-used' : 'badge-new'}">${product.condition === 'used' ? 'Used' : 'New'}</span>
          ${product.category === 'nfa-suppressors' && isRegulated ? '<span class="badge badge-nfa">NFA item</span>' : ''}
        </div>
        <h1>${safe.name}</h1>
        <p class="product-detail-meta">${safe.brand}${safe.caliber ? ' &middot; ' + safe.caliber : ''} &middot; SKU ${safe.sku}</p>
        <p class="product-detail-price tabular">${window.AGS.formatPrice(product.price)}</p>
        <p class="hint">Sample price only. Confirm current price and availability before visiting.</p>

        ${availabilityDetail()}

        <div class="product-detail-actions">
          ${isRegulated
            ? `<a class="btn btn-primary btn-lg" href="tel:+16105560223">Call to confirm availability</a>
               <p class="hint product-detail-legal">No item is reserved through this preview. Firearm and regulated-item transactions are completed in person after all applicable identity, paperwork, background-check, and transfer requirements are satisfied.</p>`
            : `<div class="qty-add-row">
                 <div class="qty-stepper qty-stepper--lg">
                   <button type="button" id="detail-qty-decrease" aria-label="Decrease quantity" disabled>&minus;</button>
                   <span id="detail-qty" aria-live="polite">1</span>
                   <button type="button" id="detail-qty-increase" aria-label="Increase quantity" ${product.stock <= 1 ? 'disabled' : ''}>+</button>
                 </div>
                 <button type="button" class="btn btn-primary btn-lg" id="add-to-cart-btn" ${product.stock === 0 ? 'disabled' : ''}>Save to pickup list</button>
               </div>`}
        </div>

        <dl class="product-detail-specs">
          <div><dt>Category</dt><dd><a href="./shop.html?cat=${encodeURIComponent(product.category)}">${safe.categoryLabel}</a></dd></div>
          <div><dt>Brand</dt><dd>${safe.brand}</dd></div>
          ${safe.caliber ? `<div><dt>Caliber</dt><dd>${safe.caliber}</dd></div>` : ''}
          <div><dt>Condition</dt><dd>${product.condition === 'used' ? 'Used — inspect in store' : 'New'}</dd></div>
          <div><dt>Sample SKU</dt><dd>${safe.sku}</dd></div>
        </dl>

        <div class="compliance-note">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4.5 8-11.8A8 8 0 0 0 4 10.2C4 17.5 12 22 12 22z"/><path d="m9 11 2 2 4-4"/></svg>
          <p>Minimum ages and eligibility rules depend on the product and applicable law. Bring valid government-issued identification. The shop may refuse a transaction. See <a href="./about.html#compliance">compliance and licensing</a> for details.</p>
        </div>
      </div>
    </div>`;

  const qtyEl = document.getElementById('detail-qty');
  const decBtn = document.getElementById('detail-qty-decrease');
  const incBtn = document.getElementById('detail-qty-increase');
  const addBtn = document.getElementById('add-to-cart-btn');
  let qty = 1;

  function syncQuantity() {
    if (!qtyEl) return;
    qtyEl.textContent = String(qty);
    decBtn.disabled = qty <= 1;
    incBtn.disabled = qty >= product.stock;
  }
  if (decBtn) decBtn.addEventListener('click', () => { qty = Math.max(1, qty - 1); syncQuantity(); });
  if (incBtn) incBtn.addEventListener('click', () => { qty = Math.min(product.stock, qty + 1); syncQuantity(); });
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const result = window.AGSCart.add(product, qty);
      if (!result.ok) return;
      addBtn.textContent = 'Saved ✓';
      addBtn.disabled = true;
      setTimeout(() => { addBtn.textContent = 'Save to pickup list'; addBtn.disabled = product.stock === 0; }, 1200);
    });
  }

  const related = window.AGS.PRODUCTS.filter((candidate) => candidate.category === product.category && candidate.id !== product.id).slice(0, 4);
  relatedEl.innerHTML = related.map((candidate) => window.AGSProductCard.render(candidate, '../')).join('');
  relatedEl.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add-to-cart]');
    if (!button) return;
    const relatedProduct = window.AGS.getProduct(button.getAttribute('data-add-to-cart'));
    const result = window.AGSCart.add(relatedProduct, 1);
    if (!result.ok) return;
    button.textContent = 'Saved ✓';
    button.disabled = true;
    setTimeout(() => { button.textContent = 'Save to pickup list'; button.disabled = false; }, 1200);
  });

  document.title = `${product.name} | America's Gun Shop`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = `Preview ${product.name} at America's Gun Shop. Confirm current price and availability with the West Chester store.`;
});
