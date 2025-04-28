import React, { useRef, useState, useEffect, useCallback } from 'react';
import ConfigForm from './ConfigForm';
import { addWhiteBackgroundAndBordersToSVG, extractGId, buildBodyData } from './Utils/utils';
import { post } from './services/api';
import { defaultConfig, defaultBlocks, defaultBlocksMap } from './defaults';
import SvgCard from './Components/SvgCard';
import './Configurator.css';

// ---- Interfaces / Types ----

interface Position {
  x: number;
  y: number;
}

interface Placeholder {
  name: string;
  value: string;
}

interface BlockConfig {
  text: string;
  widthInMillimeters: number;
  fontSize: number;
  fontName: string;
  leftOffsetInMillimeters: number;
  topOffsetInMillimeters: number;
  topdragOffsetInMillimeters?: number;
  leftdragOffsetInMillimeters?: number;
  alignment: string;
  multiline: boolean;
  lineHeight: number;
  rotation: number;
  r: number;
  g: number;
  b: number;
}

interface Block {
  id: number;
  config: BlockConfig;
  name?: string;
  changed?: boolean;
}

// ---- Main App Component ----

export default function App() {
  const [positions, setPositions] = useState<Record<number, Position>>({});
  const [svgData, setSvgData] = useState<string>('');
  const [firstfetch, setFirstfetch] = useState<boolean>(true);
  const [parametersUrl, setParametersUrl] = useState<string>('');
  const [selectedConfigId, setSelectedConfigId] = useState<number>(25);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(1);
  const [paperWidth, setPaperWidth] = useState<number>(210);
  const [paperHeight, setPaperHeight] = useState<number>(105);
  const [format, setFormat] = useState<string>('svg');
  const [config, setConfig] = useState<any>(defaultConfig);
  const [configs, setConfigs] = useState<any[]>([]);
  //
  const [blocks, setBlocks] = useState<Block[]>(defaultBlocks);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [myMap, setMyMap] = useState<Map<number, string>>(new Map());
  const [isTemplate, setIsTemplate] = useState<boolean>(true);
  const [align, setAlign] = useState<string>('left');
  const [size, setSize] = useState<string>('medium');
  const [svgGroups, setSvgGroups] = useState<Map<number, string>>(new Map());
  const [lastUpdatedBlockId, setLastUpdatedBlockId] = useState<string | null>(null);
  const [blocksMap, setBlocksMap] = useState(defaultBlocksMap);
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([
    { name: 'COMPANY', value: 'WunderPen' },
    { name: 'NAME1', value: 'Siva' },
    { name: 'SENDER', value: 'Samer Ben Mim,' },
  ]);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const updateMapValue = (id: string, newValue: string) => {
    setMyMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(parseInt(id, 10), newValue);
      return newMap;
    });
  };

  const handleBlockChange = (e: React.ChangeEvent<HTMLInputElement> | null, text?: string) => {
    let {
      name = null,
      value = null,
      type = null,
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

  useEffect(() => {
    if (containerRef.current) {
      const scrollableDiv = containerRef.current;
      const centerX = (scrollableDiv.scrollWidth - scrollableDiv.clientWidth) / 2;
      const centerY = (scrollableDiv.scrollHeight - scrollableDiv.clientHeight) / 2;
      scrollableDiv.scrollTo({ left: centerX, top: centerY, behavior: 'smooth' });
    }
  }, [svgData]);

  useEffect(() => {
    if (myMap.size === 0) return;

    const queryParams = [...myMap.entries()]
      .map(([_, value]) => `${value}`)
      .join('&');
    setParametersUrl(queryParams);
  }, [myMap]);

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(
      setTimeout(() => {
        handleSendRequest();
      }, 150)
    );
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [paperHeight, paperWidth]);

  const fetchSVG = useCallback(
    async (inputText: string | undefined, regenrate = true) => {
      if (!inputText) return;
      try {
        const b = regenrate ? blocks : blocks.filter((b) => b.changed);

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
            firstfetch,
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
          setMyMap(newMap);
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
    [blocks, selectedBlockIndex, paperWidth, paperHeight, format, selectedConfigId, firstfetch, config, svgData, blocksMap, isTemplate, placeholders]
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
          firstfetch,
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
        setMyMap(newMap);
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
  }, [parametersUrl, blocks, paperWidth, paperHeight, format, selectedConfigId, firstfetch, config, svgData]);

  const handleGenerate = (regenrate = true) => {
    setFirstfetch(false);
    const val = blocks.find((b) => b.id === selectedBlockIndex)?.config.text;
    fetchSVG(val, regenrate);
  };

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(
      setTimeout(() => {
        handleGenerate(false);
      }, 150)
    );
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [blocks, isTemplate, placeholders]);

  useEffect(() => {
    handleGenerate();
  }, []);

  useEffect(() => {
    if (!svgData) return;
    const splittedData = svgData.split('\n').slice(1, -1);
    setSvgGroups((prev) => {
      const updated = new Map(prev);
      splittedData.forEach((block) => {
        const id = extractGId(block);
        if (id !== null) {
          updated.set(id, block);
        }
      });
      return updated;
    });
  }, [svgData]);

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
      />
      <button style={{ marginLeft: '10px', marginBottom: '5px', marginTop: '0px', padding: "10px" }} onClick={() => handleGenerate()}>
        Generate Different Preview
      </button>
      <div style={{ width: '45%', margin: '20px 0' }}>
        <ConfigForm
          handleBlockChange={handleBlockChange}
          selectedConfigId={selectedConfigId}
          setSelectedConfigId={setSelectedConfigId}
          generatePreview={() => {
            const val = blocks.find((b) => b.id === selectedBlockIndex)?.config.text;
            fetchSVG(val);
          }}
          setPaperHeight={setPaperHeight}
          setPaperWidth={setPaperWidth}
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
          setSvgData={setSvgData}
          svgData={svgData}
          setSelectedBlockIndex={setSelectedBlockIndex}
          setPlaceholders={setPlaceholders}
          placeholders={placeholders}
          setIsTemplate={setIsTemplate}
          isTemplate={isTemplate}
          size={size}
          setSize={setSize}
        />
      </div>
    </div>
  );
}
