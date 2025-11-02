// src/features/supplyDemand/index.js
export const id = 'supply-demand';

export function initialSeed(bounds) {
  // bounds = { xLeft, xRight, yTop, yBottom }
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

export function overlay(/* ctx, store, helpers */) {
  // No extra drawing for the baseline feature
}

export function panel(/* dom, store, helpers */) {
  // No extra sidebar UI for the baseline feature
}
