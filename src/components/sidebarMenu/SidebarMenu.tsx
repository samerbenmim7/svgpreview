import React from "react";
import styles from "./SidebarMenu.module.css";

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

interface SidebarMenuProps {
  selected: string;
  onSelect: (id: string) => void;
}

const menuItems: MenuItem[] = [
  {
    id: "text",
    label: "Add Text",
    icon: (
      <span className={styles.icon}>
        <i className="bi bi-fonts"></i>
      </span>
    ),
  },
  {
    id: "image",
    label: "Add Image",
    icon: (
      <span className={styles.icon}>
        <i className="bi bi-card-image"></i>
      </span>
    ),
  },
  {
    id: "elements",
    label: "Add Symbols",
    icon: (
      <span className={styles.icon}>
        <i className="bi bi-emoji-smile"></i>{" "}
      </span>
    ),
  },
  {
    id: "background",
    label: "Add Background",
    icon: (
      <span className={styles.icon}>
        <i className="bi bi-back"></i>
      </span>
    ),
  },
  {
    id: "signature",
    label: "Add Signature",
    icon: (
      <span className={styles.icon}>
        <i className="bi bi-pen"></i>
      </span>
    ),
  },
];

const SidebarMenu: React.FC<SidebarMenuProps> = ({ selected, onSelect }) => {
  return (
    <div className={styles.menu}>
      {menuItems.map(({ id, label, icon }) => (
        <div
          key={id}
          className={`${styles.item} ${selected === id ? styles.active : ""}`}
          onClick={() => onSelect(id)}
        >
          {icon}
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  );
};

export default SidebarMenu;
