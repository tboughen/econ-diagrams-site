// src/features/supplyDemand/index.js
// Owns: side-panel controls (Shifts/Elasticity + D/S toggles) and
// the Disequilibrium overlay (price line, brace, labels, shading).

export const id = "supply-demand";
export const title = "Supply & Demand";

/** Initial state seed for this feature */
export function initialSeed(ob) {
  return {
    textSize: 20,
    curves: [
      { id:'S1', kind:'supply',  slope:-1, intercept:(ob.yBottom+ob.xLeft),     label:'S1', color:'#000', visible:true  },
      { id:'S2', kind:'supply',  slope:-1, intercept:(ob.yBottom+ob.xLeft+100), label:'S2', color:'#000', visible:false },
      { id:'S3', kind:'supply',  slope:-1, intercept:(ob.yBottom+ob.xLeft+200), label:'S3', color:'#000', visible:false },
      { id:'D1', kind:'demand',  slope: 1, intercept:(ob.yTop -ob.xLeft),       label:'D1', color:'#000', visible:true  },
      { id:'D2', kind:'demand',  slope: 1, intercept:(ob.yTop -ob.xLeft-100),   label:'D2', color:'#000', visible:false },
      { id:'D3', kind:'demand',  slope: 1, intercept:(ob.yTop -ob.xLeft-200),   label:'D3', color:'#000', visible:false }
    ],
    eqMode: 'equilibrium',
    priceY: null,
    marginEnabled: false
  };
}

/** Build the feature’s side-panel controls inside the given container */
export function panel(container, store, helpers) {
  const s = () => store.getState();

  // --- Mode toggle: Shifts / Elasticity
  const toggleWrap = el(`<div id="curveToggle" class="curve-control"></div>`);
  const btnShift = el(`<div class="curve-control-segment active">Shifts</div>`);
  const btnElast = el(`<div class="curve-control-segment">Elasticity</div>`);
  toggleWrap.append(btnShift, btnElast);

  let mode = 'shift';
  btnShift.onclick = () => { mode = 'shift'; btnShift.classList.add('active'); btnElast.classList.remove('active'); };
  btnElast.onclick  = () => { mode = 'rotate'; btnElast.classList.add('active'); btnShift.classList.remove('active'); };

  // --- D buttons (above S buttons)
  const rowD = el(`<div class="curve-row" id="demandButtons"></div>`);
  const d1 = rowButton('D1'), d2 = rowButton('D2'), d3 = rowButton('D3');
  rowD.append(d1,d2,d3);
  [d1,d2,d3].forEach((b,i)=> b.onclick = () => { store.dispatch({ type:'toggleCurve', id:`D${i+1}` }); refresh(); });

  // --- S buttons
  const rowS = el(`<div class="curve-row" id="curveButtons"></div>`);
  const s1 = rowButton('S1'), s2 = rowButton('S2'), s3 = rowButton('S3');
  rowS.append(s1,s2,s3);
  [s1,s2,s3].forEach((b,i)=> b.onclick = () => { store.dispatch({ type:'toggleCurve', id:`S${i+1}` }); refresh(); });

  // Mount
  container.append(
    h2('Curve Control'), toggleWrap,
    rowD, rowS
  );

  // Keep buttons’ active states in sync with store
  function refresh(){
    const vis = id => (s().curves.find(c=>c.id===id)||{}).visible;
    toggleActive(d1, vis('D1')); toggleActive(d2, vis('D2')); toggleActive(d3, vis('D3'));
    toggleActive(s1, vis('S1')); toggleActive(s2, vis('S2')); toggleActive(s3, vis('S3'));
  }
  refresh();

  // Expose current mode back to host (used by index.html mouse handlers)
  if (!window.__econModes) window.__econModes = {};
  window.__econModes[id] = () => mode;
}

