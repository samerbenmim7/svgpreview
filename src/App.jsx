import React, { useRef,useState, useEffect, useCallback } from 'react';
import ConfigForm from './ConfigForm';

function App() {
  //const [textValue, setTextValue] = useState('Write To Excite !');
  const [svgData, setSvgData] = useState('');
  const [font, setFont] = useState('jessy');
  const [updateMode, setUpdateMode] = useState('onChange');
  const [debounceInterval, setDebounceInterval] = useState(100);
  const [lastSentText, setLastSentText] = useState("");
  const [requestTimestamps, setRequestTimestamps] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [averageRequests, setAverageRequests] = useState(0);
  const [parametersUrl, setParametersUrl] = useState('');
  const [selectedConfigId, setSelectedConfigId] = useState(null);
  const [gCodeData, setGCodeData] = useState(''); // Stores the generated G-code
 // Color::FromArgb(200, 0, 0, 200)
  // Fields Config fieldWidth,fieldFontSize,leftOffset,topOffset,alignment,lineHeight,multiline,paperWidth,paperHeight
  // const [fieldWidth, setFieldWidth] = useState(70);
  // const [fieldFontSize, setFieldFontSize] = useState(4);
  // const [leftOffset, setLeftOffset] = useState(14);
  // const [topOffset, setTopOffset] = useState(35);
  // const [alignment, setAlignment] = useState('left');
  // const [lineHeight, setLineHeight] = useState(4);
  // const [multiline, setMultiline] = useState(true);
  // const [rColor, setRColor] = useState(0);
  // const [gColor, setGColor] = useState(0);
  // const [bColor, setBColor] = useState(200);
  const containerRef = useRef(null);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(0);

  // Paper Config
  const [paperWidth, setPaperWidth] = useState(210);
  const [paperHeight, setPaperHeight] = useState(105);
  const [format, setFormat] = useState('svg');
  const [configs, setConfigs] = useState([]);
  // Zoom state: in percentages (100 = 100%, 150 = 150%, etc.)
  const [zoom, setZoom] = useState(35);
  const [blocks, setBlocks] = useState([
    {
      name: "title",
      config: {
        text: "A Warm Thank You to WunderPen !",
        widthInMillimeters: 210,
        fontSize: 5,
        fontName: "david",
        leftOffsetInMillimeters: 0,
        topOffsetInMillimeters: 18,
        multiline: true,
        lineHeight: 0,
        rotation: 0,
        r: 0,
        g: 0,
        b: 0,
        alignment: "center"
      }
    },
    {
      name: "sender",
      config: {
        text: "Rue Wafa Enfidha, 4030 Sousse, Tunisia",
        widthInMillimeters: 33,
        fontSize: 3,
        fontName: "conrad",
        leftOffsetInMillimeters: 155,
        topOffsetInMillimeters: 109,
        multiline: true,
        lineHeight: 4,
        rotation: -20,
        r: 0,
        g: 0,
        b: 0,
        alignment: "left"
      }
    },
    {
      name: "sender2",
      config: {
        text: "Samer Ben Mim,",
        widthInMillimeters: 33,
        fontSize: 4,
        fontName: "conrad",
        leftOffsetInMillimeters: 155,
        topOffsetInMillimeters: 104,
        multiline: true,
        lineHeight: 4,
        rotation: -20,
        r: 0,
        g: 0,
        b: 0,
        alignment: "left"
      }
    },

    {
      name: "date",
      config: {
        text: "2025-03-18",
        widthInMillimeters: 50,
        fontSize: 3,
        fontName: "conrad",
        leftOffsetInMillimeters: 27,
        topOffsetInMillimeters: -49,
        multiline: true,
        lineHeight: 10,
        rotation: 90,
        r: 0,
        g: 0,
        b: 0,
        alignment: "right"
      }
    },
    {
      name: "header",
      config: {
        text: "Dear WunderPen team ♥,",
        widthInMillimeters: 180,
        fontSize: 4,
        fontName: "jessy",
        leftOffsetInMillimeters: 18,
        topOffsetInMillimeters: 25,
        multiline: true,
        lineHeight: 10,
        rotation: 0,
        r: 0,
        g: 0,
        b: 0,
        alignment: "left"
      }
    },
 
    {
      name: "content",
      config: {
        text: "Thank you so much for your warm welcome, comfortable accommodations, and exceptional hospitality. Your support made my integration smooth and enjoyable. My deepest gratitude to Ahmad, Siva, An-Guo, Steffi, Momo & Coco, and the entire team for your exceptional efforts in making me feel at home.",
        widthInMillimeters: 185,
        fontSize: 5,
        fontName: "enrico",
        leftOffsetInMillimeters: 17,
        topOffsetInMillimeters: 39,
        multiline: true,
        lineHeight: 8,
        rotation: 0,
        r: 0,
        g: 0,
        b: 0,
        alignment: "left"
      }
    },
    {
      name: "content",
      config: {
        text: "Wishing you all continued success and prosperity!",
        widthInMillimeters: 185,
        fontSize: 4,
        fontName: "enrico",
        leftOffsetInMillimeters: 17,
        topOffsetInMillimeters: 79,
        multiline: true,
        lineHeight: 8,
        rotation: 0,
        r: 0,
        g: 0,
        b: 0,
        alignment: "left"
      }
    },
 
   
    
    
  ]);


  console.log(blocks)
  // Handler to update block config values
  const handleBlockChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(e.target.value)

    setBlocks((prevBlocks) =>
      prevBlocks.map((block, idx) => {
        console.log(idx)
        if (idx !== selectedBlockIndex) return block;
        if (name === 'name') {
          
          return { ...block, name: value };
        } else {
          // For the alignment field, simply use the value (no parseFloat needed)
          const newVal =
            name === 'alignment'
              ? value :
              name === 'multiline' ?
              (value.toLowerCase() == "true")
              : type === 'checkbox'
              ? checked
              : type === 'number'
              ? parseFloat(value)
              : value;
          return {
            ...block,
            config: {
              ...block.config,
              [name]: newVal,
            },
          };
        }
      })
    );
  };
  const fonts = ['jessy', 'conrad', 'boyd',"david","adrian","direct"];
  const debounceOptions = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
