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
import { PAPER_SIZES_MM } from "./utils/const";
import SignatureConfigurator from "./components/MenuViews/signatureConfigurator/signatureConfigurator";

// --- Types ---
interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

interface ConfiguratorProps {
  handleBlockChange: (updatedBlock: Block, index: number) => void;
  blocks: Block[];
  selectedBlockIndex: number;
  setSelectedBlockIndex: (index: number) => void;
  setPaperWidth: (width: number) => void;
  setPaperHeight: (height: number) => void;
  handleAddBlock: (character: string, fontName: string) => void;
  setBackgroundImage: (url: string) => void;
  configViewId: string;
  setConfigViewId: (id: string | number) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  cardFormat: string; // or a specific union like 'A4' | 'Letter' | ...
  setSelectedConfigId: (id: string | number) => void;
  selectedConfigId: string | number;
  setSync: (sync: boolean) => void;
  paperWidth: number;
  backgroundImageOpacity: number;
  setBackgroundImageOpacity: (opacity: number) => void;
  setPlaceholders: (placeholders: string[]) => void;
  placeholders: string[];
  setTextColor: (color: number) => void;
  textColor: number;
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
  // align,
  // setAlign,
  setPaperWidth,
  setPaperHeight,
  // size,
  // setSize,
  handleAddBlock,
  setBackgroundImage,
  onMouseEnter,
  onMouseLeave,
  cardFormat,
  setSelectedConfigId,
  selectedConfigId,
  setSync,
  paperWidth,
  backgroundImageOpacity,
  setBackgroundImageOpacity,
  setPlaceholders,
  placeholders,
  configViewId,
  setConfigViewId,
  textColor,
  setTextColor,
}) => {
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    const paperSize = PAPER_SIZES_MM[cardFormat];
    if (paperSize) {
      setPaperWidth(paperSize.width);
      setPaperHeight(paperSize.height);
    } else {
      console.warn(`Unknown cardFormat size: ${cardFormat}`);
    }
  }, [cardFormat]);

  const handleBlockSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBlockIndex(parseInt(e.target.value, 10));
  };

  return (
    <div
      style={{
        display: "flex",
        marginTop: "20px",
        zIndex: 0,
        position: "fixed",
        transform: "translateY(30%)",
      }}
    >
      <SidebarMenu selected={configViewId} onSelect={setConfigViewId} />
      <CardWrapper>
        {configViewId === "text" ? (
          <TextSettingsCard
            handleBlockChange={handleBlockChange}
            setPaperHeight={setPaperHeight}
            setPaperWidth={setPaperWidth}
            // align={align}
            // setAlign={setAlign}
            blocks={blocks}
            selectedBlockIndex={selectedBlockIndex}
            setSelectedBlockIndex={setSelectedBlockIndex}
            // size={size}
            // setSize={setSize}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            setSelectedConfigId={setSelectedConfigId}
            selectedConfigId={selectedConfigId}
            font={
              blocks.find((b) => b.id == selectedBlockIndex)?.config.fontName
            }
            paperWidth={paperWidth}
            setSync={setSync}
            setPlaceholders={setPlaceholders}
            placeholders={placeholders}
            setTextColor={setTextColor}
            textColor={textColor}
          />
        ) : configViewId === "elements" ? (
          <SymbolsConfigurator
            setBackgroundImage={setBackgroundImage}
            handleAddBlock={handleAddBlock}
          />
        ) : configViewId === "background" ? (
          <BackgroundView
            setBackgroundImage={setBackgroundImage}
            backgroundImageOpacity={backgroundImageOpacity}
            setBackgroundImageOpacity={setBackgroundImageOpacity}
          />
        ) : configViewId === "signature" ? (
          <SignatureConfigurator handleAddBlock={handleAddBlock} />
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
