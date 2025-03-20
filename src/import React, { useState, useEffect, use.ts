import React, { useState, useEffect, useCallback } from 'react';
import ConfigForm from './ConfigForm';

function App() {
  const [textValue, setTextValue] = useState('This Is A Demo Text');
  const [svgData, setSvgData] = useState('');
  const [font, setFont] = useState('jessy');
  const [updateMode, setUpdateMode] = useState('onChange');
  const [debounceInterval, setDebounceInterval] = useState(100);
  const [lastSentText, setLastSentText] = useState(textValue);
  const [requestTimestamps, setRequestTimestamps] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [averageRequests, setAverageRequests] = useState(0);
  const [parametersUrl, setParametersUrl] = useState('');
  const [selectedConfigId, setSelectedConfigId] = useState(null);

  // 1) Add two states for controlling paper width/height
  const [paperWidth, setPaperWidth] = useState(50);  // default 50mm
  const [paperHeight, setPaperHeight] = useState(70); // default 70mm

  const fonts = ['jessy', 'conrad', 'boyd'];
  const debounceOptions = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];

  const styles = {
    container: {
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
      minHeight: '400px',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '20px',
      overflow: 'auto',
      background: '#80808038', // Light gray background
    },
    paperStyle: {
      // We'll dynamically set width & height using our states
      backgroundColor: 'white',
      border: '1px solid black',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
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

  // Fetches the SVG data (POST request) and updates X-Parameters-Url
  const fetchSVG = useCallback(
    async (inputText, selectedFont) => {
      if (inputText) {
        try {
          const bodyData = {
            fields: [
              {
                text: inputText,
                widthInMillimeters: 70,
                fontSize: 2,
                fontName: selectedFont,
                leftOffsetInMillimeters: 4,
                topOffsetInMillimeters: 35,
                alignment: 'left',
                multiline: true,
                lineHeight: 4,
              },
            ],
            config: {
              // 2) Use your states for paper width/height in the request body
              paperWidthInMillimeters: paperWidth,
              paperHeightInMillimeters: paperHeight,
              format: 'svg',
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
          setSvgData(data);

          const paramUrl = response.headers.get('X-Parameters-Url') || '';
          setParametersUrl(paramUrl);

          setLastSentText(inputText);
          logRequest();
        } catch (error) {
          console.error('Error fetching SVG:', error);
          setSvgData('<svg><text x="10" y="50" fill="red">Error</text></svg>');
        }
      }
    },
    [selectedConfigId, logRequest, paperWidth, paperHeight]
  );

  // Handles sending a request with ?data=parametersUrl
  const handleSendRequest = useCallback(async () => {
    if (!parametersUrl) {
      alert('No X-Parameters-Url is available.');
      return;
    }
    try {
      const bodyData = {
        fields: [
          {
            text: textValue,
            widthInMillimeters: 70,
            fontSize: 2,
            fontName: font,
            leftOffsetInMillimeters: 4,
            topOffsetInMillimeters: 35,
            alignment: 'left',
            multiline: true,
            lineHeight: 4,
          },
        ],
        config: {
          // 3) Use the same states here so data is consistent
          paperWidthInMillimeters: paperWidth,
          paperHeightInMillimeters: paperHeight,
          format: 'svg',
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
      setSvgData(data);

      const paramUrl = response.headers.get('X-Parameters-Url') || '';
      setParametersUrl(paramUrl);

      logRequest();
    } catch (error) {
      console.error('Error sending request with data param:', error);
      setSvgData('<svg><text x="10" y="50" fill="red">Error</text></svg>');
    }
  }, [parametersUrl, textValue, font, selectedConfigId, logRequest, paperWidth, paperHeight]);

  // Handle text changes
  const handleTextChange = (event) => {
    setTextValue(event.target.value);
    if (updateMode === 'onChange') {
      if (event.target.value) {
        fetchSVG(event.target.value, font);
      }
    }
  };

  // Debounce effect for text changes
  useEffect(() => {
    if (updateMode === 'debounce') {
      const interval = setInterval(() => {
        if (textValue !== lastSentText) {
          fetchSVG(textValue, font);
        }
      }, debounceInterval);
      return () => clearInterval(interval);
    }
  }, [textValue, lastSentText, fetchSVG, font, updateMode, debounceInterval]);

  // Manual "Generate" button
  const handleGenerate = () => {
    fetchSVG(textValue, font);
  };

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      {/* Left Panel for Config */}
      <div style={{ width: '45%', margin: '20px 0', border: '1px solid black' }}>
        <ConfigForm
          selectedConfigId={selectedConfigId}
          setSelectedConfigId={setSelectedConfigId}
          generatePreview={() => fetchSVG(textValue, font)}
        />
      </div>

      {/* Right Panel for SVG Preview & Controls */}
      <div style={styles.container}>
        <div style={styles.header}>
          {/* Font Selection */}
          <select
            style={styles.dropdown}
            value={font}
            onChange={(e) => setFont(e.target.value)}
          >
            {fonts.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          {/* Update Mode Selection */}
          <select
            style={styles.dropdown}
            value={updateMode}
            onChange={(e) => setUpdateMode(e.target.value)}
          >
            <option value="onChange">On Change</option>
            <option value="debounce">Debounce</option>
            <option value="onSubmit">On Submit</option>
          </select>

          {/* Debounce Interval Selection */}
          {updateMode === 'debounce' && (
            <select
              style={styles.dropdown}
              value={debounceInterval}
              onChange={(e) => setDebounceInterval(Number(e.target.value))}
            >
              {debounceOptions.map((ms) => (
                <option key={ms} value={ms}>
                  {ms} ms
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Text Input */}
        <input
          type="text"
          style={styles.input}
          value={textValue}
          onChange={handleTextChange}
          placeholder="Type your text here..."
        />

        {/* On Submit Mode: "Generate" Button */}
        {updateMode === 'onSubmit' && (
          <button style={styles.button} onClick={handleGenerate}>
            Generate
          </button>
        )}

        {/* Paper Size Inputs (in the "right" panel) */}
        <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
          <label>
            Paper Width (mm):
            <input
              type="number"
              value={paperWidth}
              onChange={(e) => setPaperWidth(parseFloat(e.target.value) || 0)}
              style={{ marginLeft: '5px', width: '60px' }}
            />
          </label>
          <label>
            Paper Height (mm):
            <input
              type="number"
              value={paperHeight}
              onChange={(e) => setPaperHeight(parseFloat(e.target.value) || 0)}
              style={{ marginLeft: '5px', width: '60px' }}
            />
          </label>
        </div>

        {/* SVG Container (gray background, scrollable if needed) */}
        <div style={styles.svgContainer}>
          {/** 
            "Paper" is simply a centered box with the dimension states 
            and white background 
          **/}
          <div
            style={{
              ...styles.paperStyle,
              width: `${paperWidth}mm`,
              height: `${paperHeight}mm`,
            }}
          >
            {/* Insert the fetched SVG */}
            <div dangerouslySetInnerHTML={{ __html: svgData }} />
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
