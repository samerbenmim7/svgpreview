import { useEffect } from "react";
import { extractGId } from "../utils/utils";

export function useSvgGroups(
  svgData: string,
  svgGroups: Map<number, string>,
  setSvgGroups: (groups: Map<number, string>) => void
) {
  useEffect(() => {
    if (!svgData) return;
    const splittedData = svgData.split("\n").slice(1, -1);
    const updated = new Map<number, string>();
    splittedData.forEach((block) => {
      const id = extractGId(block);
      if (id !== null) {
        updated.set(id, block);
      }
    });
    setSvgGroups(updated);
  }, [svgData]);
}
