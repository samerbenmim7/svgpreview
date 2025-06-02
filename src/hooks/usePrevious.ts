import { useEffect, useRef } from "react";

/**
 * Custom hook that returns the **previous** value of a given variable.
 *
 * Useful for comparing current and prior values between renders.
 *
 * @param value - The current value to track.
 * @returns The value from the previous render, or `undefined` on the first render.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
