import React, { useMemo, useState } from "react";
import styles from "./symbolsConfigurator.module.css";
import ImageSwiper from "../../helpers/swiper/Swiper";
import { useSpriteLoader } from "../../../hooks/useSpriteLoader";

interface SymbolsConfiguratorProps {
  setBackgroundImage: (url: string) => void;
  handleAddBlock: (character: string, fontName: string) => void;
}

const SymbolsConfigurator: React.FC<SymbolsConfiguratorProps> = ({
  setBackgroundImage,
  handleAddBlock,
}) => {
  const [opacity, setOpacity] = useState<number>(100);
  const [blurValue, setBlurValue] = useState<number>(0);
  const [tagsFilter, setTagsFilter] = useState<string>("");

  const symbolCount = useSpriteLoader();

  const changeValue = (delta: number) => {
    setBlurValue((prev) => Math.max(0, Math.min(100, prev + delta)));
  };

  const symbolIds = useMemo(() => {
    const ids: number[] = [];

    for (let i = 0; i < symbolCount; i++) {
      const symbolElement = document.getElementById(`sym-${i + 1}`);
      const tags = symbolElement?.getAttribute("tags") || "";

      if (!tagsFilter || tags.includes(tagsFilter)) {
        ids.push(i + 1);
      }
    }

    return ids;
  }, [symbolCount, tagsFilter]);

  return (
    <div className={styles.container}>
      <div>
        <div style={{ margin: "10px 0" }}>Browse</div>
        <div
          style={{
            width: "100%",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <input
            type="text"
            className={styles.input}
            placeholder="Type to search..."
            value={tagsFilter}
            onChange={(e) => setTagsFilter(e.target.value)}
          />
          <br />
          <ImageSwiper
            forsprites
            symbolCount={symbolCount}
            handleAddBlock={handleAddBlock}
            symbolIds={symbolIds}
          />
        </div>
      </div>

      <br />
      <br />

      <div style={{ display: "flex", width: "100%" }}>
        <div style={{ width: "60%" }}>
          <div>Background color</div>
          <div
            style={{ marginTop: "10px", cursor: "pointer" }}
            onClick={() => setBackgroundImage("")}
          >
            No BG
          </div>
        </div>

        <div style={{ width: "40%" }}>
          <div>Blur</div>
          <div className={styles.wrapper} style={{ marginTop: "10px" }}>
            <div>
              <input
                type="number"
                className={styles.inputBox}
                value={blurValue}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setBlurValue(
                    isNaN(val) ? 0 : Math.max(0, Math.min(100, val))
                  );
                }}
              />
              <span className={styles.percentSymbol}>%</span>
            </div>
            <div className={styles.customArrows}>
              <div
                onClick={() => changeValue(1)}
                style={{ transform: "rotateZ(90deg)" }}
              >
                ‹
              </div>
              <div
                onClick={() => changeValue(-1)}
                style={{ transform: "rotateZ(90deg)" }}
              >
                ›
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.label}>Opacity</div>
      <div className={styles.sliderRow}>
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          className={styles.rangeTrack}
          style={{ flex: 1 }}
        />
        <div className={styles.percentBox}>{opacity}%</div>
      </div>
    </div>
  );
};

export default SymbolsConfigurator;
