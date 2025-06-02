// SignaturePad.tsx
import React, { useEffect, useRef } from "react";
import styles from "./signatureConfigurator.module.css";
import Button from "../../atoms/button/Button";
import { SIGNATURE_STROKE_COLOR } from "../../../utils/const";

type Point = { x: number; y: number };

// Minimum length in pixels for a stroke to be considered “valid”
const MIN_PATH_LENGTH = 170;

interface SignaturePadProps {
  handleAddBlock: (
    type: string,
    name: string,
    size: number,
    payload: string,
    shouldSave: boolean
  ) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ handleAddBlock }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const clearBtnRef = useRef<HTMLDivElement | null>(null);
  const submitBtnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !clearBtnRef.current || !submitBtnRef.current)
      return;

    const canvas = canvasRef.current;
    const clearBtn = clearBtnRef.current;
    const submitBtn = submitBtnRef.current;

    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 1.5; // cosmetic
    ctx.strokeStyle = SIGNATURE_STROKE_COLOR;

    let drawing = false;
    let current: Point[] = [];
    let layers: Point[][] = [];

    /* ---------- helpers ---------- */
    const invert = (pt: Point): Point => ({ x: pt.x, y: canvas.height - pt.y });

    const pathString = (layer: Point[]) =>
      layer.map((pt) => `${pt.x},${pt.y}`).join(",");

    const pathLength = (pts: Point[]) =>
      pts.slice(1).reduce((len, p, i) => {
        const dx = p.x - pts[i].x;
        const dy = p.y - pts[i].y;
        return len + Math.hypot(dx, dy);
      }, 0);

    const hasValidStroke = () =>
      layers.some((l) => pathLength(l) >= MIN_PATH_LENGTH);

    const redrawLayers = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      layers.forEach((layer) => {
        layer.forEach((p, idx) => {
          const screen = invert(p);
          if (idx === 0) ctx.moveTo(screen.x, screen.y);
          else ctx.lineTo(screen.x, screen.y);
        });
      });
      ctx.stroke();
      ctx.closePath();
    };

    const setSubmitDisabled = () => {
      const btn = submitBtn.querySelector("button") as HTMLButtonElement | null;
      if (btn) btn.disabled = !hasValidStroke();
    };

    /* ---------- drawing ---------- */
    const start = (e: MouseEvent) => {
      drawing = true;
      current = [];
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
      current.push(invert({ x: e.offsetX, y: e.offsetY }));
    };

    const draw = (e: MouseEvent) => {
      if (!drawing) return;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      current.push(invert({ x: e.offsetX, y: e.offsetY }));
    };

    const stop = () => {
      if (!drawing) return;
      drawing = false;
      ctx.closePath();

      if (current.length) {
        const len = pathLength(current);
        const alreadyValid = hasValidStroke(); // pre‑existing valid stroke?
        if (len >= MIN_PATH_LENGTH || alreadyValid) {
          layers.push([...current]);
        } else {
          // discard tiny stroke and erase its drawing
          redrawLayers();
        }
      }
      setSubmitDisabled();
    };

    /* ---------- buttons ---------- */
    const clearAll = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      layers = [];
      current = [];
      setSubmitDisabled();
    };

    const submitAll = () => {
      if (!hasValidStroke()) return; // safety guard
      const payload = layers.map(pathString).join("$");
      handleAddBlock?.("S", "custom-signature", 14, payload, true);
      clearAll();
    };

    /* ---------- listeners ---------- */
    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", stop);
    clearBtn.addEventListener("click", clearAll);
    submitBtn.addEventListener("click", submitAll);

    // initial state
    setSubmitDisabled();

    /* ---------- cleanup ---------- */
    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", draw);
      window.removeEventListener("mouseup", stop);
      clearBtn.removeEventListener("click", clearAll);
      submitBtn.removeEventListener("click", submitAll);
    };
  }, [handleAddBlock]);

  /* ---------- UI ---------- */
  return (
    <div className={styles.container}>
      <div>
        <div style={{ margin: "10px 0" }}>Sign Here</div>

        {/* buttons */}
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            gap: "1rem",
            justifyContent: "end",
          }}
        >
          {/* clear */}
          <div ref={clearBtnRef}>
            <Button
              label="Clear All"
              icon={<i className={`bi bi-eraser-fill ${styles.iconWhite}`} />}
              width="100px"
              height="25px"
              padding="5px"
              backgroundColor="transparent"
              hoverColor="transparent"
              color="black"
              fontSize="12px"
              fontWeight="300"
              borderRadius="5px"
              border="solid 1px black"
            />
          </div>

          {/* submit */}
          <div ref={submitBtnRef}>
            <Button
              label="Submit"
              icon={<i className={`bi bi-upload ${styles.iconWhite}`} />}
              width="100px"
              height="25px"
              padding="5px"
              backgroundColor="black"
              hoverColor="gray"
              color="white"
              fontSize="12px"
              fontWeight="300"
              borderRadius="5px"
              border="none"
            />
          </div>
        </div>

        {/* drawing area */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 250,
              height: 170,
              border: "1px solid white",
              position: "relative",
              background: "white",
            }}
          >
            <canvas
              ref={canvasRef}
              width={250}
              height={170}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                cursor: "crosshair",
              }}
            />
          </div>
        </div>
      </div>

      {/* sign-on-mobile & previous signatures */}
      <br />
      <br />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ margin: "10px 0" }}>Sign On Mobile</div>
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/sign"
          width={50}
          height={50}
          alt="QR code to sign with mobile"
        />
      </div>

      <div style={{ display: "flex", width: "100%", marginTop: "1rem" }}>
        <div style={{ width: "100%" }}>
          <div>Previous Signatures</div>
          {/* add your own listing logic here */}
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
