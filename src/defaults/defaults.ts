// defaults.ts

import { Block } from "../types/types";

// --------- Types ---------
export interface BlockConfig {
  text: string;
  widthInMillimeters: number;
  fontSize: number;
  fontName: string;
  path?: string;
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

// export interface Block {
//   id: number;
//   name?: string;
//   changed?: boolean;
//   config: BlockConfig;
// }

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
    id: 1,
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
      r: 0,
      g: 0,
      b: 200,
      alignment: "center",
    },
    isSymbol: false,
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
      r: 0,
      g: 0,
      b: 200,
      alignment: "center",
    },
    isSymbol: true,
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
      b: 200,
      alignment: "left",
    },
    isSymbol: false,
  },
  {
    id: 3,
    changed: true,
    name: "sender2",
    config: {
      text: "{{CUSTOM2}}",
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
      b: 200,
      alignment: "left",
    },
    isSymbol: false,
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
    isSymbol: false,
  },
  {
    id: 5,
    changed: true,
    name: "header",
    config: {
      text: "Dear {{CUSTOM1}} team :) ,",
      widthInMillimeters: 180,
      fontSize: 4,
      fontName: "jessy",
      leftOffsetInMillimeters: 18,
      topOffsetInMillimeters: 25,
      multiline: true,
      lineHeight: 10,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: false,
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
    isSymbol: false,
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
    isSymbol: false,
  },
];

