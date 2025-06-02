import { useMemo } from "react";
import { Dispatch, SetStateAction } from "react";
import { createStateSetter, FieldSetter } from "../utils/misc";
import { EditorState } from "../types/types";
import { EditorKey, editorKeys } from "../utils/editorkeys";

// map "svgData"  -> "setSvgData"
type EditorSetters = {
  [K in EditorKey as `set${Capitalize<K>}`]: FieldSetter<K>;
};

export function useEditorSetters(
  setEditorState: Dispatch<SetStateAction<EditorState>>
): EditorSetters {
  return useMemo(() => {
    const setters: Partial<EditorSetters> = {};

    editorKeys.forEach((key) => {
      const name =
        `set${key[0].toUpperCase() + key.slice(1)}` as keyof EditorSetters;
      // cast OK because we know the field names match
      setters[name] = createStateSetter(key, setEditorState) as any;
    });

    return setters as EditorSetters;
  }, [setEditorState]);
}
