import React, { useState, useRef, useEffect } from "react";
import "./PaperSizeSelector.css";

interface PaperSizeSelectorProps {
  value: string;
  onChange: (size: string) => void;
  options: string[];
}

const PaperSizeSelector: React.FC<PaperSizeSelectorProps> = ({
  value,
  onChange,
  options,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="paper-selector" ref={ref}>
      <label className="selector-label">Format size</label>
      <div className="dropdown-toggle" onClick={() => setOpen(!open)}>
        {value.replace("Landscape", "L")}
        <span className="dropdown-arrow">▾</span>
      </div>
      {open && (
        <div className="dropdown-menu">
          {options.map((opt) => (
            <div
              key={opt}
              className={`dropdown-item ${opt === value ? "selected" : ""}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              <div className="paper-icon" />
              <span>{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaperSizeSelector;
