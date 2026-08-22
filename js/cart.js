/* cart.js — device-local pickup list for non-regulated products. */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'ags-pickup-list-v1';
  const state = { items: [] };

  function normalizeItem(candidate) {
    if (!candidate || typeof candidate.id !== 'string' || !window.AGS) return null;
    const product = window.AGS.getProduct(candidate.id);
    if (!product || window.AGS.isRegulated(product) || product.stock <= 0) return null;
    const requested = window.AGSUtils.safeInteger(candidate.qty, 1);
    const qty = Math.min(Math.max(requested, 1), product.stock);
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      qty,
      maxQty: product.stock,
    };
  }

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      state.items = Array.isArray(parsed) ? parsed.map(normalizeItem).filter(Boolean) : [];
    } catch (_error) {
      state.items = [];
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (_error) {
      // The list still works for the current page if storage is unavailable.
    }
  }

  function snapshot() {
    return state.items.map((item) => ({ ...item }));
  }

  function emit() {
    persist();
    window.dispatchEvent(new CustomEvent('ags:cart-change', { detail: { items: snapshot() } }));
  }

  function add(product, requestedQty = 1) {
    const normalized = normalizeItem({ id: product && product.id, qty: requestedQty });
    if (!normalized) return { ok: false, reason: 'unavailable' };

    const existing = state.items.find((item) => item.id === normalized.id);
    if (existing) {
      existing.maxQty = normalized.maxQty;
      existing.qty = Math.min(existing.qty + normalized.qty, existing.maxQty);
    } else {
      state.items.push(normalized);
    }
    emit();
    return { ok: true, qty: existing ? existing.qty : normalized.qty };
  }

  function remove(id) {
    state.items = state.items.filter((item) => item.id !== id);
    emit();
  }

  function setQty(id, requestedQty) {
    const item = state.items.find((candidate) => candidate.id === id);
    if (!item) return;
    const qty = window.AGSUtils.safeInteger(requestedQty, item.qty);
    if (qty <= 0) {
      remove(id);
      return;
    }
    item.qty = Math.min(qty, item.maxQty);
    emit();
  }

  function clear() {
    state.items = [];
    emit();
  }

  function count() {
    return state.items.reduce((sum, item) => sum + item.qty, 0);
  }

  function subtotal() {
    return state.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  }

  function items() {
    return snapshot();
  }

  load();
  persist();

  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    load();
    window.dispatchEvent(new CustomEvent('ags:cart-change', { detail: { items: snapshot() } }));
  });

  global.AGSCart = { add, remove, setQty, clear, count, subtotal, items };
})(window);
