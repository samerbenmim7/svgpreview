import { SplitStringResult } from "../types/types";

export function addWhiteBackgroundAndBordersToSVG(
  svgContent: string,
  oldSvgData: string
): string {
  let index = 0;
  let count = 0;
  while ((index = svgContent.indexOf("id='", index)) !== -1) {
    index++;
    count++;
    if (count > 1) return svgContent;
  }

  if (count == 1 && oldSvgData == "") return svgContent;
  if (count == 1) {
    const id = extractGroupId(svgContent);

    if (id !== null) {
      const { before, after } = splitAroundSubstring(oldSvgData, id);
      svgContent = before + "\n" + removeFirstAndLastLine(svgContent) + after;
    }
  }

  return svgContent;
}

export function removeFirstAndLastLine(text: string): string {
  const lines = text.split("\n");
  lines.shift();
  lines.pop();
  return lines.join("\n");
}

export function deleteGroupFromSvgString(str: string, id: number): string {
  const { before, after } = splitAroundSubstring(str, id);
  return before + after;
}
export function splitAroundSubstring(
  full: string,
  targetId: number
): SplitStringResult {
  const startTag = `<g id='${targetId}'`;
  const startIndex = full.indexOf(startTag);
  if (startIndex === -1) {
    const startIndex = full.indexOf("\n");
    return {
      before: full.substring(0, startIndex),
      after: full.substring(startIndex),
    };
  }
  const before = full.substring(0, startIndex);
  const endIndex = full.indexOf("</g>", startIndex);
  if (endIndex === -1) return { before, after: "" };
  const after = full.substring(endIndex + 4);
  return { before, after };
}

export function extractGroupId(str: string): number | null {
  const gIndex = str.indexOf("<g");
  if (gIndex === -1) return null;
  const idIndex = str.indexOf("id=", gIndex);
  if (idIndex === -1) return null;
  const quoteChar = str.charAt(idIndex + 3);
  if (quoteChar !== '"' && quoteChar !== "'") return null;
  const startOfId = idIndex + 4;
  const endOfId = str.indexOf(quoteChar, startOfId);
  if (endOfId === -1) return null;
  return parseInt(str.substring(startOfId, endOfId));
}

export function getMetadataBlock(svgLine: string): string | null {
  const OPEN = "<metadata>";
  const CLOSE = "</metadata>";
  const metaStart = svgLine.indexOf(OPEN);
  if (metaStart === -1) return null;

  const metaEnd = svgLine.indexOf(CLOSE, metaStart);
  if (metaEnd === -1) return null;

  const metaValue = svgLine.slice(metaStart + OPEN.length, metaEnd);

  return metaValue;
}
