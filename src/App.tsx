import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  HTMLAttributes,
} from "react";
import ConfigForm from "./ConfigForm";
import {
  addWhiteBackgroundAndBordersToSVG,
  extractGId,
  buildBodyData,
  deleteGroupFromSvgString,
  getRandom,
} from "./utils/utils";
import { post, get } from "./services/api";
import { defaultConfig, defaultBlocks, mockBlock } from "./defaults";
import SvgCard from "./components/svgCard/SvgCard";
import "./Configurator.css";
import {
  Position,
  Placeholder,
  BlockConfig,
  Block,
  Snapshot,
  EditorState,
} from "./types/types";
import { useDebounce } from "./hooks/useDebounce";
import { useCenterScroll } from "./hooks/useCenterScroll";
import { useSvgGroups } from "./hooks/useSvgGroup";
import { DEFAULT_FONT, PAPER_SIZES_MM, PX_PER_MM } from "./Utils/const";
import { useKeyboard } from "./hooks/useKeyboard";
import { useSpriteLoader } from "./hooks/useSpriteLoader";
import TextSettingsCard from "./components/MenuViews/blocksConfigurator/BlocksConfigurator";
import Button from "./components/atoms/button/Button";
import { Columns } from "react-feather";
import Recipients from "./Recipients";
import RecipientsPage from "./RecipientsPage";
import Templates from "./Templates";
import "bootstrap-icons/font/bootstrap-icons.css";
import RecipientSelector from "./components/atoms/input/Input";
import PaperSizeSelector from "./components/atoms/SizeSelector/PaperSizeSelector";

interface Card {
  paper: string;
  svgData: string;
  positions: Record<number, Position>; // to be renamed blocksPosition
  backgroundImage: string;
  parametersUrl: string; // should be renamedcontains the string that serves to regenerate same block
  blocks: Block[];
  selectedBlockIndex: number;
  selectedConfigId: number;
  align: string;
  size: string;
  blockShouldDisplayOutline: boolean;
  svgGroups;
  lastUpdatedBlockId;
  //paperWidth to be verefied
  //paperHeight to be verified
  //format to be verified
  //config to be verifie
  // is Template to be verified
}

