/* cart.js — in-memory mock cart state for non-regulated items only.
   No localStorage/sessionStorage (sandboxed iframes block it) — state lives
   in a module-level JS variable for the duration of the page session, and is
   re-broadcast via a custom event so header/footer badges stay in sync. */

(function (global) {
  'use strict';

  const state = {
    items: [], // { id, name, price, qty }
  };

  function emit() {
    window.dispatchEvent(new CustomEvent('ags:cart-change', { detail: { items: state.items } }));
  }

  function add(item, qty) {
    qty = qty || 1;
    const existing = state.items.find((i) => i.id === item.id);
    if (existing) {
      existing.qty += qty;
    } else {
      state.items.push({ id: item.id, name: item.name, price: item.price, qty });
    }
    emit();
  }

  function remove(id) {
    state.items = state.items.filter((i) => i.id !== id);
    emit();
  }

  function setQty(id, qty) {
    const item = state.items.find((i) => i.id === id);
    if (!item) return;
    if (qty <= 0) {
      remove(id);
      return;
    }
    item.qty = qty;
    emit();
  }

  function clear() {
    state.items = [];
    emit();
  }

  function count() {
    return state.items.reduce((sum, i) => sum + i.qty, 0);
  }

  function subtotal() {
    return state.items.reduce((sum, i) => sum + i.qty * i.price, 0);
  }

  function items() {
    return state.items.slice();
  }

  global.AGSCart = { add, remove, setQty, clear, count, subtotal, items };
})(window);
