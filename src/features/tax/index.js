// src/features/tax/index.js
export default {
  key: 'tax',
  title: 'Tax',

  // No controls yet → empty panel
  panel(slot /*, store, helpers */) {
    slot.innerHTML = '';
  },

  // No overlay drawing yet
  overlay(/* ctx, store, helpers */) {},

  // Use the page’s default seed (returning null tells index.html to keep its seed)
  initialSeed(/* ob */) { return null; }
};
