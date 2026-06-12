import lzString from "lz-string";

import { DEFAULT_TEMPLATE_ID, migrateTemplateId } from "./templates";
import type { MenuTemplateId } from "./templates";
import { isMenuCustomTheme, type MenuCustomTheme } from "./templates/custom-theme";

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = lzString;

export interface MenuItemAction {
  label: string;
  href?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
  tags?: string[];
  actions?: MenuItemAction[];
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuData {
  restaurantName: string;
  categories: MenuCategory[];
  templateId?: MenuTemplateId;
  customTheme?: MenuCustomTheme;
  backgroundImageUrl?: string;
  isDemo?: boolean;
}

/** Shape returned by the AI extraction server function (no ids). */
export interface ExtractedMenu {
  restaurantName: string;
  categories: {
    name: string;
    items: { name: string; description: string; price: string }[];
  }[];
  isDemo?: boolean;
}

export function createId(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  const random = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) id += chars[random[i] % chars.length];
  return id;
}

function resolveTemplateId(menu: MenuData): MenuTemplateId {
  const customTheme =
    menu.customTheme && isMenuCustomTheme(menu.customTheme) ? menu.customTheme : undefined;
  if (menu.templateId === "custom" && customTheme) return "custom";
  return migrateTemplateId(menu.templateId ?? DEFAULT_TEMPLATE_ID);
}

export function normalizeMenu(menu: MenuData): MenuData {
  const customTheme =
    menu.customTheme && isMenuCustomTheme(menu.customTheme) ? menu.customTheme : undefined;

  return {
    ...menu,
    restaurantName: menu.restaurantName?.trim() || "My Restaurant",
    templateId: resolveTemplateId({ ...menu, customTheme }),
    customTheme,
    categories: Array.isArray(menu.categories) ? menu.categories : [],
  };
}

export function withIds(raw: ExtractedMenu): MenuData {
  return normalizeMenu({
    restaurantName: raw.restaurantName || "My Restaurant",
    templateId: DEFAULT_TEMPLATE_ID,
    categories: raw.categories.map((category) => ({
      id: createId(6),
      name: category.name,
      items: category.items.map((item) => ({
        id: createId(6),
        name: item.name,
        description: item.description ?? "",
        price: item.price ?? "",
      })),
    })),
    isDemo: raw.isDemo,
  });
}

const storageKey = (id: string) => `menusnap:${id}`;

export function saveMenu(id: string, menu: MenuData): void {
  try {
    localStorage.setItem(storageKey(id), JSON.stringify(menu));
  } catch {
    // storage full or unavailable — share link still carries the data
  }
}

export function loadMenu(id: string): MenuData | null {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MenuData;
    if (!parsed || !Array.isArray(parsed.categories)) return null;
    return normalizeMenu(parsed);
  } catch {
    return null;
  }
}

/** Compress menu data so the share URL / QR code works on any device. */
export function encodeMenu(menu: MenuData): string {
  return compressToEncodedURIComponent(JSON.stringify(menu));
}

export function decodeMenu(encoded: string): MenuData | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json) as MenuData;
    if (!parsed || !Array.isArray(parsed.categories)) return null;
    return normalizeMenu(parsed);
  } catch {
    return null;
  }
}
