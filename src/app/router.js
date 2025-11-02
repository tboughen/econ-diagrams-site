// src/app/router.js
const listeners = new Set();

export function onRoute(fn){ listeners.add(fn); return () => listeners.delete(fn); }

export function currentRoute(){
  const raw = location.hash.replace(/^#/, '');
  const cleaned = raw.replace(/^\/+/, ''); // allow #/tax as well as #tax
  return cleaned || 'supply-demand';
}

export function startRouter(){
  const fire = () => listeners.forEach(fn => fn(currentRoute()));
  window.addEventListener('hashchange', fire);
  fire(); // first load
}
