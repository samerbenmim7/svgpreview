import React, { useRef, useEffect, useState } from 'react';
import Draggable from 'react-draggable';

export default function DraggableGroup({
  svgString,
  zoom,
  position,
  onDrag,
  onStop
}) {
  const nodeRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localPos, setLocalPos] = useState(position);
  const pendingStopRef = useRef(null); // store the pending onStop call
  const [shouldCallStop, setShouldCallStop] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      setLocalPos(position);
    }
  }, [position, isDragging]);

  const handleStart = () => setIsDragging(true);

  const handleStop = (e, data) => {
    setIsDragging(false);

    requestAnimationFrame(() => {
      if (!nodeRef.current) return;

      const bbox = nodeRef.current.getBBox();
      const svg = nodeRef.current.ownerSVGElement;
      if (!svg) return;

      const svgWidth = svg.viewBox.baseVal.width || svg.clientWidth;
      const svgHeight = svg.viewBox.baseVal.height || svg.clientHeight;

      let { x, y } = data;

      const overRight = bbox.x + x + bbox.width > svgWidth;
      const overLeft = bbox.x + x < 0;
      const overTop = bbox.y + y < 0;
      const overBottom = bbox.y + y + bbox.height > svgHeight;

      if (overRight) x -= (bbox.x + x + bbox.width - svgWidth);
      if (overLeft) x -= (bbox.x + x);
      if (overTop) y -= (bbox.y + y);
      if (overBottom) y -= (bbox.y + y + bbox.height - svgHeight);

      const corrected = x !== data.x || y !== data.y;

      setLocalPos({ x, y });

      if (corrected) {
        pendingStopRef.current = { e, x, y };
        setShouldCallStop(true); // will call after transition ends
      } else {
     //   onStop?.(e, { x, y }); // No correction needed, call immediately
      }
    });
  };

  const handleTransitionEnd = () => {
    if (shouldCallStop && pendingStopRef.current) {
      const { e, x, y } = pendingStopRef.current;
      onStop?.(e, { x, y }); // ✅ Corrected position after animation
      pendingStopRef.current = null;
      setShouldCallStop(false);
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      scale={zoom / 100}
      position={localPos}
      onStart={handleStart}
      onDrag={onDrag}
      onStop={handleStop}
    >
      <g
        ref={nodeRef}
        pointerEvents="bounding-box"
        dangerouslySetInnerHTML={{ __html: svgString }}
        onTransitionEnd={handleTransitionEnd} // ✅ wait for transition end
        style={{
          outline: isDragging ? '2px dashed #4caf50' : 'none',
          transition: isDragging ? 'none' : 'transform 0.3s ease', // animate when not dragging
        }}
      />
    </Draggable>
  );
}
 