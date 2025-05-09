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
    label: "Text hinzufügen",
    icon: (
      <span className={styles.icon}>
        <i className="bi bi-fonts"></i>
      </span>
    ),
  },
  {
    id: "image",
    label: "Bild hinzufügen",
    icon: (
      <span className={styles.icon}>
        <i className="bi bi-card-image"></i>
      </span>
    ),
  },
  {
    id: "elements",
    label: "Elemente einfügen",
    icon: (
      <span className={styles.icon}>
        <i className="bi bi-emoji-smile"></i>{" "}
      </span>
    ),
  },
  {
    id: "background",
    label: "Hintergrund",
    icon: (
      <span className={styles.icon}>
        <i className="bi bi-back"></i>
      </span>
    ),
  },
  {
    id: "address",
    label: "Adresse",
    icon: (
      <span className={styles.icon}>
        <i className="bi bi-file-person"></i>
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
