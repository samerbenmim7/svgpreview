import { useEffect, useRef } from "react";

/**
 * Debounce a callback; it will run only after the user
 * stops triggering `deps` changes for `delay` ms.
 */
export function useDebounce(callback: () => void, delay: number, deps: any[]) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(callback, delay);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [...deps, callback, delay]);
}
