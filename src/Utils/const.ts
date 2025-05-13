export const PX_PER_MM = 11.8110238095;
export const DEFAULT_FONT = "jessy";

export const PAPER_SIZES_MM: Record<
  string,
  {
    width: number;
    height: number;
    scale: number;
    skew: number;
  }
> = {
  "DL (Landscape)": {
    width: 210,
    height: 99,
    scale: 40,
    skew: 0.1,
  },
  A4: {
    width: 210,
    height: 297,
    scale: 37,
    skew: -1,
  },
  "A4 (Landscape)": {
    width: 297,
    height: 210,
    scale: 26,
    skew: -1,
  },
  A6: {
    width: 105,
    height: 148,
    scale: 58,
    skew: 0.1,
  },
  "A6 (Landscape)": {
    width: 148,
    height: 105,
    scale: 52,
    skew: 0.1,
  },
};