export default function App() {
  // Refs
  const cardRef = useRef<HTMLDivElement | null>(null);
  const blockNextId = useRef(defaultBlocks.length + 1);
  const [editorState, setEditorState] = useState<EditorState>({
    paper: Object.keys(PAPER_SIZES_MM)[0],
    positions: {},
    svgData: "",
    backgroundImage: "",
    parametersUrl: "",
    blocks: defaultBlocks,
    selectedBlockIndex: 1,
    paperWidth: 50,
    paperHeight: 105,
    recipientId: 0,
    selectedConfigId: 25,
    format: "svg",
    config: defaultConfig,
    isTemplate: true,
    align: "left",
    size: "medium",
    blockShouldDisplayOutline: false,
    svgGroups: new Map(),
    needsSync: true,
    history: [],
    future: [],
    GroupIdentifierUrlMap: new Map(),
    lastUpdatedBlockId: null,
  });

  const [zoom, setZoom] = useState<number>(40);
  const [paper, setPaper] = useState(Object.keys(PAPER_SIZES_MM)[0]);

  // State declarations
  const [positions, setPositions] = useState<Record<number, Position>>({});
  const [svgData, setSvgData] = useState<string>("");
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [parametersUrl, setParametersUrl] = useState<string>("");
  const [blocks, setBlocks] = useState<Block[]>(defaultBlocks);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(1);
  const [paperWidth, setPaperWidth] = useState<number>(50); // TO
  const [paperHeight, setPaperHeight] = useState<number>(105);
  const [recipientId, setRecipientId] = useState<number>(0);
  const [selectedConfigId, setSelectedConfigId] = useState<number>(25);
  const [format, setFormat] = useState<string>("svg");
  const [config, setConfig] = useState<any>(defaultConfig);
  const [isTemplate, setIsTemplate] = useState<boolean>(true);
  const [align, setAlign] = useState<string>("left");
  const [size, setSize] = useState<string>("medium");
  const [blockShouldDisplayOutline, setBlockShouldDisplayOutline] =
    useState<boolean>(false);
  const [svgGroups, setSvgGroups] = useState<Map<number, string>>(new Map());
  const [needsSync, setSync] = useState(true);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const [GroupIdentifierUrlMap, setGroupIdentifierUrlMap] = useState<
    Map<number, string>
  >(new Map());
  const [lastUpdatedBlockId, setLastUpdatedBlockId] = useState<string | null>(
    null
  );

  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([
    { name: "COMPANY", value: "WunderPen" },
    { name: "SENDER", value: "Samer Ben Mim," },
  ]);

  // Custom hooks
  useCenterScroll(containerRef, svgData);
  useDebounce(
    () => {
      if (needsSync) {
        handleGenerate(true);
        setSync(false);
      }
    },
    150,
    [recipientId]
  );
  useDebounce(
    () => {
      if (needsSync) {
        handleGenerate(false);
        setSync(false);
      }
    },
    150,
    [needsSync, recipientId, placeholders]
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
    format,
    config,
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
    setFormat(snap.format);
    setConfig(snap.config);
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
    pushHistory();
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
      } else if (text === "size") {
        type = "number";
        name = "fontSize";
        if (size === "small") value = "2";
        if (size === "medium") value = "4";
        if (size === "large") value = "6";
      } else if (text == "rotation") {
        name = "rotation";
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

        const bodyData = buildBodyData({
          blocks: b,
          paperWidth,
          paperHeight,
          format,
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
      format,
      selectedConfigId,
      config,
      svgData,
      isTemplate,
      recipientId,
      placeholders,
    ]
  );
  console.log("positions", positions);
  // const handleSendRequest = useCallback(async () => {
  //   if (!parametersUrl) return;
  //   try {
  //     const bodyData = buildBodyData({
  //       blocks,
  //       paperWidth,
  //       paperHeight,
  //       format,
  //       selectedConfigId,
  //       placeholders,
  //       isTemplate,
  //     });

  //     const { text, response } = await post(
  //       "/preview" + parametersUrl,
  //       bodyData
  //     );
  //     if (!response.ok) throw new Error();

  //     setSvgData(addWhiteBackgroundAndBordersToSVG(text, svgData));

  //     const paramUrlCount =
  //       Number(response.headers.get("X-Parameters-Url")) || 0;
  //     if (paramUrlCount !== 1) {
  //       const newMap = new Map<number, string>();
  //       for (let i = 1; i <= paramUrlCount; ++i) {
  //         const value = response.headers.get("X-Parameters-Url" + i);
  //         if (value) newMap.set(i, value);
  //       }
  //       setGroupIdentifierUrlMap(newMap);
  //     } else {
  //       for (let [header, value] of response.headers.entries()) {
  //         if (header.toLowerCase().startsWith("x-parameters-url")) {
  //           const id = header.slice("X-Parameters-Url".length);
  //           if (id) updateMapValue(id, value);
  //         }
  //       }
  //     }
  //   } catch {
  //     setSvgData('<svg><text x="10" y="50" fill="red">Error</text></svg>');
  //   }
  // }, [
  //   parametersUrl,
  //   blocks,
  //   paperWidth,
  //   paperHeight,
  //   format,
  //   selectedConfigId,
  //   config,
  //   svgData,
  // ]);

  const handleGenerate = (regenrateAll = true, samePreview = false) => {
    console.log("here");
    fetchSVG(regenrateAll);
  };

  const [myValue, setMyValue] = useState(window.view);

  useEffect(() => {
    const handleChange = () => {
      setMyValue(window.view);
    };

    // Custom event you fire when the value changes
    window.addEventListener("view", handleChange);
    console.log("changed", window.view);
    return () => window.removeEventListener("view", handleChange);
  }, []);
  if (myValue == "Templates") return <Templates />;
  if (myValue == "Recipients") return <RecipientsPage />;
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
      <br />
      <br />
      <br />
      <br />

      <div style={{ display: "flex", width: "100%" }}>
        {/* <SvgCard
        svgGroups={svgGroups}
        setBlocks={setBlocks}
        setPositions={setPositions}
        positions={positions}
        setSelectedBlockIndex={setSelectedBlockIndex}
        containerRef={containerRef}
        cardRef={cardRef}
        setSync={setSync}
        pushHistory={pushHistory}
      /> */}

        <div
          style={{
            margin: "20px 0",
            marginRight: "-450px",

            zIndex: 2,
          }}
        >
          {/* <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "10px",

            padding: "10px",
            borderTop: "1px solid #ccc",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "10px",
              padding: "10px",
            }}
          >
            <button
              onClick={() => handleGenerate()}
              style={{
                background: "#e3e55f",

                color: "black",
                padding: "10px 16px",
                fontSize: "14px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              🔄 Generate Preview
            </button>

            <button
              onClick={() => handleDeleteBlock()}
              style={{
                background: "#e3e55f",

                color: "black",
                padding: "10px 16px",
                fontSize: "14px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              🗑️ Delete Block
            </button>

            <button
              onClick={() => handleAddBlock()}
              style={{
                background: "#e3e55f",
                color: "black",
                padding: "10px 16px",
                fontSize: "14px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              ➕ Add Block
            </button>

            <button
              onClick={() => undo()}
              style={{
                background: "#e3e55f",
                color: "black",
                padding: "10px 16px",
                fontSize: "14px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              ↩️ Undo
            </button>

            <button
              onClick={() => redo()}
              style={{
                background: "#e3e55f",

                color: "black",
                padding: "10px 16px",
                fontSize: "14px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              ↪️ Redo
            </button>
          </div>
        </div> */}

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
            paper={paper}
          />
        </div>

        <div
          style={{
            background: "#f2ede9",
            width: "90%",
            zIndex: 1,
            right: 0,
            minHeight: "740px",
            borderRadius: "10px",
            display: "flex",
            marginLeft: "auto",
          }}
        >
          <div style={{ padding: "20px", width: "100%", display: "flex" }}>
            <div
              style={{
                width: "25%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h1
                style={{
                  marginTop: "80px",
                  marginLeft: "120px",
                  fontFamily: "sans-serif",
                  display: "flex",

                  position: "fixed",
                }}
              >
                Post Card
              </h1>
              <PaperSizeSelector
                value={paper}
                onChange={(o) => {
                  setPaper(o);
                  setZoom(PAPER_SIZES_MM[o].scale);
                }}
                options={Object.keys(PAPER_SIZES_MM)}
              />
            </div>

            <div
              style={{
                width: "75%",
                display: "flex",
                height: "100%",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "end",
                  alignItems: "center",
                  height: "100%",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: (PX_PER_MM * paperWidth * zoom) / 100,
                    height: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    flexDirection: "column",
                    margin: "0 25px",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      // height: "20px",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        display: "flex",

                        justifyContent: "end",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        label="Share"
                        icon={
                          <i
                            style={{ color: "white" }}
                            className="bi bi-share"
                          ></i>
                        }
                        onClick={() => alert("Clickeed!")}
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
                        icon={<i className="bi bi-floppy"></i>}
                        onClick={() => alert("Clickeed!")}
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
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        fontFamily: "sans-serif",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          fontFamily: "sans-serif",
                        }}
                      ></div>
                      <Button
                        label="Flip Card"
                        icon={<i className="bi bi-arrow-left-right"></i>}
                        onClick={() => setIsFlipped(!isFlipped)}
                        width="120px"
                        height="30px"
                        padding="10px 10px"
                        backgroundColor="white"
                        hoverColor="#ebed8e"
                        color="black"
                        fontSize="14px"
                        fontWeight="600"
                        borderRadius="8px"
                      />{" "}
                      <div
                        style={{
                          display: "flex",
                          fontFamily: "sans-serif",
                          marginLeft: "50px",
                        }}
                      >
                        <Button
                          label="Step Back"
                          icon={<i className="bi bi-arrow-90deg-left"></i>}
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
                        />{" "}
                        <Button
                          label="Step Forward"
                          icon={<i className="bi bi-arrow-90deg-right"></i>}
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
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      width: (PX_PER_MM * paperWidth * zoom) / 100,
                      height: (PX_PER_MM * paperHeight * zoom) / 100,
                      //maxHeight: "685px",
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      position: "relative",
                      boxSizing: "border-box",
                      marginTop: "15px",
                    }}
                  >
                    <SvgCard
                      svgGroups={svgGroups}
                      setBlocks={setBlocks}
                      setPositions={setPositions}
                      positions={positions}
                      setSelectedBlockIndex={setSelectedBlockIndex}
                      blockShouldDisplayOutline={blockShouldDisplayOutline}
                      //@ts-ignore
                      containerRef={containerRef}
                      //@ts-ignore

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
                      skewAnimateRange={PAPER_SIZES_MM[paper].skew}
                    />
                  </div>

                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "60px",
                      marginTop: "15px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <RecipientSelector
                      value={recipientId}
                      onChange={(e) => {
                        setSync(true);

                        setRecipientId(e);
                      }}
                    />
                    {!isFlipped ? "Front view" : "Back view"}
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
