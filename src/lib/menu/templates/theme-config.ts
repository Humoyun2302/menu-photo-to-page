import type { ImageAspect } from "./menu-item-image";
import type { MenuTemplateId } from "./types";

/** Every theme uses the same 2-column product card grid. */
export const PRODUCT_CARD_GRID = "grid grid-cols-2 items-start gap-2.5 sm:gap-3.5";

/** Visual tokens for a theme — card structure stays identical; only styling varies. */
export interface MenuThemeConfig {
  id: MenuTemplateId;
  name: string;
  description: string;
  preview: {
    background: string;
    accent: string;
    text: string;
    border: string;
    cardBg: string;
  };
  qrColors: { dark: string; light: string };
  page: {
    fallbackClassName: string;
    overlayClassName: string;
    contentMaxWidth: string;
    sectionSpacing: string;
  };
  header: {
    wrapperClassName?: string;
    innerClassName: string;
    eyebrow?: string;
    eyebrowClassName?: string;
    titleClassName: string;
    decoration?: "line" | "diamond" | "gradient-bar" | "none";
    decorationClassName?: string;
  };
  category: {
    wrapperClassName: string;
    titleClassName: string;
    headerLayout: "left-rule" | "center" | "accent-bar";
    gridClassName: string;
  };
  card: {
    className: string;
    titleClassName: string;
    priceClassName: string;
    descriptionClassName: string;
    tagClassName: string;
    actionClassName: string;
    imageAspect: ImageAspect;
    imageRounded: "none" | "lg" | "xl" | "2xl";
    contentClassName: string;
    placeholderClassName: string;
  };
}

