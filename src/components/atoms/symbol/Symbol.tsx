import React from "react";

interface SymbolProps {
  id: number;
  size?: number;
  className?: string;
  handleAddBlock?: (character: string, fontName: string) => void;
  vb: number[];
  character: string;
  fontName: string;
}

export const Symbol: React.FC<SymbolProps> = ({
  id,
  size = 48,
  className = "",
  handleAddBlock,
  vb,
  character,
  fontName,
}) => {
  const [minX, minY, vbW, vbH] = vb;

  return (
    <svg
      className={className}
      style={{ cursor: "pointer" }}
      onClick={() => {
        if (handleAddBlock) handleAddBlock(character, fontName);
      }}
      width={size}
      height={size}
      viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <use href={`#sym-${id}`} />
    </svg>
  );
};
