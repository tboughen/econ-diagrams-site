// src/features/subsidy/index.js
export default {
  key: 'subsidy',
  title: 'Subsidy',
  panel(slot) { slot.innerHTML = ''; },
  overlay() {},
  initialSeed() { return null; }
};
