// Generic undo/redo store over a reducer
export function createHistoryStore(reducer, initial) {
  const past = [];
  let present = initial;
  const future = [];

  return {
    getState: () => present,
    dispatch: (action) => {
      const next = reducer(present, action);
      if (next !== present) {
        past.push(present);
        present = next;
        future.length = 0;
      }
    },
    undo: () => {
      if (!past.length) return;
      future.push(present);
      present = past.pop();
    },
    redo: () => {
      if (!future.length) return;
      past.push(present);
      present = future.pop();
    },
    reset: (to) => { past.length = 0; future.length = 0; present = to; }
  };
}
