import { useKeyboard } from "./useKeyboard";

export function useKeyboardShortcuts({
  onDelete,
  onUndo,
  onRedo,
}: {
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
}) {
  useKeyboard("Backspace", onDelete, { ctrl: true });
  useKeyboard("z", onUndo, { ctrl: true });
  useKeyboard("y", onRedo, { ctrl: true });
}
