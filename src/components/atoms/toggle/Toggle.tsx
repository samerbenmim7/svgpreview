import React from "react";
import styles from "./toggle.module.css";

const Toggle = ({ isOn, handleToggle }) => {
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
