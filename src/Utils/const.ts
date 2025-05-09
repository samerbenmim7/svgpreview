export const PX_PER_MM = 11.8110238095;
export const DEFAULT_FONT = "jessy";

export const PAPER_SIZES_MM: Record<
  string,
  { width: number; height: number; scale: number }
> = {
  "DL (Landscape)": { width: 210, height: 105, scale: 33 },

  DL: { width: 105, height: 210, scale: 0.4 },
  "A4 (Landscape)": { width: 297, height: 210, scale: 33 },

  A4: { width: 210, height: 297, scale: 33 },

  //   A5: { width: 148, height: 210, scale: 0.5 },
  //   "A5 (Landscape)": { width: 210, height: 148, scale: 33 },
  "A6 (Landscape)": { width: 148, height: 105, scale: 33 },

  A6: { width: 105, height: 148, scale: 33 },
};
