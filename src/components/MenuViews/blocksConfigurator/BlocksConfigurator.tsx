import React, { useMemo, useState } from "react";
import styles from "./blocksConfigurator.module.css";
import { Block } from "../../../types/types";

interface BlocksConfiguratorCardProps {
  handleBlockChange: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | null,
    text?: string,
    value?: string
  ) => void;
  blocks: Block[];
  selectedBlockIndex: number;
  setSelectedBlockIndex: (index: number) => void;
  align: string;
  setAlign: (align: "left" | "center" | "right") => void;
  setPaperWidth: (width: number) => void;
  setPaperHeight: (height: number) => void;
  size: string;
  setSize: (size: string) => void;
  onMouseEnter;
  onMouseLeave;
  font;
}

const fontOptions = ["enrico", "conrad", "jessy", "david"];
const sizeOptions = Array.from({ length: 30 }, (_, i) => i + 1);
const weightOptions = ["light", "regular", "bold"] as const;

const BlocksConfiguratorCard: React.FC<BlocksConfiguratorCardProps> = ({
  handleBlockChange,
  blocks,
  selectedBlockIndex,
  align,
  setAlign,
  size,
  setSize,
  onMouseEnter,
  onMouseLeave,
  font,
}) => {
  const [weight, setWeight] = useState<string>("regular");
  const [opacity, setOpacity] = useState<number>(100);

  const selectedBlock = useMemo(() => {
    return blocks.find((b) => b.id === selectedBlockIndex);
  }, [blocks, selectedBlockIndex]);
  console.log(selectedBlock?.config.fontSize);
  return (
    <>
      <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <textarea
          onChange={handleBlockChange}
          value={selectedBlock?.config.text || ""}
          name="text"
          className={styles.headerTextArea}
          placeholder="Text hinzufügen"
        />

        <hr className={styles.hr} />

        {/* Schriftart */}
        <div className={styles.label}>Schriftart</div>
        <select
          className={styles.select}
          style={{ fontFamily: "Bradley Hand" }}
          value={selectedBlock?.config.fontName}
          onChange={(e) => {
            handleBlockChange(null, "fontName", e.target.value);
          }}
        >
          {fontOptions.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        {/* Font size & weight */}
        <div className={styles.row}>
          <div className={styles.colorDot} />
          <select
            className={styles.smallSelect}
            value={selectedBlock?.config.fontSize}
            onChange={(e) =>
              handleBlockChange(null, "fontSize", e.target.value)
            }
          >
            {sizeOptions.map((s) => (
              <option key={s} value={s}>
                {s} pt
              </option>
            ))}
          </select>
          <select
            className={styles.smallSelect}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          >
            {weightOptions.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        {/* Alignment */}
        <div className={styles.label}>Ausrichtung</div>
        <div className={styles.alignGroup}>
          {(["left", "center", "right"] as const).map((dir) => (
            <button
              key={dir}
              className={`${styles.alignBtn} ${
                align === dir ? styles.alignBtnActive : ""
              }`}
              onClick={() => setAlign(dir)}
              aria-label={dir}
            >
              ≡
            </button>
          ))}
        </div>

        {/* Deckkraft (Opacity) */}
        <div className={styles.label}>Deckkraft</div>
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
    </>
  );
};

export default BlocksConfiguratorCard;
