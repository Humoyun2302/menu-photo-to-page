import type { ComponentType } from "react";

import type { MenuData } from "../menu-data";
import { CustomMenuTemplate } from "./custom-menu-template";
import type { MenuCustomTheme } from "./custom-theme";
import { migrateTemplateId, THEMES } from "./theme-config";
import { createThemeTemplate } from "./themed-menu-template";
import type { MenuTemplateId, MenuTemplateMeta, MenuTemplateProps } from "./types";

export const DEFAULT_TEMPLATE_ID: MenuTemplateId = "classic";

export type { MenuTemplateId, MenuTemplateMeta, MenuTemplateProps };
export { migrateTemplateId, THEMES, LEGACY_TEMPLATE_MAP, PRODUCT_CARD_GRID } from "./theme-config";
export type { MenuCustomTheme } from "./custom-theme";

interface TemplateEntry extends MenuTemplateMeta {
  component: ComponentType<MenuTemplateProps>;
}

const PRESET_TEMPLATES: Record<Exclude<MenuTemplateId, "custom">, TemplateEntry> = {
  classic: { ...THEMES.classic, component: createThemeTemplate("classic") },
  modern: { ...THEMES.modern, component: createThemeTemplate("modern") },
  rustic: { ...THEMES.rustic, component: createThemeTemplate("rustic") },
  neon: { ...THEMES.neon, component: createThemeTemplate("neon") },
  luxury: { ...THEMES.luxury, component: createThemeTemplate("luxury") },
  cafe: { ...THEMES.cafe, component: createThemeTemplate("cafe") },
};

function customTemplateEntry(theme?: MenuCustomTheme): TemplateEntry {
  const colors = theme?.colors ?? {
    background: "#f5f5f7",
    accent: "#6366f1",
    text: "#1a1a1a",
    border: "#e5e5ea",
    cardBg: "#ffffff",
  };

  return {
    id: "custom",
    name: theme?.name ?? "Custom AI",
    description: theme?.description ?? "AI-generated style from your prompt",
    preview: colors,
    qrColors: { dark: colors.text, light: colors.background },
    component: CustomMenuTemplate,
  };
}

export const TEMPLATE_LIST = Object.values(PRESET_TEMPLATES);

export function isValidTemplateId(id: string): id is MenuTemplateId {
  return id === "custom" || id in PRESET_TEMPLATES;
}

export function getTemplate(
  id: string | undefined,
  menu?: Pick<MenuData, "customTheme">,
): TemplateEntry {
  if (id === "custom") {
    return customTemplateEntry(menu?.customTheme);
  }
  const resolved = migrateTemplateId(id);
  return PRESET_TEMPLATES[resolved];
}

export function resolveTemplateId(menu: MenuData): MenuTemplateId {
  if (menu.templateId === "custom" && menu.customTheme) return "custom";
  return migrateTemplateId(menu.templateId);
}

export function getQrColors(menu: MenuData): { dark: string; light: string } {
  return getTemplate(menu.templateId, menu).qrColors;
}
