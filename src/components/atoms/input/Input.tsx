import React from "react";
import styles from "./RecipientSelector.module.css"; // Assuming you're using CSS Modules
import useRecipientCount from "../../../hooks/useRecipientCount";

interface RecipientSelectorProps {
  value: number;
  onChange: (newValue: number) => void;
  count: number;
}

const RecipientSelector: React.FC<RecipientSelectorProps> = ({
  value,
  onChange,
  count,
}) => {
  const decrement = () => {
    if (!count || count == 0) return;
    onChange(Math.max(0, value - 1));
  };
  const increment = () => {
    if (!count || count == 0) return;
    onChange(Math.min(count, value + 1));
  };

  return (
    <div className={styles.recipientWrapper}>
      <label className={styles.recipientLabel}>Recipients ({count})</label>
      <div className={styles.recipientControl}>
        <span className={styles.recipientSub}>No.</span>
        <div className={styles.recipientBox}>
          <button
            onClick={decrement}
            className={styles.arrowBtn}
            disabled={!count || count == 0}
          >
            &#8249;
          </button>
          <span className={styles.recipientValue}>
            {value == 0 ? "" : value}
          </span>
          <button
            onClick={increment}
            className={styles.arrowBtn}
            disabled={!count || count == 0}
          >
            &#8250;
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipientSelector;
