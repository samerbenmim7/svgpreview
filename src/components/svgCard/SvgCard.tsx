import React, { useRef, useState, useEffect } from 'react';
import styles from './svgCard.module.css';
import DraggableGroup from '../draggbleGroup/DraggableGroup';
import { PX_PER_MM } from '../../Utils/const';

import {Position} from '../../types/types'


interface SvgCardProps {
  svgGroups: Map<number, string>;
  positions: Record<number, Position>;
  setSelectedBlockIndex: (index: number) => void;
  containerRef: React.RefObject<HTMLDivElement| null> ;
  cardRef: React.RefObject<HTMLDivElement| null>  ;
  setPositions: React.Dispatch<React.SetStateAction<Record<number, Position>>>;
  setBlocks: React.Dispatch<any>;  // (you can improve this if you have a proper Block[] type)
  setSync:React.Dispatch<any>;
}

// --- Component ---
export default function SvgCard({
  svgGroups,
  positions,
  setSelectedBlockIndex,
  containerRef,
  cardRef,
  setPositions,
  setBlocks,
  setSync
}: SvgCardProps) {


  const [zoom, setZoom] = useState<number>(27);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const currentTilt = useRef({ x: 0, y: 0 });
  const targetTilt = useRef({ x: 0, y: 0 });

  const maxTilt = 12;
  const perspective = 1500;
  const scale = 1.01;
  const speed = 0.05;

  const animateTilt = () => {
    currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * speed;
    currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * speed;

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

  const handleDragEnd = (_: any, data: { x: number; y: number }, id: number) => {
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
    setSync(true)
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
    <div className={styles.container}>
      <div className={styles.header} />

      <div className={styles.svgContainer} ref={containerRef}>
        <div
          style={{
            alignSelf: 'baseline',
            transform: `${isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'} scale(${zoom / 100})`,
            transformOrigin: 'center center',
            transition: 'transform .6s',
          }}
          onMouseMove={handleMouseMove}
        >
          <div
            ref={cardRef}
            style={{
              boxShadow: '0 10px 16px #bbb',
              border: "1px solid #ddd",
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              position: 'relative',
              willChange: 'transform',
              cursor: 'pointer'
            }}
          >
            <svg id="svgPrev" xmlns="http://www.w3.org/2000/svg" width="2480.315" height="1240.1575">
              <rect x="0" y="0" width="100%" height="100%" fill="white"></rect>

              {Array.from(svgGroups).map(([key, value]) => {
                const position = positions[key] || { x: 0, y: 0 };
                return (
                  <DraggableGroup
                    key={key}
                    index={key}
                    svgString={value}
                    zoom={zoom}
                    onStop={(e, data) => handleDragEnd(e, data, key)}
                    position={position}
                    setSelectedBlockIndex={setSelectedBlockIndex}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
