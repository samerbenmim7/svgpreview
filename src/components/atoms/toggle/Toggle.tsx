import React from "react";
import styles from "./toggle.module.css";

interface ToggleProps {
  isOn: boolean;
  handleToggle: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ isOn, handleToggle }) => {
  return (
    <div
      className={styles.toggleContainer}
      onClick={handleToggle}
      style={{
        background: isOn ? "#cfd100" : "black",
      }}
    >
      <div className={`${styles.toggleSwitch} ${isOn ? styles.on : ""}`} />
    </div>
  );
};

export default Toggle;
