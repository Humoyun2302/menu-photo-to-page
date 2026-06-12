import { useCallback, useEffect, useRef, useState } from "react";

import {
  createId,
  normalizeMenu,
  saveMenu,
  type MenuCategory,
  type MenuData,
  type MenuItem,
} from "@/lib/menu/menu-data";
import type { MenuTemplateId } from "@/lib/menu/templates";
import type { MenuCustomTheme } from "@/lib/menu/templates/custom-theme";

const MAX_HISTORY = 50;
const AUTOSAVE_MS = 800;

const draftKey = (id: string) => `menusnap:draft:${id}`;

function cloneMenu(menu: MenuData): MenuData {
  return structuredClone(menu);
}

export interface MenuEditorActions {
  setRestaurantName: (name: string) => void;
  setTemplateId: (id: MenuTemplateId) => void;
  applyCustomTheme: (theme: MenuCustomTheme) => void;
  setBackgroundImageUrl: (url: string | undefined) => void;
  updateCategory: (categoryId: string, patch: Partial<MenuCategory>) => void;
  removeCategory: (categoryId: string) => void;
  addCategory: () => void;
  updateItem: (categoryId: string, itemId: string, patch: Partial<MenuItem>) => void;
  removeItem: (categoryId: string, itemId: string) => void;
  addItem: (categoryId: string) => string;
  duplicateItem: (categoryId: string, itemId: string) => void;
  moveCategory: (fromIndex: number, toIndex: number) => void;
  moveItem: (categoryId: string, fromIndex: number, toIndex: number) => void;
  moveItemToCategory: (
    itemId: string,
    fromCategoryId: string,
    toCategoryId: string,
    toIndex: number,
  ) => void;
  undo: () => void;
  redo: () => void;
  replaceMenu: (menu: MenuData) => void;
}

export interface MenuEditorState {
  menu: MenuData;
  draftId: string;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  lastSavedAt: Date | null;
  isSaving: boolean;
  actions: MenuEditorActions;
}

