/** AI-generated style stored on the menu — colors use inline styles at render time. */
export interface MenuCustomTheme {
  name: string;
  description: string;
  prompt: string;
  colors: {
    background: string;
    accent: string;
    text: string;
    border: string;
    cardBg: string;
  };
  headerDecoration: "none" | "line" | "diamond";
  categoryHeader: "center" | "left-rule" | "accent-bar";
  cardRoundness: "sharp" | "rounded" | "pill";
  fontFeel: "serif" | "sans" | "bold" | "light";
}

export const CARD_ROUNDNESS_CLASS: Record<MenuCustomTheme["cardRoundness"], string> = {
  sharp: "rounded-sm",
  rounded: "rounded-xl",
  pill: "rounded-2xl",
};

export const FONT_TITLE_CLASS: Record<MenuCustomTheme["fontFeel"], string> = {
  serif: "font-display",
  sans: "",
  bold: "font-bold",
  light: "font-light",
};

export function isMenuCustomTheme(value: unknown): value is MenuCustomTheme {
  if (!value || typeof value !== "object") return false;
  const t = value as MenuCustomTheme;
  return (
    typeof t.name === "string" &&
    typeof t.description === "string" &&
    typeof t.prompt === "string" &&
    !!t.colors?.background &&
    !!t.colors?.accent &&
    !!t.colors?.text
  );
}
