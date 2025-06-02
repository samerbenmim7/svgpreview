import React, { HTMLAttributes, useState } from "react";
import { ReactAnglePicker } from "react-angle-picker";
import { Block } from "../../../types/types";

interface BlockToolbarProps extends HTMLAttributes<HTMLDivElement> {
  visible: boolean;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  handleBlockChange: (
    e: React.ChangeEvent<HTMLInputElement> | null,
    key?: string,
    value?: number
  ) => void;
  block: Block;
  style?: React.CSSProperties;
}

export const BlockToolbar: React.FC<BlockToolbarProps> = ({
  visible,
  fontSize,
  onFontSizeChange,
  handleBlockChange,
  block,
  style,
  ...rest
}) => {
  const [angle, setAngle] = useState<number>(block.config.rotation);
  return <></>;
  return (
    <div
      onMouseEnter={rest.onMouseEnter}
      onMouseLeave={rest.onMouseLeave}
      style={{
        position: "absolute",
        zIndex: 9999,
        padding: "15px",
        transform: style?.transform,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        {...rest}
        style={{
          padding: "8px 10px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.98)",
          border: "1px solid #999",
          boxShadow: "0 8px 20px rgba(0,0,0,.4)",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          gap: 14,
          fontSize: 18,
          userSelect: "none",
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(-8px) scale(0.9)",
          transition: visible
            ? "opacity 200ms ease 500ms, transform 200ms ease 500ms"
            : "opacity 200ms ease 100ms, transform 200ms ease 100ms",
          pointerEvents: visible ? "auto" : "none",
          ...style,
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-around",
          }}
        >
          <span role="img" aria-label="edit">
            ✏️
          </span>
          <span role="img" aria-label="palette">
            🎨
          </span>
          <span role="img" aria-label="settings">
            ⚙️
          </span>
        </div>

        {/* Font size and rotation controls */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
          }}
        >
          <span style={{ fontSize: 16 }}>Aa</span>
          <input
            type="number"
            name="fontSize"
            min={1}
            max={120}
            value={block.config.fontSize}
            onChange={(e) => handleBlockChange(e)}
            style={{ width: 50, height: 20 }}
          />
          <div>{block.config.rotation}º</div>
          <ReactAnglePicker
            value={angle}
            width={40}
            onChange={(e: number) => setAngle(e)}
            onAfterChange={(e: number) => {
              handleBlockChange(null, "rotation", e);
            }}
          />
        </label>
      </div>
    </div>
  );
};