export const THEMES: Record<MenuTemplateId, MenuThemeConfig> = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Warm candlelit tones with gold accents",
    preview: {
      background: "#191410",
      accent: "#c9a84c",
      text: "#f3e9d6",
      border: "#3d3428",
      cardBg: "#2a2218",
    },
    qrColors: { dark: "#191410", light: "#f3e9d6" },
    page: {
      fallbackClassName: "min-h-screen bg-[oklch(0.158_0.013_55)] text-[oklch(0.93_0.022_85)]",
      overlayClassName: "bg-[oklch(0.158_0.013_55)]/85",
      contentMaxWidth: "max-w-2xl",
      sectionSpacing: "space-y-12",
    },
    header: {
      wrapperClassName: "border-b border-[oklch(0.32_0.02_60)]",
      innerClassName: "mx-auto max-w-2xl px-5 py-14 text-center sm:py-20",
      eyebrow: "Menu",
      eyebrowClassName: "text-xs font-medium tracking-[0.35em] text-[oklch(0.8_0.125_80)] uppercase",
      titleClassName: "mt-4 font-display text-4xl font-semibold text-balance sm:text-5xl",
      decoration: "line",
      decorationClassName: "bg-[oklch(0.8_0.125_80)]",
    },
    category: {
      wrapperClassName: "mb-5",
      titleClassName: "font-display text-xl font-semibold text-[oklch(0.8_0.125_80)]",
      headerLayout: "left-rule",
      gridClassName: PRODUCT_CARD_GRID,
    },
    card: {
      className:
        "overflow-hidden rounded-xl border border-[oklch(0.32_0.02_60)] bg-[oklch(0.205_0.016_55)] shadow-[0_14px_44px_-18px_oklch(0_0_0/0.7)] transition-transform duration-300 hover:-translate-y-0.5",
      titleClassName: "font-display text-[0.9rem] font-medium leading-snug line-clamp-2",
      priceClassName: "text-sm font-medium text-[oklch(0.8_0.125_80)]",
      descriptionClassName: "text-xs leading-relaxed text-[oklch(0.68_0.027_78)] line-clamp-2",
      tagClassName:
        "rounded-md bg-[oklch(0.32_0.02_60)] px-1.5 py-0.5 text-[10px] font-medium text-[oklch(0.8_0.125_80)]",
      actionClassName:
        "mt-2 w-full rounded-lg border border-[oklch(0.8_0.125_80)]/40 px-3 py-1.5 text-center text-xs font-medium text-[oklch(0.8_0.125_80)] transition-colors hover:bg-[oklch(0.8_0.125_80)]/10",
      imageAspect: "card",
      imageRounded: "none",
      contentClassName: "flex flex-col gap-1 p-3",
      placeholderClassName: "bg-[oklch(0.25_0.016_55)]",
    },
  },

  modern: {
    id: "modern",
    name: "Modern",
    description: "Bold gradients and glass-morphism cards",
    preview: {
      background: "#0f0f12",
      accent: "#6366f1",
      text: "#ffffff",
      border: "rgba(255,255,255,0.1)",
      cardBg: "rgba(255,255,255,0.05)",
    },
    qrColors: { dark: "#0f0f12", light: "#ffffff" },
    page: {
      fallbackClassName: "min-h-screen bg-[#0f0f12] text-white",
      overlayClassName: "bg-[#0f0f12]/80",
      contentMaxWidth: "max-w-2xl",
      sectionSpacing: "space-y-10",
    },
    header: {
      innerClassName: "relative mx-auto max-w-2xl px-5 py-14 sm:py-18",
      eyebrow: "Digital Menu",
      eyebrowClassName: "text-xs font-semibold tracking-widest text-[#a5b4fc] uppercase",
      titleClassName: "mt-3 text-3xl font-bold tracking-tight sm:text-4xl",
      decoration: "gradient-bar",
    },
    category: {
      wrapperClassName: "mb-4",
      titleClassName: "text-lg font-bold tracking-tight",
      headerLayout: "accent-bar",
      gridClassName: PRODUCT_CARD_GRID,
    },
    card: {
      className:
        "overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-colors hover:bg-white/8",
      titleClassName: "text-[0.9rem] font-semibold leading-snug line-clamp-2",
      priceClassName:
        "mt-0.5 w-fit rounded-full bg-gradient-to-r from-[#6366f1] to-[#ec4899] px-2.5 py-0.5 text-xs font-semibold text-white",
      descriptionClassName: "text-xs leading-relaxed text-[#a1a1aa] line-clamp-2",
      tagClassName:
        "rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-[#a5b4fc]",
      actionClassName:
        "mt-2 w-full rounded-xl bg-gradient-to-r from-[#6366f1] to-[#ec4899] px-3 py-1.5 text-center text-xs font-semibold text-white",
      imageAspect: "card",
      imageRounded: "xl",
      contentClassName: "flex flex-col gap-1 p-3",
      placeholderClassName: "bg-white/5",
    },
  },

  rustic: {
    id: "rustic",
    name: "Rustic",
    description: "Earthy farm-to-table with warm wood tones",
    preview: {
      background: "#2a1f14",
      accent: "#c4a574",
      text: "#e8dcc8",
      border: "#4a3828",
      cardBg: "#352618",
    },
    qrColors: { dark: "#2a1f14", light: "#e8dcc8" },
    page: {
      fallbackClassName: "min-h-screen bg-[#2a1f14] text-[#e8dcc8]",
      overlayClassName: "bg-[#2a1f14]/80",
      contentMaxWidth: "max-w-2xl",
      sectionSpacing: "space-y-12",
    },
    header: {
      wrapperClassName: "border-b border-[#4a3828]",
      innerClassName: "mx-auto max-w-2xl px-5 py-14 text-center sm:py-18",
      eyebrow: "Farm to Table",
      eyebrowClassName: "text-sm tracking-[0.3em] text-[#c4a574] uppercase",
      titleClassName: "mt-3 font-display text-4xl font-semibold sm:text-5xl",
      decoration: "none",
    },
    category: {
      wrapperClassName: "mb-5",
      titleClassName: "font-display text-lg font-semibold tracking-wide text-[#c4a574] uppercase",
      headerLayout: "center",
      gridClassName: PRODUCT_CARD_GRID,
    },
    card: {
      className:
        "overflow-hidden rounded-xl border border-[#4a3828] bg-[#352618]/80 transition-transform duration-300 hover:-translate-y-0.5",
      titleClassName: "font-display text-[0.9rem] font-medium leading-snug line-clamp-2",
      priceClassName: "text-sm font-medium text-[#c4a574]",
      descriptionClassName: "text-xs leading-relaxed text-[#a89880] line-clamp-2",
      tagClassName:
        "rounded-md bg-[#4a3828] px-1.5 py-0.5 text-[10px] font-medium text-[#c4a574]",
      actionClassName:
        "mt-2 w-full rounded-lg bg-[#c4a574] px-3 py-1.5 text-center text-xs font-semibold text-[#2a1f14]",
      imageAspect: "card",
      imageRounded: "lg",
      contentClassName: "flex flex-col gap-1 p-3",
      placeholderClassName: "bg-[#3d2e1e]",
    },
  },

  neon: {
    id: "neon",
    name: "Neon",
    description: "Vibrant nightlife bar with glowing accents",
    preview: {
      background: "#0a0a0f",
      accent: "#ff00ff",
      text: "#ffffff",
      border: "rgba(255,0,255,0.3)",
      cardBg: "#12121a",
    },
    qrColors: { dark: "#0a0a0f", light: "#ffffff" },
    page: {
      fallbackClassName: "min-h-screen bg-[#0a0a0f] text-white",
      overlayClassName: "bg-[#0a0a0f]/75",
      contentMaxWidth: "max-w-2xl",
      sectionSpacing: "space-y-10",
    },
    header: {
      wrapperClassName: "border-b border-[#ff00ff]/20",
      innerClassName: "relative mx-auto max-w-2xl px-5 py-14 text-center sm:py-18",
      eyebrow: "Tonight",
      eyebrowClassName: "text-xs font-bold tracking-[0.5em] text-[#00ffff] uppercase",
      titleClassName:
        "mt-4 text-3xl font-black tracking-tight text-transparent sm:text-4xl bg-gradient-to-r from-[#ff00ff] via-white to-[#00ffff] bg-clip-text",
      decoration: "none",
    },
    category: {
      wrapperClassName: "mb-4",
      titleClassName: "text-base font-bold tracking-widest text-[#00ffff] uppercase",
      headerLayout: "left-rule",
      gridClassName: PRODUCT_CARD_GRID,
    },
    card: {
      className:
        "overflow-hidden rounded-xl border border-[#ff00ff]/30 bg-[#12121a]/80 shadow-[0_0_20px_-5px_#ff00ff40] transition-transform duration-200 hover:-translate-y-0.5",
      titleClassName: "text-[0.9rem] font-bold leading-snug line-clamp-2",
      priceClassName:
        "mt-0.5 w-fit rounded bg-[#ff00ff] px-2 py-0.5 text-xs font-bold text-black",
      descriptionClassName: "text-xs leading-relaxed text-[#a0a0b0] line-clamp-2",
      tagClassName:
        "rounded bg-[#00ffff]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#00ffff] uppercase",
      actionClassName:
        "mt-2 w-full rounded-lg bg-[#ff00ff] px-3 py-1.5 text-center text-xs font-bold text-black",
      imageAspect: "card",
      imageRounded: "lg",
      contentClassName: "flex flex-col gap-1 p-3",
      placeholderClassName: "bg-[#1a1a24]",
    },
  },

  luxury: {
    id: "luxury",
    name: "Luxury",
    description: "Cinematic spacing and refined editorial typography",
    preview: {
      background: "#0d0d0d",
      accent: "#c9a962",
      text: "#f5f0e8",
      border: "#2a2a2a",
      cardBg: "#141414",
    },
    qrColors: { dark: "#0d0d0d", light: "#f5f0e8" },
    page: {
      fallbackClassName: "min-h-screen bg-[#0d0d0d] text-[#f5f0e8]",
      overlayClassName: "bg-[#0d0d0d]/88",
      contentMaxWidth: "max-w-2xl",
      sectionSpacing: "space-y-14",
    },
    header: {
      innerClassName: "mx-auto max-w-2xl px-6 py-16 text-center sm:py-22",
      eyebrow: "Tasting menu",
      eyebrowClassName: "text-xs tracking-[0.45em] text-[#c9a962] uppercase font-light",
      titleClassName: "mt-5 font-display text-4xl font-light tracking-wide sm:text-5xl",
      decoration: "diamond",
      decorationClassName: "text-[#c9a962]",
    },
    category: {
      wrapperClassName: "mb-6",
      titleClassName:
        "text-center font-display text-lg font-light tracking-[0.15em] text-[#c9a962] uppercase",
      headerLayout: "center",
      gridClassName: PRODUCT_CARD_GRID,
    },
    card: {
      className:
        "overflow-hidden rounded-sm border border-[#2a2a2a] bg-[#141414] transition-all duration-500 hover:border-[#c9a962]/40",
      titleClassName: "font-display text-[0.9rem] font-light tracking-wide line-clamp-2",
      priceClassName: "text-xs font-light tracking-widest text-[#c9a962]",
      descriptionClassName: "text-xs font-light leading-relaxed text-[#a89f8f] line-clamp-2",
      tagClassName:
        "border border-[#c9a962]/30 px-1.5 py-0.5 text-[9px] tracking-[0.15em] text-[#c9a962] uppercase",
      actionClassName:
        "mt-2 w-full border border-[#c9a962]/50 px-3 py-1.5 text-center text-[10px] tracking-[0.2em] text-[#c9a962] uppercase",
      imageAspect: "card",
      imageRounded: "none",
      contentClassName: "flex flex-col gap-1.5 p-3.5",
      placeholderClassName: "bg-[#1a1a1a]",
    },
  },

  cafe: {
    id: "cafe",
    name: "Cafe",
    description: "Warm, cozy lifestyle cards with soft edges",
    preview: {
      background: "#faf6f1",
      accent: "#c4785a",
      text: "#3d2c1e",
      border: "#e8ddd0",
      cardBg: "#fffdf9",
    },
    qrColors: { dark: "#3d2c1e", light: "#faf6f1" },
    page: {
      fallbackClassName: "min-h-screen bg-[#faf6f1] text-[#3d2c1e]",
      overlayClassName: "bg-[#faf6f1]/90",
      contentMaxWidth: "max-w-2xl",
      sectionSpacing: "space-y-12",
    },
    header: {
      innerClassName: "mx-auto max-w-2xl px-5 py-14 text-center sm:py-18",
      eyebrow: "Welcome in",
      eyebrowClassName: "text-sm tracking-[0.3em] text-[#c4785a] uppercase",
      titleClassName: "mt-3 font-display text-4xl font-semibold italic sm:text-5xl",
      decoration: "line",
      decorationClassName: "bg-[#c4785a]",
    },
    category: {
      wrapperClassName: "mb-5",
      titleClassName: "text-center font-display text-lg font-semibold text-[#c4785a]",
      headerLayout: "center",
      gridClassName: PRODUCT_CARD_GRID,
    },
    card: {
      className:
        "overflow-hidden rounded-2xl border border-[#e8ddd0] bg-[#fffdf9] shadow-[0_8px_30px_-12px_rgba(61,44,30,0.15)] transition-transform duration-300 hover:-translate-y-1",
      titleClassName: "font-display text-[0.9rem] font-semibold leading-snug line-clamp-2",
      priceClassName: "text-sm font-semibold text-[#c4785a]",
      descriptionClassName: "text-xs leading-relaxed text-[#8b7355] italic line-clamp-2",
      tagClassName:
        "rounded-full bg-[#f3ebe3] px-2 py-0.5 text-[10px] font-medium text-[#8b6355]",
      actionClassName:
        "mt-2 w-full rounded-full bg-[#c4785a] px-3 py-1.5 text-center text-xs font-semibold text-white",
      imageAspect: "card",
      imageRounded: "2xl",
      contentClassName: "flex flex-col gap-1 p-3",
      placeholderClassName: "bg-[#f3ebe3]",
    },
  },
};

export const THEME_LIST = Object.values(THEMES);

/** Map legacy template IDs to current themes. */
export const LEGACY_TEMPLATE_MAP: Record<string, MenuTemplateId> = {
  marketplace: "classic",
  delivery: "modern",
  minimal: "classic",
  bistro: "cafe",
  elegant: "luxury",
};

export function migrateTemplateId(id: string | undefined): MenuTemplateId {
  if (!id) return "classic";
  if (id in THEMES) return id as MenuTemplateId;
  return LEGACY_TEMPLATE_MAP[id] ?? "classic";
}
