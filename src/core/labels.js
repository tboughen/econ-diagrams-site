// Text parsing & layout helpers (no drawing)

const subDigitMap = {'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'};

export function normalizeSubDigits(str) {
  return str.replace(/[₀-₉]/g, ch => subDigitMap[ch] ?? ch);
}

export function splitBaseSub(label) {
  const norm = normalizeSubDigits(label);
  const m = norm.match(/^([A-Za-z]+)(\d+)$/);
  return m ? { base: m[1], sub: m[2] } : { base: label, sub: '' };
}

// A small, pure calculator for subscript metrics based on main textSize
export function computeSubMetrics(textSize, { subScale = .70, dropEm = .20, kernPx = 0 } = {}) {
  const mainSize = textSize;
  const subSize  = Math.round(textSize * subScale);
  const dropPx   = Math.round(textSize * dropEm);
  return { mainSize, subSize, dropPx, kernPx };
}
