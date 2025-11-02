// src/state/history.js
export function createHistoryStore(reducer, initialState){
  let state = initialState;
  const past = [];
  const future = [];
  const listeners = new Set();

  function notify(){ listeners.forEach(fn => fn(state)); }

  function getState(){ return state; }
  function dispatch(action){
    const prev = state;
    const next = reducer(state, action);
    if (next !== prev){
      past.push(prev);
      state = next;
      future.length = 0;
      notify();
    }
  }
  function reset(newState){
    state = newState;
    past.length = 0;
    future.length = 0;
    notify();
  }
  function undo(){
    if (past.length){
      future.push(state);
      state = past.pop();
      notify();
    }
  }
  function redo(){
    if (future.length){
      past.push(state);
      state = future.pop();
      notify();
    }
  }
  function subscribe(fn){
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return { getState, dispatch, reset, undo, redo, subscribe };
}
