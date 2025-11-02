// Pure geometry helpers (no canvas, no DOM)

export const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

export function isPointWithinBoundaries(p, b) {
  return p.x >= b.xLeft && p.x <= b.xRight && p.y >= b.yTop && p.y <= b.yBottom;
}

// Liang–Barsky-style line/box clipping simplified to your use-case:
// returns [Pmin, Pmax] segment within bounds, or null if fully out.
export function getLineSegmentWithinBounds(m, b, xL, xR, yT, yB) {
  const pts = [];
  const yL = m * xL + b; if (yL >= yT && yL <= yB) pts.push({ x: xL, y: yL });
  const yR = m * xR + b; if (yR >= yT && yR <= yB) pts.push({ x: xR, y: yR });

  if (Math.abs(m) > 1e-9) {
    const xT = (yT - b) / m; if (xT >= xL && xT <= xR) pts.push({ x: xT, y: yT });
    const xB = (yB - b) / m; if (xB >= xL && xB <= xR) pts.push({ x: xB, y: yB });
  }

  if (pts.length < 2) return null;
  pts.sort((a, c) => a.x - c.x);
  return [pts[0], pts[pts.length - 1]];
}

export function computeIntersection(m1, b1, m2, b2) {
  if (Math.abs(m1 - m2) < 1e-9) return null;
  const x = (b2 - b1) / (m1 - m2);
  const y = m1 * x + b1;
  return { x, y };
}
