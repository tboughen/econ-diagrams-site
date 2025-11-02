// src/app/features.js
import supplyDemand from '../features/supplydemand/index.js';
import tax          from '../features/tax/index.js';
import subsidy      from '../features/subsidy/index.js';
import externalities from '../features/externalities/index.js';

// Temporary: buffer stocks not built yet → point to supply-demand
const registry = {
  '':              supplyDemand,
  'home':          supplyDemand,
  'supply-demand': supplyDemand,

  'tax':           tax,
  'subsidy':       subsidy,
  'externalities': externalities,

  // placeholder until we add a buffer feature
  'buffer':        supplyDemand
};

export function getFeature(route){
  return registry[route] || supplyDemand;
}
