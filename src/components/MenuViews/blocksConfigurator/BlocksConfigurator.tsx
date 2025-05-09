import React, { useState } from "react";
import styles from "./blocksConfigurator.module.css";
import { Block } from "../../../types/types";

interface BlocksConfiguratorCardProps {
  handleBlockChange: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | null,
    text?: string
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
}

const fontOptions = ["Bradley Hand", "Arial", "Courier", "Times"];
const sizeOptions = [8, 12, 16, 18, 24, 32, 48];
const weightOptions = ["light", "regular", "bold"] as const;

const BlocksConfiguratorCard: React.FC<BlocksConfiguratorCardProps> = ({
  handleBlockChange,
  blocks,
  selectedBlockIndex,
  setSelectedBlockIndex,
  align,
  setAlign,
  setPaperWidth,
  setPaperHeight,
  size,
  setSize,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [font, setFont] = useState<string>("Bradley Hand");
  const [weight, setWeight] = useState<string>("regular");
  const [opacity, setOpacity] = useState<number>(100);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockIndex);

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
          style={{ fontFamily: font }}
          value={font}
          onChange={(e) => setFont(e.target.value)}
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
            value={size}
            onChange={(e) => setSize(e.target.value)}
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
