// src/features/tax/index.js
export const id = 'tax';

// feature-local setting (in pixels of price-space)
let taxSizePx = 60;

export function initialSeed(bounds) {
  // Same base curves as supply-demand
  return {
    curves: [
      { id:'S1', kind:'supply',  slope:-1, intercept:(bounds.yBottom+bounds.xLeft),     label:'S1', color:'#000', visible:true  },
      { id:'S2', kind:'supply',  slope:-1, intercept:(bounds.yBottom+bounds.xLeft+100), label:'S2', color:'#000', visible:false },
      { id:'S3', kind:'supply',  slope:-1, intercept:(bounds.yBottom+bounds.xLeft+200), label:'S3', color:'#000', visible:false },
      { id:'D1', kind:'demand',  slope: 1, intercept:(bounds.yTop   -bounds.xLeft),     label:'D1', color:'#000', visible:true  },
      { id:'D2', kind:'demand',  slope: 1, intercept:(bounds.yTop   -bounds.xLeft-100), label:'D2', color:'#000', visible:false },
      { id:'D3', kind:'demand',  slope: 1, intercept:(bounds.yTop   -bounds.xLeft-200), label:'D3', color:'#000', visible:false }
    ],
    textSize: 20,
    marginEnabled: false,
    eqMode: 'equilibrium',
    priceY: null
  };
}

export function overlay(ctx, store, helpers) {
  const s = store.getState();
  const S = helpers.selectors.visibleSupply(s);
  const D = helpers.selectors.visibleDemand(s);
  if (!S || !D) return;

  // Pre-tax equilibrium (for reference)
  const p0 = helpers.computeIntersection(S.slope, S.intercept, D.slope, D.intercept);
  if (!p0) return;

  // Tax: parallel upward shift of supply by taxSizePx
  const S_tax = { ...S, intercept: S.intercept + taxSizePx };

  // With-tax equilibrium
  const p1 = helpers.computeIntersection(S_tax.slope, S_tax.intercept, D.slope, D.intercept);
  if (!p1) return;

  const { xLeft, yBottom } = helpers.getOuterBoundaries();
  const lineW = helpers.lineW();

  // Q1 guide
  ctx.save();
  ctx.setLineDash([10,10]);
  ctx.strokeStyle = '#555';
  ctx.lineWidth = lineW;
  ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p1.x, yBottom); ctx.stroke();
  ctx.restore();

  // Wedge rectangle between Pc (consumer) and Ps (producer) at Q1
  ctx.save();
  ctx.globalAlpha = 0.20;
  ctx.fillStyle = '#d62828';
  const yConsumer = Math.min(p1.y, p1.y - taxSizePx); // higher price
  const yProducer = Math.max(p1.y, p1.y - taxSizePx); // lower price received
  ctx.fillRect(p1.x - 18, yConsumer, 36, Math.abs(taxSizePx));
  ctx.restore();

  // Annotate prices
  ctx.save();
  ctx.font = `${Math.round(helpers.getTextSize()*0.85)}px Arial`;
  ctx.fillStyle = '#d62828';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('Pᶜ', xLeft - 12, yConsumer);
  ctx.fillText('Pˢ', xLeft - 12, yProducer);
  ctx.restore();
}

export function panel(dom, store, helpers) {
  const wrap = document.createElement('div');
  wrap.style.display = 'grid';
  wrap.style.gap = '8px';
  wrap.innerHTML = `
    <h3 style="margin:0;">Tax controls</h3>
    <label style="font-size:14px;">Tax size (px): <span id="taxVal">${taxSizePx}</span></label>
    <input id="taxSlider" type="range" min="10" max="160" step="5" value="${taxSizePx}">
    <small>Draws a wedge only (no core state mutation).</small>
  `;
  dom.appendChild(wrap);

  const slider = wrap.querySelector('#taxSlider');
  const out = wrap.querySelector('#taxVal');
  slider.addEventListener('input', () => {
    taxSizePx = Number(slider.value);
    out.textContent = taxSizePx;
    // nudge a re-render via a harmless state dispatch
    const val = store.getState().textSize;
    store.dispatch({ type: 'setTextSize', value: val });
  });
}
