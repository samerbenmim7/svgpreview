// ---- Interfaces / Types ----

export interface Position {
  x: number;
  y: number;
}

export interface Placeholder {
  name: string;
  value: string;
}

export interface BlockConfig {
  text: string;
  widthInMillimeters: number;
  fontSize: number;
  fontName: string;
  leftOffsetInMillimeters: number;
  topOffsetInMillimeters: number;
  topdragOffsetInMillimeters?: number;
  leftdragOffsetInMillimeters?: number;
  alignment: string;
  multiline: boolean;
  lineHeight: number;
  rotation: number;
  r: number;
  g: number;
  b: number;
}

export interface Block {
  id: number;
  config: BlockConfig;
  name?: string;
  changed?: boolean;
}