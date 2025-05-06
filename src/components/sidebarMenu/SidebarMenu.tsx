import React from "react";
import styles from "./SidebarMenu.module.css";

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

const menuItems: MenuItem[] = [
  {
    id: "text",
    label: "Text hinzufügen",
    icon: <span className={styles.icon}>▢</span>,
  },
  {
    id: "image",
    label: "Bild hinzufügen",
    icon: <span className={styles.icon}>▢</span>,
  },
  {
    id: "elements",
    label: "Elemente einfügen",
    icon: <span className={styles.icon}>▢</span>,
  },
  {
    id: "background",
    label: "Hintergrund",
    icon: <span className={styles.icon}>▢</span>,
  },
  {
    id: "address",
    label: "Adresse",
    icon: <span className={styles.icon}>▢</span>,
  },
];

export default function SidebarMenu({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: any;
}) {
  return (
    <div className={styles.menu}>
      {menuItems.map(({ id, label, icon }) => (
        <div
          key={id}
          className={`${styles.item} ${selected == id ? styles.active : ""}`}
          onClick={() => onSelect(id)}
        >
          {icon}
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  );
}
