
interface ExtractResult {
  before: string;
  after: string;
}

interface Placeholder {
  name: string;
  value: string;
}

interface BlockConfig {
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

interface Block {
  id: number;
  config: BlockConfig;
}

interface BuildBodyDataParams {
  blocks: Block[];
  paperWidth: number;
  paperHeight: number;
  format: string;
  selectedConfigId: number;
  placeholders: Placeholder[];
  isTemplate: boolean;
}

export function extractBeforeAfter(str: string, id: number): ExtractResult {
  const startTag = `<g id='${id}'`;
  const startIndex = str.indexOf(startTag);
  if (startIndex === -1) {
    // when we append new block the id does not exsists
   const startIndex = str.indexOf('\n');
    return { before: str.substring(0, startIndex), after: str.substring(startIndex) };}
  const before = str.substring(0, startIndex);
  const endIndex = str.indexOf('</g>', startIndex);
  if (endIndex === -1) return { before, after: '' };
  const after = str.substring(endIndex + 4);
  return { before, after };
}

export function extractGId(str: string): number | null {
  const gIndex = str.indexOf('<g');
  if (gIndex === -1) return null;
  const idIndex = str.indexOf('id=', gIndex);
  if (idIndex === -1) return null;
  const quoteChar = str.charAt(idIndex + 3);
  if (quoteChar !== '"' && quoteChar !== "'") return null;
  const startOfId = idIndex + 4;
  const endOfId = str.indexOf(quoteChar, startOfId);
  if (endOfId === -1) return null;
  return parseInt(str.substring(startOfId, endOfId));
}

export function addWhiteBackgroundAndBordersToSVG(
  svgContent: string,
  oldSvgData: string,
): string {
  let index = 0;
  let count = 0;

  while ((index = svgContent.indexOf("id='", index)) !== -1) {
    index++;
    count++;
    if (count > 1) return svgContent;
  }
  if (count==1) {
    const id = extractGId(svgContent);

    if (id !== null) {
      const { before, after } = extractBeforeAfter(oldSvgData, id);


      svgContent = before +"\n"+removeFirstAndLastLine(svgContent) + after;
    }
  } 

  return svgContent;
}

export function downloadFile(content: BlobPart, fileName: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}



export function pxToMm(px: number): number {
  const cssDPI = 96;
  const deviceDPR = window.devicePixelRatio || 1;
  const screenDPI = cssDPI * deviceDPR;
  return (px * 25.4) / screenDPI;
}

export function buildBodyData({
  blocks,
  paperWidth,
  paperHeight,
  format,
  selectedConfigId,
  placeholders,
  isTemplate,
}: BuildBodyDataParams) {
  return {
    fields: blocks.map((b) => ({
      text: b.config.text,
      widthInMillimeters: b.config.widthInMillimeters,
      fontSize: b.config.fontSize,
      fontName: b.config.fontName,
      leftOffsetInMillimeters: b.config.leftOffsetInMillimeters,
      topOffsetInMillimeters: b.config.topOffsetInMillimeters,
      topdragOffsetInMillimeters: b.config.topdragOffsetInMillimeters,
      leftdragOffsetInMillimeters: b.config.leftdragOffsetInMillimeters,
      alignment: b.config.alignment,
      multiline: b.config.multiline,
      lineHeight: b.config.lineHeight,
      rotate: b.config.rotation,
      rgbColor: `${b.config.r},${b.config.g},${b.config.b}`,
      id: `${b.id}`,
    })),
    config: {
      paperWidthInMillimeters: paperWidth,
      paperHeightInMillimeters: paperHeight,
      format,
    },
    configId: selectedConfigId,
    placeholdersValues: placeholders.reduce<Record<string, string>>((acc, ph) => {
      if (ph.name) {
        acc[ph.name] = ph.value;
      }
      return acc;
    }, {}),
    isTemplate,
  };
}
function removeFirstAndLastLine(text) {
  const lines = text.split('\n');
  lines.shift();    // remove first line
  lines.pop();      // remove last line
  return lines.join('\n');
}


export function deleteGroupFromSvgString(str,id){
  const { before, after } = extractBeforeAfter(str, id);
  return before + after

}

export function getRandom(min ,max) {
   return Math.floor(Math.random() * (max - min + 1)) + min;
}
