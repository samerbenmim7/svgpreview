// DraggableGroup.jsx
import React, { useRef,useState } from 'react';
import Draggable from 'react-draggable';

export default function DraggableGroup({
  svgString,
  zoom,
  position,
  onDrag,
  onStop,
  bounds
}) {
  const nodeRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleStart = () => setIsDragging(true);
  const handleStop = () => {setIsDragging(false)


    
  };
  return (
    <Draggable
      nodeRef={nodeRef}
      scale={zoom / 100}
      position={position}      
      onStart={handleStart}
      onDrag={onDrag}
      onStop={(e,data)=>{onStop(e,data); handleStop()}}
      defaultClassName="draggable"
      defaultClassNameDragging="draggable-active"
      bounds={bounds} // ✅ custom bounds

    >
      <g
        ref={nodeRef}
        pointerEvents="bounding-box"
        dangerouslySetInnerHTML={{ __html: svgString }}
        style={{
            outline: isDragging ? '2px dashed #4caf50' : 'none',
            transition: 'outline 0.2s ease-in-out',
          }}
      />
    </Draggable>
  );
}
