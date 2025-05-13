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
  /** artwork for the *front* side */
  svgGroups: Map<number, string>;
  /** artwork for the *back* side (OPTIONAL).  
      If omitted, front artwork is reused. */
  backSvgGroups?: Map<number, string>;

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
  skewAnimateRange: number;
}

const SvgCard: React.FC<SvgCardProps> = ({
  svgGroups,
  backSvgGroups,
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
  skewAnimateRange,
}) => {
  /** -------------- 3‑D tilt animation ---------------- */
  const currentTilt = useRef({ x: 0, y: 0 });
  const targetTilt = useRef({ x: 0, y: 0 });

  const maxTilt = 12;
  const perspective = 1500;
  const scale = 1.01;
  const speed = 0.03;

  const animateTilt = () => {
    currentTilt.current.x +=
      (targetTilt.current.x - currentTilt.current.x) * speed;
    currentTilt.current.y +=
      (targetTilt.current.y - currentTilt.current.y) * speed;

    if (cardRef.current) {
      cardRef.current.style.transform = `
        perspective(${perspective}px)
        rotateX(${currentTilt.current.x}deg)
        rotateY(${currentTilt.current.y}deg)
        scale(${scale})
      `;
    }
    requestAnimationFrame(animateTilt);
  };

  useEffect(() => {
    requestAnimationFrame(animateTilt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** reset tilt target when user disables the effect */
  useEffect(() => {
    targetTilt.current = { x: 0, y: 0 };
  }, [skewAnimateRange]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (skewAnimateRange === -1 || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const diffX = (event.clientX - centerX) / (rect.width / 2);
    const diffY = (event.clientY - centerY) / (rect.height / 2);

    const clampedX = Math.max(
      -skewAnimateRange,
      Math.min(skewAnimateRange, diffX)
    );
    const clampedY = Math.max(
      -skewAnimateRange,
      Math.min(skewAnimateRange, diffY)
    );

    targetTilt.current = {
      x: clampedY * maxTilt * -1,
      y: clampedX * maxTilt,
    };
  };

  /** -------------- drag / position helpers -------------- */
  const [isHovered, setIsHovered] = useState<number>(-1);
  const [lastHovered, setLastHovered] = useState<number>(-1);
  const [isCurrentlyDragging, setIsCurrentlyDragging] =
    useState<boolean>(false);
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

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

    setPositions((prev) => ({ ...prev, [id]: newPos }));
    setSync(true);

    setBlocks((prev) =>
      prev.map((block) =>
        block.id !== id
          ? { ...block, changed: false }
          : {
              ...block,
              changed: true,
              config: {
                ...block.config,
                topOffsetInMillimeters:
                  block.config.topOffsetInMillimeters + mmY,
                leftOffsetInMillimeters:
                  block.config.leftOffsetInMillimeters + mmX,
              },
            }
      )
    );
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockIndex);

  /** -------------- RENDER -------------- */
  const zoomStyle = { transform: `scale(${zoom / 100})` };

  return (
    <>
      {/* ---------- Block toolbar ---------- */}
      <div
        className={styles.toolbarWrapper}
        style={{
          top: (toolbarPos.y / 100) * zoom,
          left: (toolbarPos.x / 100) * zoom,
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
            onFontSizeChange={(size) =>
              handleBlockChange(null, "fontSize", size)
            }
          />
        )}
      </div>

      {/* ---------- Card 3‑D / flip container ---------- */}
      <div className={styles.zoomWrapper} style={zoomStyle}>
        <div
          ref={cardRef}
          className={styles.tiltWrapper}
          onMouseMove={handleMouseMove}
        >
          <div
            ref={containerRef}
            className={`${styles.faces} ${isFlipped ? styles.flipped : ""}`}
          >
            {/* ---------- FRONT FACE ---------- */}
            <div
              className={!isFlipped ? styles.face : styles.faceBack}
              style={{
                backgroundImage: `url("${backgroundImage}")`,
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <svg
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
                          blockShouldDisplayOutline &&
                          key === selectedBlockIndex
                        }
                      />
                    );
                  })}
              </svg>
            </div>

            {/* ---------- BACK FACE ---------- */}
            <div
              className={` ${!isFlipped ? styles.faceBack : styles.face}`}
              style={{}}
            >
              <svg
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
                {Array.from(backSvgGroups ?? svgGroups)
                  .sort((a, b) => b[1].length - a[1].length)
                  .map(([key, value]) => {
                    const position = positions[key] || { x: 0, y: 0 };
                    return (
                      <g
                        key={key}
                        transform={`translate(${position.x}, ${position.y})`}
                        dangerouslySetInnerHTML={{ __html: value }}
                      />
                    );
                  })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SvgCard;
