import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  SetStateAction,
  Dispatch,
} from "react";
import ConfigForm from "../../ConfigForm";
import { buildBodyData, normaliseEvent } from "../../utils/misc.ts";
import { post } from "../../services/inkloomApi.ts";
import { mockBlock } from "../../defaults/defaults.ts";
import SvgCard from "../svgCard/SvgCard";
import {
  Position,
  Placeholder,
  Snapshot,
  EditorState,
  BlockUpdate,
} from "../../types/types";
import { useDebounce } from "../../hooks/useDebounce";
import { useSvgGroups } from "../../hooks/useSvgGroup";
import {
  DEFAULT_FONT,
  MAX_NUMBER_OF_BLOCKS_PER_VIEW,
  MAX_NUMBER_OF_CHARS_PER_BLOCK,
  PAPER_SIZES_MM,
  PX_PER_MM,
} from "../../utils/const";
import Button from "../atoms/button/Button";
import "bootstrap-icons/font/bootstrap-icons.css";
import RecipientSelector from "../atoms/input/Input";
import PaperSizeSelector from "../atoms/SizeSelector/PaperSizeSelector";
import styles from "./editor.module.css";
import { usePrevious } from "../../hooks/usePrevious.ts";
import useRecipientCount from "../../hooks/useRecipientCount.ts";
import useRecipient from "../../hooks/useRecipient.ts";
import ShippingPage from "../../ShippingPage.tsx";
import { findNextAvailableBlockId, getRandom } from "../../utils/math.ts";
import {
  addWhiteBackgroundAndBordersToSVG,
  deleteGroupFromSvgString,
} from "../../utils/strings.ts";
import { useSyncPlaceholderLength } from "../../hooks/useSyncPlaceholderLength.ts";
import { useViewListener } from "../../hooks/useViewListener.ts";
import { useEditorSetters } from "../../hooks/useEditorKeysSetters.ts";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts.ts";
import { useHistory } from "../../hooks/useHistory.ts";

