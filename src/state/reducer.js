import { clamp } from '../core/geometry.js';

export const initialState = {
  curves: [],            // fill in from index bootstrap for now
  textSize: 20,
  marginEnabled: false,
  eqMode: 'equilibrium',
  priceY: null
};

export function reducer(state, action) {
  switch (action.type) {
    case 'toggleCurve': {
      return {
        ...state,
        curves: state.curves.map(c => c.id === action.id ? { ...c, visible: !c.visible } : c)
      };
    }
    case 'shiftCurve': {
      const { id, dx } = action;
      return {
        ...state,
        curves: state.curves.map(c => {
          if (c.id !== id) return c;
          // intercept change derived from current slope and dx (right = demand positive, supply negative as before)
          return { ...c, intercept: c.intercept - (c.slope * dx) };
        })
      };
    }
    case 'rotateCurve': {
      const { id, angle, pivot } = action;
      return {
        ...state,
        curves: state.curves.map(c => {
          if (c.id !== id) return c;
          // constrain angle by kind (supply negative slope, demand positive)
          const minA = c.kind === 'supply' ? (-Math.PI/2)+0.001 : 0;
          const maxA = c.kind === 'supply' ? 0 : (Math.PI/2)-0.001;
          const a = Math.min(Math.max(angle, minA), maxA);
          const slope = Math.tan(a);
          const intercept = pivot.y - slope * pivot.x;
          return { ...c, slope, intercept };
        })
      };
    }
    case 'setEqMode': return { ...state, eqMode: action.mode };
    case 'toggleMargin': return { ...state, marginEnabled: !state.marginEnabled };
    case 'setPriceY':  return { ...state, priceY: action.y };
    case 'setTextSize': return { ...state, textSize: clamp(action.value, 10, 64) };
    case 'reset': return action.to;
    default: return state;
  }
}
