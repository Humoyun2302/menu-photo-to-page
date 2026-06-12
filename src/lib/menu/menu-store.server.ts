import type { MenuData } from "./menu-data";

const STORE_NAME = "menusnap-menus";

type DevStore = Map<string, MenuData>;

declare global {
  // eslint-disable-next-line no-var
  var __menusnapDevStore: DevStore | undefined;
}

function devStore(): DevStore {
  if (!globalThis.__menusnapDevStore) {
    globalThis.__menusnapDevStore = new Map();
  }
  return globalThis.__menusnapDevStore;
}

async function netlifyStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

export async function savePublishedMenu(menuId: string, menu: MenuData): Promise<void> {
  try {
    const store = await netlifyStore();
    await store.setJSON(menuId, menu);
    return;
  } catch {
    devStore().set(menuId, menu);
  }
}

export async function loadPublishedMenu(menuId: string): Promise<MenuData | null> {
  try {
    const store = await netlifyStore();
    const menu = await store.get(menuId, { type: "json" });
    if (!menu || typeof menu !== "object") return null;
    return menu as MenuData;
  } catch {
    return devStore().get(menuId) ?? null;
  }
}
