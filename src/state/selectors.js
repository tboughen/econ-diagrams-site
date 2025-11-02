export const visibleSupply  = (s) => s.curves.find(c => c.kind === 'supply' && c.visible) || null;
export const visibleDemand  = (s) => s.curves.find(c => c.kind === 'demand' && c.visible) || null;
export const allCurves      = (s) => s.curves;
