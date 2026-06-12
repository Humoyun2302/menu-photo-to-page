import { cn } from "@/lib/utils";

import { MenuBackground } from "./menu-background";
import {
  CARD_ROUNDNESS_CLASS,
  FONT_TITLE_CLASS,
  type MenuCustomTheme,
} from "./custom-theme";
import { MenuItemImage, MenuItemImagePlaceholder } from "./menu-item-image";
import { PRODUCT_CARD_GRID } from "./theme-config";
import type { MenuTemplateProps } from "./types";

function CategoryHeader({
  name,
  layout,
  color,
}: {
  name: string;
  layout: MenuCustomTheme["categoryHeader"];
  color: string;
}) {
  if (layout === "center") {
    return (
      <h2
        className="mb-4 text-center text-lg font-semibold"
        style={{ color }}
      >
        {name}
      </h2>
    );
  }

  if (layout === "accent-bar") {
    return (
      <div className="mb-4 flex items-center gap-2.5">
        <div className="h-5 w-1 rounded-full" style={{ backgroundColor: color }} />
        <h2 className="text-lg font-semibold" style={{ color }}>
          {name}
        </h2>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 className="text-lg font-semibold" style={{ color }}>
        {name}
      </h2>
      <div className="h-px flex-1 opacity-20" style={{ backgroundColor: color }} />
    </div>
  );
}

function CustomProductCard({
  item,
  theme,
}: {
  item: MenuTemplateProps["menu"]["categories"][0]["items"][0];
  theme: MenuCustomTheme;
}) {
  const round = CARD_ROUNDNESS_CLASS[theme.cardRoundness];
  const titleFont = FONT_TITLE_CLASS[theme.fontFeel];

  return (
    <article
      className={cn("flex flex-col overflow-hidden border shadow-sm transition-transform hover:-translate-y-0.5", round)}
      style={{
        backgroundColor: theme.colors.cardBg,
        borderColor: theme.colors.border,
      }}
    >
      {item.imageUrl ? (
        <MenuItemImage
          src={item.imageUrl}
          alt={item.name}
          rounded={theme.cardRoundness === "pill" ? "2xl" : theme.cardRoundness === "rounded" ? "xl" : "none"}
          aspect="card"
          layout="fill"
        />
      ) : (
        <MenuItemImagePlaceholder
          rounded={theme.cardRoundness === "pill" ? "2xl" : theme.cardRoundness === "rounded" ? "xl" : "none"}
          aspect="card"
          layout="fill"
          className="opacity-60"
          style={{ backgroundColor: theme.colors.border }}
        />
      )}

      <div className="flex flex-col gap-1 p-3">
        {item.tags?.length ? (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `${theme.colors.accent}22`,
                  color: theme.colors.accent,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <h3
          className={cn("text-[0.9rem] leading-snug line-clamp-2", titleFont)}
          style={{ color: theme.colors.text }}
        >
          {item.name}
        </h3>

        {item.price ? (
          <p className="text-sm font-semibold" style={{ color: theme.colors.accent }}>
            {item.price}
          </p>
        ) : null}

        {item.description ? (
          <p
            className="text-xs leading-relaxed line-clamp-2 opacity-75"
            style={{ color: theme.colors.text }}
          >
            {item.description}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function CustomMenuTemplate({ menu, footer }: MenuTemplateProps) {
  const theme = menu.customTheme;
  if (!theme) return null;

  const { colors } = theme;
  const titleClass = FONT_TITLE_CLASS[theme.fontFeel];

  return (
    <MenuBackground
      backgroundImageUrl={menu.backgroundImageUrl}
      fallbackClassName="min-h-screen"
      overlayClassName="min-h-screen"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <header>
        <div className="mx-auto max-w-2xl px-5 py-14 text-center sm:py-18">
          <p
            className="text-xs tracking-[0.3em] uppercase opacity-70"
            style={{ color: colors.accent }}
          >
            Menu
          </p>
          <h1
            className={cn("mt-3 text-4xl sm:text-5xl", titleClass)}
            style={{ color: colors.text }}
          >
            {menu.restaurantName}
          </h1>
          {theme.headerDecoration === "line" ? (
            <div
              className="mx-auto mt-5 h-px w-16"
              style={{ backgroundColor: colors.accent }}
            />
          ) : null}
          {theme.headerDecoration === "diamond" ? (
            <div
              className="mx-auto mt-6 flex items-center justify-center gap-3"
              style={{ color: colors.accent }}
            >
              <div className="h-px w-12 bg-current opacity-60" />
              <span>◆</span>
              <div className="h-px w-12 bg-current opacity-60" />
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-12 px-4 pb-12 pt-4">
        {menu.categories.map((category) => (
          <section key={category.id}>
            <CategoryHeader
              name={category.name}
              layout={theme.categoryHeader}
              color={colors.accent}
            />
            <div className={PRODUCT_CARD_GRID}>
              {category.items.map((item) => (
                <CustomProductCard key={item.id} item={item} theme={theme} />
              ))}
            </div>
          </section>
        ))}
        {footer}
      </div>
    </MenuBackground>
  );
}
