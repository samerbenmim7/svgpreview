import { useEffect } from "react";

/**
 * Listens for a custom `"view"` event on `window`
 * and updates the provided setter with `window.view`.
 *
 * @param setView - A setter function (e.g. from useState) to update the view value.
 */
export function useViewListener<T>(setView: (value: T) => void) {
  useEffect(() => {
    const handleChange = () => {
      //@ts-ignore
      setView(window.view);
    };

    window.addEventListener("view", handleChange);
    return () => window.removeEventListener("view", handleChange);
  }, [setView]);
}
