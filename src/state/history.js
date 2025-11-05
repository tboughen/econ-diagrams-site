// src/state/history.js
export function createHistoryStore(reducer, initialState) {
  let present = initialState;
  let past = [];    // stack: last entry is the one to undo to
  let future = [];  // stack for redo
  const listeners = new Set();

  // batching
  let batching = false;
  let batchHasChange = false;  // did anything actually change while batching?

  const notify = () => listeners.forEach(fn => fn());

  function setPresent(next, { record = true } = {}) {
    if (next === present) return;           // no-op
    if (record) {
      if (batching) {
        // First change in a batch: capture baseline once
        if (!batchHasChange) {
          past.push(present);
          future.length = 0;
          batchHasChange = true;
        }
      } else {
        // Non-batched change: push current present once
        past.push(present);
        future.length = 0;
      }
    }
    present = next;
    notify();
  }

  function dispatch(action) {
    const next = reducer(present, action);
    if (next === present) return;           // no-op
    setPresent(next, { record: true });
  }

  function undo() {
    // Close any open batch before undoing to avoid odd states
    endBatch();
    if (past.length === 0) return;
    const prev = past.pop();
    future.push(present);
    present = prev;
    notify();
  }

  function redo() {
    endBatch();
    if (future.length === 0) return;
    const next = future.pop();
    past.push(present);
    present = next;
    notify();
  }

  function reset(state) {
    // Hard reset to a known state; clears history (by design)
    present = state;
    past = [];
    future = [];
    batching = false;
    batchHasChange = false;
    notify();
  }

  function beginBatch() {
    if (batching) return;   // already batching
    batching = true;
    batchHasChange = false; // we’ll capture baseline upon first real change
  }

  function endBatch() {
    if (!batching) return;
    // If nothing changed during the batch, do nothing: no phantom entry
    batching = false;
    batchHasChange = false;
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return {
    getState: () => present,
    dispatch,
    undo,
    redo,
    reset,
    subscribe,
    beginBatch,
    endBatch,
  };
}
