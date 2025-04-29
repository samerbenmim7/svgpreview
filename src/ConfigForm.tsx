import React, { useState, useEffect, useRef } from 'react';
import {
  AiOutlineAlignLeft,
  AiOutlineAlignCenter,
  AiOutlineAlignRight
} from 'react-icons/ai';
import { FiChevronDown } from 'react-icons/fi';

// Types
interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

interface ConfiguratorProps {
  handleBlockChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | null, text?: string) => void;
  blocks: Block[];
  selectedBlockIndex: number;
  setSelectedBlockIndex: (index: number) => void;
  align: string;
  setAlign: (align: string) => void;
  setPaperWidth: (width: number) => void;
  setPaperHeight: (height: number) => void;
  size: string;
  setSize: (size: string) => void;
}

interface BlockConfig {
  text: string;
  widthInMillimeters: number;
  fontSize: number;
  fontName: string;
  leftOffsetInMillimeters: number;
  topOffsetInMillimeters: number;
  multiline: boolean;
  lineHeight: number;
  rotation: number;
  r: number;
  g: number;
  b: number;
  alignment: string;
}

interface Block {
  id: number | string;
  name?: string;
  changed?: boolean;
  config: BlockConfig;
}

interface Placeholder {
  name: string;
  value: string;
}

// Paper Sizes
const PAPER_SIZES_MM: Record<string, { width: number; height: number }> = {
  'A4': { width: 210, height: 297 },
  'A4 (landscape)': { width: 297, height: 210 },
  'A5': { width: 148, height: 210 },
  'A5 (landscape)': { width: 210, height: 148 },
  'A6': { width: 105, height: 148 },
  'A6 (landscape)': { width: 148, height: 105 },
  'DL': { width: 210, height: 105 },
  'DL (landscape)': { width: 105, height: 210 },
};

// Small CSS injection (only once)
const css = `
/* your long css string here exactly as you wrote it */
`;

if (!document.getElementById('cfg-style')) {
  const style = document.createElement('style');
  style.id = 'cfg-style';
  style.innerHTML = css;
  document.head.appendChild(style);
}

// Dropdown component
function Dropdown({ value, onChange, options }: DropdownProps) {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="cfg-dd">
      <button
        className={`cfg-select ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {value} <FiChevronDown />
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

// Main Configurator Component
export default function Configurator({
  handleBlockChange,
  blocks,
  selectedBlockIndex,
  setSelectedBlockIndex,
  align,
  setAlign,
  setPaperWidth,
  setPaperHeight,
  size,
  setSize,
}: ConfiguratorProps) {
  const [colour, setColour] = useState<string>('#304ffe');
  const [font, setFont] = useState<string>('Stafford');
  const [paper, setPaper] = useState<string>('DL');

  const colours = ['#304ffe', '#000000', '#ff1744', '#00bfa5'];
  const fonts = ['Stafford', 'Bradley Hand', 'Alex Brush', 'Great Vibes'];
  const papers = ['DL', 'DL (landscape)', 'A5', 'A5 (landscape)', 'A4', 'A4 (landscape)', 'A6', 'A6 (landscape)', 'Greetings Card (A4) (landscape)'];

  useEffect(() => { handleBlockChange?.(null, 'alignment'); }, [align]);
  useEffect(() => { handleBlockChange?.(null, 'size'); }, [size]);

  useEffect(() => {
    const size = PAPER_SIZES_MM[paper];
    if (size) {
      setPaperWidth(size.width);
      setPaperHeight(size.height);
    } else {
      console.warn(`Unknown paper size: ${paper}`);
    }
  }, [paper, setPaperWidth, setPaperHeight]);

  const handleBlockSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBlockIndex(parseInt(e.target.value, 10));
  };
 // console.log(blocks.find(b => b.id == selectedBlockIndex),selectedBlockIndex)
  return (
    <div className="cfg-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '1px' }}>
        <select
          value={selectedBlockIndex}
          onChange={handleBlockSelectChange}
          style={{ padding: '6px', fontSize: '13px', minWidth: '140px' }}
        >
          {blocks.map((block) => (
            <option key={block.id} value={block.id}>
              {block.name}
            </option>
          ))}
        </select>
      </div>

      <br />

      <div className="cfg-row" style={{ justifyContent: "space-evenly" }}>
        <Dropdown value={font} onChange={setFont} options={fonts} />
        <Dropdown value={paper} onChange={setPaper} options={papers} />
      </div>

      <textarea
        className="cfg-textarea"
        onChange={handleBlockChange}
        value={blocks.find(b => b.id == selectedBlockIndex)?.config.text || ''}
        name="text"
        placeholder="Click to add your message"
      />

      <div className="cfg-toolbar">
        <div className="cfg-align">
          <button className={align === 'left' ? 'active' : ''} onClick={() => setAlign('left')}><AiOutlineAlignLeft /></button>
          <button className={align === 'center' ? 'active' : ''} onClick={() => setAlign('center')}><AiOutlineAlignCenter /></button>
          <button className={align === 'right' ? 'active' : ''} onClick={() => setAlign('right')}><AiOutlineAlignRight /></button>
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

      <div className="cfg-sizes">
        {['small', 'medium', 'large'].map(s => (
          <button key={s} className={size === s ? 'active' : ''} onClick={() => setSize(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

const sizeMap = { small: '14px', medium: '18px', large: '24px' };
