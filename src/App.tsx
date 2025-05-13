import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  HTMLAttributes,
} from "react";
import Editor from "./components/editor/Editor";
import { createStateSetter } from "./utils/utils";
import { EditorState } from "./types/types";
import { PAPER_SIZES_MM } from "./Utils/const";
import { defaultBlocks, defaultBlocks2 } from "./defaults";

const initialEditorState: EditorState = {
  positions: {},
  svgData: "",
  backgroundImage: "",
  parametersUrl: "",
  blocks: defaultBlocks,
  selectedBlockIndex: 1,
  selectedConfigId: 25,
  align: "left",
  size: "medium",
  blockShouldDisplayOutline: false,
  svgGroups: new Map<number, string>(),
  lastUpdatedBlockId: null,
  GroupIdentifierUrlMap: new Map(),
  history: [],
  future: [],
};

const initialEditorState1: EditorState = {
  positions: {},
  svgData: "",
  backgroundImage: "",
  parametersUrl: "",
  blocks: defaultBlocks2,
  selectedBlockIndex: 1,
  selectedConfigId: 25,
  align: "left",
  size: "medium",
  blockShouldDisplayOutline: false,
  svgGroups: new Map<number, string>(),
  lastUpdatedBlockId: null,
  GroupIdentifierUrlMap: new Map(),
  history: [],
  future: [],
};

export default function App() {
  const [editorState, setEditorState] =
    useState<EditorState>(initialEditorState);
  const [editorState2, setEditorState2] =
    useState<EditorState>(initialEditorState1);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(40);
  const [cardFormat, setCardFormat] = useState<string>(
    Object.keys(PAPER_SIZES_MM)[0]
  );

  return (
    <>
      <Editor
        editorState={!isFlipped ? editorState : editorState2}
        setEditorState={!isFlipped ? setEditorState : setEditorState2}
        isFlipped={isFlipped}
        setIsFlipped={setIsFlipped}
        zoom={zoom}
        setZoom={setZoom}
        cardFormat={cardFormat}
        setCardFormat={setCardFormat}
      />
    </>
  );
}