const defaultConfig = {
  name: 'Default',
  fontSizeDraw: 10,
  fontSizeOverlay: 60,
  posX: 0,
  posY: 0,
  servoAngleUp: 60,
  servoAngleHighUp: 50,
  servoAngleDown: 80,
  servoWaitTime: 80,
  printerSpeed: 3000,
  myAlignType: 'AlignLeft',
  segmentLength: 0.5,
  angleThreshold: (5.0 / 180.0) * 3.14159,
  charDist: 0.0,
  imperfectY: 0.5,
  imperfectX: 2.0,
  lineDist: 10.0,
  rotate: 0,
  offsetBorderX: 20,
  offsetBorderY: 30,
  offsetRightBorder: 10,
  paperWidth: 210,
  paperHeight: 297,
  heightTopStripe: 15,
  heightBottomStripe: 15,
  heightRightStripe: 15,
  heightLeftStripe: 15,
  backGroundImageName: '',
  repeatShiftX: 50,
  repeatShiftY: 50,
  repeatX: 0,
  repeatY: 0,
  createPreviewImages: true,
  creationCanceled: false,
  creationIsRunning: false,
  picBoxDokSizeX: 0,
  picBoxDokSizeY: 0,
  curFontIndex: 0,
  id:25
};
const [config, setConfig] = useState(defaultConfig);
useEffect(() => {
  if (containerRef.current) {
    const scrollableDiv = containerRef.current;
    
    // Calculate center positions
    const centerX = (scrollableDiv.scrollWidth - scrollableDiv.clientWidth) / 2;
    const centerY = (scrollableDiv.scrollHeight - scrollableDiv.clientHeight) / 2;

    // Scroll to center
    scrollableDiv.scrollTo({
      left: centerX,
      top: centerY,
      behavior: "smooth", // Optional: Smooth scrolling effect
    });
  }
}, [svgData]); // Runs when svgData updates

  const styles = {
    
    container: {
      maxWidth:"75%",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
      width: '100%',
      height: '100vh',
      padding: '20px',
      boxSizing: 'border-box',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: '20px',
    },
    dropdown: {
      padding: '10px',
      fontSize: '16px',
      marginRight: '10px',
    },
    input: {
      padding: '10px',
      fontSize: '16px',
      width: '100%',
      marginBottom: '10px',
      boxSizing: 'border-box',
    },
    button: {
      padding: '10px',
      fontSize: '16px',
      cursor: 'pointer',
      marginTop: '10px',
    },
    svgContainer: {
      border: '1px solid #ccc',
      minHeight: '500px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      marginTop: '10px',
      overflow: 'auto', // enables scrolling
      background: '#80808038', // Light gray
      position: 'relative',
    },
    parametersUrlContainer: {
      width: '100%',
      marginTop: '10px',
    },
    parametersUrlLabelArea: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    parametersUrlTextarea: {
      width: '100%',
      minHeight: '80px',
      fontFamily: 'monospace',
      fontSize: '14px',
      boxSizing: 'border-box',
    },
    metricsContainer: {
      marginTop: '10px',
      padding: '10px',
      border: '1px solid #ddd',
      width: '100%',
      textAlign: 'center',
    },
    averageText: { color: 'red', fontWeight: 'bold' },
    gCodeContainer: {
      width: '100%',
      marginTop: '10px',
    },
    gCodeTextArea: {
      width: '100%',
      minHeight: '100px',
      fontFamily: 'monospace',
      fontSize: '12px',
      boxSizing: 'border-box',
    },
    
  };
  
  const downloadFile = (content, fileName, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadGCode = () => {
    downloadFile(gCodeData, "gcode.txt", "text/plain");
  };

  const handleDownloadSVG = () => {
    downloadFile(svgData, "preview.svg", "image/svg+xml");
  };

  // Logs each request for metrics
  const logRequest = useCallback(() => {
    const timestamp = Date.now();
    setRequestTimestamps((prev) => {
      const updatedTimestamps = prev.filter((t) => timestamp - t <= 10000);
      updatedTimestamps.push(timestamp);
      setAverageRequests((updatedTimestamps.length / 10).toFixed(1));
      return updatedTimestamps;
    });
    setTotalRequests((prev) => prev + 1);
  }, []);

  // Resets metrics and counters
  const resetMetrics = () => {
    setRequestTimestamps([]);
    setTotalRequests(0);
    setAverageRequests(0);
  };

  // Helper: ensure white background in SVG
  const addWhiteBackgroundAndBordersToSVG = (svgContent, paperWidth, paperHeight) => {
    if (!svgContent) return '';
  
    // Convert 10mm margin to pixels
    const conversionFactor = 300; // px per inch
  
    const mmToInch = 25.4;
    const marginLeft = config.heightLeftStripe   / mmToInch  * conversionFactor; // Convert 10mm to px
    const marginRight = config.heightRightStripe   / mmToInch  * conversionFactor; // Convert 10mm to px
    const marginTop = config.heightTopStripe   / mmToInch  * conversionFactor; // Convert 10mm to px
    const marginBottom = config.heightBottomStripe   / mmToInch  * conversionFactor; // Convert 10mm to px


    const dpi = 300;
    
    // Borders as SVG <rect> elements
    const borders = `
      <rect x="0" y="0" width="100%" height="100%" fill="white"/>
      <rect x="${marginLeft}" y="0" width="1" height="200%" fill="red"/> <!-- Left Border -->
      <rect x="${paperWidth/mmToInch *dpi -marginRight}" y="0" width="1" height="100%" fill="red"/> <!-- Right Border -->
      <rect x="0" y="${marginTop}" width="100%" height="1" fill="red"/> <!-- Top Border -->
      <rect x="0" y="${paperHeight/mmToInch *dpi -marginBottom}" width="100%" height="1" fill="red"/> <!-- Bottom Border -->
    `;
  
    // Insert the white background and borders after the opening <svg> tag
    return svgContent.replace(/<svg([^>]+)>/, `<svg$1>${borders}`);
  };
  
  const generateGCode = async () => {
    try {
      const bodyData = {
        fields: [
          ...blocks.map(b=>(
            {
              text: b.config.text,
              widthInMillimeters: b.config.widthInMillimeters,
              fontSize: b.config.fontSize,
              fontName: b.config.fontName,
              leftOffsetInMillimeters: b.config.leftOffsetInMillimeters,
              topOffsetInMillimeters: b.config.topOffsetInMillimeters,
              alignment: b.config.alignment,
              multiline: b.config.multiline,
              lineHeight: b.config.lineHeight,
              rotate:b.config.rotation,
              rgbColor:b.config.r + ","+b.config.g + "," + b.config.b

            }
          )
        )
        
        ],
        config: {
          paperWidthInMillimeters: paperWidth,
          paperHeightInMillimeters: paperHeight,
          format: format,
          //rgbColor: `${rColor},${gColor},${bColor}`,

        },
        configId: selectedConfigId,
      };
  
      const response = await fetch('http://wunderpen-inkloom-test.server.bett-ingenieure.de/gcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': 'cmVhZC1hcGlrZXkteC1pbmtsb29tDQo=',
        },
        body: JSON.stringify(bodyData),
      });
  
      
      const gCodeText = await response.text();
      setGCodeData(gCodeText);
    } catch (error) {
      console.error('Error generating G-code:', error);
      setGCodeData('Error: Could not generate G-code.');
    }
  };
  
  // Fetches the SVG data (POST request) and updates X-Parameters-Url
  const fetchSVG = useCallback(
    async (inputText, selectedFont) => {
      if (!inputText) return;
      try {
        const bodyData = {
          fields: [
            ...blocks.map(b=>(
              {
                text: b.config.text,
                widthInMillimeters: b.config.widthInMillimeters,
                fontSize: b.config.fontSize,
                fontName: b.config.fontName,
                leftOffsetInMillimeters: b.config.leftOffsetInMillimeters,
                topOffsetInMillimeters: b.config.topOffsetInMillimeters,
                alignment: b.config.alignment,
                multiline: b.config.multiline,
                lineHeight: b.config.lineHeight,
                rotate:b.config.rotation,
                rgbColor:b.config.r + ","+b.config.g + "," + b.config.b
  

              }
            )
          )
          
          ],
          config: {
            paperWidthInMillimeters: paperWidth,
            paperHeightInMillimeters: paperHeight,
            format: format,
          //  rgbColor: `${rColor},${gColor},${bColor}`,

          },
          configId: selectedConfigId,
        };

        const response = await fetch('https://inkloom-test.bi-dev2.de/api/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': 'cmVhZC1hcGlrZXkteC1pbmtsb29tDQo=',
          },
          body: JSON.stringify(bodyData),
        });

        if (!response.ok) {
          throw new Error('Network response was not OK');
        }

        const data = await response.text();
        const index = data.indexOf("<svg");
        const gcode = data.slice(0, index);
        setGCodeData(gcode)
        const rawSvg = data.slice(index);


        setSvgData(addWhiteBackgroundAndBordersToSVG(rawSvg, paperWidth, paperHeight));

        const paramUrl = response.headers.get('X-Parameters-Url') || '';
        setParametersUrl(paramUrl);

        setLastSentText(inputText);
        logRequest();
      } catch (error) {
        console.error('Error fetching SVG:', error);
        setSvgData('<svg><text x="10" y="50" fill="red">Error</text></svg>');
      }
    },
    [
      selectedConfigId,

      paperWidth,
      paperHeight,
      // rColor,
      // gColor,
      // bColor,
      config.heightLeftStripe,
      config.heightBottomStripe,
      config.heightTopStripe,
      config.heightRightStripe,
      blocks,
      format,
      logRequest,
    ]
  );

  // handleSendRequest
  const handleSendRequest = useCallback(async () => {
    if (!parametersUrl) {
      alert('No X-Parameters-Url is available.');
      return;
    }
    try {
      const bodyData = {
        fields: [
          ...blocks.map(b=>(
            {
              text: b.config.text,
              widthInMillimeters: b.config.widthInMillimeters,
              fontSize: b.config.fontSize,
              fontName: b.config.fontName,
              leftOffsetInMillimeters: b.config.leftOffsetInMillimeters,
              topOffsetInMillimeters: b.config.topOffsetInMillimeters,
              alignment: b.config.alignment,
              multiline: b.config.multiline,
              lineHeight: b.config.lineHeight,
              rotate:b.config.rotation,
              rgbColor:b.config.r + ","+b.config.g + "," + b.config.b


            }
          )
        )
        
        ],
        config: {
          paperWidthInMillimeters: paperWidth,
          paperHeightInMillimeters: paperHeight,
          format: format,
         // rgbColor: `${rColor},${gColor},${bColor}`,

        },
        configId: selectedConfigId,
      };

      const url = parametersUrl
        .replace('http', 'https')
        .replace('wunderpen-inkloom-test.server.bett-ingenieure.de', 'inkloom-test.bi-dev2.de/api');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': 'cmVhZC1hcGlrZXkteC1pbmtsb29tDQo=',
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        throw new Error('Network response was not OK');
      }

      const data = await response.text();
      const index = data.indexOf("<svg");
      const gcode = data.slice(0, index);
      setGCodeData(gcode)

      const rawSvg = data.slice(index);      setSvgData(addWhiteBackgroundAndBordersToSVG(rawSvg, paperWidth, paperHeight));

      const paramUrl = response.headers.get('X-Parameters-Url') || '';
      setParametersUrl(paramUrl);

      logRequest();
    } catch (error) {
      console.error('Error sending request with data param:', error);
      setSvgData('<svg><text x="10" y="50" fill="red">Error</text></svg>');
    }
  }, [
    parametersUrl,
//    textValue,
    font,
   
    paperWidth,
    paperHeight,
    // rColor,
    // gColor,
    // bColor,
    format,
    selectedConfigId,
    logRequest,
  ]);

  // Handle text changes
  // const handleTextChange = (e) => {
  //   setTextValue(e.target.value);
  //   if (updateMode === 'onChange' && e.target.value) {
  //     fetchSVG(e.target.value, font);
  //   }
  // };

  // Debounce effect
  // useEffect(() => {
  //   if (updateMode === 'debounce') {
  //     const interval = setInterval(() => {
  //       if (textValue !== lastSentText) {
  //         fetchSVG(textValue, font);
  //       }
  //     }, debounceInterval);
  //     return () => clearInterval(interval);
  //   }
  // }, [textValue, lastSentText, fetchSVG, font, updateMode, debounceInterval]);

  // Manual "Generate" button
  const handleGenerate = () => {
    fetchSVG(blocks[selectedBlockIndex]?.config["text"], font);
  };
  useEffect(() => {
    handleGenerate()
  }, [paperWidth,paperHeight,   
    // rColor,
    // gColor,
    // bColor,
    config.heightLeftStripe,
    config.heightBottomStripe,
    config.heightTopStripe,
    config.heightRightStripe,
    blocks
  ]);

  // OnChange for config fields
  const onConfigChange = (setter) => (e) => {
    if (e.target.type === 'checkbox') {
      setter(e.target.checked);
    } else {
      setter(e.target.type === 'number' ? Number(e.target.value) : e.target.value);
    }
   // setTimeout(() => fetchSVG(textValue, font), 1);
  };

  // Layout for the small config + zoom
  const smallConfigStyle = {
    marginTop: '10px',
    padding: '10px',
    border: '1px solid #ccc',
    fontSize: '12px',
    width: '100%',
  };
  const smallInputStyle = { width: '38px', marginRight: '10px' };
  const labelStyle = { marginRight: '5px' };

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      {/* Left Panel for Config */}
      <div style={{ width: '45%', margin: '20px 0', border: '1px solid black' }}>
        <ConfigForm
          handleBlockChange={handleBlockChange}
          //setTextValue={setTextValue}
          //textValue={textValue}
          selectedConfigId={selectedConfigId}
          setSelectedConfigId={setSelectedConfigId}
          generatePreview={() => fetchSVG(blocks[selectedBlockIndex]?.config["text"], font)}
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

      {/* Right Panel for SVG Preview & Controls */}
      <div style={styles.container}>
        <div style={styles.header}>
          {/* Font Selection */}
          {/* <select
            style={styles.dropdown}
            value={font}
            onChange={(e) => {
              setFont(e.target.value);
              //if (updateMode === 'onChange') fetchSVG(textValue, e.target.value);
            }}
          >
            {fonts.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select> */}
         

        
          {/* Debounce Interval Selection */}
     
        </div>

        {/* Text Input */}
        <input
          type="text"
          style={styles.input}
          value={blocks[selectedBlockIndex]?.config["text"] }
          onChange={handleBlockChange}
          name='text'
          placeholder="Type your text here..."
        />

        {/* On Submit Mode: "Generate" Button */}
      

        <div style={styles.svgContainer} ref={containerRef}>
          <div
            style={{
              alignSelf:'baseline',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <div
            dangerouslySetInnerHTML={{ __html: svgData }} />
          </div>
        </div>

        {/* Extra Preview Config (including Zoom) */}
        <div style={smallConfigStyle}>
          <strong style={{ display: 'block', marginBottom: '5px' }}>Extra Preview Config:</strong>
          <div style={{display:"flex",alignItems:"center"}}>

          <label style={labelStyle}>Page Width (mm):</label>
          <input
            type="number"
            value={paperWidth}
            onChange={onConfigChange(setPaperWidth)}
            style={smallInputStyle}
          />

          <label style={labelStyle}>Page Height (mm):</label>
          <input
            type="number"
            value={paperHeight}
            onChange={onConfigChange(setPaperHeight)}
            style={smallInputStyle}
          />
           {/* <label style={labelStyle}>R:</label>
          <input
            type="number"
            value={rColor}
            onChange={onConfigChange(setRColor)}
            style={smallInputStyle}
          />
           <label style={labelStyle}>G:</label>
          <input
            type="number"
            value={gColor}
            onChange={onConfigChange(setGColor)}
            style={smallInputStyle}
          />
           <label style={labelStyle}>B:</label>
          <input
            type="number"
            value={bColor}
            onChange={onConfigChange(setBColor)}
            style={smallInputStyle}
          /> */}

          {/* <label style={labelStyle}>Fmt:</label>
          <select
            value={format}
            onChange={onConfigChange(setFormat)}
            style={smallInputStyle}
          >
            <option value="svg">SVG</option>
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
          </select> */}

<button 
style={{
  marginLeft:"40px",
  padding:"10px 15px"
}}
onClick={() => {
            
            containerRef.current?.scrollTo({
  left: (containerRef.current.scrollWidth - containerRef.current.clientWidth) / 2,
  top: (containerRef.current.scrollHeight - containerRef.current.clientHeight) / 2,
  behavior: "smooth"
})}}>
  Center SVG
</button>
<button style={{
  marginLeft:"40px",
  padding:"10px 15px"
}} onClick={handleDownloadGCode}>Download GCode</button>
<button style={{
  marginLeft:"40px",
  padding:"10px 15px"
}} onClick={handleDownloadSVG}>Download SVG</button>
<div style={{display:"flex",justifyContent:"center",alignItems:"center",width: '380px'}}>
<div style={{ marginRight: '5px', display: 'inline-block' }}>
  Zoom:
</div>
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

        {/* Parameters URL + "Send Request" */}
        <div style={styles.parametersUrlContainer}>
          <div style={styles.parametersUrlLabelArea}>
            <label htmlFor="parametersUrl">X-Parameters-Url:</label>
            <button
              style={{ marginLeft: '10px', marginTop: '10px' }}
              onClick={handleSendRequest}
            >
              Send Request
            </button>
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
    <label>Generate G-Code:</label>
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

        {/* Metrics Panel */}
        <div style={styles.metricsContainer}>
          <p>Total Requests Sent: {totalRequests}</p>
          <p>
            Average Requests Per Second:{' '}
            <span style={styles.averageText}>{averageRequests}</span>
          </p>
          <button style={styles.button} onClick={resetMetrics}>
            Reset Metrics
          </button>
        
        </div>
      </div>
    </div>
  );
}

export default App;
