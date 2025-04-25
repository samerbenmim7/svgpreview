import React, { useRef, useState, useEffect, useCallback,useLayoutEffect } from 'react'
import ConfigForm from './ConfigForm'
import DraggableGroup from './Components/DraggableGroup'
import { styles } from './styles'
import {
  addWhiteBackgroundAndBordersToSVG,
  downloadFile,jsxElement
} from './Utils/utils.js'
import { DndContext, useDraggable } from '@dnd-kit/core';

import {PX_PER_MM} from './Utils/const.js'

import { defaultConfig, defaultBlocks,defaultBlocksMap } from './defaults'
import Draggable from 'react-draggable';
import './Configurator.css';

// useInteractDragRotate.js
export default function App() {
  const [positions, setPositions] = useState({}); // id → { x, y }

  const [svgData, setSvgData] = useState('')
  const [firstfetch, setFirstfetch] = useState(true)
  const [requestTimestamps, setRequestTimestamps] = useState([])
  const [totalRequests, setTotalRequests] = useState(0)
  const [averageRequests, setAverageRequests] = useState(0)
  const [parametersUrl, setParametersUrl] = useState('')
  const [selectedConfigId, setSelectedConfigId] = useState(25)
  const [gCodeData, setGCodeData] = useState('')
  const containerRef = useRef(null)
  const [selectedBlockIndex, setSelectedBlockIndex] = useState('1')
  const [paperWidth, setPaperWidth] = useState(210)
  const [paperHeight, setPaperHeight] = useState(105)
  const [format, setFormat] = useState('svg')
  const [zoom, setZoom] = useState(27)
  const [config, setConfig] = useState(defaultConfig)
  const [configs, setConfigs] = useState([])
  const [blocks, setBlocks] = useState(defaultBlocks)
  const [debounceTimer, setDebounceTimer] = useState(null)
  const [myMap, setMyMap] = useState(new Map());
  const [isTemplate, setIsTemplate] = useState(true)
  const [align, setAlign]   = useState('left');
  const [size, setSize]     = useState('medium');
  const [svgGroups,setSvgGroups] = useState([]);
  const [blocksMap, setBlocksMap] = useState(defaultBlocksMap
  );
  const [schuffle, setshuffle] = useState(false);
  const handleDrag = (e, data,id) => {
    //console.log(`Group  dragged to X: ${data.x}, Y: ${data.y}`);
  };
  const handleStop = (e, data, id) => {
    const deltaMmY = data.x / PX_PER_MM;
    const deltaMmX = data.y / PX_PER_MM;
    setBlocksMap(prevMap => {
      const newMap = new Map(prevMap);
      const block = newMap.get(parseInt(id+1));

      if (!block) return prevMap; 

      const updatedBlock = {
        ...block,
        config: {
          ...block.config,
          topdragOffsetInMillimeters:  deltaMmX,
          leftdragOffsetInMillimeters: deltaMmY,
        },
      };

      newMap.set(id+1, updatedBlock);

      return newMap;
    });
  };


  const [placeholders, setPlaceholders] = useState([
     { name: 'COMPANY', value: 'WunderPen' },
     { name: 'NAME1', value: 'Siva' },
     { name: 'SENDER', value: 'Samer Ben Mim,' }

     

  ]);
  const handleAdd = (key, value) => {
    setMyMap(prevMap => {
      const newMap = new Map(prevMap);
      newMap.set(key, value);
      return newMap;
    });
  };

  const updateMapValue = (id, newValue) => {
    setMyMap(prevMap => {
      const newMap = new Map(prevMap); // Create a shallow copy
      newMap.set(parseInt(id, 10), newValue);        // Overwrite or add new value
      return newMap;                   // Update state
    });
  };
  
  
  const handleBlockChange = (e, text) => {
    
    let {
      name   = null,
      value  = null,
      type   = null,
      checked = null
    } = e?.target || {};

if(text){
  if(text == "alignment") {
    name = 'alignment'
    value = align
  }else if(text == "size") {
    type = 'number'
    name = 'fontSize'

    if(size=="small")
    value = 2
    if(size=="medium")
      value = 4
    if(size=="large")
      value = 6
  }
}
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) => {
        if (block.id != selectedBlockIndex) return { ...block, changed: false }
        if (name === 'name') return { ...block, name: value, changed: true }
        const newVal =
          name === 'alignment'
            ? value
            : name === 'multiline'
            ? value.toLowerCase() === 'true'
            : type === 'checkbox'
            ? checked
            : type === 'number'
            ? parseFloat((name=='r'||name=='g'||name=='b')?Math.max(value%255,0):value)
            : value
        return {
          ...block,
          changed: true,
          config: {
            ...block.config,
            [name]: newVal,
          },
        }
      })
    )
  
  }
 
  const logRequest = useCallback(() => {
    const timestamp = Date.now()
    setRequestTimestamps((prev) => {
      const updatedTimestamps = prev.filter((t) => timestamp - t <= 10000)
      updatedTimestamps.push(timestamp)
      setAverageRequests((updatedTimestamps.length / 10).toFixed(1))
      return updatedTimestamps
    })
    setTotalRequests((prev) => prev + 1)
  }, [])

  const resetMetrics = () => {
    setRequestTimestamps([])
    setTotalRequests(0)
    setAverageRequests(0)
  }

  useEffect(() => {
    if (containerRef.current) {
      const scrollableDiv = containerRef.current
      const centerX = (scrollableDiv.scrollWidth - scrollableDiv.clientWidth) / 2
      const centerY = (scrollableDiv.scrollHeight - scrollableDiv.clientHeight) / 2
      scrollableDiv.scrollTo({ left: centerX, top: centerY, behavior: 'smooth' })
    }
  }, [svgData])

  const generateGCode = async () => {
    try {
      const bodyData = {
        fields: blocks.map((b) => ({
          text: b.config.text,
          widthInMillimeters: b.config.widthInMillimeters,
          fontSize: b.config.fontSize,
          fontName: b.config.fontName,
          leftOffsetInMillimeters: b.config.leftOffsetInMillimeters,
          topOffsetInMillimeters: b.config.topOffsetInMillimeters,
          alignment: b.config.alignment,
          multiline: b.config.multiline,
          lineHeight: b.config.lineHeight,
          rotate: b.config.rotation,
          rgbColor: b.config.r + ',' + b.config.g + ',' + b.config.b,
          id: b.id + '',
        })),
        config: {
          paperWidthInMillimeters: paperWidth,
          paperHeightInMillimeters: paperHeight,
          format,
        },
        configId: selectedConfigId,
        placeholdersValues:placeholders.reduce((acc, ph) => {
          if (ph.name) {
            acc[ph.name] = ph.value;
          }
          return acc;
        }, {}),
        isTemplate 
      }
      var url = parametersUrl
      .replace(
        'preview',
        'gcode'
      )
        .replace(
          'wunderpen-inkloom-test.server.bett-ingenieure.de',
          'inkloom-test.bi-dev2.de/api'
        )
       

         
        
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': 'cmVhZC1hcGlrZXkteC1pbmtsb29tDQo=',
        },
        body: JSON.stringify(bodyData),
      })
      if (!response.ok) throw new Error()
      
      const gCodeText = await response.text()
      setGCodeData(gCodeText)
    } catch {
      setGCodeData('Error: Could not generate G-code.')
    }
  }

  useEffect(() => {
    if (myMap.size === 0) return;

    const queryParams = [...myMap.entries()]
      .map(([key, value]) => `${value}`)
      .join('&');
      const urlStr = "https://inkloom-test.bi-dev2.de/api/preview?" + queryParams;

   // const urlStr = "http://wunderpen-inkloom-test.server.bett-ingenieure.de/preview?" + queryParams;
    setParametersUrl(urlStr);
  }, [myMap]);

  useEffect(() => {
    clearTimeout(debounceTimer)
    setDebounceTimer(
      setTimeout(() => {
        handleSendRequest()
      }, 150)
    )
    return () => {
      clearTimeout(debounceTimer)
    }
  }, [paperHeight,paperWidth])


  const fetchSVG = useCallback(
    async (inputText,regenrate = true) => {
      if (!inputText) return
      try {
        console.log(blocks)
        const b = regenrate ? [...blocks] :blocks.filter((b) => b.changed)
        const bodyData = {
          fields: b.map((b) => ({
            text: b.config.text,
            widthInMillimeters: b.config.widthInMillimeters,
            fontSize: b.config.fontSize,
            fontName: b.config.fontName,
            leftOffsetInMillimeters: parseInt(b.config.leftOffsetInMillimeters),
            topOffsetInMillimeters: parseInt(b.config.topOffsetInMillimeters),
            topdragOffsetInMillimeters :  b.config.topdragOffsetInMillimeters,
            leftdragOffsetInMillimeters :  b.config.leftdragOffsetInMillimeters,

            alignment: b.config.alignment,
            multiline: b.config.multiline,
            lineHeight: b.config.lineHeight,
            rotate: b.config.rotation,
            rgbColor: b.config.r + ',' + b.config.g + ',' + b.config.b,
            id: b.id + '',
          })),
          config: {
            paperWidthInMillimeters: paperWidth,
            paperHeightInMillimeters: paperHeight,
            format,
          },
          configId: selectedConfigId,
          placeholdersValues:  placeholders.reduce((acc, ph) => {
            if (ph.name) {
              acc[ph.name] = ph.value;
            }
            return acc;
          }, {}),
          isTemplate 
        }
        const response = await fetch('https://inkloom-test.bi-dev2.de/api/preview', {

        //const response = await fetch('http://wunderpen-inkloom-test.server.bett-ingenieure.de/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': 'cmVhZC1hcGlrZXkteC1pbmtsb29tDQo=',
          },
          body: JSON.stringify(bodyData),
        })
        if (!response.ok) throw new Error()
        const data = await response.text()

       
        setSvgData(
          addWhiteBackgroundAndBordersToSVG(
            data,
            firstfetch,
            svgData,
            config,
            paperWidth,
            paperHeight,
            isTemplate,
            placeholders
          )
        )
   
        const paramUrlCount = response.headers.get('X-Parameters-Url') || 0
      
        if(paramUrlCount!=1){
          const newMap = new Map();
          for (let i = 1; i <= paramUrlCount; ++i) {
            const key = i;
            const value = response.headers.get('X-Parameters-Url' + i);
            newMap.set(key, value);
          }
          //setParametersUrl(urlStr)
          setMyMap(newMap);

        }
        else{              
          for (let [header, value] of response.headers.entries()) {
            if (header.toLowerCase().startsWith('x-parameters-url')) {

              const id = header.slice('X-Parameters-Url'.length); // Extract the ID part
              if(id)
              updateMapValue(id, value);
            }
          }
        }
  

        logRequest()



      } catch (e){
        console.log(e)
        setSvgData('<svg><text x="10" y="50" fill="red">Error</text></svg>')
      }
    },
    [ blocks,paperWidth, paperHeight, format, selectedConfigId, logRequest, firstfetch, config, svgData, blocksMap, isTemplate,
      placeholders]
  )
  useEffect(() => {
    if (!svgData) return;
    setSvgGroups(svgData.split('\n').slice(1, -1));

  }, [svgData]);  

  const handleSendRequest = useCallback(async () => {
    if (!parametersUrl) return
    try {
      const bodyData = {
        fields: blocks.map((b) => ({
          text: b.config.text,
          widthInMillimeters: b.config.widthInMillimeters,
          fontSize: b.config.fontSize,
          fontName: b.config.fontName,
          leftOffsetInMillimeters: b.config.leftOffsetInMillimeters,
          topOffsetInMillimeters: b.config.topOffsetInMillimeters,
          alignment: b.config.alignment,
          multiline: b.config.multiline,
          lineHeight: b.config.lineHeight,
          rotate: b.config.rotation,
          rgbColor: b.config.r + ',' + b.config.g + ',' + b.config.b,
          id: b.id + '',
        })),
        config: {
          paperWidthInMillimeters: paperWidth,
          paperHeightInMillimeters: paperHeight,
          format,
        },
        configId: selectedConfigId,
        placeholdersValues: placeholders.reduce((acc, ph) => {
          if (ph.name) {
            acc[ph.name] = ph.value;
          }
          return acc;
        }, {}),
        isTemplate 
      }
     
      var url = parametersUrl
        .replace(
          'wunderpen-inkloom-test.server.bett-ingenieure.de',
          'inkloom-test.bi-dev2.de/api'
        )
       

         
        
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': 'cmVhZC1hcGlrZXkteC1pbmtsb29tDQo=',
        },
        body: JSON.stringify(bodyData),
      })
      if (!response.ok) throw new Error()
      const data = await response.text()
      
      setSvgData(
        addWhiteBackgroundAndBordersToSVG(
          data,
          firstfetch,
          svgData,
          config,
          paperWidth,
          paperHeight
        )
      )
      const paramUrlCount = response.headers.get('X-Parameters-Url') || 0
      
        if(paramUrlCount!=1){
          const newMap = new Map();
          for (let i = 1; i <= paramUrlCount; ++i) {
            const key = i;
            const value = response.headers.get('X-Parameters-Url' + i);
            newMap.set(key, value);
          }
          //setParametersUrl(urlStr)
          setMyMap(newMap);

        }
        else{              
          for (let [header, value] of response.headers.entries()) {
            if (header.toLowerCase().startsWith('x-parameters-url')) {

              const id = header.slice('X-Parameters-Url'.length); // Extract the ID part
              if(id)
              updateMapValue(id, value);
            }
          }
        }
      logRequest()
    } catch {
      setSvgData('<svg><text x="10" y="50" fill="red">Error</text></svg>')
    }
  }, [parametersUrl, blocks, paperWidth, paperHeight, format, selectedConfigId, logRequest, firstfetch, config, svgData])
  const handleSendRequestRegenrate = useCallback(async () => {
    if (!parametersUrl) return
    try {
      const bodyData = {
        fields: blocks.map((b) => ({
          text: b.config.text,
          widthInMillimeters: b.config.widthInMillimeters,
          fontSize: b.config.fontSize,
          fontName: b.config.fontName,
          leftOffsetInMillimeters: b.config.leftOffsetInMillimeters,
          topOffsetInMillimeters: b.config.topOffsetInMillimeters,
          alignment: b.config.alignment,
          multiline: b.config.multiline,
          lineHeight: b.config.lineHeight,
          rotate: b.config.rotation,
          rgbColor: b.config.r + ',' + b.config.g + ',' + b.config.b,
          id: b.id + '',
        })),
        config: {
          paperWidthInMillimeters: paperWidth,
          paperHeightInMillimeters: paperHeight,
          format,
        },
        configId: selectedConfigId,
        placeholdersValues:  placeholders.reduce((acc, ph) => {
          if (ph.name) {
            acc[ph.name] = ph.value;
          }
          return acc;
        }, {}),
        isTemplate 
      }
     
      var url = parametersUrl
        .replace(
          'wunderpen-inkloom-test.server.bett-ingenieure.de',
          'inkloom-test.bi-dev2.de/api'
        )
       

         
        
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': 'cmVhZC1hcGlrZXkteC1pbmtsb29tDQo=',
        },
        body: JSON.stringify(bodyData),
      })
      if (!response.ok) throw new Error()
      const data = await response.text()
      
      setSvgData(
        addWhiteBackgroundAndBordersToSVG(
          data,
          firstfetch,
          svgData,
          config,
          paperWidth,
          paperHeight
        )
      )
      const paramUrlCount = response.headers.get('X-Parameters-Url') || 0
      
        if(paramUrlCount!=1){
          const newMap = new Map();
          for (let i = 1; i <= paramUrlCount; ++i) {
            const key = i;
            const value = response.headers.get('X-Parameters-Url' + i);
            newMap.set(key, value);
          }
          //setParametersUrl(urlStr)
          setMyMap(newMap);

        }
        else{              
          for (let [header, value] of response.headers.entries()) {
            if (header.toLowerCase().startsWith('x-parameters-url')) {

              const id = header.slice('X-Parameters-Url'.length); // Extract the ID part
              if(id)
              updateMapValue(id, value);
            }
          }
        }
      logRequest()
    } catch {
      setSvgData('<svg><text x="10" y="50" fill="red">Error</text></svg>')
    }
  }, [parametersUrl, blocks, paperWidth, paperHeight, format, selectedConfigId, logRequest, firstfetch, config, svgData])

  const handleGenerate = (regenrate = true) => {
    setPositions((prev) => ({
      ...prev,
      [0]: {
        x: 0,
        y: 0,
      },
    }));
    setFirstfetch(false)
    
    const val = blocks.find((b) => b.id == selectedBlockIndex)?.config.text
    fetchSVG(val,regenrate)
  }

  useEffect(() => {
    clearTimeout(debounceTimer)
    setDebounceTimer(
      setTimeout(() => {
        handleGenerate()
      }, 150)
    )
    return () => {
      clearTimeout(debounceTimer)
    }
  }, [blocks, isTemplate,placeholders])
  useEffect(() => {
    handleGenerate()
  }, [])
  const onConfigChange = (setter) => (e) => {
    if (e.target.type === 'checkbox') {
      setter(e.target.checked)
    } else {
      setter(e.target.type === 'number' ? Number(e.target.value) : e.target.value)
    }
  }
  const cardRef = useRef(null);

  // These will keep track of the current tilt angles and target tilt angles.
  const currentTilt = useRef({ x: 0, y: 0 });
  const targetTilt = useRef({ x: 0, y: 0 });
  
  // Configuration values similar to your jQuery tilt options.
  const maxTilt = 12; // maximum tilt in degrees
  const perspective = 1500; // in px, for the 3D perspective
  const scale = 1.01;
  const speed = 0.05; // interpolation factor (adjust for faster/slower follow)

  // When the mouse moves, compute the relative position from the card's center.
  const handleMouseMove = (event) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const diffX = event.clientX - centerX;
      const diffY = event.clientY - centerY;

      // Normalize differences based on half the card's width and height.
      const normX = diffX / (rect.width / 2);
      const normY = diffY / (rect.height / 2);

      const clampedNormX = Math.max(-.2, Math.min(.2, normX));
      const clampedNormY = Math.max(-.2, Math.min(.2, normY));

      // Calculate the target tilt angles (invert the X tilt for natural effect).
      targetTilt.current.x = clampedNormY * maxTilt * -1;
      targetTilt.current.y = clampedNormX * maxTilt;
    }
  };
 
  // Animation loop: slowly interpolate current tilt to target tilt.
  
  const handleMouseLeave = () => {
    // targetTilt.current.x = 0;
    // targetTilt.current.y = 0;
  };
  const animateTilt = () => {
    currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * speed;
    currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * speed;

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

  // Start the animation loop when the component mounts.
  useEffect(() => {
    requestAnimationFrame(animateTilt);
  }, []);

  const [isFlipped, setIsFlipped] = useState(false);
  const gRef = useRef(null);
  const [bbox, setBbox] = useState(null);
  
  useLayoutEffect(() => {
    if (nodeRef.current) {
      const { x, y, width, height } = nodeRef.current.getBBox();
      setBbox({ x, y, width, height });
    }
  }, []);
  const newsstyles = {
    svgContainer: {
      perspective: '1000px', // Needed to give the 3D effect
      width: '300px',
      height: '300px',
      margin: '0 auto',
    },
    flipCardInner: {

      transition: 'transform 0.6s',
      transformStyle: 'preserve-3d',
      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
    },
    flipCardSide: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      //backfaceVisibility: 'hidden',
    },
    flipCardBack: {
      transform: 'rotateY(180deg)',
    },
  };
    const nodeRef = useRef(null);

    const handleDragEnd = (event) => {
      const { delta, active } = event;
      const id = active.id ;
    
      const newPos = {
        x: (positions[id]?.x || 0) + delta.x,
        y: (positions[id]?.y || 0) + delta.y,
      };
    
      const mmX = parseInt(newPos.x / PX_PER_MM * 100 / zoom);
      const mmY = parseInt(newPos.y / PX_PER_MM * 100 / zoom);
    
      setPositions((prev) => ({
        ...prev,
        [id]: newPos,
      }));

      setTimeout(() => {
        setBlocks((prevBlocks) =>
          prevBlocks.map((block) => {
            console.log(id+1,block.id)
            if (block.id != id+1) return block;
            return {
              ...block,
              config: {
                ...block.config,
                topOffsetInMillimeters: mmY,
                leftOffsetInMillimeters: mmX,
              },
            };
          })
        );
    
      
      }, 1);
    };
  

    useEffect(() => {
    console.log("changed",blocks)
    }, [blocks])
  return (
    <div style={{ display: 'flex', width: '100%' }}>
   
      <div style={styles.container}>
    
        <div style={styles.header} />

        <div style={styles.svgContainer} ref={containerRef}
    
        >
          <div
         style={{
          alignSelf: 'baseline',
          transform: `${isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'} scale(${zoom / 100})`,
          transformOrigin: 'center center',
          transition: 'transform .6s',
        }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
              
            <div
                
            ref={cardRef}
            style={{
              boxShadow: '0 10px 16px #bbb', // Added container shadow
              border: "1px solid #ddd",
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              // The following minimal styling ensures the card is visible without extra colors.
              background: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              // Make sure the element is positioned in the document flow;
              // since we only apply a transform, its layout position stays unchanged.
              position: 'relative',
              willChange: 'transform',
              cursor: 'pointer'
             // backfaceVisibility: 'hidden',

            }}
         
            >

<svg xmlns="http://www.w3.org/2000/svg" width="2480.315" height="1240.1575">
      <rect x="0" y="0" width="100%" height="100%" fill="white"></rect>
      <DndContext onDragEnd={handleDragEnd}

      >

      {svgGroups.map((g, i) => {
        const id = i;
        const position = positions[id] || { x: 0, y: 0 };

        return (
          <DraggableGroup
            key={id}
            id={id}
            svgString={g}
            zoom={zoom}
            position={position}
          />
        );
      })}
    </DndContext>


</svg>
            </div>
           
            
              </div>
        </div>
      

      </div>
      <button style={{ marginLeft: '10px', marginBottom: '5px',marginTop: '0px', padding:"10px" }} onClick={handleGenerate  }>
              Generate Different Preview
            </button>
      <div style={{ width: '45%', margin: '20px 0' }}>
        <ConfigForm
          handleBlockChange={handleBlockChange}
          selectedConfigId={selectedConfigId}
          setSelectedConfigId={setSelectedConfigId}
          generatePreview={() => {
            const val = blocks.find((b) => b.id == selectedBlockIndex)?.config.text
            fetchSVG(val)
          }}
          setPaperHeight= {setPaperHeight}
          setPaperWidth= {setPaperWidth}

          align={align}
          setAlign={setAlign}
          configs={configs}
          config={config}
          setConfigs={setConfigs}
          setConfig={setConfig}
          defaultConfig={defaultConfig}
          blocks={blocks}
          setBlocks={setBlocks}
          selectedBlockIndex={selectedBlockIndex}
          setSvgData = {setSvgData}
          svgData = {svgData}
          setSelectedBlockIndex={setSelectedBlockIndex}
          setPlaceholders = {setPlaceholders}
          placeholders = {placeholders}
          setIsTemplate = {setIsTemplate}
          isTemplate= {isTemplate}
          size={size}
          setSize={setSize}
        />
        
      </div>

    
    </div>
  )
}


