import type { MenuItem } from "../menu-data";
import { MenuProductCard } from "./menu-product-card";
import { THEMES } from "./theme-config";
import type { MenuTemplateId } from "./types";

/** @deprecated Use MenuProductCard with theme tokens directly. */
export function MenuItemCard({
  item,
  themeId = "classic",
}: {
  item: MenuItem;
  themeId?: MenuTemplateId;
}) {
  return <MenuProductCard item={item} theme={THEMES[themeId].card} />;
}
