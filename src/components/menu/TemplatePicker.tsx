import { Check } from "lucide-react";

import { ImageUploadField } from "@/components/menu/ImageUploadField";
import {
  DEFAULT_TEMPLATE_ID,
  TEMPLATE_LIST,
  getTemplate,
  type MenuTemplateId,
} from "@/lib/menu/templates";
import type { MenuData } from "@/lib/menu/menu-data";
import { cn } from "@/lib/utils";

interface TemplatePickerProps {
  menu: MenuData;
  selectedId: MenuTemplateId;
  onSelect: (id: MenuTemplateId) => void;
  onBackgroundChange: (url: string | undefined) => void;
}

export function TemplatePicker({
  menu,
  selectedId,
  onSelect,
  onBackgroundChange,
}: TemplatePickerProps) {
  const TemplateComponent = getTemplate(selectedId, menu).component;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Choose a style</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick how your published menu will look to guests.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {TEMPLATE_LIST.map((template) => {
          const selected = selectedId === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id)}
              className={cn(
                "group relative overflow-hidden rounded-xl border-2 p-3 text-left transition-all",
                selected
                  ? "border-primary shadow-glow"
                  : "border-border hover:border-primary/50",
              )}
            >
              <div
                className="mb-3 aspect-[4/3] overflow-hidden rounded-lg border"
                style={{
                  backgroundColor: template.preview.background,
                  borderColor: template.preview.border,
                  ...(menu.backgroundImageUrl
                    ? {
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${menu.backgroundImageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}),
                }}
              >
                <div className="flex h-full flex-col gap-2 p-2">
                  <div
                    className="truncate text-[10px] font-semibold"
                    style={{ color: template.preview.text }}
                  >
                    {menu.restaurantName || "Restaurant"}
                  </div>
                  <div className="grid flex-1 grid-cols-2 gap-1 content-start">
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className="flex flex-col overflow-hidden rounded border"
                        style={{
                          borderColor: template.preview.border,
                          backgroundColor: template.preview.cardBg,
                        }}
                      >
                        <div
                          className="aspect-[4/3] w-full opacity-30"
                          style={{ backgroundColor: template.preview.text }}
                        />
                        <div className="space-y-0.5 p-1">
                          <div
                            className="h-0.5 w-full rounded-full opacity-50"
                            style={{ backgroundColor: template.preview.text }}
                          />
                          <div
                            className="h-0.5 w-5 rounded-full"
                            style={{ backgroundColor: template.preview.accent }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium">{template.name}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">{template.description}</p>
              {selected ? (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Custom background (optional)</h3>
        <p className="text-xs text-muted-foreground">
          Upload a photo to use as the menu page background. Works with any template.
        </p>
        <ImageUploadField
          value={menu.backgroundImageUrl}
          onChange={onBackgroundChange}
          label="Upload background image"
          maxDimension={1200}
        />
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="border-b bg-muted/40 px-4 py-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Live preview
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          <TemplateComponent
            menu={{
              ...menu,
              templateId: selectedId || DEFAULT_TEMPLATE_ID,
              categories: menu.categories.slice(0, 2).map((c) => ({
                ...c,
                items: c.items.slice(0, 3),
              })),
            }}
          />
        </div>
      </div>
    </div>
  );
}
