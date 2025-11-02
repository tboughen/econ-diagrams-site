// src/app/features.js
// Map routes -> dynamic imports
const registry = {
  '':             () => import('../features/supplydemand/index.js'),
  'home':         () => import('../features/supplydemand/index.js'),
  'supply-demand':() => import('../features/supplydemand/index.js'),

  // You can add more later:
  // 'tax':         () => import('../features/tax/index.js'),
  // 'subsidy':     () => import('../features/subsidy/index.js'),
  // 'externalities':() => import('../features/externalities/index.js'),
  // 'buffer':      () => import('../features/buffer/index.js'),
};

// Normalise the feature shape so index.html can call .panel/.overlay/.initialSeed safely.
function normalize(route, mod) {
  const f = mod?.default ?? mod ?? {};
  return {
    key: f.key ?? route ?? '',
    title: f.title ?? '',
    panel: typeof f.panel === 'function' ? f.panel : () => {},
    overlay: typeof f.overlay === 'function' ? f.overlay : null,
    initialSeed: typeof f.initialSeed === 'function' ? f.initialSeed : () => null,
  };
}

export function getFeature(route) {
  const key = (route || '').toLowerCase();
  const loader = registry[key] || registry[''];// default to supply-demand
  // Return a tiny shim that index.html already uses like a sync value.
  // If you prefer async/await, you can make onRoute async instead.
  // Here we return a Promise and index.html awaits it before mounting.
  return {
    then(res, rej){ loader().then(m => res(normalize(key, m))).catch(rej); }
  };
}
