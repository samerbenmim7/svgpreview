import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./ImageSwiper.css"; // custom styles

const ImageSwiper = ({
  images = [],
  setBackgroundImage = null,
  forsprites = false,
  symbolCount = 0,
  handleAddBlock,
  symbolIds,
}) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <div
      className="swiper-container"
      style={{ width: "100%", display: "flex", justifyContent: "center" }}
    >
      <div ref={prevRef} className="swiper-button custom-prev">
        ‹
      </div>
      <div ref={nextRef} className="swiper-button custom-next">
        ›
      </div>
      <div style={{ width: "80%", display: "flex", justifyContent: "center" }}>
        <Swiper
          modules={[Navigation]}
          slidesPerView={4}
          spaceBetween={0}
          loop={true}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
        >
          {!forsprites
            ? images.map((img, index) => (
                <SwiperSlide style={{ cursor: "pointer" }} key={index}>
                  <img
                    onClick={() => {
                      if (setBackgroundImage) setBackgroundImage(img);
                    }}
                    src={img}
                    alt={`slide-${index}`}
                    className="slide-image"
                    style={{
                      width: "42px",
                      height: "42px",
                    }}
                  />
                </SwiperSlide>
              ))
            : symbolIds?.map((id) => {
                const symbolElement = document.getElementById(`sym-${id}`);

                const vb = symbolElement
                  ?.getAttribute("viewBox")
                  ?.split(" ")
                  .map(Number) || [0, 0, 100, 100];

                const character =
                  symbolElement?.getAttribute("data-caracter") || "";
                const fontName =
                  symbolElement?.getAttribute("data-category") || "";

                return (
                  <SwiperSlide key={id} style={{ cursor: "pointer" }}>
                    <Symbol
                      key={id}
                      id={id}
                      size={70}
                      handleAddBlock={handleAddBlock}
                      vb={vb}
                      character={character}
                      fontName={fontName}
                    />
                  </SwiperSlide>
                );
              })}
        </Swiper>
      </div>
    </div>
  );
};

export default ImageSwiper;

function Symbol({
  id,
  size = 48,
  className = "",
  handleAddBlock,
  vb,
  character,
  fontName,
}) {
  const [minX, minY, vbW, vbH] = vb;

  return (
    <svg
      className={className}
      style={{ cursor: "pointer !important" }}
      onClick={() => {
        if (handleAddBlock) handleAddBlock(character, fontName);
      }}
      width={size}
      height={size}
      viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <use href={`#sym-${id}`} />
    </svg>
  );
}
