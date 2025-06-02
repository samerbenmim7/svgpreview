import { useEffect } from "react";

/**
 * Stores the number of placeholders in localStorage under the key "customCols".
 * Only updates when `placeholders` is an array.
 */
export function useSyncPlaceholderLength(placeholders: any[] | undefined) {
  useEffect(() => {
    if (Array.isArray(placeholders)) {
      localStorage.setItem("customCols", placeholders.length.toString());
    }
  }, [placeholders]);
}
