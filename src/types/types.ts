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
  path?: string;
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
  isSymbol: boolean;
}

export type Snapshot = {
  positions: Record<number, Position>;
  blocks: Block[];
  svgGroupsIdentifierContentMap: Map<number, string>;
  svgData: string;
  selectedBlockIndex: number;
  paperWidth: number;
  paperHeight: number;
  selectedConfigId: number;
  // config: any;
  GroupIdentifierUrlMap: Map<number, string>;
  isTemplate: boolean;
  // align: string;
  textColor: number;
  lastUpdatedBlockId: string | null;
};

export interface EditorState {
  positions: Record<number, Position>;
  svgData: string;
  backgroundImage: string;
  backgroundImageOpacity: number;
  // parametersUrl: string;
  blocks: Block[];
  selectedBlockIndex: number;
  paperWidth: number;
  paperHeight: number;
  recipientId: number;
  selectedConfigId: number;
  isTemplate: boolean;
  blockShouldDisplayOutline: boolean;
  svgGroupsIdentifierContentMap: Map<number, string>;
  needsSync: boolean;
  history: Snapshot[];
  future: Snapshot[];
  GroupIdentifierUrlMap: Map<number, string>;
  lastUpdatedBlockId: string | null;
  placeholders: [];
  textColor: number;
}

export interface SplitStringResult {
  before: string;
  after: string;
}

export interface BuildBodyDataParams {
  blocks: Block[];
  paperWidth: number;
  paperHeight: number;
  selectedConfigId: number;
  pplaceholders: Placeholder[];
  recipientId: number | null;
}

export type BlockUpdate =
  | {
      source: "event";
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    }
  | {
      source: "field";
      name: keyof BlockConfig;
      value: any;
      inputType?: "number" | "checkbox";
    };

export type EditorSetters = {
  [K in keyof EditorState as `set${Capitalize<string & K>}`]: (
    value: EditorState[K] | ((prev: EditorState[K]) => EditorState[K])
  ) => void;
};
