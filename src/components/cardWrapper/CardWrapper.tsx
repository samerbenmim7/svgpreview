import React, { useState } from "react";
import styles from "./cardWrapper.module.css";
import { Block } from "../../types/types";

export default function CardWrapper({ children }) {
  return <div className={styles.card}>{children}</div>;
}
