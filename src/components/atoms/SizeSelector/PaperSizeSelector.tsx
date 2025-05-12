import React, { useState, useRef, useEffect } from "react";
import styles from "./PaperSizeSelector.module.css";

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
    <div
      className={styles.paperSelector}
      ref={ref}
      style={{ position: "fixed" }}
    >
      <label className={styles.selectorLabel}>Format size</label>
      <div className={styles.dropdownToggle} onClick={() => setOpen(!open)}>
        {value.replace("Landscape", "L")}
        <span className={styles.dropdownArrow}>▾</span>
      </div>
      {open && (
        <div className={styles.dropdownMenu}>
          {options.map((opt) => (
            <div
              key={opt}
              className={`${styles.dropdownItem} ${
                opt === value ? styles.selected : ""
              }`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              <div className={styles.paperIcon} />
              <span>{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaperSizeSelector;
