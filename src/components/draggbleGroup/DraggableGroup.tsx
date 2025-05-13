import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  RefObject,
} from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";

interface DraggableGroupProps {
  svgString: string;
  zoom: number;
  position: { x: number; y: number };
  onDrag?: (e: DraggableEvent, data: DraggableData) => void;
  onStop: (e: DraggableEvent, data: DraggableData) => void;
  index: number;
  setSelectedBlockIndex: (index: number) => void;
  pushHistory: () => void;
  selectedBlockIndex: number;
  isHovered: number;
  setIsHovered: (index: number) => void;
  setToolbarPos: (pos: { x: number; y: number }) => void;
  setIsCurrentlyDragging: (val: boolean) => void;
  setLastHovered: (index: number) => void;
  blockShouldDisplayOutline: boolean;
}

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
  blockShouldDisplayOutline,
}: DraggableGroupProps) {
  const [isCorrected, setIsCorrected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [localPos, setLocalPos] = useState(position);
  const nodeRef = useRef<SVGGraphicsElement | null>(null);

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
    const node = nodeRef.current;
    if (!node) return;

    const bbox = node.getBBox();
    setToolbarPos({ x: bbox.x + bbox.width - 28, y: bbox.y - 15 });
  }, [setToolbarPos]);

  const handleStop = (e: DraggableEvent, data: DraggableData) => {
    setIsCurrentlyDragging(false);
    const node = nodeRef.current;
    if (!node) return;

    const bbox = node.getBBox();
    const svg = node.ownerSVGElement;
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

  const handleStart = () => {
    pushHistory();
    setSelectedBlockIndex(index);
    setIsDragging(true);
    setIsCurrentlyDragging(true);
  };

  const handleMouseEnter = () => {
    setIsHovered(index);
    if (index != selectedBlockIndex) setSelectedBlockIndex(index);
    setLastHovered(index);
  };

  const handleMouseLeave = () => setIsHovered(-1);

  const handleTransitionEnd = () => {
    if (pendingStopRef.current) {
      pendingStopRef.current = null;
      setIsCorrected(false);
    }
  };

  useEffect(() => {
    if (isHovered === index) {
      updateToolbarPosition();
    }
  }, [
    isHovered,
    zoom,
    updateToolbarPosition,
    isDragging,
    JSON.stringify([isDragging, position]),
  ]);

  return (
    <Draggable
      nodeRef={nodeRef as unknown as RefObject<HTMLElement>}
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
        ref={nodeRef}
        pointerEvents="bounding-box"
        dangerouslySetInnerHTML={{ __html: svgString }}
        onTransitionEnd={handleTransitionEnd}
        style={{
          outline:
            blockShouldDisplayOutline || isHovered === index
              ? "2px dashed blue"
              : "none",
          transition: isCorrected ? "transform 0.5s ease-in" : "none",
        }}
      />
    </Draggable>
  );
}
