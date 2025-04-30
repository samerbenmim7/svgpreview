import React, { useRef, useState, useEffect, useCallback } from 'react';
import ConfigForm from './ConfigForm';
import { addWhiteBackgroundAndBordersToSVG, extractGId, buildBodyData, deleteGroupFromSvgString, getRandom } from './utils/utils';
import { post ,get} from './services/api';
import { defaultConfig, defaultBlocks, defaultBlocksMap, mockBlock } from './defaults';
import SvgCard from './components/svgCard/SvgCard';
import './Configurator.css';
import {Position,Placeholder,BlockConfig,Block} from './types/types'
import { useDebounce } from './hooks/useDebounce';
import { useCenterScroll } from './hooks/useCenterScroll';
import { useSvgGroups } from './hooks/useSvgGroup';
import { DEFAULT_FONT } from './Utils/const';
import { useKeyboard } from './hooks/useKeyboard';
import { useSpriteLoader } from './hooks/useSpriteLoader';


export default function App() {
  const [positions, setPositions] = useState<Record<number, Position>>({});
  const [svgData, setSvgData] = useState<string>('');
  const [parametersUrl, setParametersUrl] = useState<string>('');
  const [blocks, setBlocks] = useState<Block[]>(defaultBlocks);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(1);
  const [paperWidth, setPaperWidth] = useState<number>(210);
  const [paperHeight, setPaperHeight] = useState<number>(105);
  const [selectedConfigId, setSelectedConfigId] = useState<number>(25);
  const [format, setFormat] = useState<string>('svg');
  const [config, setConfig] = useState<any>(defaultConfig);
  const [GroupIdentifierUrlMap, setGroupIdentifierUrlMap] = useState<Map<number, string>>(new Map());
  const [isTemplate, setIsTemplate] = useState<boolean>(true);
  const [align, setAlign] = useState<string>('left');
  const [size, setSize] = useState<string>('medium');
  const [svgGroups, setSvgGroups] = useState<Map<number, string>>(new Map());
  const [lastUpdatedBlockId, setLastUpdatedBlockId] = useState<string | null>(null);
  const [needsSync, setSync] = useState(true);

  const blockNextId = useRef(blocks.length+1); 

  const [placeholders, setPlaceholders] = useState<Placeholder[]>([
    { name: 'COMPANY', value: 'WunderPen' },
    { name: 'NAME1', value: 'Siva' },
    { name: 'SENDER', value: 'Samer Ben Mim,' },
  ]);


  const symbolCount = useSpriteLoader();



  
  
  useKeyboard("Backspace",() => {
    if (selectedBlockIndex) {
      handleDeleteBlock(selectedBlockIndex);
    }
  });
    

    function getBlockNextId() {
      const id = blockNextId.current;
      blockNextId.current += 1;
      return id;
    }
  const cardRef = useRef<HTMLDivElement | null>(null);
  const updateMapValue = (id: string, newValue: string) => {
    setGroupIdentifierUrlMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(parseInt(id, 10), newValue);
      return newMap;
    });
  };


