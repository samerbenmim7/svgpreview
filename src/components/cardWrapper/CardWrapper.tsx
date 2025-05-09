import React, { ReactNode, memo } from "react";
import styles from "./cardWrapper.module.css";

interface CardWrapperProps {
  children: ReactNode;
}

/**
 * A simple wrapper component for card content.
 * It memoizes rendering to avoid unnecessary re-renders when children don't change.
 */
const CardWrapper: React.FC<CardWrapperProps> = ({ children }) => {
  return <div className={styles.card}>{children}</div>;
};

export default memo(CardWrapper);
