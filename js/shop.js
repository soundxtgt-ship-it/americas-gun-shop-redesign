/* shop.js — catalog filtering and a device-local pickup list. */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  const grid = document.getElementById('shop-product-grid');
  if (!grid || !window.AGS || !window.AGSCart) return;

  const escapeHTML = window.AGSUtils.escapeHTML;
  const escapeAttr = window.AGSUtils.escapeAttr;
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

  const validCategories = new Set(window.AGS.CATEGORIES.map((category) => category.id));
  const validBrands = new Set(window.AGS.BRANDS);
  const availableCalibers = Array.from(new Set(window.AGS.PRODUCTS.map((product) => product.caliber).filter(Boolean))).sort();
  const validCalibers = new Set(availableCalibers);
  const validSorts = new Set(['relevance', 'price-asc', 'price-desc', 'name-asc', 'stock-desc']);

  function validNumber(value) {
    if (value === null || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : null;
  }

  const requestedCategories = params.getAll('cat');
  const state = {
    categories: requestedCategories.filter((value) => validCategories.has(value)),
    conditions: params.getAll('condition').filter((value) => value === 'new' || value === 'used'),
    brands: params.getAll('brand').filter((value) => validBrands.has(value)),
    calibers: params.getAll('caliber').filter((value) => validCalibers.has(value)),
    priceMin: validNumber(params.get('min')),
    priceMax: validNumber(params.get('max')),
    inStockOnly: params.get('stock') === '1',
    query: (params.get('q') || '').slice(0, 100),
    sort: validSorts.has(params.get('sort')) ? params.get('sort') : 'relevance',
    view: params.get('view') === 'list' ? 'list' : 'grid',
  };

  function renderCategoryFilters() {
    categoryFilterWrap.innerHTML = window.AGS.CATEGORIES.map((category) => {
      const count = window.AGS.PRODUCTS.filter((product) => product.category === category.id).length;
      return `<label class="checkbox-field checkbox-field--compact">
        <input type="checkbox" name="category" value="${escapeAttr(category.id)}" ${state.categories.includes(category.id) ? 'checked' : ''} />
        <span>${escapeHTML(category.label)}</span>
        <span class="filter-count">${count}</span>
      </label>`;
    }).join('');
  }

  function renderBrandFilters() {
    brandFilterWrap.innerHTML = [...validBrands].sort().map((brand) => `
      <label class="checkbox-field checkbox-field--compact">
        <input type="checkbox" name="brand" value="${escapeAttr(brand)}" ${state.brands.includes(brand) ? 'checked' : ''} />
        <span>${escapeHTML(brand)}</span>
      </label>`).join('');
  }

  function renderCaliberFilters() {
    caliberFilterWrap.innerHTML = availableCalibers.map((caliber) => `
      <label class="checkbox-field checkbox-field--compact">
        <input type="checkbox" name="caliber" value="${escapeAttr(caliber)}" ${state.calibers.includes(caliber) ? 'checked' : ''} />
        <span>${escapeHTML(caliber)}</span>
      </label>`).join('');
  }

  function getFiltered() {
    let list = window.AGS.PRODUCTS.slice();
    if (state.categories.length) list = list.filter((product) => state.categories.includes(product.category));
    if (state.conditions.length) list = list.filter((product) => state.conditions.includes(product.condition));
    if (state.brands.length) list = list.filter((product) => state.brands.includes(product.brand));
    if (state.calibers.length) list = list.filter((product) => product.caliber && state.calibers.includes(product.caliber));
    if (state.priceMin !== null) list = list.filter((product) => product.price >= state.priceMin);
    if (state.priceMax !== null) list = list.filter((product) => product.price <= state.priceMax);
    if (state.inStockOnly) list = list.filter((product) => product.stock > 0);

    const query = state.query.trim().toLowerCase();
    if (query) {
      list = list.filter((product) =>
        product.name.toLowerCase().includes(query)
        || product.brand.toLowerCase().includes(query)
        || (product.caliber && product.caliber.toLowerCase().includes(query))
        || window.AGS.categoryLabel(product.category).toLowerCase().includes(query)
      );
    }

    switch (state.sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'name-asc': list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'stock-desc': list.sort((a, b) => b.stock - a.stock); break;
      default: break;
    }
    return list;
  }

  function syncURL() {
    try {
      const url = new URL(window.location.href);
      url.search = '';
      state.categories.forEach((value) => url.searchParams.append('cat', value));
      state.conditions.forEach((value) => url.searchParams.append('condition', value));
      state.brands.forEach((value) => url.searchParams.append('brand', value));
      state.calibers.forEach((value) => url.searchParams.append('caliber', value));
      if (state.priceMin !== null) url.searchParams.set('min', String(state.priceMin));
      if (state.priceMax !== null) url.searchParams.set('max', String(state.priceMax));
      if (state.inStockOnly) url.searchParams.set('stock', '1');
      if (state.query.trim()) url.searchParams.set('q', state.query.trim());
      if (state.sort !== 'relevance') url.searchParams.set('sort', state.sort);
      if (state.view !== 'grid') url.searchParams.set('view', state.view);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (_error) {
      // file:// previews can restrict history updates.
    }
  }

  function renderPills() {
    const pills = [];
    state.categories.forEach((value) => pills.push({ label: window.AGS.categoryLabel(value), clear: () => { state.categories = state.categories.filter((item) => item !== value); } }));
    state.conditions.forEach((value) => pills.push({ label: value === 'new' ? 'New' : 'Used', clear: () => { state.conditions = state.conditions.filter((item) => item !== value); } }));
    state.brands.forEach((value) => pills.push({ label: value, clear: () => { state.brands = state.brands.filter((item) => item !== value); } }));
    state.calibers.forEach((value) => pills.push({ label: value, clear: () => { state.calibers = state.calibers.filter((item) => item !== value); } }));
    if (state.priceMin !== null || state.priceMax !== null) {
      pills.push({ label: `$${state.priceMin ?? 0}–$${state.priceMax ?? '∞'}`, clear: () => { state.priceMin = null; state.priceMax = null; priceMin.value = ''; priceMax.value = ''; } });
    }
    if (state.inStockOnly) pills.push({ label: 'In stock only', clear: () => { state.inStockOnly = false; inStockOnly.checked = false; } });

    pillsWrap.replaceChildren();
    pills.forEach((pill) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'filter-pill';
      wrapper.append(document.createTextNode(pill.label));
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Remove filter ${pill.label}`);
      button.textContent = '×';
      button.addEventListener('click', () => {
        pill.clear();
        syncFilterInputs();
        render();
      });
      wrapper.append(button);
      pillsWrap.append(wrapper);
    });
  }

  function syncFilterInputs() {
    categoryFilterWrap.querySelectorAll('input').forEach((input) => { input.checked = state.categories.includes(input.value); });
    brandFilterWrap.querySelectorAll('input').forEach((input) => { input.checked = state.brands.includes(input.value); });
    caliberFilterWrap.querySelectorAll('input').forEach((input) => { input.checked = state.calibers.includes(input.value); });
    document.querySelectorAll('input[name="condition"]').forEach((input) => { input.checked = state.conditions.includes(input.value); });
  }

  function render(options = {}) {
    const filtered = getFiltered();
    grid.innerHTML = filtered.map((product) => window.AGSProductCard.render(product, '../')).join('');
    grid.classList.toggle('is-list-view', state.view === 'list');
    emptyState.hidden = filtered.length !== 0;
    resultsCount.textContent = `Showing ${filtered.length} of ${window.AGS.PRODUCTS.length} sample products`;
    renderPills();
    if (options.syncURL !== false) syncURL();
  }

  function toggleValue(list, value, checked) {
    return checked ? Array.from(new Set([...list, value])) : list.filter((item) => item !== value);
  }

  renderCategoryFilters();
  renderBrandFilters();
  renderCaliberFilters();

  searchInput.value = state.query;
  sortSelect.value = state.sort;
  priceMin.value = state.priceMin ?? '';
  priceMax.value = state.priceMax ?? '';
  inStockOnly.checked = state.inStockOnly;
  document.querySelectorAll('.view-toggle-btn').forEach((button) => {
    const active = button.getAttribute('data-view') === state.view;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  syncFilterInputs();

  categoryFilterWrap.addEventListener('change', (event) => {
    if (!event.target.matches('input[type="checkbox"]')) return;
    state.categories = toggleValue(state.categories, event.target.value, event.target.checked);
    render();
  });
  brandFilterWrap.addEventListener('change', (event) => {
    if (!event.target.matches('input[type="checkbox"]')) return;
    state.brands = toggleValue(state.brands, event.target.value, event.target.checked);
    render();
  });
  caliberFilterWrap.addEventListener('change', (event) => {
    if (!event.target.matches('input[type="checkbox"]')) return;
    state.calibers = toggleValue(state.calibers, event.target.value, event.target.checked);
    render();
  });
  document.querySelectorAll('input[name="condition"]').forEach((input) => {
    input.addEventListener('change', (event) => {
      state.conditions = toggleValue(state.conditions, event.target.value, event.target.checked);
      render();
    });
  });
  priceMin.addEventListener('input', () => { state.priceMin = validNumber(priceMin.value); render(); });
  priceMax.addEventListener('input', () => { state.priceMax = validNumber(priceMax.value); render(); });
  inStockOnly.addEventListener('change', () => { state.inStockOnly = inStockOnly.checked; render(); });

  let searchDebounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => { state.query = searchInput.value.slice(0, 100); render(); }, 150);
  });
  sortSelect.addEventListener('change', () => { state.sort = validSorts.has(sortSelect.value) ? sortSelect.value : 'relevance'; render(); });

  document.querySelectorAll('.view-toggle-btn').forEach((button) => {
    button.addEventListener('click', () => {
      state.view = button.getAttribute('data-view') === 'list' ? 'list' : 'grid';
      document.querySelectorAll('.view-toggle-btn').forEach((candidate) => {
        const active = candidate === button;
        candidate.classList.toggle('is-active', active);
        candidate.setAttribute('aria-pressed', String(active));
      });
      render();
    });
  });

  function clearAll() {
    Object.assign(state, {
      categories: [], conditions: [], brands: [], calibers: [],
      priceMin: null, priceMax: null, inStockOnly: false, query: '', sort: 'relevance', view: 'grid',
    });
    searchInput.value = '';
    sortSelect.value = 'relevance';
    priceMin.value = '';
    priceMax.value = '';
    inStockOnly.checked = false;
    document.querySelectorAll('.view-toggle-btn').forEach((button) => {
      const active = button.getAttribute('data-view') === 'grid';
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    syncFilterInputs();
    render();
  }

  document.getElementById('clear-filters').addEventListener('click', clearAll);
  document.getElementById('empty-clear-filters').addEventListener('click', clearAll);

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add-to-cart]');
    if (!button) return;
    const product = window.AGS.getProduct(button.getAttribute('data-add-to-cart'));
    const result = window.AGSCart.add(product, 1);
    if (!result.ok) return;
    const original = button.textContent;
    button.textContent = 'Saved ✓';
    button.disabled = true;
    setTimeout(() => { button.textContent = original; button.disabled = false; }, 1200);
  });

  const cartItemsEl = document.getElementById('cart-items');
  const cartEmptyEl = document.getElementById('cart-empty-state');
  const cartFooterEl = document.getElementById('cart-panel-footer');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartPanelCountEl = document.getElementById('cart-panel-count');
  const clearListButton = document.getElementById('cart-clear-btn');

  function renderCartPanel() {
    const items = window.AGSCart.items();
    cartPanelCountEl.textContent = `(${window.AGSCart.count()})`;
    if (!items.length) {
      cartItemsEl.replaceChildren();
      cartEmptyEl.hidden = false;
      cartFooterEl.hidden = true;
      return;
    }
    cartEmptyEl.hidden = true;
    cartFooterEl.hidden = false;
    cartItemsEl.innerHTML = items.map((item) => `
      <div class="cart-item" data-cart-item="${escapeAttr(item.id)}">
        <div class="cart-item-info">
          <h4>${escapeHTML(item.name)}</h4>
          <p>${escapeHTML(item.id)} · ${item.maxQty} available in this sample</p>
        </div>
        <div class="cart-item-controls">
          <div class="qty-stepper">
            <button type="button" data-qty-decrease aria-label="Decrease quantity of ${escapeAttr(item.name)}">&minus;</button>
            <span aria-live="polite">${item.qty}</span>
            <button type="button" data-qty-increase aria-label="Increase quantity of ${escapeAttr(item.name)}" ${item.qty >= item.maxQty ? 'disabled' : ''}>+</button>
          </div>
          <span class="cart-item-price tabular">${window.AGS.formatPrice(item.price * item.qty)}</span>
          <button type="button" class="cart-item-remove" data-remove aria-label="Remove ${escapeAttr(item.name)} from pickup list">×</button>
        </div>
      </div>`).join('');
    cartSubtotalEl.textContent = window.AGS.formatPrice(window.AGSCart.subtotal());
  }

  cartItemsEl.addEventListener('click', (event) => {
    const row = event.target.closest('[data-cart-item]');
    if (!row) return;
    const id = row.getAttribute('data-cart-item');
    const item = window.AGSCart.items().find((candidate) => candidate.id === id);
    if (!item) return;
    if (event.target.closest('[data-qty-increase]')) window.AGSCart.setQty(id, item.qty + 1);
    else if (event.target.closest('[data-qty-decrease]')) window.AGSCart.setQty(id, item.qty - 1);
    else if (event.target.closest('[data-remove]')) window.AGSCart.remove(id);
  });

  if (clearListButton) clearListButton.addEventListener('click', () => window.AGSCart.clear());
  window.addEventListener('ags:cart-change', renderCartPanel);

  render({ syncURL: false });
  renderCartPanel();
  if (window.location.hash === '#cart') document.getElementById('cart').scrollIntoView({ behavior: 'smooth' });
});
