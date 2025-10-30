// Underbrace geometry planner (returns a path plan; no drawing)

import { clamp } from './geometry.js';

// Compute radii given total length L, clamped to reasonable values.
export function computeBraceRadii(L) {
  let rEnd = Math.max(10, Math.min(34, L * 0.08));
  let rMid = Math.max(12, Math.min(40, L * 0.10));
  const need = 2 * rEnd + 2 * rMid + 8;
  if (need > L) {
    const k = (L - 8) / (2 * rEnd + 2 * rMid);
    rEnd *= k; rMid *= k;
  }
  return { rEnd, rMid };
}

/**
 * Plan a 4-quarter underbrace path.
 * Returns an object describing drawing ops you can execute with Canvas later.
 */
export function planUnderbrace4QuartersAnchored(attachL, attachR, baselineY, opts = {}) {
  const { color = '#d62828', lineWidth = 2, radii = null } = opts;
  const left = attachL, right = attachR;
  const L = Math.max(0, right - left);
  if (L < 12) return null;

  let { rEnd, rMid } = radii ?? computeBraceRadii(L);
  const midX = (left + right) / 2;

  // Lower the flats by half an end-radius to match your visual spec
  const delta = 0.5 * rEnd;
  let yFlat = baselineY + delta;

  // Join points (flat meeting each curl)
  let xFlatL = left  + 0.425 * rEnd;
  let xFlatR = right - 0.425 * rEnd;

  // Sanity "snap" (keeps symmetry consistent with your prior implementation)
  const Rl = { x: left  + 0.425 * rEnd, y: baselineY + 0.5 * rEnd };
  const Rr = { x: right - 0.425 * rEnd, y: baselineY + 0.5 * rEnd };
  if (Math.abs(xFlatL - Rl.x) > 0.75 || Math.abs(yFlat - Rl.y) > 0.75) { xFlatL = Rl.x; yFlat = Rl.y; }
  if (Math.abs(xFlatR - Rr.x) > 0.75 || Math.abs(yFlat - Rr.y) > 0.75) { xFlatR = Rr.x; yFlat = Rr.y; }

  // Ensure the mid dip fits between flats
  const bodyWidth = Math.max(0, xFlatR - xFlatL);
  const maxRmid = Math.max(6, (bodyWidth / 2) - 2);
  if (rMid > maxRmid) rMid = maxRmid;

  // Emit a path plan consumable by renderer
  return {
    style: { color, lineWidth },
    anchors: { left, right, baselineY, yFlat, xFlatL, xFlatR, rEnd, rMid, midX },
    ops: [
      // Left curl (join -> attach)
      { op: 'quad', from: { x: xFlatL, y: yFlat },
        ctrl: { x: left + 0.35 * rEnd, y: baselineY + rEnd },
        to:   { x: left, y: baselineY } },

      // Flat left
      { op: 'line', from: { x: xFlatL, y: yFlat }, to: { x: midX - rMid, y: yFlat } },

      // Dip (two quarter-circles)
      { op: 'arc',  cx: (midX - rMid), cy: (yFlat + rMid), r: rMid, fromAngle: 1.5*Math.PI, toAngle: 0, ccw: false },
      { op: 'arc',  cx: (midX + rMid), cy: (yFlat + rMid), r: rMid, fromAngle: Math.PI,     toAngle: 1.5*Math.PI, ccw: false },

      // Flat right
      { op: 'line', from: { x: midX + rMid, y: yFlat }, to: { x: xFlatR, y: yFlat } },

      // Right curl (join -> attach)
      { op: 'quad', from: { x: xFlatR, y: yFlat },
        ctrl: { x: right - 0.35 * rEnd, y: baselineY + rEnd },
        to:   { x: right, y: baselineY } },
    ]
  };
}
