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
  setAlign: (align: string) => void;
  setPaperWidth: (width: number) => void;
  setPaperHeight: (height: number) => void;
  size: string;
  setSize: (size: string) => void;
}

export default function BlocksConfiguratorCard({
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
}) {
  const [font, setFont] = useState("Bradley Hand");
  const [weight, setWeight] = useState("regular");
  const [opacity, setOpacity] = useState(100);

  return (
    <>
      <textarea
        onChange={handleBlockChange}
        value={
          blocks.find((b) => b.id == selectedBlockIndex)?.config.text || ""
        }
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
        {["Bradley Hand", "Arial", "Courier", "Times"].map((f) => (
          <option key={f}>{f}</option>
        ))}
      </select>

      {/* font size & weight */}
      <div className={styles.row}>
        <div className={styles.colorDot} />
        <select
          className={styles.smallSelect}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        >
          {[8, 12, 16, 18, 24, 32, 48].map((s) => (
            <option key={s}>{s} pt</option>
          ))}
        </select>
        <select
          className={styles.smallSelect}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        >
          {["light", "regular", "bold"].map((w) => (
            <option key={w}>{w}</option>
          ))}
        </select>
      </div>

      <div className={styles.label}>Ausrichtung</div>

      {/* wrapper now shows outline */}
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
            {dir === "left" && "≡"}
            {dir === "center" && "≡"}
            {dir === "right" && "≡"}
          </button>
        ))}
      </div>

      {/* Deckkraft */}
      <div className={styles.label}>Deckkraft</div>
      <div className={styles.sliderRow}>
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          style={{ flex: 1 }}
          className={styles.rangeTrack}
        />
        <div className={styles.percentBox}>{opacity}%</div>
      </div>
    </>
  );
}
