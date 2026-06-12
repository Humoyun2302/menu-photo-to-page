import { useEffect } from "react";

export interface KeyboardShortcutHandlers {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onAddItem?: () => void;
  onAddSection?: () => void;
  onDelete?: () => void;
  onTogglePreview?: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handlers.onUndo?.();
        return;
      }
      if ((mod && e.key === "z" && e.shiftKey) || (mod && e.key === "y")) {
        e.preventDefault();
        handlers.onRedo?.();
        return;
      }
      if (mod && e.key === "s") {
        e.preventDefault();
        handlers.onSave?.();
        return;
      }
      if (mod && e.key === "p") {
        e.preventDefault();
        handlers.onTogglePreview?.();
        return;
      }

      if (isEditableTarget(e.target)) return;

      if (mod && e.key === "Enter") {
        e.preventDefault();
        handlers.onAddItem?.();
        return;
      }
      if (mod && e.shiftKey && e.key === "N") {
        e.preventDefault();
        handlers.onAddSection?.();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        handlers.onDelete?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers, enabled]);
}