/** Draw the disequilibrium overlay (price line, brace, labels, shading) */
export function overlay(ctx, store, helpers) {
  const state = store.getState();
  if (state.eqMode !== 'disequilibrium') return;

  const {
    clamp, getEffectiveBoundaries, getOuterBoundaries, selectors,
    drawWithSubscript, computeBraceRadii, planUnderbrace4QuartersAnchored,
    executeBracePlan, useEquilibriumDash, getTextSize
  } = helpers;

  const eff = getEffectiveBoundaries();
  const o   = getOuterBoundaries();
  const S   = selectors.visibleSupply(state);
  const D   = selectors.visibleDemand(state);
  if(!S || !D) return;

  const textSize = getTextSize();
  const lineW = textSize/5;

  let yP = state.priceY;
  const eq = getEquilibriumPoint(state, helpers);
  if(yP == null && eq) yP = eq.y;
  if(yP == null) return;

  yP = clamp(yP, eff.yTop, eff.yBottom);
  const xS = qxAt(yP, S);
  const xD = qxAt(yP, D);
  const valid=(x)=>x!=null && x>=eff.xLeft && x<=eff.xRight; if(!valid(xS)||!valid(xD)) return;

  const leftAttach  = Math.min(xS,xD);
  const rightAttach = Math.max(xS,xD);

  // Handle (neutral)
  ctx.save();
  ctx.fillStyle = '#555';
  ctx.beginPath(); ctx.arc(o.xLeft, yP, 7, 0, 2*Math.PI); ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth   = 1.5;
  ctx.stroke();
  ctx.restore();

  // Horizontal price dash
  ctx.save(); useEquilibriumDash(ctx, lineW);
  ctx.beginPath(); ctx.moveTo(o.xLeft, yP); ctx.lineTo(rightAttach, yP); ctx.stroke();
  ctx.restore();

  drawWithSubscript(ctx, 'P','1', o.xLeft-15, yP, {align:'right', baseline:'middle'});

  // Vertical Q guides
  ctx.save(); useEquilibriumDash(ctx, lineW);
  ctx.beginPath(); ctx.moveTo(xS, yP); ctx.lineTo(xS, o.yBottom); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(xD, yP); ctx.lineTo(xD, o.yBottom); ctx.stroke();
  ctx.restore();

  drawWithSubscript(ctx, 'Q','D', xD, o.yBottom+15, {align:'center', baseline:'top'});
  drawWithSubscript(ctx, 'Q','S', xS, o.yBottom+15, {align:'center', baseline:'top'});

  // Shading
  if(Math.abs(xS-xD)>1e-3){
    ctx.save(); ctx.globalAlpha=.15; ctx.fillStyle=(xS>xD)?'#2a9d8f':'#d62828';
    ctx.fillRect(leftAttach, yP, rightAttach-leftAttach, o.yBottom-yP); ctx.restore();
  }

  // Underbrace baseline
  const qLabelTop = o.yBottom + 15;
  const qLabelH   = textSize;
  const gapBelow  = Math.max(6, textSize*0.20);
  const baselineY = qLabelTop + qLabelH + gapBelow;

  const shortage   = (xD > xS);
  const braceColor = shortage ? '#d62828' : '#2a9d8f';

  const L = rightAttach - leftAttach;
  if (L >= 10) {
    const radii = computeBraceRadii(L);
    const clearance = (ctx.canvas.height - 6) - baselineY;
    const needMax = Math.max(radii.rEnd, radii.rMid);
    if (clearance < needMax) {
      const k = Math.max(0, clearance) / (needMax || 1);
      radii.rEnd *= k; radii.rMid *= k;
    }
    const plan = planUnderbrace4QuartersAnchored(leftAttach, rightAttach, baselineY, {
      color: braceColor,
      lineWidth: Math.max(1.5, textSize/5.5),
      radii
    });
    if (plan) executeBracePlan(ctx, plan);

    // Caption
    const midX = (leftAttach + rightAttach)/2;
    const label = shortage ? 'Shortage' : 'Surplus';
    const labelSize = Math.max(10, Math.round(textSize * 0.85));
    const delta = 0.5 * radii.rEnd;
    const yTextRaw = (baselineY + delta) + radii.rMid + Math.max(6, textSize*0.25);
    const yText = Math.min(ctx.canvas.height - 6, yTextRaw);
    ctx.save(); ctx.setLineDash([]); ctx.fillStyle = braceColor;
    ctx.font = `${labelSize}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(label, midX, yText);
    ctx.restore();
  }

  // helpers (private to this module)
  function qxAt(y, curve){ if(!curve||!curve.visible||Math.abs(curve.slope)<1e-9) return null; return (y - curve.intercept)/curve.slope; }
  function getEquilibriumPoint(s, h){
    const S = h.selectors.visibleSupply(s), D = h.selectors.visibleDemand(s);
    if(!S||!D) return null;
    const p = h.computeIntersection(S.slope, S.intercept, D.slope, D.intercept);
    return (p && h.isPointWithinBoundaries(p, h.getEffectiveBoundaries())) ? p : null;
  }
}

/* ---------------- small DOM helpers ---------------- */
function el(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }
function h2(text){ const h=document.createElement('h2'); h.textContent=text; return h; }
function rowButton(label){
  const b = el(`<button aria-label="${label}">${label[0]}<span class="sub">${label.slice(1)}</span></button>`);
  b.className = ''; // keep host styles
  return b;
}
function toggleActive(btn, on){ btn.classList.toggle('active', !!on); }
