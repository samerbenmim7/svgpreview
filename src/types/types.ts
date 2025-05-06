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

export type Snapshot = {
  positions: Record<number, Position>;
  blocks: Block[];
  svgGroups: Map<number, string>;
  svgData: string;
  parametersUrl: string;
  selectedBlockIndex: number;
  paperWidth: number;
  paperHeight: number;
  selectedConfigId: number;
  format: string;
  config: any;
  GroupIdentifierUrlMap: Map<number, string>;
  isTemplate: boolean;
  align: string;
  size: string;
  lastUpdatedBlockId: string | null;
};
