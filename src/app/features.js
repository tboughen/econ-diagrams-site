// src/app/features.js
import * as supplyDemand from '../features/supplyDemand/index.js';
import * as tax from '../features/tax/index.js';
import * as subsidy from '../features/subsidy/index.js';
import * as externalities from '../features/externalities/index.js';

const registry = {
  [supplyDemand.id]: supplyDemand,
  [tax.id]: tax,
  [subsidy.id]: subsidy,
  [externalities.id]: externalities
};

export function getFeature(route){ return registry[route] || supplyDemand; }
export function routes(){ return Object.keys(registry); }