function mutateSilently(newBlocks : Block[]) {
  setBlocks(newBlocks);
}
  const handleDeleteBlock= (id =selectedBlockIndex )=>{
    let newSelectedBlockId = 0;
    const filteredBlocks  = blocks.filter(b=>b.id!=selectedBlockIndex)
    newSelectedBlockId = filteredBlocks?.[0]?.id
   mutateSilently(filteredBlocks.map(b=>({...b, changed:true})))
    console.log(deleteGroupFromSvgString(svgData,id))
   setSvgData(deleteGroupFromSvgString(svgData,id))
   setSvgGroups(prev => {
    const newMap = new Map(prev);
    newMap.delete(id);
    return newMap;
  });
   setSelectedBlockIndex(newSelectedBlockId)
  }


  const handleAddBlock= (text ="NEW TEXT", fontName = DEFAULT_FONT  )=>{
    
    const b = blocks.map(b=>({
      ...b,changed:false
    }))
    setBlocks([...b,{...mockBlock, config:{...mockBlock.config, fontName,text  , topOffsetInMillimeters: getRandom(10,paperHeight-10), leftOffsetInMillimeters: getRandom(10,paperWidth-10)} , id : getBlockNextId()}])
    setSync(true)
  }
  const handleBlockChange = (e: React.ChangeEvent<HTMLInputElement |HTMLTextAreaElement> | null, text?: string) => {
    let {
      name = null,
      value = null,
      type = null,
      // @ts-ignore
      checked = null
    } = e?.target || {};

    if (text) {
      if (text === "alignment") {
        name = 'alignment';
        value = align;
      } else if (text === "size") {
        type = 'number';
        name = 'fontSize';
        if (size === "small") value = "2";
        if (size === "medium") value = "4";
        if (size === "large") value = "6";
      }
    }
    setSync(true)
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) => {
        if (block.id !== selectedBlockIndex) return { ...block, changed: false };
    
        if (name === 'name') {
          return {
            ...block,
            name: value ?? undefined, 
            changed: true
          };
        }
    
        const newVal =
          name === 'alignment' ? value :
          name === 'multiline' ? (value as string).toLowerCase() === 'true' :
          type === 'checkbox' ? checked :
          type === 'number'
            ? parseFloat((name === 'r' || name === 'g' || name === 'b') ? Math.max((+!value) % 255, 0).toString() : (value as string))
            : value;
    
        return {
          ...block,
          changed: true,
          config: {
            ...block.config,
            [name as keyof BlockConfig]: newVal, // safer cast
          },
        };
      })
    );
    
  };

  useEffect(() => {
    if (lastUpdatedBlockId === 'all') {
      setPositions(() => {
        const reset: Record<number, Position> = {};
        blocks.forEach((block) => {
          reset[block.id] = { x: 0, y: 0 };
        });
        return reset;
      });
      setLastUpdatedBlockId(null);
    }
  }, [svgGroups, lastUpdatedBlockId]);

  useCenterScroll(containerRef, svgData);

  useEffect(() => {
    if (GroupIdentifierUrlMap.size === 0) return;

    const queryParams = [...GroupIdentifierUrlMap.entries()]
      .map(([_, value]) => `${value}`)
      .join('&');
    setParametersUrl(queryParams);
  }, [GroupIdentifierUrlMap]);


  const fetchSVG = useCallback(
    async ( regenrateAll = true) => {
      try {
        if(!svgData) regenrateAll=true
        const b = regenrateAll ? blocks : blocks.filter((b) => b.changed);

        const bodyData = buildBodyData({
          blocks: b,
          paperWidth,
          paperHeight,
          format,
          selectedConfigId,
          placeholders,
          isTemplate,
        });

        const { text, response } = await post("/preview", bodyData);
        if (!response.ok) throw new Error();
        setLastUpdatedBlockId("all");

        setSvgData(
          addWhiteBackgroundAndBordersToSVG(
            text,
            svgData,
          )
        );

        const paramUrlCount = Number(response.headers.get('X-Parameters-Url')) || 0;
        if (paramUrlCount !== 1) {
          const newMap = new Map<number, string>();
          for (let i = 1; i <= paramUrlCount; ++i) {
            const value = response.headers.get('X-Parameters-Url' + i);
            if (value) newMap.set(i, value);
          }
          setGroupIdentifierUrlMap(newMap);
        } else {
          for (let [header, value] of response.headers.entries()) {
            if (header.toLowerCase().startsWith('x-parameters-url')) {
              const id = header.slice('X-Parameters-Url'.length);
              if (id) updateMapValue(id, value);
            }
          }
        }

      } catch (e) {
        console.error(e);
        setSvgData('<svg><text x="10" y="50" fill="red">Error</text></svg>');
      }
    },
    [blocks, selectedBlockIndex, paperWidth, paperHeight, format, selectedConfigId, config, svgData, isTemplate, placeholders]
  );

  const handleSendRequest = useCallback(async () => {
    if (!parametersUrl) return;
    try {
      const bodyData = buildBodyData({
        blocks,
        paperWidth,
        paperHeight,
        format,
        selectedConfigId,
        placeholders,
        isTemplate,
      });

      const { text, response } = await post("/preview" + parametersUrl, bodyData);
      if (!response.ok) throw new Error();

      setSvgData(
        addWhiteBackgroundAndBordersToSVG(
          text,
          svgData,
        )
      );

      const paramUrlCount = Number(response.headers.get('X-Parameters-Url')) || 0;
      if (paramUrlCount !== 1) {
        const newMap = new Map<number, string>();
        for (let i = 1; i <= paramUrlCount; ++i) {
          const value = response.headers.get('X-Parameters-Url' + i);
          if (value) newMap.set(i, value);
        }
        setGroupIdentifierUrlMap(newMap);
      } else {
        for (let [header, value] of response.headers.entries()) {
          if (header.toLowerCase().startsWith('x-parameters-url')) {
            const id = header.slice('X-Parameters-Url'.length);
            if (id) updateMapValue(id, value);
          }
        }
      }
    } catch {
      setSvgData('<svg><text x="10" y="50" fill="red">Error</text></svg>');
    }
  }, [parametersUrl, blocks, paperWidth, paperHeight, format, selectedConfigId, config, svgData]);

  const handleGenerate = (regenrateAll = true, samePreview = false) => {
    fetchSVG(regenrateAll);
  };

  useDebounce(
    () => {
      if (needsSync) {
        handleGenerate(false);   
        setSync(false);          
      }
    },
    150,
    [needsSync, isTemplate, placeholders] 
  );
    useSvgGroups(svgData, svgGroups,setSvgGroups);

  return (
    <div style={{ display: 'flex', width: '100%' }}>

      <SvgCard
        svgGroups={svgGroups}
        setBlocks={setBlocks}
        setPositions={setPositions}
        positions={positions}
        setSelectedBlockIndex={setSelectedBlockIndex}
        containerRef={containerRef}
        cardRef={cardRef}
        setSync={setSync}
      />

      <button style={{ marginLeft: '10px', marginBottom: '5px', marginTop: '0px', padding: "10px" }} onClick={() => handleGenerate()}>
        Generate Different Preview
      </button>
      <button style={{ marginLeft: '10px', marginBottom: '5px', marginTop: '0px', padding: "10px" }} onClick={() => handleDeleteBlock()}>
        Delete Block
      </button>
      <button style={{ marginLeft: '10px', marginBottom: '5px', marginTop: '0px', padding: "10px" }} onClick={() => handleAddBlock()}>
        Add Block
      </button>

      <div style={{ width: '45%', margin: '20px 0' }}>
        <ConfigForm
          handleBlockChange={handleBlockChange}
          setPaperHeight={setPaperHeight}
          setPaperWidth={setPaperWidth}
          align={align}
          setAlign={setAlign}
          blocks={blocks}
          selectedBlockIndex={selectedBlockIndex}
          setSelectedBlockIndex={setSelectedBlockIndex}
          size={size}
          setSize={setSize}
        />

<div style={{
  height:"400px",
  overflow:'scroll'
}}>


{Array.from({ length: symbolCount }, (_, index) => (
  <Symbol key={index} id={index + 1} size={70}  handleAddBlock={handleAddBlock}/>
))}
</div>

      </div>
                


    </div>
  );
}

function Symbol({ id, size = 48, className = '', handleAddBlock }) {
  const symbolElement = document.getElementById(`sym-${id}`);

  const vb = symbolElement
    ?.getAttribute('viewBox')
    ?.split(' ')
    .map(Number) || [0, 0, 100, 100];

  const [minX, minY, vbW, vbH] = vb;

  const character = symbolElement?.getAttribute('data-caracter') || '';
  const fontName = symbolElement?.getAttribute('data-category') || '';

  return (
    <svg
      className={className}
      style={{ cursor: 'pointer' }}
      onClick={() => {
        handleAddBlock(character,fontName); 
      }}
      width={size}
      height={size}
      viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <use href={`#sym-${id}`} />
    </svg>
  );
}

