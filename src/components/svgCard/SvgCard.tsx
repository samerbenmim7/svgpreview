import React, {
  useRef,
  useState,
  useEffect,
  RefObject,
  MouseEvent,
} from "react";
import styles from "./svgCard.module.css";
import DraggableGroup from "../draggbleGroup/DraggableGroup";
import { PX_PER_MM } from "../../Utils/const";
import { Block, Position } from "../../types/types";
import { BlockToolbar } from "../helpers/blockToolBar/BlockToolbar";

interface SvgCardProps {
  svgGroups: Map<number, string>;
  positions: Record<number, Position>;
  setSelectedBlockIndex: (index: number) => void;
  containerRef: RefObject<HTMLDivElement>;
  cardRef: RefObject<HTMLDivElement>;
  setPositions: React.Dispatch<React.SetStateAction<Record<number, Position>>>;
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setSync: React.Dispatch<React.SetStateAction<boolean>>;
  pushHistory: () => void;
  zoom: number;
  pageWidth: number;
  pageHeight: number;
  isFlipped: boolean;
  undo: () => void;
  redo: () => void;
  selectedBlockIndex: number;
  handleBlockChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | null,
    key?: string,
    value?: number
  ) => void;
  blocks: Block[];
  backgroundImage: string;
  blockShouldDisplayOutline: boolean;
}

const SvgCard: React.FC<SvgCardProps> = ({
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
  blockShouldDisplayOutline,
}) => {
  const currentTilt = useRef({ x: 0, y: 0 });
  const targetTilt = useRef({ x: 0, y: 0 });

  const [isHovered, setIsHovered] = useState<number>(-1);
  const [lastHovered, setLastHovered] = useState<number>(-1);
  const [isCurrentlyDragging, setIsCurrentlyDragging] =
    useState<boolean>(false);

  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const maxTilt = 12;
  const perspective = 1500;
  const scale = 1.01;
  const speed = 0.03;

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

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const diffX = event.clientX - centerX;
    const diffY = event.clientY - centerY;

    const normX = diffX / (rect.width / 2);
    const normY = diffY / (rect.height / 2);

    const clampedX = Math.max(-0.1, Math.min(0.1, normX));
    const clampedY = Math.max(-0.1, Math.min(0.1, normY));

    targetTilt.current.x = clampedY * maxTilt * -1;
    targetTilt.current.y = clampedX * maxTilt;
  };

  useEffect(() => {
    requestAnimationFrame(animateTilt);
  }, []);

  const handleDragEnd = (
    _: unknown,
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

    setBlocks((prevBlocks) =>
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

  const selectedBlock = blocks.find((b) => b.id === selectedBlockIndex);

  return (
    <>
      {/* Toolbar */}
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
        {selectedBlock && (
          <BlockToolbar
            visible={isHovered !== -1 && !isCurrentlyDragging}
            onMouseEnter={() => setIsHovered(lastHovered)}
            onMouseLeave={() => setIsHovered(-1)}
            fontSize={selectedBlock.config.fontSize}
            handleBlockChange={handleBlockChange}
            block={selectedBlock}
            onFontSizeChange={(size: number) => {
              handleBlockChange(null, "fontSize", size);
            }}
          />
        )}
      </div>

      {/* SVG container */}
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
              backgroundSize: "100% 100%",
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
              />
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
                      blockShouldDisplayOutline={
                        blockShouldDisplayOutline && key == selectedBlockIndex
                      }
                    />
                  );
                })}
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default SvgCard;
