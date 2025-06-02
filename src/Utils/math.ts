import { Block } from "../types/types";

export function findNextAvailableBlockId(blocks: Block[]): number {
  const usedIds = new Set(blocks.map((block) => block.id));

  let nextId = 0;
  while (usedIds.has(nextId)) {
    nextId++;
  }
  return nextId;
}

export function pxToMm(px: number): number {
  const cssDPI = 96;
  const deviceDPR = window.devicePixelRatio || 1;
  const screenDPI = cssDPI * deviceDPR;
  return (px * 25.4) / screenDPI;
}

export function getRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
