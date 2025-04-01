import React, { useRef, useState, useEffect, useCallback } from 'react'
import ConfigForm from './ConfigForm'
import { styles } from './styles'
import {
  addWhiteBackgroundAndBordersToSVG,
  downloadFile,
} from './utils'
import { defaultConfig, defaultBlocks } from './defaults'

export default function App() {
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
  const [zoom, setZoom] = useState(35)
  const [config, setConfig] = useState(defaultConfig)
  const [configs, setConfigs] = useState([])
  const [blocks, setBlocks] = useState(defaultBlocks)
  const [debounceTimer, setDebounceTimer] = useState(null)
  const [myMap, setMyMap] = useState(new Map());

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
  
  
  const handleBlockChange = (e) => {
    const { name, value, type, checked } = e.target
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
    async (inputText,regenrate = false) => {
      if (!inputText) return
      try {
        const b = regenrate ? blocks :blocks.filter((b) => b.changed)
        const bodyData = {
          fields: b.map((b) => ({
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
        }
        const response = await fetch('https://inkloom-test.bi-dev2.de/api/preview', {
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
          console.log(myMap)

        }
        else{              
          for (let [header, value] of response.headers.entries()) {
            if (header.toLowerCase().startsWith('x-parameters-url')) {

              const id = header.slice('X-Parameters-Url'.length); // Extract the ID part
              console.log(`Found ID: ${id}, Value: ${value}`);
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
    [blocks, paperWidth, paperHeight, format, selectedConfigId, logRequest, firstfetch, config, svgData]
  )

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
          console.log(myMap)

        }
        else{              
          for (let [header, value] of response.headers.entries()) {
            if (header.toLowerCase().startsWith('x-parameters-url')) {

              const id = header.slice('X-Parameters-Url'.length); // Extract the ID part
              console.log(`Found ID: ${id}, Value: ${value}`);
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
          console.log(myMap)

        }
        else{              
          for (let [header, value] of response.headers.entries()) {
            if (header.toLowerCase().startsWith('x-parameters-url')) {

              const id = header.slice('X-Parameters-Url'.length); // Extract the ID part
              console.log(`Found ID: ${id}, Value: ${value}`);
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

  const handleGenerate = (regenrate = false) => {
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
  }, [blocks])

  const onConfigChange = (setter) => (e) => {
    if (e.target.type === 'checkbox') {
      setter(e.target.checked)
    } else {
      setter(e.target.type === 'number' ? Number(e.target.value) : e.target.value)
    }
  }

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <div style={{ width: '45%', margin: '20px 0', border: '1px solid black' }}>
        <ConfigForm
          handleBlockChange={handleBlockChange}
          selectedConfigId={selectedConfigId}
          setSelectedConfigId={setSelectedConfigId}
          generatePreview={() => {
            const val = blocks.find((b) => b.id == selectedBlockIndex)?.config.text
            fetchSVG(val)
          }}
          configs={configs}
          config={config}
          setConfigs={setConfigs}
          setConfig={setConfig}
          defaultConfig={defaultConfig}
          blocks={blocks}
          setBlocks={setBlocks}
          selectedBlockIndex={selectedBlockIndex}
          setSelectedBlockIndex={setSelectedBlockIndex}
        />
      </div>
      <div style={styles.container}>
        <div style={styles.header} />
        <input
          type="text"
          style={styles.input}
          value={blocks.find((b) => b.id == selectedBlockIndex)?.config.text || ''}
          onChange={handleBlockChange}
          name="text"
        />
        <div style={styles.svgContainer} ref={containerRef}>
          <div
            style={{
              alignSelf: 'baseline',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: svgData }} />
          </div>
        </div>
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            border: '1px solid #ccc',
            fontSize: '12px',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '5px' }}>Page Width (mm):</label>
            <input
              type="number"
              value={paperWidth}
              onChange={onConfigChange(setPaperWidth)}
              style={{ width: '38px', marginRight: '10px' }}
            />
            <label style={{ marginRight: '5px' }}>Page Height (mm):</label>
            <input
              type="number"
              value={paperHeight}
              onChange={onConfigChange(setPaperHeight)}
              style={{ width: '38px', marginRight: '10px' }}
            />
            <button
              style={{ marginLeft: '40px', padding: '10px 15px' }}
              onClick={() => {
                containerRef.current?.scrollTo({
                  left: (containerRef.current.scrollWidth - containerRef.current.clientWidth) / 2,
                  top: (containerRef.current.scrollHeight - containerRef.current.clientHeight) / 2,
                  behavior: 'smooth',
                })
              }}
            >
              Center SVG
            </button>
            <button
              style={{ marginLeft: '40px', padding: '10px 15px' }}
              onClick={() => downloadFile(gCodeData, 'gcode.txt', 'text/plain')}
            >
              Download GCode
            </button>
            <button
              style={{ marginLeft: '40px', padding: '10px 15px' }}
              onClick={() => downloadFile(svgData, 'preview.svg', 'image/svg+xml')}
            >
              Download SVG
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '380px' }}>
              <div style={{ marginRight: '5px', display: 'inline-block' }}>Zoom:</div>
              <input
                type="range"
                min="1"
                max="200"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value) || 1)}
                style={{ width: '200px' }}
              />
              <span style={{ marginLeft: '8px' }}>{zoom}</span>
            </div>
          </div>
        </div>
        <div style={styles.parametersUrlContainer}>
          <div style={styles.parametersUrlLabelArea}>
            <label htmlFor="parametersUrl">X-Parameters-Url:</label>
            <div>
            <button style={{ marginLeft: '10px', marginBottom: '5px',marginTop: '0px', padding:"10px" }} onClick={handleSendRequest}>
              Generate Same Preview with this URL
            </button>
            <button style={{ marginLeft: '10px', marginBottom: '5px',marginTop: '0px', padding:"10px" }} onClick={handleGenerate  }>
              Generate Different Preview
            </button>
            </div>
          </div>
          <textarea
            id="parametersUrl"
            style={styles.parametersUrlTextarea}
            readOnly
            value={parametersUrl}
          />
        </div>
        <div style={styles.gCodeContainer}>
          <div>
            <label>Generate G-Code For This Preview :</label>
            <button style={styles.button} onClick={generateGCode}>
              Create G-Code
            </button>
          </div>
          <textarea
            id="gCodeOutput"
            style={styles.gCodeTextArea}
            readOnly
            value={gCodeData}
          />
        </div>
        <div style={styles.metricsContainer}>
          <p>Total Requests Sent: {totalRequests}</p>
          <p>
            Average Requests Per Second: <span style={styles.averageText}>{averageRequests}</span>
          </p>
          <button style={styles.button} onClick={resetMetrics}>
            Reset Metrics
          </button>
        </div>
      </div>
    </div>
  )
}
