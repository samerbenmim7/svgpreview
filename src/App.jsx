import React, { useState, useEffect, useCallback } from 'react';

function App() {
  const [textValue, setTextValue] = useState('Hello! I’m Samer Ben Mim, and I’m excited to collaborate with you!');
  const [svgData, setSvgData] = useState('');
  const [font, setFont] = useState('jessy');
  const [updateMode, setUpdateMode] = useState('onChange');
  const [debounceInterval, setDebounceInterval] = useState(100);
  const [lastSentText, setLastSentText] = useState(textValue);
  const [requestTimestamps, setRequestTimestamps] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [averageRequests, setAverageRequests] = useState(0);

  const fonts = ['jessy', 'conrad', 'boyd'];
  const debounceOptions = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];

  const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Arial, sans-serif', width: '100%', height: '100vh', padding: '20px', boxSizing: 'border-box' },
    header: { display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '800px', marginBottom: '20px' },
    dropdown: { padding: '10px', fontSize: '16px', marginRight: '10px' },
    input: { padding: '10px', fontSize: '16px', width: '100%', maxWidth: '800px', marginBottom: '10px', boxSizing: 'border-box' },
    button: { padding: '10px', fontSize: '16px', cursor: 'pointer', marginTop: '10px' },
    svgContainer: { border: '1px solid #ccc', minHeight: '400px', width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', overflow: 'auto' },
    metricsContainer: { marginTop: '10px', padding: '10px', border: '1px solid #ddd', width: '100%', maxWidth: '800px', textAlign: 'center' },
    averageText: { color: 'red', fontWeight: 'bold' },
  };

  const logRequest = () => {
    const timestamp = Date.now();
    setRequestTimestamps((prev) => {
      const updatedTimestamps = [...prev.filter(t => timestamp - t <= 10000), timestamp];
      setAverageRequests((updatedTimestamps.length / 10).toFixed(1));
      return updatedTimestamps;
    });
    setTotalRequests((prev) => prev + 1);
  };

  const resetMetrics = () => {
    setRequestTimestamps([]);
    setTotalRequests(0);
    setAverageRequests(0);
  };

  const fetchSVG = useCallback(async (inputText, selectedFont) => {
    if (inputText) {
      try {
        const bodyData = {
          fields: [{ text: inputText, widthInMillimeters: 70, fontSize: 1, fontName: selectedFont, leftOffsetInMillimeters: 4, topOffsetInMillimeters: 30, alignment: '2', multiline: true, lineHeight: 4 }],
          config: { paperWidthInMillimeters: 50, paperHeightInMillimeters: 70, format: 'svg' }
        };

        const response = await fetch('https://inkloom-test.bi-dev2.de/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'cmVhZC1hcGlrZXkteC1pbmtsb29tDQo=' },
          body: JSON.stringify(bodyData)
        });

        if (!response.ok) throw new Error('Network response was not OK');

        const data = await response.text();
        setSvgData(data);
        setLastSentText(inputText);
        logRequest();
      } catch (error) {
        console.error('Error fetching SVG:', error);
        setSvgData('<svg><text x="10" y="50" fill="red">Error</text></svg>');
      }
    }
  }, []);

  const handleTextChange = (event) => {
    setTextValue(event.target.value);
    if (updateMode === 'onChange') {
      if (event.target.value) fetchSVG(event.target.value, font);
    }
  };

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

  const handleGenerate = () => fetchSVG(textValue, font);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <select style={styles.dropdown} value={font} onChange={(e) => setFont(e.target.value)}>
          {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>

        <select style={styles.dropdown} value={updateMode} onChange={(e) => setUpdateMode(e.target.value)}>
          <option value="onChange">On Change</option>
          <option value="debounce">Debounce</option>
          <option value="onSubmit">On Submit</option>
        </select>

        {updateMode === 'debounce' && (
          <select style={styles.dropdown} value={debounceInterval} onChange={(e) => setDebounceInterval(Number(e.target.value))}>
            {debounceOptions.map((ms) => (
              <option key={ms} value={ms}>{ms} ms</option>
            ))}
          </select>
        )}
      </div>

      <input type="text" style={styles.input} value={textValue} onChange={handleTextChange} placeholder="Type your text here..." />

      {updateMode === 'onSubmit' && <button style={styles.button} onClick={handleGenerate}>Generate</button>}

      <div style={styles.svgContainer}>
        <div dangerouslySetInnerHTML={{ __html: svgData }} />
      </div>

      <div style={styles.metricsContainer}>
        <p>Total Requests Sent: {totalRequests}</p>
        <p>Average Requests Per Second: <span style={styles.averageText}>{averageRequests}</span></p>
        <button style={styles.button} onClick={resetMetrics}>Reset Metrics</button>
      </div>
    </div>
  );
}

export default App;
