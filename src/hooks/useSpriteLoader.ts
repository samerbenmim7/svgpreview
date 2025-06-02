// hooks/useSpriteLoader.ts
import { useEffect, useState } from "react";
import { get } from "../services/inkloomApi";

/**
 * Custom hook that fetches an SVG sprite file from a given URL,
 * injects it into the DOM (hidden), and returns the number of <symbol> elements it contains.
 *
 * @param url - The URL of the SVG sprite file.
 * @returns The number of <symbol> elements found in the loaded sprite.
 */

export function useSpriteLoader(url = "/icons/sprite.svg") {
  const [symbolCount, setSymbolCount] = useState(0);

  useEffect(() => {
    const fetchSprite = async () => {
      try {
        const { text } = await get(url);

        const div = document.createElement("div");
        div.style.display = "none";
        div.innerHTML = text;
        document.body.prepend(div);

        const svg = div.querySelector("svg");
        const symbols = svg?.querySelectorAll("symbol") || [];
        setSymbolCount(symbols.length);
      } catch (err) {
        console.error("Failed to load sprite:", err);
      }
    };

    fetchSprite();
  }, [url]);

  return symbolCount;
}
