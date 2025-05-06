import React, { useMemo, useState } from "react";
import styles from "./symbolsConfigurator.module.css";
import ImageSwiper from "../../helpers/swiper/Swiper";
import { useSpriteLoader } from "../../../hooks/useSpriteLoader";

const backgroundImages = [
  "https://img.freepik.com/premium-vector/elegant-hand-drawn-leaf-background_336924-2203.jpg?semt=ais_hybrid&w=740",
  "https://images.vexels.com/content/69405/preview/blue-sparkle-and-bokeh-lights-background-design-7bd19e.png",
  "https://cdn.pixabay.com/photo/2017/01/29/21/25/background-2019432_1280.png",
  "https://t3.ftcdn.net/jpg/13/79/99/02/360_F_1379990249_X29vpOVx40ErmnvtapwoMxk4emqA4a0R.jpg",
  "https://img.freepik.com/free-photo/maple-leaf-border-background-orange-watercolor-autumn-season_53876-128735.jpg?semt=ais_hybrid&w=740",
  "https://t4.ftcdn.net/jpg/11/95/78/63/240_F_1195786301_n9qnXgfZFK9gtqC3Go550Wy7HHWWKee6.jpg",
  "https://img.freepik.com/premium-vector/elegant-hand-drawn-leaf-background_336924-2203.jpg?semt=ais_hybrid&w=740",
  "https://img.freepik.com/free-vector/minimalist-background-with-leaves_23-2148909131.jpg",
  "https://img.freepik.com/free-photo/maple-leaf-border-background-orange-watercolor-autumn-season_53876-128735.jpg?semt=ais_hybrid&w=740",
  "https://img.freepik.com/free-vector/rectangle-gold-frame-with-foliage-pattern-background-vector_53876-109053.jpg",
];

export default function SymbolsConfigurator({
  setBackgroundImage,
  handleAddBlock,
}) {
  const [opacity, setOpacity] = useState(100);
  const [value, setValue] = useState(0);
  const [tagsFilter, setTagsFilter] = useState("");

  const symbolCount = useSpriteLoader();

  const changeValue = (delta) => {
    setValue((prev) => {
      let newVal = Math.max(0, Math.min(100, prev + delta)); // keep between 0–100
      return newVal;
    });
  };

  const symbolIds = useMemo(() => {
    return Array.from({ length: symbolCount }, (_, index) => {
      const symbolElement = document.getElementById(`sym-${index + 1}`);
      const tags = symbolElement?.getAttribute("tags") || "";
      if (!tagsFilter || tags.includes(tagsFilter)) {
        return index + 1;
      }
      return null;
    }).filter((id) => id !== null);
  }, [symbolCount, tagsFilter]);

  return (
    <div className={styles.container}>
      {/* <button className={styles.bgButton}>Upload Background</button>
      <hr className={styles.hr} /> */}
      <div>
        <div style={{ margin: "10px 0" }}>Browse</div>
        <div
          style={{
            width: "100%",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <input
            type="text"
            className={styles.input}
            placeholder="Type to search..."
            value={tagsFilter}
            onChange={(e) => setTagsFilter(e.target.value)}
          />
          <br />
          <ImageSwiper
            forsprites
            symbolCount={symbolCount}
            handleAddBlock={handleAddBlock}
            symbolIds={symbolIds}
          />
        </div>
      </div>

      <br />
      <br />

      <div style={{ display: "flex", width: "100%" }}>
        <div style={{ width: "60%" }}>
          <div style={{ width: "100%" }}>Background color</div>
          <div
            style={{ width: "100%", marginTop: "10px", cursor: "pointer" }}
            onClick={() => setBackgroundImage("")}
          >
            No BG
          </div>
        </div>
        <div style={{ width: "40%" }}>
          <div style={{ width: "100%" }}>Blur</div>
          <div
            className={styles.wrapper}
            style={{ width: "100%", marginTop: "10px" }}
          >
            <div>
              <input
                type="number"
                className={styles.inputBox}
                value={value}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setValue(isNaN(val) ? 0 : Math.max(0, Math.min(100, val)));
                }}
              />
              <span className={styles.percentSymbol}>%</span>
            </div>
            <div className={styles.customArrows}>
              <div
                onClick={() => changeValue(1)}
                style={{ transform: "rotateZ(90deg)" }}
              >
                ‹
              </div>
              <div
                style={{ transform: "rotateZ(90deg)" }}
                onClick={() => changeValue(-1)}
              >
                ›
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <button
        onClick={() => setBackgroundImage("")} ;
        style={{ display: "flex", alignSelf: "center", margin: "auto" }}
      >
        no background
      </button> */}
      {/* Deckkraft */}

      <div className={styles.label}>Opacity</div>
      <div className={styles.sliderRow}>
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          style={{ flex: 1 }}
          className={styles.rangeTrack}
        />
        <div className={styles.percentBox}>{opacity}%</div>
      </div>
    </div>
  );
}
