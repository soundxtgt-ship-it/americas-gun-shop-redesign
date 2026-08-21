/* shop.js — inventory browsing: filters, sort, search, cart panel */

document.addEventListener('DOMContentLoaded', function () {
  const grid = document.getElementById('shop-product-grid');
  const emptyState = document.getElementById('shop-empty-state');
  const resultsCount = document.getElementById('results-count');
  const pillsWrap = document.getElementById('active-filter-pills');
  const searchInput = document.getElementById('shop-search');
  const sortSelect = document.getElementById('shop-sort');
  const priceMin = document.getElementById('price-min');
  const priceMax = document.getElementById('price-max');
  const inStockOnly = document.getElementById('filter-in-stock');
  const categoryFilterWrap = document.getElementById('filter-category');
  const brandFilterWrap = document.getElementById('filter-brand');
  const caliberFilterWrap = document.getElementById('filter-caliber');

  const params = new URLSearchParams(window.location.search);

  const state = {
    categories: params.get('cat') ? [params.get('cat')] : [],
    conditions: [],
    brands: [],
    calibers: [],
    priceMin: null,
    priceMax: null,
    inStockOnly: false,
    query: '',
    sort: 'relevance',
    view: 'grid',
  };

  // ---- Build filter option lists ----
  function renderCategoryFilters() {
    categoryFilterWrap.innerHTML = window.AGS.CATEGORIES.map((cat) => {
      const count = window.AGS.PRODUCTS.filter((p) => p.category === cat.id).length;
      const checked = state.categories.includes(cat.id) ? 'checked' : '';
      return `<label class="checkbox-field checkbox-field--compact">
        <input type="checkbox" name="category" value="${cat.id}" ${checked} />
        <span>${cat.label}</span>
        <span class="filter-count">${count}</span>
      </label>`;
    }).join('');
  }

  function renderBrandFilters() {
    const brands = window.AGS.BRANDS.slice().sort();
    brandFilterWrap.innerHTML = brands.map((b) => {
      const checked = state.brands.includes(b) ? 'checked' : '';
      return `<label class="checkbox-field checkbox-field--compact">
        <input type="checkbox" name="brand" value="${b}" ${checked} /><span>${b}</span>
      </label>`;
    }).join('');
  }

  function renderCaliberFilters() {
    const calibers = Array.from(new Set(window.AGS.PRODUCTS.map((p) => p.caliber).filter(Boolean))).sort();
    caliberFilterWrap.innerHTML = calibers.map((c) => {
      const checked = state.calibers.includes(c) ? 'checked' : '';
      return `<label class="checkbox-field checkbox-field--compact">
        <input type="checkbox" name="caliber" value="${c}" ${checked} /><span>${c}</span>
      </label>`;
    }).join('');
  }

  renderCategoryFilters();
  renderBrandFilters();
  renderCaliberFilters();

  // ---- Filtering / sorting ----
  function getFiltered() {
    let list = window.AGS.PRODUCTS.slice();

    if (state.categories.length) list = list.filter((p) => state.categories.includes(p.category));
    if (state.conditions.length) list = list.filter((p) => state.conditions.includes(p.condition));
    if (state.brands.length) list = list.filter((p) => state.brands.includes(p.brand));
    if (state.calibers.length) list = list.filter((p) => p.caliber && state.calibers.includes(p.caliber));
    if (state.priceMin !== null) list = list.filter((p) => p.price >= state.priceMin);
    if (state.priceMax !== null) list = list.filter((p) => p.price <= state.priceMax);
    if (state.inStockOnly) list = list.filter((p) => p.stock > 0);
    if (state.query.trim()) {
      const q = state.query.trim().toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.caliber && p.caliber.toLowerCase().includes(q)) ||
        window.AGS.categoryLabel(p.category).toLowerCase().includes(q)
      );
    }

    switch (state.sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'name-asc': list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'stock-desc': list.sort((a, b) => b.stock - a.stock); break;
      case 'rating-desc': list.sort((a, b) => Number(b.rating) - Number(a.rating)); break;
      default: break; // relevance = catalog order
    }
    return list;
  }

  function renderPills() {
    const pills = [];
    state.categories.forEach((c) => pills.push({ label: window.AGS.categoryLabel(c), clear: () => { state.categories = state.categories.filter((x) => x !== c); } }));
    state.conditions.forEach((c) => pills.push({ label: c === 'new' ? 'New' : 'Used', clear: () => { state.conditions = state.conditions.filter((x) => x !== c); } }));
    state.brands.forEach((b) => pills.push({ label: b, clear: () => { state.brands = state.brands.filter((x) => x !== b); } }));
    state.calibers.forEach((c) => pills.push({ label: c, clear: () => { state.calibers = state.calibers.filter((x) => x !== c); } }));
    if (state.priceMin !== null || state.priceMax !== null) {
      pills.push({ label: `$${state.priceMin ?? 0}–$${state.priceMax ?? '∞'}`, clear: () => { state.priceMin = null; state.priceMax = null; priceMin.value = ''; priceMax.value = ''; } });
    }
    if (state.inStockOnly) pills.push({ label: 'In stock only', clear: () => { state.inStockOnly = false; inStockOnly.checked = false; } });

    if (!pills.length) {
      pillsWrap.innerHTML = '';
      return;
    }
    pillsWrap.innerHTML = pills.map((p, i) => `
      <span class="filter-pill" data-pill-index="${i}">
        ${p.label}
        <button type="button" aria-label="Remove filter ${p.label}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </span>
    `).join('');
    pillsWrap.querySelectorAll('button').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        pills[i].clear();
        syncFilterInputs();
        render();
      });
    });
  }

  function syncFilterInputs() {
    categoryFilterWrap.querySelectorAll('input').forEach((el) => { el.checked = state.categories.includes(el.value); });
    brandFilterWrap.querySelectorAll('input').forEach((el) => { el.checked = state.brands.includes(el.value); });
    caliberFilterWrap.querySelectorAll('input').forEach((el) => { el.checked = state.calibers.includes(el.value); });
    document.querySelectorAll('input[name="condition"]').forEach((el) => { el.checked = state.conditions.includes(el.value); });
  }

  function render() {
    const filtered = getFiltered();
    grid.innerHTML = filtered.map((p) => window.AGSProductCard.render(p, '../')).join('');
    grid.classList.toggle('is-list-view', state.view === 'list');
    emptyState.hidden = filtered.length !== 0;
    resultsCount.textContent = `Showing ${filtered.length} of ${window.AGS.PRODUCTS.length} products`;
    renderPills();
  }

  // ---- Event wiring ----
  categoryFilterWrap.addEventListener('change', (e) => {
    const val = e.target.value;
    state.categories = e.target.checked ? [...state.categories, val] : state.categories.filter((c) => c !== val);
    render();
  });
  brandFilterWrap.addEventListener('change', (e) => {
    const val = e.target.value;
    state.brands = e.target.checked ? [...state.brands, val] : state.brands.filter((b) => b !== val);
    render();
  });
  caliberFilterWrap.addEventListener('change', (e) => {
    const val = e.target.value;
    state.calibers = e.target.checked ? [...state.calibers, val] : state.calibers.filter((c) => c !== val);
    render();
  });
  document.querySelectorAll('input[name="condition"]').forEach((el) => {
    el.addEventListener('change', (e) => {
      const val = e.target.value;
      state.conditions = e.target.checked ? [...state.conditions, val] : state.conditions.filter((c) => c !== val);
      render();
    });
  });
  priceMin.addEventListener('input', () => { state.priceMin = priceMin.value ? Number(priceMin.value) : null; render(); });
  priceMax.addEventListener('input', () => { state.priceMax = priceMax.value ? Number(priceMax.value) : null; render(); });
  inStockOnly.addEventListener('change', () => { state.inStockOnly = inStockOnly.checked; render(); });

  let searchDebounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => { state.query = searchInput.value; render(); }, 150);
  });

  sortSelect.addEventListener('change', () => { state.sort = sortSelect.value; render(); });

  document.querySelectorAll('.view-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.view = btn.getAttribute('data-view');
      document.querySelectorAll('.view-toggle-btn').forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      render();
    });
  });

  function clearAll() {
    state.categories = [];
    state.conditions = [];
    state.brands = [];
    state.calibers = [];
    state.priceMin = null;
    state.priceMax = null;
    state.inStockOnly = false;
    state.query = '';
    searchInput.value = '';
    priceMin.value = '';
    priceMax.value = '';
    inStockOnly.checked = false;
    syncFilterInputs();
    render();
  }
  document.getElementById('clear-filters').addEventListener('click', clearAll);
  document.getElementById('empty-clear-filters').addEventListener('click', clearAll);

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-to-cart]');
    if (!btn) return;
    const product = window.AGS.getProduct(btn.getAttribute('data-add-to-cart'));
    if (!product) return;
    window.AGSCart.add(product, 1);
    const original = btn.textContent;
    btn.textContent = 'Added ✓';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1200);
    renderCartPanel();
  });

  render();

  // ---- Cart panel ----
  const cartItemsEl = document.getElementById('cart-items');
  const cartEmptyEl = document.getElementById('cart-empty-state');
  const cartFooterEl = document.getElementById('cart-panel-footer');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartPanelCountEl = document.getElementById('cart-panel-count');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  function renderCartPanel() {
    const items = window.AGSCart.items();
    cartPanelCountEl.textContent = `(${window.AGSCart.count()})`;
    if (!items.length) {
      cartItemsEl.innerHTML = '';
      cartEmptyEl.hidden = false;
      cartFooterEl.hidden = true;
      return;
    }
    cartEmptyEl.hidden = true;
    cartFooterEl.hidden = false;
    cartItemsEl.innerHTML = items.map((item) => `
      <div class="cart-item" data-cart-item="${item.id}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${item.id}</p>
        </div>
        <div class="cart-item-controls">
          <div class="qty-stepper">
            <button type="button" data-qty-decrease aria-label="Decrease quantity of ${item.name}">&minus;</button>
            <span>${item.qty}</span>
            <button type="button" data-qty-increase aria-label="Increase quantity of ${item.name}">+</button>
          </div>
          <span class="cart-item-price tabular">${window.AGS.formatPrice(item.price * item.qty)}</span>
          <button type="button" class="cart-item-remove" data-remove aria-label="Remove ${item.name} from cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>
      </div>
    `).join('');
    cartSubtotalEl.textContent = window.AGS.formatPrice(window.AGSCart.subtotal());
  }

  cartItemsEl.addEventListener('click', (e) => {
    const row = e.target.closest('[data-cart-item]');
    if (!row) return;
    const id = row.getAttribute('data-cart-item');
    const items = window.AGSCart.items();
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (e.target.closest('[data-qty-increase]')) window.AGSCart.setQty(id, item.qty + 1);
    else if (e.target.closest('[data-qty-decrease]')) window.AGSCart.setQty(id, item.qty - 1);
    else if (e.target.closest('[data-remove]')) window.AGSCart.remove(id);
  });

  checkoutBtn.addEventListener('click', () => {
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Processing…';
    setTimeout(() => {
      window.AGSCart.clear();
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = 'Checkout (mock)';
      const successEl = document.createElement('div');
      successEl.className = 'form-success is-visible checkout-success is-visible';
      successEl.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
        <div><strong>Order placed (mock).</strong> This is a design demo &mdash; no real payment was processed. In a live build, non-regulated items ship or hold for pickup; firearms always require an in-store visit.</div>
      `;
      cartFooterEl.after(successEl);
      setTimeout(() => successEl.remove(), 6000);
    }, 900);
  });

  window.addEventListener('ags:cart-change', renderCartPanel);
  renderCartPanel();

  if (window.location.hash === '#cart') {
    document.getElementById('cart').scrollIntoView({ behavior: 'smooth' });
  }
});
