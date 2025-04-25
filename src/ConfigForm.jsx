import React, { useState, useEffect, useRef } from 'react';
import {
  AiOutlineAlignLeft,
  AiOutlineAlignCenter,
  AiOutlineAlignRight
} from 'react-icons/ai';
import { FiChevronDown } from 'react-icons/fi';
const PAPER_SIZES_MM = {
  'A4':                   { width: 210, height: 297 },
  'A4 (landscape)':       { width: 297, height: 210 },

  'A5':                   { width: 148, height: 210 },
  'A5 (landscape)':       { width: 210, height: 148 },

  'A6':                   { width: 105, height: 148 },
  'A6 (landscape)':       { width: 148, height: 105 },

  /* NEW — DL card (aka DL+, slimline) */
  'DL':                   { width: 210, height: 105 },
  'DL (landscape)':       { width: 105, height: 210 }   // optional, if you need it

  // keep any other specials…
  // 'Greetings Card (A4) (landscape)': { width: 297, height: 210 }
};
/* ------------------------------------------------------------------ */
/*  1.  CSS injected once into <head>                                 */
/* ------------------------------------------------------------------ */
const css = `
.cfg-card{
  width:420px;padding:24px;border-radius:16px;background:#fff;
  box-shadow:0 4px 16px rgba(0,0,0,.06);font-family:system-ui,sans-serif;
  position:relative
}
.cfg-row{display:flex;gap:12px;margin-bottom:18px}
.cfg-select{
  all:unset;flex:1;padding:14px 18px;border-radius:6px;
  background:#4f8cff;color:#fff;font-weight:600;cursor:pointer;
  display:flex;justify-content:space-between;align-items:center
}
.cfg-select svg{transition:.2s}
.cfg-select.open svg{transform:rotate(180deg)}
/* dropdown container + menu */
.cfg-dd{position:relative}
.cfg-menu{
  position:absolute;top:calc(100% + 4px);left:0;right:0;
  background:#fff;border:1px solid #e2e8f0;border-radius:4px;
  max-height:240px;overflow-y:auto;box-shadow:0 4px 12px rgba(0,0,0,.06);
  z-index:10;padding:4px 0
}
.cfg-menu li{padding:10px 14px;cursor:pointer;font-size:15px;color:#1e293b}
.cfg-menu li:hover{background:#f1f5f9}
.cfg-menu li.selected{background:#f1f5f9;font-weight:600}
/* textarea */
.cfg-textarea{
  width:100%;height:220px;resize:none;border:2px solid #d6dbe4;
  border-radius:4px;padding:14px;font:500 16px/1.4 system-ui,sans-serif;
  margin-bottom:18px
}
/* toolbar */
.cfg-toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px}
.cfg-align button{
  all:unset;border:2px solid #2140d0;padding:8px 12px;cursor:pointer
}
.cfg-align button+button{border-left:none}
.cfg-align button.active,.cfg-align button:hover{background:#2140d0;color:#fff}
.cfg-colours{display:flex;gap:20px}
.cfg-dot{width:34px;height:34px;border-radius:50%;border:none;cursor:pointer}
/* font size buttons */
.cfg-sizes{display:flex;justify-content:center;gap:30px;margin-top:8px}
.cfg-sizes button{all:unset;font-size:18px;cursor:pointer;color:#1e293b;position:relative}
.cfg-sizes button.active::after{
  content:'';position:absolute;left:0;right:0;bottom:-6px;height:2px;background:#2140d0
}`;
if (!document.getElementById('cfg-style')) {
  const style = document.createElement('style');
  style.id = 'cfg-style';
  style.innerHTML = css;
  document.head.appendChild(style);
}

