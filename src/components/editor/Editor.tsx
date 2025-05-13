import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  HTMLAttributes,
} from "react";
import ConfigForm from "../../ConfigForm";
import {
  addWhiteBackgroundAndBordersToSVG,
  buildBodyData,
  deleteGroupFromSvgString,
  getRandom,
  createStateSetter,
} from "../../utils/utils";
import { post, get } from "../../services/api";
import { defaultBlocks, mockBlock } from "../../defaults";
import SvgCard from "../svgCard/SvgCard";
import {
  Position,
  Placeholder,
  BlockConfig,
  Block,
  Snapshot,
} from "../../types/types";
import { useDebounce } from "../../hooks/useDebounce";
import { useCenterScroll } from "../../hooks/useCenterScroll";
import { useSvgGroups } from "../../hooks/useSvgGroup";
import { DEFAULT_FONT, PAPER_SIZES_MM, PX_PER_MM } from "../../Utils/const";
import { useKeyboard } from "../../hooks/useKeyboard";
import Button from "../atoms/button/Button";
import "bootstrap-icons/font/bootstrap-icons.css";
import RecipientSelector from "../atoms/input/Input";
import PaperSizeSelector from "../atoms/SizeSelector/PaperSizeSelector";
import styles from "./editor.module.css";
import { usePrevious } from "../../hooks/usePrevious.ts";

