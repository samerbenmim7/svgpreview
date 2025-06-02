import { useCallback } from "react";
import { MAX_HISTORY } from "../utils/const";
import { Snapshot } from "../types/types";

export function useHistory<T>(
  getSnapshot: () => T,
  restoreSnapshot: (snap: T) => void,
  history: T[],
  setHistory: React.Dispatch<React.SetStateAction<T[]>>,
  future: T[],
  setFuture: React.Dispatch<React.SetStateAction<T[]>>,
  // textColor: string,

  maxSize: number = MAX_HISTORY
) {
  const deepCopy = (s: T) => structuredClone(s);

  const pushHistory = useCallback(() => {
    const snap = deepCopy(getSnapshot());

    setHistory((prev) => [...prev.slice(-maxSize + 1), snap]);
    setFuture([]);
  }, [
    getSnapshot,
    maxSize,
    setHistory,
    setFuture,
    //   , textColor
  ]);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (!prev.length) return prev;

      const newHistory = prev.slice(0, -1);
      const last = prev[prev.length - 1];

      setFuture((f) => [deepCopy(getSnapshot()), ...f]);
      queueMicrotask(() => restoreSnapshot(last));

      return newHistory;
    });
  }, [getSnapshot, restoreSnapshot, setHistory, setFuture]);

  const redo = useCallback(() => {
    setFuture((prev) => {
      if (!prev.length) return prev;

      const [next, ...rest] = prev;

      setHistory((h) => [...h, deepCopy(getSnapshot())]);
      queueMicrotask(() => restoreSnapshot(next));

      return rest;
    });
  }, [getSnapshot, restoreSnapshot, setFuture, setHistory]);

  return { pushHistory, undo, redo, history, future };
}
