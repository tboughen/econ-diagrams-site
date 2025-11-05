// src/state/history.js
export function createHistoryStore(reducer, initialState){
  let state       = initialState;
  let past        = [];   // stack of previous states
  let future      = [];   // stack of undone states (for redo)
  let listeners   = new Set();
  let batchDepth  = 0;    // >0 means we are batching (drag/rotate/price-drag)
  let dirtyDuringBatch = false; // track if anything changed while batching

  function getState(){ return state; }

  function notify(){
    listeners.forEach(fn => fn());
  }

  function pushHistorySnapshot(){
    past.push(state);
    future = []; // clear redo chain on new action
  }

  function dispatch(action){
    // Special control actions
    if (action && action.type === '__history_beginBatch') {
      batchDepth++;
      return;
    }
    if (action && action.type === '__history_endBatch') {
      if (batchDepth > 0) batchDepth--;
      // when batching fully ends, take a single snapshot if we changed anything
      if (batchDepth === 0 && dirtyDuringBatch) {
        pushHistorySnapshot();
        dirtyDuringBatch = false;
        notify();
      }
      return;
    }

    // Normal reducer flow
    const prev = state;
    const next = reducer(state, action);
    if (next !== prev) {
      state = next;
      if (batchDepth > 0) {
        // Defer history entry until the batch ends
        dirtyDuringBatch = true;
      } else {
        // Immediate, single-step history entry
        pushHistorySnapshot();
      }
      notify();
    }
  }

  function undo(){
    if (past.length === 0) return;
    // current state goes to future, restore previous
    future.push(state);
    state = past.pop();
    notify();
  }

  function redo(){
    if (future.length === 0) return;
    past.push(state);
    state = future.pop();
    notify();
  }

  function reset(newInitial){
    state = newInitial;
    past = [];
    future = [];
    notify();
  }

  function subscribe(fn){
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return { getState, dispatch, undo, redo, reset, subscribe };
}
