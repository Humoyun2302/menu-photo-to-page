import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

import { MenuBackground } from "./menu-background";
import { MenuProductCard } from "./menu-product-card";
import { THEMES } from "./theme-config";
import type { MenuTemplateId, MenuTemplateProps } from "./types";

interface ThemedMenuTemplateProps extends MenuTemplateProps {
  themeId: MenuTemplateId;
}

function CategoryHeader({
  name,
  layout,
  titleClassName,
  wrapperClassName,
}: {
  name: string;
  layout: "left-rule" | "center" | "accent-bar";
  titleClassName: string;
  wrapperClassName: string;
}) {
  if (layout === "center") {
    return (
      <div className={wrapperClassName}>
        <h2 className={titleClassName}>{name}</h2>
      </div>
    );
  }

  if (layout === "accent-bar") {
    return (
      <div className={`flex items-center gap-2.5 ${wrapperClassName}`}>
        <div className="h-5 w-1 rounded-full bg-current opacity-60" />
        <h2 className={titleClassName}>{name}</h2>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${wrapperClassName}`}>
      <h2 className={titleClassName}>{name}</h2>
      <div className="h-px flex-1 bg-current opacity-15" />
    </div>
  );
}

function HeaderDecoration({
  type,
  className = "",
}: {
  type: "line" | "diamond" | "gradient-bar" | "none";
  className?: string;
}) {
  if (type === "none") return null;

  if (type === "line") {
    return <div className={cn("mx-auto mt-5 h-px w-16", className)} />;
  }

  if (type === "diamond") {
    return (
      <div
        className={cn(
          "mx-auto mt-8 flex items-center justify-center gap-3",
          className,
        )}
      >
        <div className="h-px w-12 bg-current opacity-60" />
        <span>◆</span>
        <div className="h-px w-12 bg-current opacity-60" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500",
        className,
      )}
    />
  );
}

export function createThemeTemplate(
  themeId: MenuTemplateId,
): ComponentType<MenuTemplateProps> {
  return function ThemeTemplate(props: MenuTemplateProps) {
    return <ThemedMenuTemplate themeId={themeId} {...props} />;
  };
}

export function ThemedMenuTemplate({ menu, footer, themeId }: ThemedMenuTemplateProps) {
  const theme = THEMES[themeId];

  return (
    <MenuBackground
      backgroundImageUrl={menu.backgroundImageUrl}
      fallbackClassName={theme.page.fallbackClassName}
      overlayClassName={theme.page.overlayClassName}
    >
      <header className={theme.header.wrapperClassName}>
        <div className={theme.header.innerClassName}>
          {theme.header.eyebrow ? (
            <p className={theme.header.eyebrowClassName}>{theme.header.eyebrow}</p>
          ) : null}
          <h1 className={theme.header.titleClassName}>{menu.restaurantName}</h1>
          {theme.header.decoration ? (
            <HeaderDecoration
              type={theme.header.decoration}
              className={theme.header.decorationClassName}
            />
          ) : null}
        </div>
      </header>

      <div
        className={cn(
          "mx-auto px-4 pb-12 pt-6",
          theme.page.contentMaxWidth,
          theme.page.sectionSpacing,
        )}
      >
        {menu.categories.map((category) => (
          <section key={category.id}>
            <CategoryHeader
              name={category.name}
              layout={theme.category.headerLayout}
              titleClassName={theme.category.titleClassName}
              wrapperClassName={theme.category.wrapperClassName}
            />
            <div className={theme.category.gridClassName}>
              {category.items.map((item) => (
                <MenuProductCard key={item.id} item={item} theme={theme.card} />
              ))}
            </div>
          </section>
        ))}
        {footer}
      </div>
    </MenuBackground>
  );
}
