import React, {
  useRef,
  useState,
  useEffect,
  HTMLAttributes,
  useCallback,
} from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";

// --- Types ---
interface DraggableGroupProps {
  svgString: string;
  zoom: number;
  position: { x: number; y: number };
  onDrag?: (e: DraggableEvent, data: DraggableData) => void;
  onStop: (e: DraggableEvent, data: DraggableData) => void;
  index: number;
  setSelectedBlockIndex: (index: number) => void;
  pushHistory: any;
  selectedBlockIndex;
  isHovered;
  setIsHovered;
  setToolbarPos;
  setIsCurrentlyDragging;
  setLastHovered;
}

// --- Component ---
export default function DraggableGroup({
  svgString,
  zoom,
  position,
  onDrag,
  onStop,
  index,
  setSelectedBlockIndex,
  pushHistory,
  selectedBlockIndex,
  setIsHovered,
  isHovered,
  setToolbarPos,
  setIsCurrentlyDragging,
  setLastHovered,
}: DraggableGroupProps) {
  const [isCorrected, setIsCorrected] = useState(false);
  const [localPos, setLocalPos] = useState(position);
  const nodeRef = useRef<Element | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pendingStopRef = useRef<{
    e: DraggableEvent;
    data: DraggableData;
  } | null>(null);

  useEffect(() => {
    if (!isDragging) {
      setLocalPos(position);
    }
  }, [position, isDragging]);

  const updateToolbarPosition = useCallback(() => {
    if (!nodeRef.current) return;
    // @ts-ignore

    const bbox = nodeRef.current.getBBox();

    setToolbarPos({ x: bbox.x + bbox.width - 28, y: bbox.y - 15 });
  }, []);

  const handleStop = (e: DraggableEvent, data: DraggableData) => {
    setIsCurrentlyDragging(false);

    if (!nodeRef.current) return;
    const bbox = (nodeRef.current as SVGGraphicsElement).getBBox();
    const svg = (nodeRef.current as SVGGraphicsElement).ownerSVGElement;
    if (!svg) return;

    const svgWidth = svg.viewBox.baseVal.width || svg.clientWidth;
    const svgHeight = svg.viewBox.baseVal.height || svg.clientHeight;

    let { x, y } = data;

    const overRight = bbox.x + x + bbox.width > svgWidth;
    const overLeft = bbox.x + x < 0;
    const overTop = bbox.y + y < 0;
    const overBottom = bbox.y + y + bbox.height > svgHeight;

    if (overRight) x -= bbox.x + x + bbox.width - svgWidth;
    if (overLeft) x -= bbox.x + x;
    if (overTop) y -= bbox.y + y;
    if (overBottom) y -= bbox.y + y + bbox.height - svgHeight;

    const corrected = x !== data.x || y !== data.y;
    if (!corrected) {
      setIsCorrected(false);
      onStop(e, data);
    } else {
      setIsCorrected(true);
      setLocalPos({ x: 0, y: 0 });
      pendingStopRef.current = { e, data: { ...data, x: 0, y: 0 } };
    }
  };
  const handleMouseEnter = () => {
    setIsHovered(index);
    setSelectedBlockIndex(index);
    setLastHovered(index);
  };
  const handleMouseLeave = () => setIsHovered(-1);
  const handleStart = () => {
    pushHistory();

    // setIsHovered(false);
    setSelectedBlockIndex(index);
    setIsDragging(true);
    setIsCurrentlyDragging(true);
  };

  const handleTransitionEnd = () => {
    if (pendingStopRef.current) {
      const { e, data } = pendingStopRef.current;
      // onStop(e, data);  // optional if you want
      pendingStopRef.current = null;
      setIsCorrected(false);
    }
  };
  useEffect(() => {
    if (isHovered == index) {
      updateToolbarPosition();
    }
  }, [
    isHovered,
    zoom,
    updateToolbarPosition,
    JSON.stringify([isDragging, position]),
  ]);

  return (
    <>
      <Draggable
        nodeRef={nodeRef as React.RefObject<HTMLElement>}
        scale={zoom / 100}
        position={position}
        onStart={handleStart}
        onDrag={onDrag}
        onStop={handleStop}
        defaultClassName="draggable"
        defaultClassNameDragging="draggable-active"
      >
        <g
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          ref={nodeRef as React.RefObject<SVGGraphicsElement>}
          pointerEvents="bounding-box"
          dangerouslySetInnerHTML={{ __html: svgString }}
          onTransitionEnd={handleTransitionEnd}
          style={{
            outline: isHovered == index ? "2px dashed blue" : "none",
            transition: !isCorrected ? "none" : "transform 0.5s ease-in",
          }}
        />
      </Draggable>
    </>
  );
}
