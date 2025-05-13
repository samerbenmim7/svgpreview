export {};
declare global {
  interface Window {
    /** app‑wide “step” or “route” controlled by the wizard */
    view: string; // or: view?: string  if it can be undefined
  }
}