export default function Editor({
  editorState,
  setEditorState,
  setIsFlipped,
  isFlipped,
  zoom,
  setZoom,
  cardFormat,
  setCardFormat,
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const blockNextId = useRef(defaultBlocks.length + 1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const setPositions = createStateSetter("positions", setEditorState);
  const setSvgData = createStateSetter("svgData", setEditorState);
  const setBackgroundImage = createStateSetter(
    "backgroundImage",
    setEditorState
  );
  const setParametersUrl = createStateSetter("parametersUrl", setEditorState);
  const setBlocks = createStateSetter("blocks", setEditorState);
  const setSelectedBlockIndex = createStateSetter(
    "selectedBlockIndex",
    setEditorState
  );
  const setSelectedConfigId = createStateSetter(
    "selectedConfigId",
    setEditorState
  );
  const setAlign = createStateSetter("align", setEditorState);
  const setSize = createStateSetter("size", setEditorState);
  const setBlockShouldDisplayOutline = createStateSetter(
    "blockShouldDisplayOutline",
    setEditorState
  );
  const setSvgGroups = createStateSetter("svgGroups", setEditorState);
  const setLastUpdatedBlockId = createStateSetter(
    "lastUpdatedBlockId",
    setEditorState
  );
  const setGroupIdentifierUrlMap = createStateSetter(
    "GroupIdentifierUrlMap",
    setEditorState
  );
  const setHistory = createStateSetter("history", setEditorState);
  const setFuture = createStateSetter("future", setEditorState);

  const {
    positions,
    svgData,
    backgroundImage,
    parametersUrl,
    blocks,
    selectedBlockIndex,
    selectedConfigId,
    align,
    size,
    blockShouldDisplayOutline,
    svgGroups,
    lastUpdatedBlockId,
    GroupIdentifierUrlMap,
    history,
    future,
  } = editorState;

  const [paperWidth, setPaperWidth] = useState<number>(50);
  const [paperHeight, setPaperHeight] = useState<number>(105);
  const [recipientId, setRecipientId] = useState<number>(0);
  const [isTemplate, setIsTemplate] = useState<boolean>(true);
  const [needsSync, setSync] = useState(true);
  const [shuffle, setShuffle] = useState(false);

  const [firstFetch, setFirstFetch] = useState(true);

  const [placeholders, setPlaceholders] = useState<Placeholder[]>([
    { name: "COMPANY", value: "WunderPen" },
    { name: "SENDER", value: "Samer Ben Mim," },
  ]);

  const [myValue, setMyValue] = useState(window.view);
  const prevRecipientId = usePrevious<number | undefined>(recipientId);
  const recipientIdChanged =
    prevRecipientId !== recipientId && recipientId !== undefined;

  useCenterScroll(containerRef, svgData);

  useDebounce(
    () => {
      if (needsSync) {
        if (shuffle) {
          handleGenerate(true);
          setShuffle(false);
        } else if (recipientIdChanged) handleGenerate(true);
        else handleGenerate(false);
        setSync(false);
      }
    },
    150,
    [needsSync, recipientId, placeholders, paperHeight, paperWidth]
  );

  useSvgGroups(svgData, svgGroups, setSvgGroups);
  useKeyboard(
    "Backspace",
    () => {
      if (selectedBlockIndex) {
        handleDeleteBlock(selectedBlockIndex);
      }
    },
    { ctrl: true }
  );
  useKeyboard(
    "z",
    () => {
      undo();
    },
    { ctrl: true }
  );
  useKeyboard(
    "y",
    () => {
      redo();
    },
    { ctrl: true }
  );

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setFuture((f) => [getSnapshot(), ...f]);
    setHistory((h) => h.slice(0, -1));
    restoreSnapshot(last);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((h) => [...h, getSnapshot()]);
    setFuture((f) => f.slice(1));
    restoreSnapshot(next);
  };

  const getSnapshot = (): Snapshot => ({
    positions,
    blocks,
    svgGroups,
    svgData,
    parametersUrl,
    selectedBlockIndex,
    paperWidth,
    paperHeight,
    selectedConfigId,
    GroupIdentifierUrlMap,
    isTemplate,
    align,
    size,
    lastUpdatedBlockId,
  });

  const restoreSnapshot = (snap: Snapshot) => {
    setPositions(snap.positions);
    setBlocks(snap.blocks);
    setSvgGroups(snap.svgGroups);
    setSvgData(snap.svgData);
    setParametersUrl(snap.parametersUrl);
    setSelectedBlockIndex(snap.selectedBlockIndex);
    setPaperWidth(snap.paperWidth);
    setPaperHeight(snap.paperHeight);
    setSelectedConfigId(snap.selectedConfigId);
    setGroupIdentifierUrlMap(snap.GroupIdentifierUrlMap);
    setIsTemplate(snap.isTemplate);
    setAlign(snap.align);
    setSize(snap.size);
    setLastUpdatedBlockId(snap.lastUpdatedBlockId);
  };
  const pushHistory = () => {
    setHistory((prev) => [...prev.slice(-9), getSnapshot()]);
    setFuture([]);
  };
  function getBlockNextId() {
    const id = blockNextId.current;
    blockNextId.current += 1;
    return id;
  }
  const updateMapValue = (id: string, newValue: string) => {
    setGroupIdentifierUrlMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(parseInt(id, 10), newValue);
      return newMap;
    });
  };

  function mutateSilently(newBlocks: Block[]) {
    setBlocks(newBlocks);
  }

  const handleDeleteBlock = (id = selectedBlockIndex) => {
    pushHistory();
    let newSelectedBlockId = 0;
    const filteredBlocks = blocks.filter((b) => b.id != selectedBlockIndex);
    newSelectedBlockId = filteredBlocks?.[0]?.id;
    mutateSilently(filteredBlocks.map((b) => ({ ...b, changed: true })));
    setSvgData(deleteGroupFromSvgString(svgData, id));
    setSvgGroups((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    setSelectedBlockIndex(newSelectedBlockId);
  };

  const handleAddBlock = (text = "NEW TEXT", fontName = DEFAULT_FONT) => {
    const blockId = getBlockNextId();
    pushHistory();
    const b = blocks.map((b) => ({
      ...b,
      changed: false,
    }));
    setBlocks([
      ...b,
      {
        ...mockBlock,
        config: {
          ...mockBlock.config,
          fontName,
          text,
          topOffsetInMillimeters: getRandom(10, paperHeight - 10),
          leftOffsetInMillimeters: getRandom(10, paperWidth - 10),
        },
        id: blockId,
      },
    ]);
    setSync(true);
    setSelectedBlockIndex(blockId);
  };
  const handleBlockChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | null,
    text?: string,
    v?: any
  ) => {
    if (!firstFetch) {
      pushHistory();
    } else {
      setBlocks(
        blocks.map((b) => ({
          ...b,
          changed: false,
        }))
      );
      setFirstFetch(false);
    }
    let {
      name = null,
      value = null,
      type = null,
      // @ts-ignore
      checked = null,
    } = e?.target || {};

    if (text) {
      if (text === "alignment") {
        name = "alignment";
        value = align;
      } else if (text === "fontSize") {
        type = "number";
        name = "fontSize";
        value = v;
      } else if (text == "rotation") {
        name = "rotation";
        value = v;
      } else if (text == "fontName") {
        name = "fontName";
        value = v;
      }
    }
    setSync(true);
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) => {
        if (block.id !== selectedBlockIndex)
          return { ...block, changed: false };

        if (name === "name") {
          return {
            ...block,
            name: value ?? undefined,
            changed: true,
          };
        }

        const newVal =
          name === "alignment"
            ? value
            : name === "multiline"
              ? (value as string).toLowerCase() === "true"
              : type === "checkbox"
                ? checked
                : type === "number"
                  ? parseFloat(
                      name === "r" || name === "g" || name === "b"
                        ? Math.max(+!value % 255, 0).toString()
                        : (value as string)
                    )
                  : value;

        return {
          ...block,
          changed: true,
          config: {
            ...block.config,
            [name as keyof BlockConfig]: newVal, // safer cast
          },
        };
      })
    );
  };

  useEffect(() => {
    if (lastUpdatedBlockId === "all") {
      setPositions(() => {
        const reset: Record<number, Position> = {};
        blocks.forEach((block) => {
          reset[block.id] = { x: 0, y: 0 };
        });
        return reset;
      });
      setLastUpdatedBlockId(null);
    }
  }, [svgGroups, lastUpdatedBlockId]);

  useEffect(() => {
    if (GroupIdentifierUrlMap.size === 0) return;
    const queryParams = [...GroupIdentifierUrlMap.entries()]
      .map(([_, value]) => `${value}`)
      .join("&");
    setParametersUrl(queryParams);
  }, [GroupIdentifierUrlMap]);

  const fetchSVG = useCallback(
    async (regenrateAll = true) => {
      try {
        if (!svgData) regenrateAll = true;
        const b = regenrateAll ? blocks : blocks.filter((b) => b.changed);
        console.log(b);
        const bodyData = buildBodyData({
          blocks: b,
          paperWidth,
          paperHeight,
          selectedConfigId,
          placeholders,
          recipientId,
        });

        const { text, response } = await post("/preview", bodyData);
        if (!response.ok) throw new Error();
        setLastUpdatedBlockId("all");

        setSvgData(addWhiteBackgroundAndBordersToSVG(text, svgData));

        const paramUrlCount =
          Number(response.headers.get("X-Parameters-Url")) || 0;
        if (paramUrlCount !== 1) {
          const newMap = new Map<number, string>();
          for (let i = 1; i <= paramUrlCount; ++i) {
            const value = response.headers.get("X-Parameters-Url" + i);
            if (value) newMap.set(i, value);
          }
          setGroupIdentifierUrlMap(newMap);
        } else {
          for (let [header, value] of response.headers.entries()) {
            if (header.toLowerCase().startsWith("x-parameters-url")) {
              const id = header.slice("X-Parameters-Url".length);
              if (id) updateMapValue(id, value);
            }
          }
        }
      } catch (e) {
        console.error(e);
        setSvgData('<svg><text x="10" y="50" fill="red">Error</text></svg>');
      }
    },
    [
      blocks,
      selectedBlockIndex,
      paperWidth,
      paperHeight,
      selectedConfigId,
      cardFormat,
      shuffle,
      svgData,
      isTemplate,
      recipientId,
      placeholders,
    ]
  );

  const handleGenerate = (regenrateAll = true, samePreview = false) => {
    fetchSVG(regenrateAll);
  };
  const handleShuffle = () => {
    setShuffle(true);
    setSync(true);
  };

  useEffect(() => {
    const handleChange = () => {
      setMyValue(window.view);
    };

    // Custom event you fire when the value changes
    window.addEventListener("view", handleChange);
    return () => window.removeEventListener("view", handleChange);
  }, []);
  // if (myValue == "Templates") return <Templates />;
  // if (myValue == "Recipients") return <RecipientsPage />;
  if (myValue == "Mailing")
    return (
      <h1
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "800px",
        }}
      >
        Mailing Step
      </h1>
    );
  if (myValue == "Shipping" || myValue == "Shipping (optional)")
    return (
      <h1
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "800px",
        }}
      >
        Shipping Step
      </h1>
    );
  if (myValue == "Completion")
    return (
      <div>
        <h1
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            marginTop: "300px",
            height: "40px",
          }}
        >
          Checkout Step
        </h1>
        <h3
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "40px",
          }}
        >
          Payment and Invoicing Details
        </h3>
      </div>
    );

  return (
    <>
      <div
        className={styles.wrapper}
        style={
          {
            "--card-width": `${(PX_PER_MM * paperWidth * zoom) / 100}px`,
            "--card-height": `${(PX_PER_MM * paperHeight * zoom) / 100}px`,
          } as React.CSSProperties
        }
      >
        <div className={styles.leftPanel}>
          <ConfigForm
            handleBlockChange={handleBlockChange}
            setPaperHeight={setPaperHeight}
            setPaperWidth={setPaperWidth}
            align={align}
            setAlign={setAlign}
            blocks={blocks}
            selectedBlockIndex={selectedBlockIndex}
            setSelectedBlockIndex={setSelectedBlockIndex}
            size={size}
            setSize={setSize}
            handleAddBlock={handleAddBlock}
            setBackgroundImage={setBackgroundImage}
            onMouseEnter={() => setBlockShouldDisplayOutline(true)}
            onMouseLeave={() => setBlockShouldDisplayOutline(false)}
            cardFormat={cardFormat}
          />
        </div>

        <div className={styles.canvasWrapper}>
          <div className={styles.canvasInner}>
            {/* ───── Left selector column ───── */}
            <div className={styles.selectorColumn}>
              <h1 className={styles.title}>Post Card</h1>
              <PaperSizeSelector
                value={cardFormat}
                onChange={(o) => {
                  setCardFormat(o);
                  setZoom(PAPER_SIZES_MM[o].scale);
                }}
                options={Object.keys(PAPER_SIZES_MM)}
              />
            </div>

            {/* ───── Right preview column ───── */}
            <div className={styles.previewColumn}>
              <div className={styles.previewContainer}>
                <div className={styles.cardWrapper}>
                  {/* ─── toolbar ─── */}
                  <div className={styles.toolbarTop}>
                    <Button
                      label="Share"
                      icon={<i className={`bi bi-share ${styles.iconWhite}`} />}
                      onClick={() => alert("Clicked!")}
                      width="160px"
                      height="35px"
                      padding="10px 10px"
                      backgroundColor="#2000a7"
                      hoverColor="#ebed8e"
                      color="white"
                      fontSize="14px"
                      fontWeight="600"
                      borderRadius="8px"
                    />
                    <Button
                      label="Save Draft"
                      icon={<i className="bi bi-floppy" />}
                      onClick={() => alert("Clicked!")}
                      width="160px"
                      height="35px"
                      padding="10px 10px"
                      backgroundColor="#e3e55f"
                      hoverColor="#ebed8e"
                      color="black"
                      fontSize="14px"
                      fontWeight="600"
                      borderRadius="8px"
                    />
                  </div>

                  <div className={styles.toolbarRow}>
                    <Button
                      label="Flip Card"
                      icon={<i className="bi bi-arrow-left-right" />}
                      onClick={() => {
                        if (firstFetch) setSync(true);
                        setIsFlipped(!isFlipped);
                      }}
                      width="120px"
                      height="30px"
                      padding="10px 10px"
                      backgroundColor="white"
                      hoverColor="#ebed8e"
                      color="black"
                      fontSize="14px"
                      fontWeight="600"
                      borderRadius="8px"
                    />
                    <div className={styles.toolbarButtons}>
                      <Button
                        label="Step Back"
                        icon={<i className="bi bi-arrow-90deg-left" />}
                        onClick={undo}
                        width="125px"
                        height="30px"
                        padding="10px 10px"
                        backgroundColor="white"
                        hoverColor="#ebed8e"
                        color="black"
                        fontSize="14px"
                        fontWeight="600"
                        borderRadius="8px"
                      />
                      <Button
                        label="Step Forward"
                        icon={<i className="bi bi-arrow-90deg-right" />}
                        onClick={redo}
                        width="140px"
                        height="30px"
                        padding="10px 10px"
                        backgroundColor="white"
                        hoverColor="#ebed8e"
                        color="black"
                        fontSize="14px"
                        fontWeight="600"
                        borderRadius="8px"
                      />

                      <Button
                        label="Shuffle"
                        icon={<i className="bi bi-shuffle" />}
                        onClick={handleShuffle}
                        width="100px"
                        height="30px"
                        padding="10px 10px"
                        backgroundColor="white"
                        hoverColor="#ebed8e"
                        color="black"
                        fontSize="14px"
                        fontWeight="600"
                        borderRadius="8px"
                      />
                    </div>
                  </div>

                  {/* ─── SVG canvas ─── */}
                  <div className={styles.svgArea}>
                    <SvgCard
                      svgGroups={svgGroups}
                      setBlocks={setBlocks}
                      setPositions={setPositions}
                      positions={positions}
                      setSelectedBlockIndex={setSelectedBlockIndex}
                      blockShouldDisplayOutline={blockShouldDisplayOutline}
                      containerRef={containerRef}
                      cardRef={cardRef}
                      setSync={setSync}
                      zoom={zoom}
                      pushHistory={pushHistory}
                      pageWidth={paperWidth}
                      pageHeight={paperHeight}
                      isFlipped={isFlipped}
                      undo={undo}
                      redo={redo}
                      selectedBlockIndex={selectedBlockIndex}
                      handleBlockChange={handleBlockChange}
                      blocks={blocks}
                      backgroundImage={backgroundImage}
                      skewAnimateRange={PAPER_SIZES_MM[cardFormat].skew}
                    />
                  </div>

                  {/* ─── bottom status bar ─── */}
                  <div className={styles.statusBar}>
                    <RecipientSelector
                      value={recipientId}
                      onChange={(e) => {
                        setSync(true);
                        setRecipientId(e);
                      }}
                    />
                    {!isFlipped ? "Front side" : "Reverse side"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
