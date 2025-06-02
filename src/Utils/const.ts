export const PX_PER_MM = 11.8110238095;
export const DEFAULT_FONT = "jessy";
export const PEN_BLUE_DEGREE = 210;
export const MAX_HISTORY = 10;
export const PLACEHOLDER_KEYS = ["CUSTOM1", "CUSTOM2"] as const;
export const MAX_NUMBER_OF_CHARS_PER_BLOCK = 1000;
export const MAX_NUMBER_OF_BLOCKS_PER_VIEW = 15;
export const SIGNATURE_STROKE_COLOR = "black";

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
