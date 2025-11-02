// src/features/subsidy/index.js
export const id = 'subsidy';

let subsidySizePx = 60;

export function initialSeed(bounds) {
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

  // With-subsidy: parallel downward shift
  const S_sub = { ...S, intercept: S.intercept - subsidySizePx };

  // New equilibrium
  const p1 = helpers.computeIntersection(S_sub.slope, S_sub.intercept, D.slope, D.intercept);
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

  // Wedge area (green)
  ctx.save();
  ctx.globalAlpha = 0.20;
  ctx.fillStyle = '#2a9d8f';
  const yConsumer = Math.max(p1.y, p1.y + subsidySizePx); // lower consumer price is min; producer higher is max
  const yProducer = Math.min(p1.y, p1.y + subsidySizePx);
  ctx.fillRect(p1.x - 18, yProducer, 36, Math.abs(subsidySizePx));
  ctx.restore();

  // Annotate prices
  ctx.save();
  ctx.font = `${Math.round(helpers.getTextSize()*0.85)}px Arial`;
  ctx.fillStyle = '#2a9d8f';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('Pᶜ', xLeft - 12, yProducer); // consumer price (lower)
  ctx.fillText('Pˢ', xLeft - 12, yConsumer); // producer price (higher)
  ctx.restore();
}

export function panel(dom, store, helpers) {
  const wrap = document.createElement('div');
  wrap.style.display = 'grid';
  wrap.style.gap = '8px';
  wrap.innerHTML = `
    <h3 style="margin:0;">Subsidy controls</h3>
    <label style="font-size:14px;">Subsidy size (px): <span id="subVal">${subsidySizePx}</span></label>
    <input id="subSlider" type="range" min="10" max="160" step="5" value="${subsidySizePx}">
    <small>Draws a wedge only (no core state mutation).</small>
  `;
  dom.appendChild(wrap);

  const slider = wrap.querySelector('#subSlider');
  const out = wrap.querySelector('#subVal');
  slider.addEventListener('input', () => {
    subsidySizePx = Number(slider.value);
    out.textContent = subsidySizePx;
    const val = store.getState().textSize;
    store.dispatch({ type: 'setTextSize', value: val });
  });
}