export const defaultBlocks2: Block[] = [
  {
    id: 1,
    changed: true,
    name: "field-1",
    config: {
      text: "TEST (back view)",
      widthInMillimeters: 180,
      fontSize: 7,
      fontName: "jessy",
      leftOffsetInMillimeters: 63.93166593768518,
      topOffsetInMillimeters: 37.276666471823695,
      multiline: true,
      lineHeight: 10,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: false,
  },
  {
    id: 2,
    changed: true,
    name: "field-1",
    config: {
      text: "3",
      widthInMillimeters: 180,
      fontSize: 17,
      fontName: "test",
      leftOffsetInMillimeters: 23.93166593768518,
      topOffsetInMillimeters: 67.276666471823695,
      multiline: true,
      lineHeight: 10,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: false,
  },
  {
    id: 3,
    changed: true,
    name: "field-1",
    config: {
      text: "2",
      widthInMillimeters: 180,
      fontSize: 20,
      fontName: "test",
      leftOffsetInMillimeters: 180.93166593768518,
      topOffsetInMillimeters: 37.276666471823695,
      multiline: true,
      lineHeight: 10,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: false,
  },
  {
    id: 4,
    changed: true,
    name: "field-1",
    config: {
      text: "1",
      widthInMillimeters: 180,
      fontSize: 17,
      fontName: "test",
      leftOffsetInMillimeters: 93.93166593768518,
      topOffsetInMillimeters: 37.276666471823695,
      multiline: true,
      lineHeight: 10,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: false,
  },
  {
    id: 10,
    changed: true,
    name: "field-10",
    config: {
      text: "e",
      widthInMillimeters: 210,
      fontSize: 5,
      fontName: "sonderzeichentestse",
      leftOffsetInMillimeters: 3.703336067853674,
      topOffsetInMillimeters: 5.920000080624678,
      multiline: true,
      lineHeight: 3,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: true,
  },
  {
    id: 11,
    changed: true,
    name: "field-11",
    config: {
      text: "S",
      widthInMillimeters: 210,
      fontSize: 7,
      fontName: "sonderzeichentestse",
      leftOffsetInMillimeters: 12.110002156710152,
      topOffsetInMillimeters: 15.601667530022603,
      multiline: true,
      lineHeight: 3,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: true,
  },
  {
    id: 12,
    changed: true,
    name: "field-12",
    config: {
      text: "G",
      widthInMillimeters: 210,
      fontSize: 7,
      fontName: "sonderzeichen",
      leftOffsetInMillimeters: 24.263333487863967,
      topOffsetInMillimeters: 9.185000695387856,
      multiline: true,
      lineHeight: 3,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: true,
  },
  {
    id: 13,
    changed: true,
    name: "field-13",
    config: {
      text: "G",
      widthInMillimeters: 210,
      fontSize: 7,
      fontName: "sonderzeichen",
      leftOffsetInMillimeters: 35.391667993614504,
      topOffsetInMillimeters: 8.401666723775815,
      multiline: true,
      lineHeight: 3,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: true,
  },
  {
    id: 14,
    changed: true,
    name: "field-14",
    config: {
      text: "W",
      widthInMillimeters: 210,
      fontSize: 7,
      fontName: "sonderzeichen",
      leftOffsetInMillimeters: 182.25333072646873,
      topOffsetInMillimeters: 84.32499904258194,
      multiline: true,
      lineHeight: 3,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: true,
  },
  {
    id: 15,
    changed: true,
    name: "field-15",
    config: {
      text: "X",
      widthInMillimeters: 210,
      fontSize: 20,
      fontName: "sonderzeichen",
      leftOffsetInMillimeters: 185.3283312807634,
      topOffsetInMillimeters: 21.42666758041302,
      multiline: true,
      lineHeight: 3,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: true,
  },
  {
    id: 16,
    changed: true,
    name: "field-16",
    config: {
      text: "p",
      widthInMillimeters: 210,
      fontSize: 7,
      fontName: "sonderzeichen",
      leftOffsetInMillimeters: 94.3666671369773,
      topOffsetInMillimeters: 58.2099995364081,
      multiline: true,
      lineHeight: 3,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: true,
  },
];

export const defaultBlocks3: Block[] = [
  {
    id: 1,
    changed: true,
    name: "field-1",
    config: {
      text: "Samer Ben Mim",
      widthInMillimeters: 180,
      fontSize: 3,
      fontName: "conrad",
      leftOffsetInMillimeters: 18.423333326614593,
      topOffsetInMillimeters: 6.373333628957159,
      multiline: true,
      lineHeight: 10,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: false,
  },
  {
    id: 2,
    changed: true,
    name: "field-2",
    config: {
      text: "Im Heppächer 7",
      widthInMillimeters: 180,
      fontSize: 3,
      fontName: "conrad",
      leftOffsetInMillimeters: 18.211666663307287,
      topOffsetInMillimeters: 11.030000221717868,
      multiline: true,
      lineHeight: 10,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: false,
  },
  {
    id: 3,
    changed: true,
    name: "field-3",
    config: {
      text: "13407 Berlin",
      widthInMillimeters: 180,
      fontSize: 7,
      fontName: "conrad",
      leftOffsetInMillimeters: 86.57999891156682,
      topOffsetInMillimeters: 52.939999556564274,
      multiline: true,
      lineHeight: 10,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: false,
  },
  {
    id: 5,
    changed: true,
    name: "field-5",
    config: {
      text: "Aroser Allee 76,",
      widthInMillimeters: 180,
      fontSize: 7,
      fontName: "conrad",
      leftOffsetInMillimeters: 80.22999901234766,
      topOffsetInMillimeters: 42.568333054506326,
      multiline: true,
      lineHeight: 10,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: false,
  },
  {
    id: 7,
    changed: true,
    name: "field-7",
    config: {
      text: "72728, Esslingen Am Neckar",
      widthInMillimeters: 180,
      fontSize: 3,
      fontName: "conrad",
      leftOffsetInMillimeters: 16.94166668346346,
      topOffsetInMillimeters: 16.11000014109319,
      multiline: true,
      lineHeight: 10,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: false,
  },
  {
    id: 8,
    changed: true,
    name: "field-8",
    config: {
      text: "John Doe",
      widthInMillimeters: 180,
      fontSize: 7,
      fontName: "conrad",
      leftOffsetInMillimeters: 90.60166551440561,
      topOffsetInMillimeters: 33.88999985890681,
      multiline: true,
      lineHeight: 10,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: false,
  },
  {
    id: 14,
    changed: true,
    name: "field-14",
    config: {
      text: "W",
      widthInMillimeters: 210,
      fontSize: 9,
      fontName: "sonderzeichen",
      leftOffsetInMillimeters: 186.0633306660002,
      topOffsetInMillimeters: 12.99333350802014,
      multiline: true,
      lineHeight: 3,
      rotation: 0,
      r: 0,
      g: 0,
      b: 200,
      alignment: "left",
    },
    isSymbol: true,
  },
];

export const defaultBlocksMap: Map<number, Block> = new Map(
  defaultBlocks.map((block) => [block.id, block])
);

// export const defaultConfig: Config = {
//   name: "Default",
//   fontSizeDraw: 10,
//   fontSizeOverlay: 60,
//   posX: 0,
//   posY: 0,
//   servoAngleUp: 60,
//   servoAngleHighUp: 50,
//   servoAngleDown: 80,
//   servoWaitTime: 80,
//   printerSpeed: 3000,
//   myAlignType: "AlignLeft",
//   segmentLength: 0.5,
//   angleThreshold: (5.0 / 180.0) * 3.14159,
//   charDist: 0.0,
//   imperfectY: 0.5,
//   imperfectX: 2.0,
//   lineDist: 10.0,
//   rotate: 0,
//   offsetBorderX: 20,
//   offsetBorderY: 30,
// r:0,
//   paperWidth: 20,
//   paperHeight: 30,
//   heightTopStripe: 2,
//   heightBottomStripe: 2,
//   heightRightStripe: 2,
//   heightLeftStripe: 2,
//   backGroundImageName: "",
//   repeatShiftX: 50,
//   repeatShiftY: 50,
//   repeatX: 0,
//   repeatY: 0,
//   createPreviewImages: true,
//   creationCanceled: false,
//   creationIsRunning: false,
//   picBoxDokSizeX: 0,
//   picBoxDokSizeY: 0,
//   curFontIndex: 0,
//   id: 25,
// };

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
    r: 0,
    g: 0,
    b: 200,
    alignment: "left",
  },
  isSymbol: false,
};
