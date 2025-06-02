import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./ImageSwiper.css";
import { Symbol } from "../../atoms/symbol/Symbol";
interface ImageSwiperProps {
  images?: string[];
  setBackgroundImage?: (imgUrl: string) => void;
  forsprites?: boolean;
  symbolCount?: number;
  handleAddBlock?: (character: string, fontName: string) => void;
  symbolIds?: number[];
}

const ImageSwiper: React.FC<ImageSwiperProps> = ({
  images = [],
  setBackgroundImage,
  forsprites = false,
  symbolCount = 0,
  handleAddBlock,
  symbolIds = [],
}) => {
  const prevRef = useRef<HTMLDivElement | null>(null);
  const nextRef = useRef<HTMLDivElement | null>(null);

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
          slidesPerGroup={4}
          spaceBetween={0}
          loop
          onBeforeInit={(swiper) => {
            const navigation = swiper.params.navigation;

            if (
              navigation &&
              typeof navigation !== "boolean" &&
              prevRef.current &&
              nextRef.current
            ) {
              navigation.prevEl = prevRef.current;
              navigation.nextEl = nextRef.current;

              swiper.navigation.init();
              swiper.navigation.update();
            }
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
                    onClick={() => setBackgroundImage?.(img)}
                    src={img}
                    alt={`slide-${index}`}
                    className="slide-image"
                    style={{ width: "42px", height: "42px" }}
                  />
                </SwiperSlide>
              ))
            : symbolIds.sort().map((id) => {
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
