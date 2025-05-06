import React from "react";

type Props = {
  label: string;
  direction?: "forward" | "back";
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  width?: string;
  height?: string;
  backgroundColor?: string;
  hoverColor?: string;
  color?: string;
  padding?: string;
  fontSize?: string;
  fontWeight?: string | number;
  borderRadius?: string;
  border?: string;
};

const Button: React.FC<Props> = ({
  label,
  direction,
  icon,
  onClick,
  disabled,
  width = "200px",
  height = "50px",
  backgroundColor = "#e3e55f",
  hoverColor = "#e0ddd9",
  color = "#000",
  padding = "10px 20px",
  fontSize = "1rem",
  fontWeight = "500",
  borderRadius = "10px",
  border = "none",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width,
        height,
        padding,
        backgroundColor,
        color,
        border,
        borderRadius,
        fontSize,
        fontWeight,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "left",
        gap: "10px",
        transition: "background-color 0.3s ease",
        margin: "5px 5px",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = hoverColor;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = backgroundColor;
      }}
    >
      <span>
        {icon ??
          (direction === "forward" ? "↷" : direction === "back" ? "↶" : "")}
      </span>
      {label}
    </button>
  );
};

export default Button;
