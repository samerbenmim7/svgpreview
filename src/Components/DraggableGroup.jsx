import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export default function DraggableGroup({ svgString, zoom = 100, id, position }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const scale = zoom / 100;

  const finalX = (position?.x || 0) /scale + (transform?.x || 0) /scale;
  const finalY = (position?.y || 0) /scale + (transform?.y || 0) /scale;

  const style = {
    transform: `translate(${finalX}px, ${finalY}px) `,
    transformOrigin: 'top left',
    cursor: 'move',
  };

  return (
    <g
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      pointerEvents="bounding-box"
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}
