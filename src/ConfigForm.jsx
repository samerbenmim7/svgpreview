import React, { useState, useEffect } from 'react';

function ConfigForm({
  selectedConfigId,
  setSelectedConfigId,
  generatePreview,
  defaultConfig,
  handleBlockChange,
  setConfig,
  setConfigs,
  configs,
  config,
  blocks,
  setBlocks,
  selectedBlockIndex,
  setSelectedBlockIndex
}) {
  // Existing API config fetching logic...
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const response = await fetch('http://wunderpen-inkloom-test.server.bett-ingenieure.de/printConfig', {
          method: 'GET',
          headers: { 'X-Api-Key': 'cmVhZC1hcGlrZXkteC1pbmtsb29tDQo=' },
        });
        const data = await response.json();
        setConfigs(data);
        setConfig(data?.[0]);
        setSelectedConfigId(data?.[0].id);
      } catch (error) {
        console.error('Error fetching configs:', error);
      }
    };
    fetchConfigs();
  }, []);

  useEffect(() => {
    const fetchSelectedConfig = async () => {
      if (!selectedConfigId) return;
      try {
        const response = await fetch(`http://wunderpen-inkloom-test.server.bett-ingenieure.de/printConfig/${selectedConfigId}`, {
          method: 'GET',
          headers: { 'X-Api-Key': 'cmVhZC1hcGlrZXkteC1pbmtsb29tDQo=' },
        });
        const data = await response.json();
        setConfig(data);
        //generatePreview(); // Trigger preview after fetching
      } catch (error) {
        console.error('Error fetching selected config:', error);
      }
    };
    fetchSelectedConfig();
  }, [selectedConfigId]);

  // ----- Blocks state and selected block index -----


  // Handler for block selection dropdown
  const handleBlockSelectChange = (e) => {
    console.log(parseInt(e.target.value, 10))
    setSelectedBlockIndex(parseInt(e.target.value, 10));
  };

  // Handler to add a new block with default values
  const handleAddBlock = () => {
    const newBlock = {
      name: "New Block",
      config: {
        text: "New Text",
        widthInMillimeters: 100,
        fontSize: 2,
        fontName: "jessy",
        leftOffsetInMillimeters: 50,
        topOffsetInMillimeters: 30,
        multiline: false,
        lineHeight: 10,
        rotation: 0,
        r: 0,
        g: 0,
        b: 0,
        alignment: "left", // default alignment
      },
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockIndex(blocks.length); // Select the new block
  };

  // Handler to delete the currently selected block
  const handleDeleteBlock = () => {
    if (blocks.length === 0) return;
    const newBlocks = blocks.filter((_, idx) => idx !== selectedBlockIndex);
    setBlocks(newBlocks);
    setSelectedBlockIndex(newBlocks.length > 0 ? Math.max(0, newBlocks.length - 1) : 0);
  };

  

  // Handler for API config changes (existing)
  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const updatedConfig = {
      ...config,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    };
    setConfig(updatedConfig);
    if (selectedConfigId) {
      try {
        await fetch(`http://wunderpen-inkloom-test.server.bett-ingenieure.de/printConfig/${selectedConfigId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': 'd3JpdGUtYXBpa2V5LXgtaW5rbG9vbQ0K',
          },
          body: JSON.stringify(updatedConfig),
        });
        console.log(`Config ${selectedConfigId} updated successfully.`);
      } catch (error) {
        console.error('Error updating config:', error);
      }
    }
  };

  // Define the configuration keys with abbreviations and in desired order.
  // Excluding the block "name" (handled in the select above)
  const configKeys = [
    { key: 'fontName', label: 'Font Name' },
    { key: 'fontSize', label: 'Font Size' },
    { key: 'leftOffsetInMillimeters', label: 'Left Offset (mm)' },
    { key: 'topOffsetInMillimeters', label: 'Top Offset (mm)' },
    { key: 'rotation', label: 'Rotation (deg)' },
    { key: 'widthInMillimeters', label: 'Field Width (mm)' },
    { key: 'lineHeight', label: 'Line Height(mm)' },
    { key: 'alignment', label: 'Alignment' },
    { key: 'r', label: 'Red Channel' },
    { key: 'g', label: 'Green Channel' },
    { key: 'b', label: 'Blue Channel' },
    { key: 'multiline', label: 'Multiline' },

  ];

  return (
    <div style={{ width: '100%', padding: '10px' }}>
      {/* Blocks Section */}
      <h2 style={{ fontSize: '23px', marginBottom: '10px', textAlign: 'left' }}>Text Blocks</h2>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '1px' }}>
        <select
          value={selectedBlockIndex}
          onChange={handleBlockSelectChange}
          style={{ padding: '6px', fontSize: '13px', minWidth: '140px' }}
        >
          {blocks.map((block, idx) => (
            <option key={idx} value={block.id}>
              {block.name}
            </option>
          ))}
        </select>
        <button onClick={handleAddBlock} style={{ padding: '6px 10px', fontSize: '13px' }}>Add Block</button>
        <button onClick={handleDeleteBlock} style={{ padding: '6px 10px', fontSize: '13px' }}>Delete Block</button>
      </div>

      {/* Block Configuration: Grid with 4 columns per row */}
      <div style={{ marginBottom: '1px', padding: '2px' }}>
        <h4 style={{ textAlign: 'left', marginBottom: '10px',fontSize: '14px' }}>Block Config</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          {configKeys.map((item, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '10px', fontWeight: 'bold' }}>{item.label}</label>
              {item.key === 'alignment' ? (
                <select
                  name={item.key}
                  value={blocks.find(b=>b.id == selectedBlockIndex)?.config[item.key] || 'left'}
                  onChange={handleBlockChange}
                  style={{ width: '70px', padding: '3px', fontSize: '12px' }}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              ) : item.key === 'fontName'?  <select
              name={item.key}
              value={blocks.find(b=>b.id == selectedBlockIndex)?.config[item.key] || 'jessy'}
              onChange={handleBlockChange}
              style={{ width: '70px', padding: '3px', fontSize: '12px' }}
            >
           <option value="jessy">jessy</option>
<option value="conrad">conrad</option>
<option value="boyd">boyd</option>
<option value="david">david</option>
<option value="adrian">adrian</option>
<option value="enrico">enrico</option>
<option value="adalbert">adalbert</option>

            </select>: 
            item.key === 'multiline'?  <select
              name={item.key}
              value={blocks.find(b=>b.id == selectedBlockIndex)?.config[item.key] }
              onChange={handleBlockChange}
              style={{ width: '70px', padding: '3px', fontSize: '12px' }}
            >
              <option value={true}>true</option>
              <option value={false}>false</option>
            </select>: 
              
              (
                <input
                  type={
                    typeof blocks.find(b=>b.id == selectedBlockIndex)?.config[item.key] === 'boolean'
                      ? 'checkbox'
                      : typeof blocks.find(b=>b.id == selectedBlockIndex)?.config[item.key] === 'number'
                        ? 'number'
                        : 'text'
                  }
                  name={item.key}
                  value={
                    typeof blocks.find(b=>b.id == selectedBlockIndex)?.config[item.key] === 'boolean'
                      ? undefined
                      : blocks.find(b=>b.id == selectedBlockIndex)?.config[item.key]
                  }
                  checked={
                    typeof blocks.find(b=>b.id == selectedBlockIndex)?.config[item.key] === 'boolean'
                      ? blocks.find(b=>b.id == selectedBlockIndex).config[item.key]
                      : undefined
                  }
                  onChange={handleBlockChange}
                  style={{ width: '70px', padding: '3px', fontSize: '12px' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Existing API Configuration Settings */}
      <h3 style={{ fontSize: '16px', marginBottom: '10px', textAlign: 'center' }}>API Config</h3>
      <select
        value={selectedConfigId || ''}
        onChange={(e) => setSelectedConfigId(e.target.value)}
        style={{ padding: '8px', fontSize: '14px', marginBottom: '15px', width: '90%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
      >
        <option value="" disabled>Select a configuration...</option>
        {configs.map((cfg) => (
          <option key={cfg.id} value={cfg.id}>
            {cfg.name}
          </option>
        ))}
      </select>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '90%', margin: '0 auto' }}>
        {Object.keys(config)
          .filter((k) => k !== 'id' && k !== 'name')
          .map((key, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
              <label style={{ fontWeight: 'bold' }}>
                {key.replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                type={typeof config[key] === 'boolean' ? 'checkbox' : typeof config[key] === 'number' ? 'number' : 'text'}
                name={key}
                value={typeof config[key] === 'boolean' ? '' : config[key]}
                checked={typeof config[key] === 'boolean' ? config[key] : undefined}
                onChange={handleChange}
                style={{ padding: '5px', fontSize: '14px' }}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

export default ConfigForm;
