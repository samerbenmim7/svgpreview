import React, { useState, useEffect, useCallback } from 'react';

function App() {
  const [textValue, setTextValue] = useState('Hello! I’m Samer Ben Mim, and I’m excited to collaborate with you !');
  const [svgData, setSvgData] = useState('');
  const [font, setFont] = useState('jessy');
  const [updateMode, setUpdateMode] = useState('onChange'); // onChange, debounce, onSubmit
  const [debounceTimer, setDebounceTimer] = useState(null);

  const fonts = ['jessy', 'conrad', 'boyd'];

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
      maxWidth: '800px',
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
      maxWidth: '800px',
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
      maxWidth: '800px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '20px',
      overflow: 'auto',
    },
  };

  const fetchSVG = useCallback(async (inputText, selectedFont) => {
    try {
      const bodyData = {
        fields: [
          {
            text: inputText,
            widthInMillimeters: 70,
            fontSize: 1,
            fontName: selectedFont,
            leftOffsetInMillimeters: 4,
            topOffsetInMillimeters: 30,
            alignment: '2',
            multiline: true,
            lineHeight: 4,
          },
        ],
        config: {
          paperWidthInMillimeters: 50,
          paperHeightInMillimeters: 70,
          format: 'svg',
        },
      };

      const response = await fetch(
        'https://309a-2003-c5-9f21-e228-eddb-c77d-7c6b-6cbf.ngrok-free.app/preview',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': 'cmVhZC1hcGlrZXkteC1pbmtsb29tDQo=',
          },
          body: JSON.stringify(bodyData),
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not OK');
      }

      const data = await response.text(); // The response is SVG text
      setSvgData(data);
    } catch (error) {
      console.error('Error fetching SVG:', error);
      setSvgData('<svg><text x="10" y="50" fill="red">Error</text></svg>');
    }
  }, []);

  const handleTextChange = (event) => {
    const newText = event.target.value;
    setTextValue(newText);

    if (updateMode === 'onChange') {
      fetchSVG(newText, font);
    } else if (updateMode === 'debounce') {
      if (debounceTimer) clearTimeout(debounceTimer);
      const newTimer = setTimeout(() => {
        fetchSVG(newText, font);
      }, 500);
      setDebounceTimer(newTimer);
    }
  };

  const handleGenerate = () => {
    fetchSVG(textValue, font);
  };

  useEffect(() => {
    fetchSVG(textValue, font);
  }, [fetchSVG, font]);

  return (
    <div style={styles.container}>
      {/* Header - Font & Mode Selection */}
      <div style={styles.header}>
        <select style={styles.dropdown} value={font} onChange={(e) => setFont(e.target.value)}>
          {fonts.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select style={styles.dropdown} value={updateMode} onChange={(e) => setUpdateMode(e.target.value)}>
          <option value="onChange">On Change</option>
          <option value="debounce">Debounce</option>
          <option value="onSubmit">On Submit</option>
        </select>
      </div>

      {/* Text Input */}
      <input
        type="text"
        style={styles.input}
        value={textValue}
        onChange={handleTextChange}
        placeholder="Type your text here..."
      />

      {/* Generate Button (Visible Only When 'On Submit' is Selected) */}
      {updateMode === 'onSubmit' && (
        <button style={styles.button} onClick={handleGenerate}>Generate</button>
      )}

      {/* SVG Preview */}
      <div style={styles.svgContainer}>
        <div dangerouslySetInnerHTML={{ __html: svgData }} />
      </div>
    </div>
  );
}

export default App;
