import { Dispatch, SetStateAction } from "react";
import { initialRows } from "../Recipients";
import {
  BlockConfig,
  BlockUpdate,
  BuildBodyDataParams,
  EditorState,
} from "../types/types";

export function downloadFile(
  content: BlobPart,
  fileName: string,
  contentType: string
): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildBodyData({
  blocks,
  paperWidth,
  paperHeight,
  selectedConfigId,
  pplaceholders,
  recipientId,
}: BuildBodyDataParams) {
  return {
    fields: blocks.map((b) => ({
      text: b.config.text.trim() || "EMPTY", // Else Inkloom will reject the request (without valid text)
      widthInMillimeters: b.config.widthInMillimeters,
      fontSize: b.config.fontSize,
      fontName: b.config.fontName,
      path: b.config.path,
      leftOffsetInMillimeters: b.config.leftOffsetInMillimeters,
      topOffsetInMillimeters: b.config.topOffsetInMillimeters,
      topdragOffsetInMillimeters: b.config.topdragOffsetInMillimeters,
      leftdragOffsetInMillimeters: b.config.leftdragOffsetInMillimeters,
      alignment: b.config.alignment,
      multiline: b.config.multiline,
      lineHeight: b.config.lineHeight,
      rotate: b.config.rotation,
      rgbColor: `${b.config.r},${b.config.g},${b.config.b}`,
      id: `${b.id}`,
    })),
    config: {
      paperWidthInMillimeters: paperWidth,
      paperHeightInMillimeters: paperHeight,
      format: "svg",
    },
    configId: selectedConfigId,
    placeholdersValues:
      recipientId == null
        ? pplaceholders.reduce<Record<string, string>>((acc, ph) => {
            if (ph.name) {
              acc[ph.name] = ph.value;
            }
            return acc;
          }, {})
        : pplaceholders.reduce<Record<string, string>>((acc, ph) => {
            if (ph.name) {
              const person = initialRows?.find((e) => e?.id == recipientId);
              //@ts-ignore
              acc[ph.name] = person?.[ph.name.toLowerCase()] ?? ph.value;
            }
            return acc;
          }, {}),
    isTemplate: recipientId == 0,
  };
}

export type FieldSetter<K extends keyof EditorState> = (
  value: EditorState[K] | ((prev: EditorState[K]) => EditorState[K])
) => void;

export function createStateSetter<K extends keyof EditorState>(
  key: K,
  setState: Dispatch<SetStateAction<EditorState>>
): FieldSetter<K> {
  return (value) =>
    setState((prev) => ({
      ...prev,
      [key]:
        typeof value === "function"
          ? (value as (p: EditorState[K]) => EditorState[K])(prev[key])
          : value,
    }));
}

export function normaliseEvent(update: BlockUpdate): {
  name: keyof BlockConfig;
  value: any;
  inputType?: string;
  checked?: boolean;
} {
  if (update?.source === "event") {
    const { name, value, type } = update.event.target;
    const checked =
      "checked" in update.event.target
        ? (update.event.target as HTMLInputElement).checked
        : undefined;
    return { name: name as keyof BlockConfig, value, inputType: type, checked };
  }

  return {
    name: update?.name,
    value: update?.value,
    inputType: update?.inputType,
  };
}
