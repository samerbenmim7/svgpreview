// DraggableGroup.jsx
import React, { useRef,useState } from 'react';
import Draggable from 'react-draggable';

export default function DraggableGroup({
  svgString,
  zoom,
  position,
  onDrag,
  onStop,
  index,
  setSelectedBlockIndex
}) {
  const nodeRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleStop = () => setIsDragging(false);
  const handleStart = () => {
    setSelectedBlockIndex(index)
    console.log(index)
    setIsDragging(true)
  }


    

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
      // bounds={bounds} 

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
