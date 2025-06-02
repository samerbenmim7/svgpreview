// useKeyboard.ts
import { useEffect } from "react";

type Options = {
  ctrl?: boolean;
  meta?: boolean;
};

/**
 * Custom hook that listens for a specific key press
 * and triggers a callback when matched, with optional modifier keys.
 *
 * @param key - The target key to listen for (case-insensitive).
 * @param callback - Function to call when the key is pressed.
 * @param options - Optional modifiers:
 *   - `ctrl`: Require Ctrl or Command key
 *   - `meta`: Require Meta (Command) key
 *
 * The hook listens to `keydown` events and automatically cleans up on unmount.
 */

export function useKeyboard(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options: Options = {}
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrlMatch = options.ctrl ? e.ctrlKey || e.metaKey : true;
      const metaMatch = options.meta ? e.metaKey : true;

      if (e.key.toLowerCase() === key.toLowerCase() && ctrlMatch && metaMatch) {
        e.preventDefault();
        callback(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callback, key, options.ctrl, options.meta]);
}
