import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./blocksConfigurator.module.css";
import { Block } from "../../../types/types";
import Button from "../../atoms/button/Button";
import { ReactAnglePicker } from "react-angle-picker";
import {
  PEN_BLUE_DEGREE,
  MAX_NUMBER_OF_CHARS_PER_BLOCK,
} from "../../../utils/const";

interface BlocksConfiguratorCardProps {
  handleBlockChange: any;
  blocks: Block[];
  selectedBlockIndex: number;
  setSelectedBlockIndex: (index: number) => void;

  setPaperWidth: (width: number) => void;
  setPaperHeight: (height: number) => void;

  onMouseEnter: any;
  onMouseLeave: any;
  font: any;
  selectedConfigId: any;
  setSelectedConfigId: any;
  setSync: any;
  paperWidth: any;
  setPlaceholders: any;
  placeholders: any;
  textColor: any;
  setTextColor: any;
}

const fontOptions = [
  "enrico",
  "conrad",
  "jessy",
  "david",
  "boyd",
  "test",
  "custom-signature",
];
const sizeOptions = Array.from({ length: 30 }, (_, i) => i + 1);
const writingOptionsMap: Record<string, number> = {
  Regular: 25,
  Spaced: 28,
  Messy: 26,
  Custom: 30,
};
const BlocksConfiguratorCard: React.FC<BlocksConfiguratorCardProps> = ({
  handleBlockChange,
  blocks,
  selectedBlockIndex,
  // align,
  // setAlign,
  // size,
  // setSize,
  onMouseEnter,
  onMouseLeave,
  font,
  selectedConfigId,
  setSelectedConfigId,
  setSync,
  paperWidth,
  setPlaceholders,
  placeholders,
  textColor,
  setTextColor,
}) => {
  const selectedBlock = useMemo(() => {
    return blocks.find((b) => b.id === selectedBlockIndex);
  }, [blocks, selectedBlockIndex]);
  const [angle, setAngle] = useState<number>(
    selectedBlock?.config.rotation ?? 0
  );

  const [sliderValue, setSliderValue] = useState<number>(100);

  useEffect(() => {
    setSliderValue(
      ((selectedBlock?.config.widthInMillimeters ?? 0) / paperWidth) * 100
    );
  }, [selectedBlockIndex, paperWidth]);

  function getNextPlaceholderId(existing: string[]): number {
    const used = new Set(
      existing
        .map((p) => {
          return p[9];
        })
        .map(Number)
    );

    for (let i = 1; i <= existing.length + 1; i++) {
      if (!used.has(i)) return i;
    }

    return existing.length;
  }

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertPlaceholder = () => {
    if (placeholders.length > 4) return;
    console.log("insert placehoder", placeholders.length);

    const textarea = textareaRef.current;
    const value = selectedBlock?.config.text || "";

    if (!textarea) return;
    console.log("text area exists");

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const id = getNextPlaceholderId(placeholders);

    const placeholderName = ` {{CUSTOM${id}}} `;
    const newValue = before + placeholderName + after;
    setPlaceholders((prev: any) => [...prev, placeholderName]);
    handleBlockChange({ source: "field", name: "text", value: newValue });
    // Move cursor after the inserted placeholder
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 12, start + 12);
    }, 0);
  };
  const removePlaceholder = (label: string) => () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    setPlaceholders((prev: any) =>
      prev.filter((p: any) => p != ` {{${label}}} `)
    );
    const value = selectedBlock?.config.text || "";

    /* escape special chars in the label */
    const safe = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    /*  match:
        - any leading spaces
        - {{   optional spaces   LABEL   optional spaces   }}
        - any trailing spaces
        The final "?" after \s* keeps it from eating new-lines. */
    const regex = new RegExp(`\\s*\\{\\{\\s*${safe}\\s*\\}\\}\\s*`, "g");

    let newValue = value.replace(regex, " ");

    /* collapse multiple blanks created by the replacement */
    newValue = newValue.replace(/\s{2,}/g, " ");

    /* trim top-level start / end spaces (optional) */
    newValue = newValue.trim();

    handleBlockChange({ source: "field", name: "text", value: newValue });
    /* restore focus */
    setTimeout(() => textarea.focus(), 0);
  };

  const p = useMemo(() => {
    const text = selectedBlock?.config.text || "";
    const set = new Set<string>();

    const regex = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      set.add(match[1]); // capture group without the curly braces
    }
    return Array.from(set); // ["CUSTOM1", "CUSTOM3", ...]
  }, [selectedBlock?.config.text]);

  if (selectedBlock?.isSymbol)
    return (
      <>
        <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          SYMBOL / SIGNATURE VIEW
          <div className={styles.row}>
            <div
              className={styles.colorDot}
              onClick={(e) => {
                setTextColor(textColor == PEN_BLUE_DEGREE ? 0 : 122);
                handleBlockChange({
                  source: "field",
                  name: "b",
                  value: textColor == PEN_BLUE_DEGREE ? 0 : PEN_BLUE_DEGREE,
                });
              }}
              style={{
                cursor: "pointer",
                background: textColor == 0 ? "black" : "blue",
              }}
            />
            <select
              className={styles.smallSelect}
              value={selectedBlock?.config.fontSize}
              onChange={(e) =>
                //handleBlockChange(null, "fontSize", e.target.value)
                handleBlockChange({
                  source: "field",
                  name: "fontSize",
                  value: e.target.value,
                })
              }
            >
              {sizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s} pt
                </option>
              ))}
            </select>
          </div>
          {/* Deckkraft (Opacity) */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "30%" }}>
              <div className={styles.label}>Rotation</div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                }}
              >
                <ReactAnglePicker
                  value={angle}
                  width={40}
                  onChange={(e: number) => setAngle(e)}
                  onAfterChange={(e: number) => {
                    handleBlockChange({
                      source: "field",
                      name: "rotation",
                      value: e,
                    });
                    //handleBlockChange(null, "rotation", e);
                  }}
                />
                <div>{selectedBlock?.config.rotation}º</div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  return (
    <>
      <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <textarea
          ref={textareaRef}
          onChange={(e) => {
            if (e.target.value.length <= MAX_NUMBER_OF_CHARS_PER_BLOCK)
              handleBlockChange({ source: "event", event: e });
          }}
          value={selectedBlock?.config.text || ""}
          name="text"
          className={styles.headerTextArea}
          placeholder="Text hinzufügen"
        />
        <Button
          label="Add Placeholder"
          icon={<i className="bi bi-plus-circle"></i>}
          onClick={insertPlaceholder}
          width="120px"
          height="20px"
          padding="5px"
          backgroundColor="transparent"
          hoverColor="transparent"
          color="black"
          fontSize="11px"
          fontWeight="300"
          borderRadius="8px"
          border="solid 1px black"
          disabled={placeholders.length > 4}
        />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap" /* Allows wrapping if needed */,
          }}
        >
          {p.map((label) => (
            <Button
              key={label}
              label={label}
              icon={
                <i
                  className="bi bi-trash3"
                  style={{ marginRight: -8, color: "blue" }}
                />
              }
              onClick={removePlaceholder(label)}
              width="73px"
              height="20px"
              padding="4px"
              backgroundColor="transparent"
              hoverColor="transparent"
              color="blue"
              fontSize="10px"
              fontWeight="300"
              borderRadius="8px"
              border="solid 1px blue"
            />
          ))}
        </div>

        {/* <div
          style={{ cursor: "pointer", width: "120px", fontSize: "12px" }}
          className={styles.smallSelect}
          onClick={insertPlaceholder}
        >
          Add Placeholder
        </div> */}
        <hr className={styles.hr} />

        {/* Schriftart */}
        <div className={styles.label}>Font</div>
        <select
          className={styles.select}
          style={{ fontFamily: "Bradley Hand" }}
          value={selectedBlock?.config.fontName}
          onChange={(e) => {
            //handleBlockChange(null, "fontName", e.target.value);
            handleBlockChange({
              source: "field",
              name: "fontName",
              value: e.target.value,
            });
          }}
        >
          {fontOptions.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        {/* Font size & writingOptions */}
        <div className={styles.row}>
          <div
            className={styles.colorDot}
            onClick={(e) => {
              setTextColor(textColor == PEN_BLUE_DEGREE ? 0 : PEN_BLUE_DEGREE);
              handleBlockChange({
                source: "field",
                name: "b",
                value: textColor == PEN_BLUE_DEGREE ? 0 : PEN_BLUE_DEGREE,
              });
            }}
            style={{
              cursor: "pointer",
              background: textColor == 0 ? "black" : "blue",
            }}
          />
          <select
            className={styles.smallSelect}
            value={selectedBlock?.config.fontSize}
            onChange={(e) =>
              //handleBlockChange(null, "fontSize", e.target.value)
              handleBlockChange({
                source: "field",
                name: "fontSize",
                value: e.target.value,
              })
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
            value={selectedConfigId}
            onChange={(e) => {
              setSelectedConfigId(e.target.value);
              setSync(true);
            }}
          >
            {Object.entries(writingOptionsMap).map(([label, id]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Alignment */}
        <div
          style={{
            display: "flex",
            alignItems: "end",
            justifyContent: "space-between",
            margin: "10px 0",
          }}
        >
          <div>
            <div className={styles.label}>Text alignment</div>
            <div className={styles.alignGroup}>
              {(["left", "center", "right"] as const).map((dir) => (
                <button
                  key={dir}
                  className={`${styles.alignBtn} ${
                    selectedBlock?.config.alignment === dir
                      ? styles.alignBtnActive
                      : ""
                  }`}
                  onClick={() =>
                    handleBlockChange({
                      source: "field",
                      name: "alignment",
                      value: dir,
                    })
                  }
                  aria-label={dir}
                >
                  {dir == "left" && <i className="bi bi-text-left"></i>}
                  {dir == "center" && <i className="bi bi-justify"></i>}
                  {dir == "right" && <i className="bi bi-text-right"></i>}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className={styles.label}>Line Height</div>

            <div className={styles.wrapper} style={{ width: "100%" }}>
              <div>
                <input
                  type="number"
                  className={styles.inputBox}
                  value={selectedBlock?.config.lineHeight}
                  onChange={() => {}}
                />
                {/* <span className={styles.percentSymbol}> </span> */}
              </div>
              <div className={styles.customArrows}>
                <div
                  onClick={(e) => {
                    if (selectedBlock?.config?.lineHeight == undefined) return;

                    handleBlockChange({
                      source: "field",
                      name: "lineHeight",
                      value: selectedBlock?.config?.lineHeight
                        ? selectedBlock?.config?.lineHeight + 1
                        : 1,
                    });
                    // handleBlockChange(
                    //   null,
                    //   "lineHeight",

                    // );
                  }}
                  style={{ transform: "rotateZ(90deg)" }}
                >
                  ‹
                </div>
                <div
                  style={{ transform: "rotateZ(90deg)" }}
                  onClick={(e) => {
                    if (!selectedBlock?.config?.lineHeight) return;

                    handleBlockChange({
                      source: "field",
                      name: "lineHeight",
                      value: Math.max(
                        0,
                        selectedBlock?.config?.lineHeight
                          ? selectedBlock?.config?.lineHeight - 1
                          : 0
                      ),
                    });
                    // handleBlockChange(
                    //   null,
                    //   "lineHeight",
                    //   Math.max(
                    //     0,
                    //     selectedBlock?.config?.lineHeight
                    //       ? selectedBlock?.config?.lineHeight - 1
                    //       : 0
                    //   )
                    // );
                  }}
                >
                  ›
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deckkraft (Opacity) */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ width: "70%" }}>
            <div style={{ width: "90%" }}>
              <div className={styles.label}>Field Width</div>
              <div className={styles.sliderRow}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderValue}
                  onChange={(e) =>
                    setSliderValue(Math.max(Number(e.target.value), 1))
                  }
                  onMouseUp={() =>
                    handleBlockChange({
                      source: "field",
                      name: "widthInMillimeters",
                      value: Math.floor((sliderValue / 100) * paperWidth),
                    })
                  }
                  onTouchEnd={() =>
                    handleBlockChange({
                      source: "field",
                      name: "widthInMillimeters",
                      value: Math.floor((sliderValue / 100) * paperWidth),
                    })
                  }
                  className={styles.rangeTrack}
                  style={{ flex: 1, width: "90%" }}
                />
                <div className={styles.percentBox}>
                  {Math.floor(sliderValue)}%
                </div>
              </div>
            </div>
          </div>
          <div style={{ width: "30%" }}>
            <div className={styles.label}>Rotation</div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <ReactAnglePicker
                value={angle}
                width={40}
                onChange={(e: number) => setAngle(e)}
                onAfterChange={(e: number) => {
                  handleBlockChange({
                    source: "field",
                    name: "rotation",
                    value: e,
                  });
                  //handleBlockChange(null, "rotation", e);
                }}
              />
              <div>{selectedBlock?.config.rotation}º</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlocksConfiguratorCard;
