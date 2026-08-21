/* product.js — product detail page rendering */

document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const product = window.AGS.getProduct(id) || window.AGS.PRODUCTS[0];
  const root = document.getElementById('product-detail-root');
  const breadcrumb = document.getElementById('product-breadcrumb');
  const icon = window.AGSProductCard.CATEGORY_ICONS[product.category] || '';
  const isRegulated = window.AGS.isRegulated(product.category);
  const catLabel = window.AGS.categoryLabel(product.category);

  breadcrumb.innerHTML = `
    <a href="../index.html">Home</a>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
    <a href="./shop.html">Shop</a>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
    <a href="./shop.html?cat=${product.category}">${catLabel}</a>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
    <span aria-current="page">${product.name}</span>
  `;

  function stockDetail() {
    if (product.stock === 0) {
      return `<div class="stock-panel stock-panel--out">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
        <div><strong>Out of stock</strong><span>Last synced ${product.syncMinutes} min ago from in-store POS. Check back soon or call the shop.</span></div>
      </div>`;
    }
    const urgency = product.stock <= 3 ? 'stock-panel--low' : 'stock-panel--live';
    const label = product.stock <= 3 ? 'Low stock' : 'Live stock — synced from in-store POS';
    return `<div class="stock-panel ${urgency}">
      <span class="dot"></span>
      <div><strong>${label}</strong><span>${product.stock} in stock &middot; last synced ${product.syncMinutes} min ago</span></div>
    </div>`;
  }

  function trendBadge() {
    const map = {
      up: { label: 'Trending up in-store', color: 'var(--color-success)' },
      down: { label: 'Selling down', color: 'var(--color-error)' },
      flat: { label: 'Steady demand', color: 'var(--color-text-faint)' },
    };
    const t = map[product.trend];
    return `<span class="trend-chip" style="color:${t.color}">${t.label}</span>`;
  }

  root.innerHTML = `
    <div class="container product-detail-grid">
      <div class="product-detail-media">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">${icon}</svg>
      </div>
      <div class="product-detail-info">
        <div class="product-detail-top-badges">
          <span class="badge ${product.condition === 'used' ? 'badge-used' : 'badge-new'}">${product.condition === 'used' ? 'Used' : 'New'}</span>
          ${product.category === 'nfa-suppressors' ? '<span class="badge badge-nfa">NFA item</span>' : ''}
          ${trendBadge()}
        </div>
        <h1>${product.name}</h1>
        <p class="product-detail-meta">${product.brand}${product.caliber ? ' &middot; ' + product.caliber : ''} &middot; SKU ${product.sku}</p>
        <div class="product-detail-rating">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01z"/></svg>
          <strong>${product.rating}</strong>
          <span>(${product.reviewCount} reviews)</span>
        </div>
        <p class="product-detail-price tabular">${window.AGS.formatPrice(product.price)}</p>

        ${stockDetail()}

        <div class="product-detail-actions">
          ${isRegulated
            ? `<button type="button" class="btn btn-primary btn-lg" id="reserve-btn" ${product.stock === 0 ? 'disabled' : ''}>Reserve &amp; complete in-store</button>
               <p class="hint product-detail-legal">Firearms and NFA items cannot ship directly to buyers. Reserving holds your item; final sale requires an in-person NICS/PA-PICS background check and ATF Form 4473 at our West Chester location.</p>`
            : `<div class="qty-add-row">
                 <div class="qty-stepper qty-stepper--lg">
                   <button type="button" id="detail-qty-decrease" aria-label="Decrease quantity">&minus;</button>
                   <span id="detail-qty">1</span>
                   <button type="button" id="detail-qty-increase" aria-label="Increase quantity">+</button>
                 </div>
                 <button type="button" class="btn btn-primary btn-lg" id="add-to-cart-btn" ${product.stock === 0 ? 'disabled' : ''}>Add to cart</button>
               </div>`}
        </div>

        <div id="reserve-success" class="form-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg><div><strong>Reserved.</strong> Bring valid PA-accepted ID to complete your NICS/PA-PICS check and ATF Form 4473 in-store. We'll hold this item for 48 hours.</div></div>

        <dl class="product-detail-specs">
          <div><dt>Category</dt><dd><a href="./shop.html?cat=${product.category}">${catLabel}</a></dd></div>
          <div><dt>Brand</dt><dd>${product.brand}</dd></div>
          ${product.caliber ? `<div><dt>Caliber</dt><dd>${product.caliber}</dd></div>` : ''}
          <div><dt>Condition</dt><dd>${product.condition === 'used' ? 'Used — inspected' : 'New'}</dd></div>
          <div><dt>SKU</dt><dd>${product.sku}</dd></div>
        </dl>

        <div class="compliance-note">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4.5 8-11.8A8 8 0 0 0 4 10.2C4 17.5 12 22 12 22z"/><path d="m9 11 2 2 4-4"/></svg>
          <p>Must be 21+ to purchase handguns and ammunition, 18+ for long guns, with valid PA-accepted ID. We reserve the right to refuse any sale. See our <a href="./about.html#compliance">compliance &amp; licensing</a> page for details.</p>
        </div>
      </div>
    </div>
  `;

  // Non-regulated add-to-cart interactions
  const qtyEl = document.getElementById('detail-qty');
  const decBtn = document.getElementById('detail-qty-decrease');
  const incBtn = document.getElementById('detail-qty-increase');
  const addBtn = document.getElementById('add-to-cart-btn');
  let qty = 1;
  if (decBtn) decBtn.addEventListener('click', () => { qty = Math.max(1, qty - 1); qtyEl.textContent = qty; });
  if (incBtn) incBtn.addEventListener('click', () => { qty = qty + 1; qtyEl.textContent = qty; });
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      window.AGSCart.add(product, qty);
      addBtn.textContent = 'Added ✓';
      setTimeout(() => { addBtn.textContent = 'Add to cart'; }, 1200);
    });
  }
  const reserveBtn = document.getElementById('reserve-btn');
  const reserveSuccess = document.getElementById('reserve-success');
  if (reserveBtn) {
    reserveBtn.addEventListener('click', () => {
      reserveBtn.disabled = true;
      reserveBtn.textContent = 'Reserved ✓';
      reserveSuccess.classList.add('is-visible');
    });
  }

  // Related products
  const relatedEl = document.getElementById('related-products');
  const related = window.AGS.PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  relatedEl.innerHTML = related.map((p) => window.AGSProductCard.render(p, '../')).join('');
  relatedEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-to-cart]');
    if (!btn) return;
    const prod = window.AGS.getProduct(btn.getAttribute('data-add-to-cart'));
    if (!prod) return;
    window.AGSCart.add(prod, 1);
    btn.textContent = 'Added ✓';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = 'Add to cart'; btn.disabled = false; }, 1200);
  });

  document.title = `${product.name} | America's Gun Shop`;
});
