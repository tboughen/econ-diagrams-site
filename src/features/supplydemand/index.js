// src/features/supplydemand/index.js
import { visibleSupply, visibleDemand } from '../../state/selectors.js';

export default {
  key: 'supply-demand',
  title: 'Supply & Demand',

  panel(slot, store, helpers){
    // Build panel UI
    slot.innerHTML = `
      <h2>Curve Control</h2>
      <div class="curve-control" style="display:flex; flex-direction:column; gap:10px;">
        <div id="sd-mode-toggle" class="curve-control-toggle" style="display:flex; border:1px solid #999; border-radius:4px; overflow:hidden;">
          <div data-mode="shift"   class="curve-control-segment active">Shifts</div>
          <div data-mode="rotate"  class="curve-control-segment">Elasticity</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <div class="curve-row" id="sd-demand-row">
            <button data-id="D1">D<span class="sub">1</span></button>
            <button data-id="D2">D<span class="sub">2</span></button>
            <button data-id="D3">D<span class="sub">3</span></button>
          </div>
          <div class="curve-row" id="sd-supply-row">
            <button data-id="S1">S<span class="sub">1</span></button>
            <button data-id="S2">S<span class="sub">2</span></button>
            <button data-id="S3">S<span class="sub">3</span></button>
          </div>
        </div>
      </div>
    `;

    // 1) Mode toggle wiring
    const modeToggle = slot.querySelector('#sd-mode-toggle');
    const setModeButtons = (m) => {
      modeToggle.querySelectorAll('.curve-control-segment').forEach(el => {
        el.classList.toggle('active', el.dataset.mode === m);
      });
    };
    // initial sync with current mode
    setModeButtons(helpers.getMode());

    modeToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.curve-control-segment');
      if (!btn) return;
      const mode = btn.dataset.mode === 'rotate' ? 'rotate' : 'shift';
      helpers.setMode(mode);
      setModeButtons(mode);
    });

    // 2) Curve toggles wiring
    function wireRow(rowSel){
      const row = slot.querySelector(rowSel);
      row.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-id]');
        if (!b) return;
        store.dispatch({ type:'toggleCurve', id: b.dataset.id });
      });
    }
    wireRow('#sd-demand-row');
    wireRow('#sd-supply-row');

    // 3) Keep button "active" classes in sync with store
    const updateActives = () => {
      const s = store.getState();
      slot.querySelectorAll('button[data-id]').forEach(btn => {
        const id = btn.dataset.id;
        const c = s.curves.find(k => k.id === id);
        btn.classList.toggle('active', !!(c && c.visible));
      });
    };
    updateActives();

    const unsubscribe = store.subscribe(updateActives);

    // If the panel gets unmounted, clean up
    // (slot will be cleared by index; this guard is for good hygiene)
    const observer = new MutationObserver(() => {
      if (!slot.isConnected) { unsubscribe(); observer.disconnect(); }
    });
    observer.observe(document.body, { childList:true, subtree:true });
  },

  overlay(/* ctx, store, helpers */){ /* none yet */ },

  // Let the main page use its default seed for S/D
  initialSeed(/* ob */){ return null; }
};
