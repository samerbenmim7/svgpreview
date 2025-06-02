/* App.tsx – loads draft on mount, saves on click */

import React, { useState } from "react";
import Editor from "./components/editor/Editor";
import { EditorState } from "./types/types";
import { PAPER_SIZES_MM, PEN_BLUE_DEGREE } from "./utils/const";
import {
  defaultBlocks,
  defaultBlocks2,
  defaultBlocks3,
} from "./defaults/defaults";
import { compressToUTF16, decompressFromUTF16 } from "lz-string";

/* ───────────────── storage keys ───────────────── */
const KEYS = {
  front: "editorStateFront",
  back: "editorStateBack",
  env: "editorStateEnvelope",
};

/* ───────────────── defaults ───────────────── */
const baseState: Omit<EditorState, "blocks" | "placeholders"> = {
  positions: {},
  svgData: "",
  backgroundImage: "",
  backgroundImageOpacity: 100,
  selectedBlockIndex: 1,
  selectedConfigId: 25,
  blockShouldDisplayOutline: false,
  svgGroupsIdentifierContentMap: new Map<number, string>(),
  lastUpdatedBlockId: null,
  GroupIdentifierUrlMap: new Map(),
  textColor: PEN_BLUE_DEGREE,
  history: [],
  future: [],
  paperWidth: 0,
  paperHeight: 0,
  recipientId: 0,
  isTemplate: false,
  needsSync: false,
};

const initialFront: EditorState = {
  ...baseState,
  blocks: defaultBlocks,
  //@ts-ignore
  placeholders: [" {{CUSTOM1}} ", " {{CUSTOM2}} "],
};

const initialBack: EditorState = {
  ...baseState,
  blocks: defaultBlocks2,
  placeholders: [],
};

const initialEnvelope: EditorState = {
  ...baseState,
  blocks: defaultBlocks3,
  placeholders: [],
};

function loadDraft(key: string, fallback: EditorState): EditorState {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    const jsonText = raw.startsWith("{")
      ? raw
      : (decompressFromUTF16(raw) ?? "");
    if (!jsonText) return fallback;

    const saved = JSON.parse(jsonText);

    return {
      ...fallback,
      ...saved,
      GroupIdentifierUrlMap: new Map(saved.GroupIdentifierUrlMap),
    };
  } catch {
    return fallback; // corrupted data → start fresh
  }
}

function stripToDraft(s: EditorState) {
  return {
    backgroundImage: s.backgroundImage,
    backgroundImageOpacity: s.backgroundImageOpacity,
    selectedConfigId: s.selectedConfigId,
    GroupIdentifierUrlMap: Array.from(s.GroupIdentifierUrlMap.entries()),
    blocks: s.blocks,
    selectedBlockIndex: s.selectedBlockIndex,
    textColor: s.textColor,
  };
}

function saveDraft(front: EditorState, back: EditorState, env: EditorState) {
  try {
    localStorage.setItem(
      KEYS.front,
      compressToUTF16(JSON.stringify(stripToDraft(front)))
    );
    localStorage.setItem(
      KEYS.back,
      compressToUTF16(JSON.stringify(stripToDraft(back)))
    );
    localStorage.setItem(
      KEYS.env,
      compressToUTF16(JSON.stringify(stripToDraft(env)))
    );
    alert("Draft saved!");
  } catch (err) {
    console.error("Could not save draft:", err);
  }
}

/* ───────────────── component ───────────────── */

export default function App() {
  const [editorState, setEditorState] = useState<EditorState>(() =>
    loadDraft(KEYS.front, initialFront)
  );
  const [editorState2, setEditorState2] = useState<EditorState>(() =>
    loadDraft(KEYS.back, initialBack)
  );
  const [envelope, setEnvelope] = useState<EditorState>(() =>
    loadDraft(KEYS.env, initialEnvelope)
  );

  const [isFlipped, setIsFlipped] = useState(false);
  const [showEnvelope, setShowEnvelope] = useState(false);
  const [zoom, setZoom] = useState(40);
  const [cardFormat, setCardFormat] = useState<string>(
    Object.keys(PAPER_SIZES_MM)[0]
  );

  return (
    <>
      <Editor
        editorState={
          showEnvelope ? envelope : !isFlipped ? editorState : editorState2
        }
        setEditorState={
          showEnvelope
            ? setEnvelope
            : !isFlipped
              ? setEditorState
              : setEditorState2
        }
        isFlipped={isFlipped}
        setIsFlipped={setIsFlipped}
        zoom={zoom}
        setZoom={setZoom}
        cardFormat={cardFormat}
        setCardFormat={setCardFormat}
        showEnvelope={showEnvelope}
        setShowEnvelope={setShowEnvelope}
        handleSaveDraft={() => saveDraft(editorState, editorState2, envelope)}
      />
    </>
  );
}
