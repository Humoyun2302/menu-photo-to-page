import type { ReactNode } from "react";

import type { MenuData } from "../menu-data";

/** Product-card themes — same 2-column grid; only visual styling varies. */
export type MenuTemplateId =
  | "classic"
  | "modern"
  | "rustic"
  | "neon"
  | "luxury"
  | "cafe"
  | "custom";

export interface MenuTemplateProps {
  menu: MenuData;
  footer?: ReactNode;
}

export interface MenuTemplateMeta {
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
}