/* ------------------------------------------------------------------ */
/*  2.  Small inline Dropdown component                               */
/* ------------------------------------------------------------------ */
function Dropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function close(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="cfg-dd">
      <button
       style={{
        display:"flex",
        alignContent:"center",
        justifyContent:"center"
      }}
        className={`cfg-select ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        {value} <FiChevronDown/>
      </button>

      {open && (
        <ul className="cfg-menu">
          {options.map(opt => (
            <li
              key={opt}
              className={opt === value ? 'selected' : ''}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  3.  Main Configurator component                                   */
/* ------------------------------------------------------------------ */
export default function Configurator({
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
  setSelectedBlockIndex,
  svgData,
  setSvgData,
  placeholders,
  setPlaceholders,
  isTemplate,
  setIsTemplate,
  align,
  setAlign,
  setPaperWidth,
  setPaperHeight,
  size,
  setSize
}) {
  const [colour, setColour] = useState('#304ffe');
  const [font, setFont]     = useState('Stafford');
  const [paper, setPaper]   = useState('DL');


  
  const colours  = ['#304ffe', '#000000', '#ff1744', '#00bfa5'];
  const fonts    = ['Stafford', 'Bradley Hand', 'Alex Brush', 'Great Vibes'];
  const papers   = [
       'DL',
    'DL (landscape)','A5','A5 (landscape)',
    'A4','A4 (landscape)',
    'A6','A6 (landscape)','Greetings Card (A4) (landscape)',
 
  ];
  useEffect(() => { handleBlockChange?.(null,'alignment'); }, [align]);
  useEffect(() => { handleBlockChange?.(null,'size'); }, [size]);

  useEffect(() => {
    // look up this paper name in the table
    const size = PAPER_SIZES_MM[paper];
  
    if (size) {
      setPaperWidth(size.width);
      setPaperHeight(size.height);
    } else {
      // optional: fall back or warn if the key is unknown
      console.warn(`Unknown paper size: ${paper}`);
    }
  }, [paper]);

  const handleBlockSelectChange = (e) => {
    console.log(parseInt(e.target.value, 10))
    setSelectedBlockIndex(parseInt(e.target.value, 10));
  };
  return (
    <div className="cfg-card">
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
        {/* <button onClick={handleAddBlock} style={{ padding: '6px 10px', fontSize: '13px' }}>Add Block</button>
        <button onClick={handleDeleteBlock} style={{ padding: '6px 10px', fontSize: '13px' }}>Delete Block</button> */}
      </div>
      <br />
      {/* top selectors */}
      <div className="cfg-row" style={{
        justifyContent:"space-evenly"
      }}>
        <Dropdown value={font}   onChange={setFont}   options={fonts}/>
        <Dropdown value={paper}  onChange={setPaper}  options={papers}/>
      </div>

      {/* message box */}
      <textarea
        className="cfg-textarea"

        onChange={handleBlockChange}
        value={blocks.find(b => b.id == selectedBlockIndex)?.config.text || ''}
        name="text"
        placeholder="Click to add your message"
      />

      {/* toolbar */}
      <div className="cfg-toolbar">
        <div className="cfg-align">
          <button className={align === 'left'   ? 'active' : ''} onClick={() => setAlign('left')}  ><AiOutlineAlignLeft/></button>
          <button className={align === 'center' ? 'active' : ''} onClick={() => setAlign('center')}><AiOutlineAlignCenter/></button>
          <button className={align === 'right'  ? 'active' : ''} onClick={() => setAlign('right')} ><AiOutlineAlignRight/></button>
        </div>

        <div className="cfg-colours">
          {colours.map(c => (
            <button
              key={c}
              className="cfg-dot"
              style={{ background: c, boxShadow: c === colour ? '0 0 0 3px #304ffe55' : 'none' }}
              onClick={() => setColour(c)}
            />
          ))}
        </div>
      </div>

      {/* font‑size selector */}
      <div className="cfg-sizes">
        {['small','medium','large'].map(s => (
          <button key={s} className={size===s?'active':''} onClick={() => setSize(s)}>
            {s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
      </div>
      
    </div>

  );
}

const sizeMap = { small:'14px', medium:'18px', large:'24px' };
