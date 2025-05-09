import React, { useState, useEffect, useRef } from "react";
import {
  AiOutlineAlignLeft,
  AiOutlineAlignCenter,
  AiOutlineAlignRight,
} from "react-icons/ai";
import { FiChevronDown } from "react-icons/fi";
import TextSettingsCard from "./components/MenuViews/blocksConfigurator/BlocksConfigurator";
import SidebarMenu from "./components/sidebarMenu/SidebarMenu";
import CardWrapper from "./components/cardWrapper/CardWrapper";
import BackgroundView from "./components/MenuViews/BackgroundConfigurator/BackgroundConfigurator";
import Toggle from "./components/atoms/toggle/Toggle";
import SymbolsConfigurator from "./components/MenuViews/symbolsConfigurator/SymbolsConfigurator";
import { Block } from "./types/types";
import { PAPER_SIZES_MM } from "./Utils/const";

// --- Types ---
interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
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

interface ConfiguratorProps {
  handleBlockChange: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | null,
    key?: string,
    value?: number | string
  ) => void;
  blocks: Block[];
  selectedBlockIndex: number;
  setSelectedBlockIndex: (index: number) => void;
  align: string;
  setAlign: (align: string) => void;
  setPaperWidth: (width: number) => void;
  setPaperHeight: (height: number) => void;
  size: string;
  setSize: (size: string) => void;
  handleAddBlock: (character: string, fontName: string) => void;
  setBackgroundImage: (url: string) => void;
  onMouseEnter;
  onMouseLeave;
  paper;
}

// --- Constants ---

const css = `
/* Add your required CSS here */
`;

if (!document.getElementById("cfg-style")) {
  const style = document.createElement("style");
  style.id = "cfg-style";
  style.innerHTML = css;
  document.head.appendChild(style);
}

// --- Dropdown Component ---
const Dropdown: React.FC<DropdownProps> = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="cfg-dd">
      <button
        className={`cfg-select ${open ? "open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        {value} <FiChevronDown />
      </button>
      {open && (
        <ul className="cfg-menu">
          {options.map((opt) => (
            <li
              key={opt}
              className={opt === value ? "selected" : ""}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// --- Main Configurator ---
const Configurator: React.FC<ConfiguratorProps> = ({
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
  handleAddBlock,
  setBackgroundImage,
  onMouseEnter,
  onMouseLeave,
  paper,
}) => {
  const [colour, setColour] = useState("#304ffe");
  const [font, setFont] = useState("Stafford");
  const [configViewId, setConfigViewId] = useState("text");
  const [toggle, setToggle] = useState(false);

  const colours = ["#304ffe", "#000000", "#ff1744", "#00bfa5"];
  const fonts = ["Stafford", "Bradley Hand", "Alex Brush", "Great Vibes"];
  const papers = Object.keys(PAPER_SIZES_MM);

  useEffect(() => {
    handleBlockChange(null, "alignment", align);
  }, [align]);

  useEffect(() => {
    handleBlockChange(null, "size", size);
  }, [size]);

  useEffect(() => {
    const paperSize = PAPER_SIZES_MM[paper];
    if (paperSize) {
      setPaperWidth(paperSize.width);
      setPaperHeight(paperSize.height);
    } else {
      console.warn(`Unknown paper size: ${paper}`);
    }
  }, [paper]);

  const handleBlockSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBlockIndex(parseInt(e.target.value, 10));
  };

  return (
    <div style={{ display: "flex", marginTop: "20px", zIndex: 0 }}>
      <SidebarMenu selected={configViewId} onSelect={setConfigViewId} />
      <CardWrapper>
        {configViewId === "text" ? (
          <TextSettingsCard
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
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
        ) : configViewId === "elements" ? (
          <SymbolsConfigurator
            setBackgroundImage={setBackgroundImage}
            handleAddBlock={handleAddBlock}
          />
        ) : configViewId === "background" ? (
          <BackgroundView setBackgroundImage={setBackgroundImage} />
        ) : (
          <>
            <h2>{configViewId}</h2>
            <Toggle isOn={toggle} handleToggle={() => setToggle(!toggle)} />
          </>
        )}
      </CardWrapper>
    </div>
  );
};

export default Configurator;
