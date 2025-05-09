// defaults.ts

// --------- Types ---------
export interface BlockConfig {
  text: string;
  widthInMillimeters: number;
  fontSize: number;
  fontName: string;
  leftOffsetInMillimeters: number;
  topOffsetInMillimeters: number;
  multiline: boolean;
  lineHeight: number;
  rotation: number;
  r: number;
  g: number;
  b: number;
  alignment: string;
}

export interface Block {
  id: number;
  name?: string;
  changed?: boolean;
  config: BlockConfig;
}

export interface Config {
  name: string;
  fontSizeDraw: number;
  fontSizeOverlay: number;
  posX: number;
  posY: number;
  servoAngleUp: number;
  servoAngleHighUp: number;
  servoAngleDown: number;
  servoWaitTime: number;
  printerSpeed: number;
  myAlignType: string;
  segmentLength: number;
  angleThreshold: number;
  charDist: number;
  imperfectY: number;
  imperfectX: number;
  lineDist: number;
  rotate: number;
  offsetBorderX: number;
  offsetBorderY: number;
  offsetRightBorder: number;
  paperWidth: number;
  paperHeight: number;
  heightTopStripe: number;
  heightBottomStripe: number;
  heightRightStripe: number;
  heightLeftStripe: number;
  backGroundImageName: string;
  repeatShiftX: number;
  repeatShiftY: number;
  repeatX: number;
  repeatY: number;
  createPreviewImages: boolean;
  creationCanceled: boolean;
  creationIsRunning: boolean;
  picBoxDokSizeX: number;
  picBoxDokSizeY: number;
  curFontIndex: number;
  id: number;
}

// --------- Values ---------

export const defaultBlocks: Block[] = [
  {
    id: 5,
    name: "title",
    changed: true,
    config: {
      text: "A Warm thank you to ",
      widthInMillimeters: 210,
      fontSize: 5,
      fontName: "david",
      leftOffsetInMillimeters: -14,
      topOffsetInMillimeters: 18.4,
      multiline: true,
      lineHeight: 3,
      rotation: 0,
      r: 200,
      g: 24,
      b: 200,
      alignment: "center",
    },
  },
  {
    id: 8,
    name: "wunderpen",
    changed: true,
    config: {
      text: "1",
      widthInMillimeters: 210,
      fontSize: 10,
      fontName: "sonderzeichenmesse",
      leftOffsetInMillimeters: 33,
      topOffsetInMillimeters: 20,
      multiline: true,
      lineHeight: 3,
      rotation: 0,
      r: 200,
      g: 24,
      b: 200,
      alignment: "center",
    },
  },
  {
    id: 2,
    changed: true,
    name: "sender",
    config: {
      text: "Rue Wafa Enfidha, 4030 Sousse, Tunisia",
      widthInMillimeters: 33,
      fontSize: 3,
      fontName: "conrad",
      leftOffsetInMillimeters: 157,
      topOffsetInMillimeters: 84,
      multiline: true,
      lineHeight: 4,
      rotation: -20,
      r: 0,
      g: 0,
      b: 0,
      alignment: "left",
    },
  },
  {
    id: 3,
    changed: true,
    name: "sender2",
    config: {
      text: "{{SENDER}}",
      widthInMillimeters: 33,
      fontSize: 4,
      fontName: "conrad",
      leftOffsetInMillimeters: 155,
      topOffsetInMillimeters: 79,
      multiline: true,
      lineHeight: 4,
      rotation: -20,
      r: 0,
      g: 0,
      b: 0,
      alignment: "left",
    },
  },
  {
    id: 4,
    changed: true,
    name: "date",
    config: {
      text: "2025-03-18",
      widthInMillimeters: 50,
      fontSize: 3,
      fontName: "jessy",
      leftOffsetInMillimeters: 160,
      topOffsetInMillimeters: 8,
      multiline: true,
      lineHeight: 10,
      rotation: 90,
      r: 0,
      g: 0,
      b: 200,
      alignment: "right",
    },
  },
  {
    id: 1,
    changed: true,
    name: "header",
    config: {
      text: "Dear {{COMPANY}} team :) ,",
      widthInMillimeters: 180,
      fontSize: 4,
      fontName: "jessy",
      leftOffsetInMillimeters: 18,
      topOffsetInMillimeters: 25,
      multiline: true,
      lineHeight: 10,
      rotation: 0,
      r: 0,
      g: 120,
      b: 0,
      alignment: "left",
    },
  },
  {
    id: 6,
    changed: true,
    name: "content",
    config: {
      text: "Thank you so much for your warm welcome, comfortable accommodations, and exceptional hospitality. Your support made my integration smooth and enjoyable. My deepest gratitude to Ahmad, Siva, An-Guo, Steffi, Momo & Coco, and the entire team for your exceptional efforts in making me feel at home.",
      widthInMillimeters: 185,
      fontSize: 5,
      fontName: "enrico",
      leftOffsetInMillimeters: 17,
      topOffsetInMillimeters: 39,
      multiline: true,
      lineHeight: 8,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
  },
  {
    id: 7,
    changed: true,
    name: "footer",
    config: {
      text: "Wishing you all continued success and prosperity!",
      widthInMillimeters: 185,
      fontSize: 4,
      fontName: "enrico",
      leftOffsetInMillimeters: 17,
      topOffsetInMillimeters: 79,
      multiline: true,
      lineHeight: 8,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
  },
];

export const defaultBlocksMap: Map<number, Block> = new Map(
  defaultBlocks.map((block) => [block.id, block])
);

export const defaultConfig: Config = {
  name: "Default",
  fontSizeDraw: 10,
  fontSizeOverlay: 60,
  posX: 0,
  posY: 0,
  servoAngleUp: 60,
  servoAngleHighUp: 50,
  servoAngleDown: 80,
  servoWaitTime: 80,
  printerSpeed: 3000,
  myAlignType: "AlignLeft",
  segmentLength: 0.5,
  angleThreshold: (5.0 / 180.0) * 3.14159,
  charDist: 0.0,
  imperfectY: 0.5,
  imperfectX: 2.0,
  lineDist: 10.0,
  rotate: 0,
  offsetBorderX: 20,
  offsetBorderY: 30,
  offsetRightBorder: 10,
  paperWidth: 20,
  paperHeight: 30,
  heightTopStripe: 2,
  heightBottomStripe: 2,
  heightRightStripe: 2,
  heightLeftStripe: 2,
  backGroundImageName: "",
  repeatShiftX: 50,
  repeatShiftY: 50,
  repeatX: 0,
  repeatY: 0,
  createPreviewImages: true,
  creationCanceled: false,
  creationIsRunning: false,
  picBoxDokSizeX: 0,
  picBoxDokSizeY: 0,
  curFontIndex: 0,
  id: 25,
};

export const mockBlock: Block = {
  id: 0,
  name: "new Block",
  changed: true,
  config: {
    text: "NEW BLOCK",
    widthInMillimeters: 210,
    fontSize: 7,
    fontName: "jessy",
    leftOffsetInMillimeters: 10,
    topOffsetInMillimeters: 10,
    multiline: true,
    lineHeight: 3,
    rotation: 0,
    r: 100,
    g: 100,
    b: 100,
    alignment: "left",
  },
};
