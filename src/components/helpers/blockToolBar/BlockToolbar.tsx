import React from "react";
import { HTMLAttributes } from "react";
import { ReactAnglePicker } from "react-angle-picker";

export function BlockToolbar(
  props: HTMLAttributes<HTMLDivElement> & {
    visible: boolean;
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    style?: React.CSSProperties;
    handleBlockChange;
    block;
  }
) {
  const {
    visible,
    fontSize,
    onFontSizeChange,
    style,
    handleBlockChange,
    block,
    ...rest
  } = props;
  const [angle, setAngle] = React.useState(block.config.rotation);

  return (
    <div
      onMouseEnter={rest.onMouseEnter}
      onMouseLeave={rest.onMouseLeave}
      style={{
        position: "absolute",
        zIndex: 9999,
        padding: "15px", // 👈 invisible hover margin
        transform: style?.transform, // allow caller to control placement
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

        {/* Font size control */}

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
            onChange={(e) => setAngle(e)}
            onAfterChange={(e) => {
              handleBlockChange(null, "rotation", e);
            }}
          />
        </label>
      </div>
    </div>
  );
}
