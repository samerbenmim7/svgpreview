// useKeyboard.ts
import { useEffect } from 'react';

type Options = {
  ctrl?: boolean;
  meta?: boolean;
};

export function useKeyboard(key: string, callback: (e: KeyboardEvent) => void, options: Options = {}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrlMatch = options.ctrl ? (e.ctrlKey || e.metaKey) : true;
      const metaMatch = options.meta ? e.metaKey : true;

      if (e.key.toLowerCase() === key.toLowerCase() && ctrlMatch && metaMatch) {
        e.preventDefault(); // optional: prevent browser undo
        callback(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback, key, options.ctrl, options.meta]);
}
