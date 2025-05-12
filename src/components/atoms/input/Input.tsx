import React from "react";
import styles from "./RecipientSelector.module.css"; // Assuming you're using CSS Modules

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
    <div className={styles.recipientWrapper}>
      <label className={styles.recipientLabel}>Recipient</label>
      <div className={styles.recipientControl}>
        <span className={styles.recipientSub}>No.</span>
        <div className={styles.recipientBox}>
          <button onClick={decrement} className={styles.arrowBtn}>
            &#8249;
          </button>
          <span className={styles.recipientValue}>
            {value == 0 ? "" : value}
          </span>
          <button onClick={increment} className={styles.arrowBtn}>
            &#8250;
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipientSelector;
