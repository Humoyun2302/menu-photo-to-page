import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

import { AiStyleGenerator } from "@/components/menu/AiStyleGenerator";
import { ImageUploadField } from "@/components/menu/ImageUploadField";
import { TEMPLATE_LIST, type MenuTemplateId } from "@/lib/menu/templates";
import type { MenuCustomTheme } from "@/lib/menu/templates/custom-theme";
import type { MenuData } from "@/lib/menu/menu-data";
import { cn } from "@/lib/utils";

interface TemplateMarketplaceProps {
  menu: MenuData;
  selectedId: MenuTemplateId;
  onSelect: (id: MenuTemplateId) => void;
  onApplyCustomTheme: (theme: MenuCustomTheme) => void;
  onBackgroundChange: (url: string | undefined) => void;
}

export function TemplateMarketplace({
  menu,
  selectedId,
  onSelect,
  onApplyCustomTheme,
  onBackgroundChange,
}: TemplateMarketplaceProps) {
  const isCustomActive = selectedId === "custom";

  return (
    <section className="space-y-5">
      <AiStyleGenerator
        restaurantName={menu.restaurantName}
        activeCustomTheme={menu.customTheme}
        isActive={isCustomActive}
        onApply={onApplyCustomTheme}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Style marketplace</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every style uses modern product cards — pick the mood that fits your brand.
          </p>
        </div>
        <span className="hidden shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary sm:flex">
          <Sparkles className="h-3.5 w-3.5" />
          {TEMPLATE_LIST.length} styles
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {TEMPLATE_LIST.map((template, index) => {
          const selected = selectedId === template.id;
          return (
            <motion.button
              key={template.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 24 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(template.id)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 p-3 text-left transition-colors",
                selected
                  ? "border-primary shadow-glow"
                  : "border-border hover:border-primary/50 hover:shadow-card",
              )}
            >
              <div
                className="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl border"
                style={{
                  backgroundColor: template.preview.background,
                  borderColor: template.preview.border,
                  ...(menu.backgroundImageUrl
                    ? {
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url(${menu.backgroundImageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}),
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="flex h-full flex-col gap-2 p-2.5">
                  <p
                    className="truncate text-[10px] font-bold tracking-wide"
                    style={{ color: template.preview.text }}
                  >
                    {menu.restaurantName || "Restaurant"}
                  </p>
                  <div className="grid flex-1 grid-cols-2 gap-1.5 content-start">
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className="flex flex-col overflow-hidden rounded-md border"
                        style={{
                          borderColor: template.preview.border,
                          backgroundColor: template.preview.cardBg,
                        }}
                      >
                        <div
                          className="aspect-[4/3] w-full opacity-30"
                          style={{ backgroundColor: template.preview.text }}
                        />
                        <div className="space-y-1 p-1.5">
                          <div
                            className="h-1 w-full rounded-full opacity-50"
                            style={{ backgroundColor: template.preview.text }}
                          />
                          <div
                            className="h-1 w-2/3 rounded-full opacity-30"
                            style={{ backgroundColor: template.preview.text }}
                          />
                          <div
                            className="h-1 w-6 rounded-full"
                            style={{ backgroundColor: template.preview.accent }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {selected ? (
                  <motion.span
                    layoutId="template-check"
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </motion.span>
                ) : null}
              </div>
              <p className="text-sm font-semibold">{template.name}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {template.description}
              </p>
            </motion.button>
          );
        })}
      </div>

      <div className="rounded-xl border bg-card/50 p-4">
        <h3 className="text-sm font-medium">Custom background</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Layer a photo behind any template — great for ambiance shots of your dining room.
        </p>
        <div className="mt-3">
          <ImageUploadField
            value={menu.backgroundImageUrl}
            onChange={onBackgroundChange}
            label="Upload background image"
            maxDimension={1200}
          />
        </div>
      </div>
    </section>
  );
}
