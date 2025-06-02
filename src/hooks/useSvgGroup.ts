// hooks/useSvgGroups.ts
import { useEffect } from "react";
import { extractGroupId, getMetadataBlock } from "../utils/strings";

/**
 * Custom React hook to extract <g> group elements from an SVG string
 * and store them in a Map keyed by their numeric ID.
 *
 * @param svgData - The full SVG markup as a string. Expected to follow this format:
 *   <svg ...>
 *     <g id="1">...</g>
 *     <g id="2">...</g>
 *     ...
 *   </svg>
 *
 * @param setSvgGroupsIdentifierContentMap - Callback to store the parsed groups as Map<number, string>
 *                       where key = group ID and value = raw <g> element string.
 */
export function useSvgGroups(
  svgData: string,
  setSvgGroupsIdentifierContentMap: (groups: Map<number, string>) => void,
  setGroupIdentifierUrlMap: (groups: Map<number, string>) => void
) {
  useEffect(() => {
    if (!svgData) return;

    // Remove <svg> wrapper lines, keep only group lines
    const groupLines = svgData.split("\n").slice(1, -1);

    const groups = new Map<number, string>();
    const identifierUrlMap = new Map<number, string>();
    groupLines.forEach((line) => {
      const id = extractGroupId(line);
      if (id !== null) {
        const metadata = getMetadataBlock(line);
        groups.set(id, line);
        if (metadata) identifierUrlMap.set(id, metadata);
      }
    });
    setGroupIdentifierUrlMap(identifierUrlMap);
    setSvgGroupsIdentifierContentMap(groups);
  }, [svgData]);
}
