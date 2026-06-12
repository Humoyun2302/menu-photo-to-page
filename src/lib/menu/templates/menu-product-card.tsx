import type { MenuItem } from "../menu-data";
import { cn } from "@/lib/utils";
import { MenuItemImage, MenuItemImagePlaceholder } from "./menu-item-image";
import type { MenuThemeConfig } from "./theme-config";

interface MenuProductCardProps {
  item: MenuItem;
  theme: MenuThemeConfig["card"];
  className?: string;
}

/**
 * Universal food product card — every dish is always displayed as a modern
 * ecommerce-style card regardless of theme. Themes only change visual tokens.
 */
export function MenuProductCard({ item, theme, className }: MenuProductCardProps) {
  const hasTags = item.tags && item.tags.length > 0;
  const hasActions = item.actions && item.actions.length > 0;

  return (
    <article className={cn("flex flex-col", theme.className, className)}>
      {item.imageUrl ? (
        <MenuItemImage
          src={item.imageUrl}
          alt={item.name}
          rounded={theme.imageRounded}
          aspect={theme.imageAspect}
          layout="fill"
        />
      ) : (
        <MenuItemImagePlaceholder
          rounded={theme.imageRounded}
          aspect={theme.imageAspect}
          layout="fill"
          className={theme.placeholderClassName}
        />
      )}

      <div className={theme.contentClassName}>
        {hasTags ? (
          <div className="flex flex-wrap gap-1">
            {item.tags!.map((tag) => (
              <span key={tag} className={theme.tagClassName}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <h3 className={cn("text-pretty", theme.titleClassName)}>{item.name}</h3>

        {item.price ? <p className={theme.priceClassName}>{item.price}</p> : null}

        {item.description ? (
          <p className={theme.descriptionClassName}>{item.description}</p>
        ) : null}

        {hasActions ? (
          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            {item.actions!.map((action) =>
              action.href ? (
                <a
                  key={action.label}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={theme.actionClassName}
                >
                  {action.label}
                </a>
              ) : (
                <span key={action.label} className={theme.actionClassName}>
                  {action.label}
                </span>
              ),
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
