// utils/editorKeys.ts
export const editorKeys = [
  "positions",
  "svgData",
  "backgroundImage",
  "blocks",
  "selectedBlockIndex",
  "selectedConfigId",
  "blockShouldDisplayOutline",
  "svgGroupsIdentifierContentMap",
  "lastUpdatedBlockId",
  "GroupIdentifierUrlMap",
  "history",
  "future",
  "backgroundImageOpacity",
  "placeholders",
  "textColor",
] as const;

export type EditorKey = (typeof editorKeys)[number]; // Creates union of valid keys
