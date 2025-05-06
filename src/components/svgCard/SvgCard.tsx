import React, { useRef, useState, useEffect, HTMLAttributes } from "react";
import styles from "./svgCard.module.css";
import DraggableGroup from "../draggbleGroup/DraggableGroup";
import { PX_PER_MM } from "../../Utils/const";

import { Position } from "../../types/types";
import { BlockToolbar } from "../helpers/blockToolBar/BlockToolbar.tsx";

interface SvgCardProps {
  svgGroups: Map<number, string>;
  positions: Record<number, Position>;
  setSelectedBlockIndex: (index: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  cardRef: React.RefObject<HTMLDivElement | null>;
  setPositions: React.Dispatch<React.SetStateAction<Record<number, Position>>>;
  setBlocks: React.Dispatch<any>;
  setSync: React.Dispatch<any>;
  pushHistory: any;
  zoom: number;
  pageWidth;
  pageHeight;
  isFlipped: boolean;
  undo: any;
  redo: any;
  selectedBlockIndex;
  handleBlockChange;
  blocks;
  backgroundImage;
}

// --- Component ---
export default function SvgCard({
  svgGroups,
  positions,
  setSelectedBlockIndex,
  selectedBlockIndex,
  containerRef,
  cardRef,
  setPositions,
  setBlocks,
  setSync,
  pushHistory,
  zoom,
  pageWidth,
  pageHeight,
  isFlipped,
  handleBlockChange,
  blocks,
  backgroundImage,
}: SvgCardProps) {
  const currentTilt = useRef({ x: 0, y: 0 });
  const targetTilt = useRef({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(-1);
  const [lastHovered, setLastHovered] = useState(-1);

  const [isCurrentlyDragging, setIsCurrentlyDragging] = useState(false);

  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const maxTilt = 12;
  const perspective = 1500;
  const scale = 1.01;
  const speed = 0.05;

  const animateTilt = () => {
    currentTilt.current.x +=
      (targetTilt.current.x - currentTilt.current.x) * speed;
    currentTilt.current.y +=
      (targetTilt.current.y - currentTilt.current.y) * speed;

    if (cardRef?.current) {
      cardRef.current.style.transform = `
        perspective(${perspective}px)
        rotateX(${currentTilt.current.x}deg)
        rotateY(${currentTilt.current.y}deg)
        scale(${scale})
      `;
    }
    requestAnimationFrame(animateTilt);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef?.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const diffX = event.clientX - centerX;
      const diffY = event.clientY - centerY;

      const normX = diffX / (rect.width / 2);
      const normY = diffY / (rect.height / 2);

      const clampedNormX = Math.max(-0.2, Math.min(0.2, normX));
      const clampedNormY = Math.max(-0.2, Math.min(0.2, normY));

      targetTilt.current.x = clampedNormY * maxTilt * -1;
      targetTilt.current.y = clampedNormX * maxTilt;
    }
  };

  useEffect(() => {
    requestAnimationFrame(animateTilt);
  }, []);
  useEffect(() => {}, [toolbarPos]);
  const handleDragEnd = (
    _: any,
    data: { x: number; y: number },
    id: number
  ) => {
    const newPos = {
      x: (positions[id]?.x || 0) + data.x,
      y: (positions[id]?.y || 0) + data.y,
    };

    const mmX = newPos.x / PX_PER_MM;
    const mmY = newPos.y / PX_PER_MM;

    setPositions((prev) => ({
      ...prev,
      [id]: newPos,
    }));
    setSync(true);
    setBlocks((prevBlocks: any[]) =>
      prevBlocks.map((block) => {
        if (block.id !== id) return { ...block, changed: false };
        return {
          ...block,
          changed: true,
          config: {
            ...block.config,
            topOffsetInMillimeters: block.config.topOffsetInMillimeters + mmY,
            leftOffsetInMillimeters: block.config.leftOffsetInMillimeters + mmX,
          },
        };
      })
    );
  };
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: (toolbarPos.y / 100) * zoom,
          left: (toolbarPos.x / 100) * zoom,
          pointerEvents: "auto",
          width: "100px",
          height: "100px",
          zIndex: 999,
        }}
      >
        <BlockToolbar
          visible={isHovered != -1 && !isCurrentlyDragging}
          onMouseEnter={() => setIsHovered(lastHovered)}
          onMouseLeave={() => setIsHovered(-1)}
          fontSize={18}
          handleBlockChange={handleBlockChange}
          block={blocks.find((b) => b.id == selectedBlockIndex)}
          onFontSizeChange={function (size: number): void {
            throw new Error("Function not implemented.");
          }}
        />
      </div>
      {/* <div className={styles.svgContainer} ref={containerRef}> */}
      <div
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: "right",
          transformBox: "fill-box",
          transition: "transform 0.6s",
        }}
      >
        <div
          ref={containerRef}
          style={{
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transformOrigin: "center",
            transition: "transform 0.6s",
          }}
          onMouseMove={handleMouseMove}
        >
          {/* <div
        ref={containerRef}
        style={{
          transform: `${isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"}  scale(${zoom / 100})`,
          transformOrigin: "right",
          transformBox: "fill-box",
          transition: "transform .6s",
        }}
        onMouseMove={handleMouseMove}
      > */}
          <div
            ref={cardRef}
            style={{
              boxShadow: "0 10px 16px #bbb",
              border: "1px solid #ddd",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.15)",
              color: "white",
              position: "relative",
              willChange: "transform",
              cursor: "pointer",
              backgroundSize: "100% 100%", // 👈 stretches to fill the box exactly
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundImage: `url("${backgroundImage}")`,
            }}
          >
            <svg
              id="svgPrev"
              xmlns="http://www.w3.org/2000/svg"
              height={pageHeight * PX_PER_MM}
              width={pageWidth * PX_PER_MM}
            >
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill={backgroundImage ? "transparent" : "white"}
              ></rect>

              {Array.from(svgGroups)
                .sort((a, b) => b[1].length - a[1].length)
                .map(([key, value]) => {
                  const position = positions[key] || { x: 0, y: 0 };
                  return (
                    <DraggableGroup
                      key={key}
                      index={key}
                      svgString={value}
                      zoom={zoom}
                      onStop={(e, data) => handleDragEnd(e, data, key)}
                      pushHistory={pushHistory}
                      position={position}
                      setSelectedBlockIndex={setSelectedBlockIndex}
                      selectedBlockIndex={selectedBlockIndex}
                      isHovered={isHovered}
                      setIsHovered={setIsHovered}
                      setLastHovered={setLastHovered}
                      setToolbarPos={setToolbarPos}
                      setIsCurrentlyDragging={setIsCurrentlyDragging}
                    />
                  );
                })}
            </svg>
          </div>
        </div>
      </div>

      {/* </div> */}
    </>
  );
}
