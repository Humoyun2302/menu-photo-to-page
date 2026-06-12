import lzString from "lz-string";

import { decodeMenu as decodeMenuLegacy, createId, normalizeMenu, type MenuData } from "./menu-data";
import type { MenuTemplateId } from "./templates";
import type { MenuCustomTheme } from "./templates/custom-theme";

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = lzString;

/** Compact wire format — no internal IDs, short keys. */
interface CompactShareMenu {
  v: 1;
  r: string;
  t?: MenuTemplateId;
  ct?: MenuCustomTheme;
  bg?: string;
  c: {
    n: string;
    i: {
      n: string;
      d?: string;
      p?: string;
      u?: string;
      tg?: string[];
    }[];
  }[];
}

export function menuToCompactShare(menu: MenuData): CompactShareMenu {
  return {
    v: 1,
    r: menu.restaurantName,
    t: menu.templateId,
    ct: menu.customTheme,
    bg: menu.backgroundImageUrl,
    c: menu.categories.map((category) => ({
      n: category.name,
      i: category.items.map((item) => ({
        n: item.name,
        d: item.description || undefined,
        p: item.price || undefined,
        u: item.imageUrl,
        tg: item.tags?.length ? item.tags : undefined,
      })),
    })),
  };
}

export function compactShareToMenu(payload: CompactShareMenu): MenuData {
  return normalizeMenu({
    restaurantName: payload.r,
    templateId: payload.t,
    customTheme: payload.ct,
    backgroundImageUrl: payload.bg,
    categories: payload.c.map((category) => ({
      id: createId(6),
      name: category.n,
      items: category.i.map((item) => ({
        id: createId(6),
        name: item.n,
        description: item.d ?? "",
        price: item.p ?? "",
        imageUrl: item.u,
        tags: item.tg,
      })),
    })),
  });
}

/** Smaller hash fallback when cloud publish is unavailable. */
export function encodeMenuCompact(menu: MenuData): string {
  return compressToEncodedURIComponent(JSON.stringify(menuToCompactShare(menu)));
}

export function decodeMenuCompact(encoded: string): MenuData | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json) as CompactShareMenu;
    if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.c)) return null;
    return compactShareToMenu(parsed);
  } catch {
    return null;
  }
}

export function decodeSharePayload(encoded: string): MenuData | null {
  return decodeMenuCompact(encoded) ?? decodeMenuLegacy(encoded);
}

export function buildShareUrl(origin: string, menuId: string, hashFallback?: string): string {
  const base = `${origin}/menu/${menuId}`;
  return hashFallback ? `${base}#d=${hashFallback}` : base;
}

export function parseShareHash(hash: string): string | null {
  const match = hash.match(/[#&]d=([^&]+)/);
  return match?.[1] ?? null;
}