export function useMenuEditor(initialMenu: MenuData, existingDraftId?: string): MenuEditorState {
  const draftIdRef = useRef(existingDraftId ?? createId());
  const [menu, setMenuState] = useState(() => normalizeMenu(initialMenu));
  const historyRef = useRef<MenuData[]>([normalizeMenu(initialMenu)]);
  const historyIndexRef = useRef(0);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipHistory = useRef(false);

  const syncHistory = useCallback(() => {
    setHistoryIndex(historyIndexRef.current);
  }, []);

  const commit = useCallback(
    (updater: (current: MenuData) => MenuData) => {
      setMenuState((current) => {
        const next = normalizeMenu(updater(current));
        if (!skipHistory.current) {
          const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1);
          historyRef.current = [...trimmed, cloneMenu(next)].slice(-MAX_HISTORY);
          historyIndexRef.current = historyRef.current.length - 1;
          syncHistory();
        }
        setIsDirty(true);
        return next;
      });
    },
    [syncHistory],
  );

  const replaceMenu = useCallback(
    (next: MenuData) => {
      const normalized = normalizeMenu(next);
      setMenuState(normalized);
      historyRef.current = [cloneMenu(normalized)];
      historyIndexRef.current = 0;
      syncHistory();
      setIsDirty(true);
    },
    [syncHistory],
  );

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    skipHistory.current = true;
    setMenuState(cloneMenu(historyRef.current[historyIndexRef.current]));
    skipHistory.current = false;
    syncHistory();
    setIsDirty(true);
  }, [syncHistory]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    skipHistory.current = true;
    setMenuState(cloneMenu(historyRef.current[historyIndexRef.current]));
    skipHistory.current = false;
    syncHistory();
    setIsDirty(true);
  }, [syncHistory]);

  useEffect(() => {
    if (!isDirty) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      setIsSaving(true);
      try {
        saveMenu(draftIdRef.current, menu);
        localStorage.setItem(draftKey(draftIdRef.current), JSON.stringify(menu));
        setLastSavedAt(new Date());
        setIsDirty(false);
      } catch {
        // storage unavailable
      } finally {
        setIsSaving(false);
      }
    }, AUTOSAVE_MS);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [menu, isDirty]);

  const actions: MenuEditorActions = {
    setRestaurantName: (name) => commit((m) => ({ ...m, restaurantName: name })),
    setTemplateId: (templateId) =>
      commit((m) => ({
        ...m,
        templateId,
        customTheme: templateId === "custom" ? m.customTheme : undefined,
      })),
    applyCustomTheme: (customTheme) =>
      commit((m) => ({ ...m, templateId: "custom", customTheme })),
    setBackgroundImageUrl: (backgroundImageUrl) =>
      commit((m) => ({ ...m, backgroundImageUrl })),
    updateCategory: (categoryId, patch) =>
      commit((m) => ({
        ...m,
        categories: m.categories.map((c) =>
          c.id === categoryId ? { ...c, ...patch } : c,
        ),
      })),
    removeCategory: (categoryId) =>
      commit((m) => ({
        ...m,
        categories: m.categories.filter((c) => c.id !== categoryId),
      })),
    addCategory: () =>
      commit((m) => ({
        ...m,
        categories: [
          ...m.categories,
          { id: createId(6), name: "New section", items: [] },
        ],
      })),
    updateItem: (categoryId, itemId, patch) =>
      commit((m) => ({
        ...m,
        categories: m.categories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                items: c.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
              }
            : c,
        ),
      })),
    removeItem: (categoryId, itemId) =>
      commit((m) => ({
        ...m,
        categories: m.categories.map((c) =>
          c.id === categoryId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c,
        ),
      })),
    addItem: (categoryId) => {
      const newId = createId(6);
      commit((m) => ({
        ...m,
        categories: m.categories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                items: [
                  ...c.items,
                  { id: newId, name: "", description: "", price: "" },
                ],
              }
            : c,
        ),
      }));
      return newId;
    },
    duplicateItem: (categoryId, itemId) =>
      commit((m) => ({
        ...m,
        categories: m.categories.map((c) => {
          if (c.id !== categoryId) return c;
          const idx = c.items.findIndex((i) => i.id === itemId);
          if (idx < 0) return c;
          const source = c.items[idx];
          const copy: MenuItem = {
            ...source,
            id: createId(6),
            name: source.name ? `${source.name} (copy)` : "",
          };
          const items = [...c.items];
          items.splice(idx + 1, 0, copy);
          return { ...c, items };
        }),
      })),
    moveCategory: (fromIndex, toIndex) =>
      commit((m) => {
        const categories = [...m.categories];
        const [moved] = categories.splice(fromIndex, 1);
        if (!moved) return m;
        categories.splice(toIndex, 0, moved);
        return { ...m, categories };
      }),
    moveItem: (categoryId, fromIndex, toIndex) =>
      commit((m) => ({
        ...m,
        categories: m.categories.map((c) => {
          if (c.id !== categoryId) return c;
          const items = [...c.items];
          const [moved] = items.splice(fromIndex, 1);
          if (!moved) return c;
          items.splice(toIndex, 0, moved);
          return { ...c, items };
        }),
      })),
    moveItemToCategory: (itemId, fromCategoryId, toCategoryId, toIndex) =>
      commit((m) => {
        let movedItem: MenuItem | null = null;
        const categories = m.categories.map((c) => {
          if (c.id !== fromCategoryId) return c;
          const item = c.items.find((i) => i.id === itemId);
          if (!item) return c;
          movedItem = item;
          return { ...c, items: c.items.filter((i) => i.id !== itemId) };
        });
        if (!movedItem) return m;
        return {
          ...m,
          categories: categories.map((c) => {
            if (c.id !== toCategoryId) return c;
            const items = [...c.items];
            items.splice(toIndex, 0, movedItem!);
            return { ...c, items };
          }),
        };
      }),
    undo,
    redo,
    replaceMenu,
  };

  return {
    menu,
    draftId: draftIdRef.current,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < historyRef.current.length - 1,
    isDirty,
    lastSavedAt,
    isSaving,
    actions,
  };
}
