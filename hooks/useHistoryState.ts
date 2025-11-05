import { useState, useCallback } from 'react';

interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

export const useHistoryState = <T>(initialState: T) => {
  const [history, setHistory] = useState<History<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const updateState = useCallback((newState: T | ((prevState: T) => T)) => {
    setHistory(h => {
      const newPresent = typeof newState === 'function' ? (newState as (prevState: T) => T)(h.present) : newState;
      if (JSON.stringify(newPresent) === JSON.stringify(h.present)) return h;
      return {
        past: [...h.past, h.present],
        present: newPresent,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory(h => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      const newPast = h.past.slice(0, h.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [h.present, ...h.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(h => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      const newFuture = h.future.slice(1);
      return {
        past: [...h.past, h.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);
  
  const resetState = useCallback((newState: T) => {
    setHistory({
        past: [],
        present: newState,
        future: [],
    });
  }, []);

  return {
    state: history.present,
    updateState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetState
  };
};