interface EditorProps {
  editorState: EditorState;
  setEditorState: Dispatch<SetStateAction<EditorState>>;
  isFlipped: boolean;
  setIsFlipped: Dispatch<SetStateAction<boolean>>;
  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
  cardFormat: string;
  setCardFormat: Dispatch<SetStateAction<string>>;
  showEnvelope: boolean;
  setShowEnvelope: Dispatch<SetStateAction<boolean>>;
  handleSaveDraft: any;
}
const Editor: React.FC<EditorProps> = ({
  editorState,
  setEditorState,
  setIsFlipped,
  isFlipped,
  zoom,
  setZoom,
  cardFormat,
  setCardFormat,
  setShowEnvelope,
  showEnvelope,
  handleSaveDraft,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {
    positions,
    svgData,
    backgroundImage,
    blocks,
    selectedBlockIndex,
    selectedConfigId,
    // align,
    // size,
    blockShouldDisplayOutline,
    svgGroupsIdentifierContentMap,
    lastUpdatedBlockId,
    GroupIdentifierUrlMap,
    history,
    future,
    backgroundImageOpacity,
    placeholders,
    textColor,
  } = editorState;

  const {
    setPositions,
    setSvgData,
    setBackgroundImage,
    setBlocks,
    setSelectedBlockIndex,
    setSelectedConfigId,
    // setAlign,
    // setSize,
    setBlockShouldDisplayOutline,
    setSvgGroupsIdentifierContentMap,
    setLastUpdatedBlockId,
    setGroupIdentifierUrlMap,
    setHistory,
    setFuture,
    setBackgroundImageOpacity,
    setPlaceholders,
    setTextColor,
  } = useEditorSetters(setEditorState);

  const [paperWidth, setPaperWidth] = useState<number>(50);
  const [paperHeight, setPaperHeight] = useState<number>(105);
  const [recipientId, setRecipientId] = useState<number>(0);
  const [isTemplate, setIsTemplate] = useState<boolean>(true);
  const [needsSync, setSync] = useState(true);
  const [shuffle, setShuffle] = useState(false);

  const [firstFetch, setFirstFetch] = useState(true);

  const [pplaceholders, setPplaceholders] = useState<Placeholder[]>([
    { name: "CUSTOM1", value: "CUSTOM1" },
    { name: "CUSTOM2", value: "CUSTOM2" },
    { name: "CUSTOM3", value: "CUSTOM3" },
    { name: "CUSTOM4", value: "CUSTOM4" },
    { name: "CUSTOM5", value: "CUSTOM5" },
  ]);

  const [windowView, setWindowView] = useState<string | undefined>(undefined);
  const [configViewId, setConfigViewId] = useState("text");

  useEffect(() => {
    setWindowView(window.view);
  }, []);

  const prevRecipientId = usePrevious<number | undefined>(recipientId);
  const prevSelectedConfigId = usePrevious<number | undefined>(
    selectedConfigId
  );

  const recipientIdChanged =
    prevRecipientId !== recipientId && recipientId !== undefined;

  const selectedConfigIdChanged =
    prevSelectedConfigId !== selectedConfigId && selectedConfigId !== undefined;

  useDebounce(
    () => {
      if (!needsSync) return;
      if (shuffle) {
        handleGenerate(true, false);
        setShuffle(false);
      } else if (recipientIdChanged || selectedConfigIdChanged)
        handleGenerate(true);
      else handleGenerate(false, false);
      setSync(false);
    },
    200,
    [
      needsSync,
      recipientId,
      placeholders,
      paperHeight,
      paperWidth,
      selectedConfigId,
      showEnvelope,
    ]
  );

  useSvgGroups(
    svgData,
    setSvgGroupsIdentifierContentMap,
    setGroupIdentifierUrlMap
  );

  useSyncPlaceholderLength(placeholders);
  //console.log(parametersUrl);

  const getSnapshot = (): Snapshot => ({
    positions,
    blocks,
    svgGroupsIdentifierContentMap,
    svgData,
    selectedBlockIndex,
    paperWidth,
    paperHeight,
    selectedConfigId,
    GroupIdentifierUrlMap,
    isTemplate,
    textColor,
    lastUpdatedBlockId,
  });

  const restoreSnapshot = (snap: Snapshot) => {
    // console.log("restore", snap);
    setPositions(snap.positions);
    setBlocks(snap.blocks);
    setSvgGroupsIdentifierContentMap(snap.svgGroupsIdentifierContentMap);
    setSvgData(snap.svgData);
    setSelectedBlockIndex(snap.selectedBlockIndex);
    setPaperWidth(snap.paperWidth);
    setPaperHeight(snap.paperHeight);
    setSelectedConfigId(snap.selectedConfigId);
    setGroupIdentifierUrlMap(snap.GroupIdentifierUrlMap);
    setIsTemplate(snap.isTemplate);
    setLastUpdatedBlockId(snap.lastUpdatedBlockId);
    setTextColor(snap.textColor);
  };
  const { pushHistory, undo, redo } = useHistory(
    getSnapshot,
    restoreSnapshot,
    history,
    setHistory,
    future,
    setFuture
    //textColor
  );

  useKeyboardShortcuts({
    onDelete: () => {
      if (selectedBlockIndex !== undefined) {
        handleDeleteBlock(selectedBlockIndex);
      }
    },
    onUndo: undo,
    onRedo: redo,
  });

  const handleDeleteBlock = (id: number = selectedBlockIndex): void => {
    pushHistory();
    let newSelectedBlockId = 0;
    const filteredBlocks = blocks.filter((b) => b.id != selectedBlockIndex);
    newSelectedBlockId = filteredBlocks?.[0]?.id;
    setBlocks(filteredBlocks.map((b) => ({ ...b, changed: true })));
    setSvgData(deleteGroupFromSvgString(svgData, id));
    setSvgGroupsIdentifierContentMap((prev: any) => {
      const newMap = new Map(prev as Map<number, string>);
      newMap.delete(id);
      return newMap;
    });
    setGroupIdentifierUrlMap((prev: any) => {
      const newMap = new Map(prev as Map<number, string>);
      newMap.delete(id);
      return newMap;
    });
    setSelectedBlockIndex(newSelectedBlockId);
  };

  const handleAddBlock = (
    text = "NEW TEXT",
    fontName = DEFAULT_FONT,
    fontSize = 7,
    path = "",
    isSymbol = false
  ) => {
    if (blocks.length >= MAX_NUMBER_OF_BLOCKS_PER_VIEW) return;
    const blockId = findNextAvailableBlockId(blocks);
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
          fontSize,
          text,
          path,
          topOffsetInMillimeters: getRandom(20, paperHeight - 20),
          leftOffsetInMillimeters: getRandom(20, paperWidth - 20),
        },
        id: blockId,
        isSymbol,
      },
    ]);
    setSync(true);
    setSelectedBlockIndex(blockId);
  };

  const handleBlockChange = (update: BlockUpdate) => {
    if (!firstFetch) {
      pushHistory();
    } else {
      setBlocks(blocks.map((b) => ({ ...b, changed: false })));
      setFirstFetch(false);
    }

    const { name, value, inputType, checked } = normaliseEvent(update);
    console.log(name, value, inputType, checked);
    setSync(true);

    setBlocks((prev: any) =>
      prev.map((block: any) => {
        if (name === "b")
          return {
            ...block,
            changed: true,
            config: { ...block.config, b: value },
          };

        if (block.id !== selectedBlockIndex)
          return { ...block, changed: false };

        const parsed =
          name === "alignment"
            ? value
            : name === "multiline"
              ? (value as string).toLowerCase() === "true"
              : inputType === "checkbox"
                ? checked
                : inputType === "number"
                  ? parseFloat(value)
                  : value;
        return {
          ...block,
          changed: true,
          config: { ...block.config, [name]: parsed },
        };
      })
    );
  };

  const { count, recipientIds, loading, error, refresh } =
    useRecipientCount(48);

  // useEffect(() => {
  //   console.log(history);
  // }, [history]);

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
  }, [svgGroupsIdentifierContentMap, lastUpdatedBlockId]);

  const { data: recipient, refetch } = useRecipient(
    recipientIds?.[recipientId] ?? null,
    48
  );

  useEffect(() => {
    // important to make a request after flipping or changing media
    if (svgData == "") {
      setSync(true);
    }
  }, [svgData]);

  const fetchSVG = useCallback(
    async (regenrateAll = true, samePreview = false) => {
      try {
        if (!svgData) regenrateAll = true;
        const b = regenrateAll ? blocks : blocks.filter((b) => b.changed);
        const bodyData = buildBodyData({
          blocks: b,
          paperWidth,
          paperHeight,
          selectedConfigId,
          pplaceholders,
          recipientId,
        });
        let url = "/preview";
        if (samePreview) {
          url =
            url +
            "?" +
            [...GroupIdentifierUrlMap.entries()]
              .map(([key, value]) => `${value}`)
              .join("&");
        }

        const { text, response } = await post(url, bodyData);
        if (!response.ok) throw new Error();
        setLastUpdatedBlockId("all");

        setSvgData(addWhiteBackgroundAndBordersToSVG(text, svgData));

        const paramUrlCount =
          Number(response.headers.get("X-Parameters-Url")) || 0;
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
      pplaceholders,
    ]
  );
  useEffect(() => {
    if (!recipient) return;

    const newPlaceholders: Placeholder[] = [];

    ["custom1", "custom2", "custom3", "custom4", "custom5", "custom6"].forEach(
      (key) => {
        const raw = recipient[key];
        if (raw == null || raw === "") return;

        newPlaceholders.push({
          name: key.toUpperCase(),
          value: String(raw),
        });
      }
    );

    setPplaceholders(newPlaceholders);
  }, [recipient]);
  const handleGenerate = (regenrateAll = true, samePreview = false) => {
    fetchSVG(regenrateAll, samePreview);
  };
  const handleShuffle = () => {
    setShuffle(true);
    setSync(true);
  };

  useViewListener(setWindowView);

  // if (windowView == "Templates") return <Templates />;
  // if (windowView == "Recipients") return <RecipientsPage />;
  if (windowView == "Mailing")
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
  if (windowView == "Shipping" || windowView == "Shipping (optional)")
    return <ShippingPage />;
  if (windowView == "Completion")
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
        id={"editor-wrapper"}
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
            paperWidth={paperWidth}
            //align={align}
            // setAlign={setAlign}
            blocks={blocks}
            selectedBlockIndex={selectedBlockIndex}
            setSelectedBlockIndex={setSelectedBlockIndex}
            // size={size}
            // setSize={setSize}
            handleAddBlock={handleAddBlock}
            setBackgroundImage={setBackgroundImage}
            onMouseEnter={() => setBlockShouldDisplayOutline(true)}
            onMouseLeave={() => setBlockShouldDisplayOutline(false)}
            cardFormat={cardFormat}
            selectedConfigId={selectedConfigId}
            setSelectedConfigId={setSelectedConfigId}
            setSync={setSync}
            setBackgroundImageOpacity={setBackgroundImageOpacity}
            backgroundImageOpacity={backgroundImageOpacity}
            placeholders={placeholders}
            setPlaceholders={setPlaceholders}
            setConfigViewId={setConfigViewId}
            configViewId={configViewId}
            setTextColor={setTextColor}
            textColor={textColor}
          />
        </div>

        <div className={styles.canvasWrapper}>
          <div className={styles.canvasInner}>
            {/* ───── Left selector column ───── */}
            <div className={styles.selectorColumn}>
              <h1 className={styles.title}>
                {showEnvelope ? "Envelope" : "Post Card"}
              </h1>
              <div
                className={styles.titlebtn}
                onClick={() => {
                  setSync(true);
                  setShowEnvelope(!showEnvelope);
                }}
              >
                {showEnvelope ? "switch to card" : "switch to envelope"}
              </div>
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
                      onClick={() => handleSaveDraft()}
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
                        //
                        //  console.log(editorState);
                        // if (firstFetch) setSync(true);
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
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
                          disabled={blocks.length == 0}
                        />
                      </div>
                      <div style={{ display: "flex" }}>
                        <Button
                          label="Delete Text"
                          icon={
                            <i
                              style={{ color: "#ff6262" }}
                              className="bi bi-trash3"
                            />
                          }
                          onClick={() => handleDeleteBlock(selectedBlockIndex)}
                          width="105px"
                          height="30px"
                          padding="5px 5px"
                          backgroundColor="white"
                          hoverColor="transparent"
                          color="#ff6262"
                          fontSize="12px"
                          fontWeight="600"
                          borderRadius="8px"
                          border="solid 1px #ff6262"
                          disabled={blocks.length == 0}
                        />
                        <Button
                          label="Add Text"
                          icon={
                            <i
                              style={{ color: "green" }}
                              className="bi bi-plus-lg"
                            />
                          }
                          onClick={() => handleAddBlock()}
                          width="90px"
                          height="30px"
                          padding="5px 5px"
                          backgroundColor="white"
                          hoverColor="transparent"
                          color="green"
                          fontSize="12px"
                          fontWeight="600"
                          borderRadius="8px"
                          border="solid 1px green"
                          disabled={
                            blocks.length >= MAX_NUMBER_OF_BLOCKS_PER_VIEW
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* ─── SVG canvas ─── */}
                  <div className={styles.svgArea}>
                    <SvgCard
                      svgGroupsIdentifierContentMap={
                        svgGroupsIdentifierContentMap
                      }
                      setConfigViewId={setConfigViewId}
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
                      skewAnimateRange={PAPER_SIZES_MM[cardFormat].skew}
                      backgroundImageOpacity={backgroundImageOpacity}
                      showEnvelope={showEnvelope}
                    />
                  </div>

                  {/* ─── bottom status bar ─── */}
                  <div className={styles.statusBar}>
                    <RecipientSelector
                      count={count}
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
};
export default Editor;
