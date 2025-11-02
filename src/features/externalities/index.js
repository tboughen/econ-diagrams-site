// src/features/externalities/index.js
export const id = 'externalities';

let mecPx = 60; // marginal external cost (vertical gap between MPC and MSC) in px

export function initialSeed(bounds) {
  return {
    curves: [
      { id:'S1', kind:'supply',  slope:-1, intercept:(bounds.yBottom+bounds.xLeft),     label:'MPC', color:'#000', visible:true  },
      { id:'S2', kind:'supply',  slope:-1, intercept:(bounds.yBottom+bounds.xLeft+100), label:'S2',  color:'#000', visible:false },
      { id:'S3', kind:'supply',  slope:-1, intercept:(bounds.yBottom+bounds.xLeft+200), label:'S3',  color:'#000', visible:false },
      { id:'D1', kind:'demand',  slope: 1, intercept:(bounds.yTop   -bounds.xLeft),     label:'MPB', color:'#000', visible:true  },
      { id:'D2', kind:'demand',  slope: 1, intercept:(bounds.yTop   -bounds.xLeft-100), label:'D2',  color:'#000', visible:false },
      { id:'D3', kind:'demand',  slope: 1, intercept:(bounds.yTop   -bounds.xLeft-200), label:'D3',  color:'#000', visible:false }
    ],
    textSize: 20,
    marginEnabled: false,
    eqMode: 'equilibrium',
    priceY: null
  };
}

export function overlay(ctx, store, helpers) {
  const s = store.getState();
  const MPC = helpers.selectors.visibleSupply(s);  // baseline supply
  const MPB = helpers.selectors.visibleDemand(s);  // baseline demand
  if (!MPC || !MPB) return;

  // Social cost curve = MPC shifted up by MEC
  const MSC = { ...MPC, label:'MSC', intercept: MPC.intercept + mecPx };

  // Market equilibrium (MPC with MPB)
  const E_market = helpers.computeIntersection(MPC.slope, MPC.intercept, MPB.slope, MPB.intercept);
  if (!E_market) return;
  // Socially efficient equilibrium (MSC with MPB)
  const E_social = helpers.computeIntersection(MSC.slope, MSC.intercept, MPB.slope, MPB.intercept);
  if (!E_social) return;

  const { yBottom } = helpers.getOuterBoundaries();
  const lineW = helpers.lineW();

  // Guides at Q_market and Q_social
  ctx.save();
  ctx.setLineDash([10,10]);
  ctx.strokeStyle = '#555';
  ctx.lineWidth = lineW;
  ctx.beginPath(); ctx.moveTo(E_market.x, E_market.y); ctx.lineTo(E_market.x, yBottom); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(E_social.x, E_social.y); ctx.lineTo(E_social.x, yBottom); ctx.stroke();
  ctx.restore();

  // Shade welfare loss triangle between MSC and MPB at Q_market
  // Points: A = E_social (on MSC), B = vertical projection at Q_market on MSC, C = E_market (on MPC/MPB)
  const A = E_social;
  const B = { x: E_market.x, y: MSC.slope * E_market.x + MSC.intercept };
  const C = E_market;

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#d62828';
  ctx.beginPath();
  ctx.moveTo(A.x, A.y);
  ctx.lineTo(B.x, B.y);
  ctx.lineTo(C.x, C.y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Draw the MSC curve segment (to make it visible)
  const eff = helpers.getEffectiveBoundaries();
  const segMSC = segment(MSC, eff, helpers);
  if (segMSC) {
    ctx.save();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#d62828';
    ctx.lineWidth = lineW;
    ctx.beginPath();
    ctx.moveTo(segMSC[0].x, segMSC[0].y);
    ctx.lineTo(segMSC[1].x, segMSC[1].y);
    ctx.stroke();
    ctx.restore();
  }

  // tiny helper (local to this file)
  function segment(curve, b, h) {
    return h.getLineSegmentWithinBounds
      ? h.getLineSegmentWithinBounds(curve.slope, curve.intercept, b.xLeft, b.xRight, b.yTop, b.yBottom)
      : null;
  }
}

export function panel(dom, store, helpers) {
  const wrap = document.createElement('div');
  wrap.style.display = 'grid';
  wrap.style.gap = '8px';
  wrap.innerHTML = `
    <h3 style="margin:0;">Externality controls</h3>
    <label style="font-size:14px;">MEC size (px): <span id="mecVal">${mecPx}</span></label>
    <input id="mecSlider" type="range" min="10" max="160" step="5" value="${mecPx}">
    <small>Shows MSC above MPC, and welfare loss at Q<sub>market</sub>.</small>
  `;
  dom.appendChild(wrap);

  const slider = wrap.querySelector('#mecSlider');
  const out = wrap.querySelector('#mecVal');
  slider.addEventListener('input', () => {
    mecPx = Number(slider.value);
    out.textContent = mecPx;
    const val = store.getState().textSize;
    store.dispatch({ type: 'setTextSize', value: val });
  });
}
