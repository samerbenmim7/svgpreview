
import parse from 'html-react-parser';

export function extractBeforeAfter(str, id) {
    const startTag = `<g id='${id}'`
    const startIndex = str.indexOf(startTag)
    if (startIndex === -1) return { before: '', after: '' }
    const before = str.substring(0, startIndex)
    const endIndex = str.indexOf('</g>', startIndex)
    if (endIndex === -1) return { before, after: '' }
    const after = str.substring(endIndex + 4)
    return { before, after }
  }
  
  export function extractGId(str) {
    const gIndex = str.indexOf('<g')
    if (gIndex === -1) return null
    const idIndex = str.indexOf('id=', gIndex)
    if (idIndex === -1) return null
    const quoteChar = str.charAt(idIndex + 3)
    if (quoteChar !== '"' && quoteChar !== "'") return null
    const startOfId = idIndex + 4
    const endOfId = str.indexOf(quoteChar, startOfId)
    if (endOfId === -1) return null
    return parseInt(str.substring(startOfId, endOfId))
  }
  
  export function addWhiteBackgroundAndBordersToSVG(
    svgContent,
    firstfetch,
    oldSvgData,
    config,
    paperWidth,
    paperHeight
  ) {
    const conversionFactor = 300
    const dpi = 300
    const mmToInch = 25.4
    const marginLeft = (config.heightLeftStripe / mmToInch) * conversionFactor
    const marginRight = (config.heightRightStripe / mmToInch) * conversionFactor
    const marginTop = (config.heightTopStripe / mmToInch) * conversionFactor
    const marginBottom = (config.heightBottomStripe / mmToInch) * conversionFactor
    // const borders = `
    //   <rect x="0" y="0" width="100%" height="100%" fill="white"/>

    // `      // <rect x="${marginLeft}" y="0" width="1" height="200%" fill="red"/>
    // <rect x="${(paperWidth / mmToInch) * dpi - marginRight}" y="0" width="1" height="100%" fill="red"/>
    // <rect x="0" y="${marginTop}" width="100%" height="1" fill="red"/>
    // <rect x="0" y="${(paperHeight / mmToInch) * dpi - marginBottom}" width="100%" height="1" fill="red"/>
    let index = 0
    let count = 0
    while ((index = svgContent.indexOf("id='", index)) !== -1) {
      index++
      count++
      if (count > 1) return svgContent
    }
    firstfetch=true
    if (!firstfetch) {
      const id = extractGId(svgContent)
      const { before, after } = extractBeforeAfter(oldSvgData, id)
      svgContent = before + svgContent + after;

    }
    return svgContent
  }
  
  export function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }
  


export const jsxElement =(svgString) => parse(svgString, {
  replace(domNode) {
    if (domNode.attribs) {
      for (const [k, v] of Object.entries(domNode.attribs)) {
        const camel = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (camel !== k) {
          domNode.attribs[camel] = v;
          delete domNode.attribs[k];
        }
      }
    }
  },
});


export function pxToMm(px) {
  const cssDPI    = 96;
  const deviceDPR = window.devicePixelRatio || 1;
  const screenDPI = cssDPI * deviceDPR;
  return px * 25.4 / screenDPI;
}