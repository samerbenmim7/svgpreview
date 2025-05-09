import React from "react";
import "./RecipientSelector.css";

interface RecipientSelectorProps {
  value: number | null;
  onChange: (newValue: number) => void;
}

const RecipientSelector: React.FC<RecipientSelectorProps> = ({
  value,
  onChange,
}) => {
  const decrement = () => onChange(Math.max(0, value - 1));
  const increment = () => onChange(Math.min(7, value + 1));

  return (
    <div className="recipient-wrapper">
      <label className="recipient-label">Recipient</label>
      <div className="recipient-control">
        <span className="recipient-sub">No.</span>
        <div className="recipient-box">
          <button onClick={decrement} className="arrow-btn">
            &#8249;
          </button>
          <span className="recipient-value">{value ? value : ""}</span>
          <button onClick={increment} className="arrow-btn">
            &#8250;
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipientSelector;
