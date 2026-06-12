import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Copy, GripVertical, ImagePlus, Sparkles, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { IMAGE_ACCEPT, fileToDataUrl, isImageFile } from "@/lib/menu/image-utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { suggestItemDescription } from "@/lib/menu/ai-assist.functions";
import type { MenuItem } from "@/lib/menu/menu-data";
import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  item: MenuItem;
  categoryId: string;
  categoryName: string;
  restaurantName: string;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<MenuItem>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

export function MenuItemCard({
  item,
  categoryId,
  categoryName,
  restaurantName,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  onDuplicate,
}: MenuItemCardProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!isImageFile(file)) {
      toast.error("Please upload a JPG, PNG, or WebP image.");
      return;
    }
    try {
      onUpdate({ imageUrl: await fileToDataUrl(file, { maxDimension: 600, quality: 0.82 }) });
    } catch {
      toast.error("Couldn't read that image.");
    }
  };
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, data: { type: "item", categoryId } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAiSuggest = async () => {
    if (!item.name.trim()) {
      toast.error("Enter a dish name first.");
      return;
    }
    setAiLoading(true);
    try {
      const { description } = await suggestItemDescription({
        data: {
          itemName: item.name,
          restaurantName,
          categoryName,
        },
      });
      onUpdate({ description });
      toast.success("Description generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI suggestion failed");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.article
          ref={setNodeRef}
          style={style}
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: isDragging ? 0.85 : 1, y: 0, scale: isDragging ? 1.02 : 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={onSelect}
          className={cn(
            "group relative overflow-hidden rounded-xl border bg-card shadow-card transition-shadow",
            isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40",
            isDragging && "z-50 shadow-glow",
          )}
        >
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              aria-label="Drag to reorder"
              className="flex h-7 w-7 cursor-grab items-center justify-center rounded-md bg-background/90 text-muted-foreground shadow-sm backdrop-blur active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </div>

          <div className="relative aspect-[2/1] overflow-hidden bg-muted/40">
            <input
              ref={imageInputRef}
              type="file"
              accept={IMAGE_ACCEPT}
              className="hidden"
              onChange={(e) => {
                handleImageFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {item.imageUrl ? (
              <>
                <img
                  src={item.imageUrl}
                  alt={item.name || "Dish"}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ imageUrl: undefined });
                  }}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  imageInputRef.current?.click();
                }}
                className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent/30 hover:text-foreground"
              >
                <ImagePlus className="h-6 w-6" />
                Add photo
              </button>
            )}
          </div>

          <div className="space-y-1.5 p-3.5">
            <Input
              value={item.name}
              placeholder="Dish name"
              aria-label="Dish name"
              onChange={(e) => onUpdate({ name: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="h-auto min-w-0 border-0 bg-transparent px-0 font-display text-[0.95rem] leading-snug font-semibold shadow-none focus-visible:ring-0"
            />
            <Input
              value={item.price}
              placeholder="$0.00"
              aria-label="Price"
              onChange={(e) => onUpdate({ price: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="h-auto w-24 border-0 bg-transparent px-0 text-sm font-medium text-primary shadow-none focus-visible:ring-0"
            />
            <Textarea
              value={item.description}
              placeholder="Description — or use AI to write one"
              aria-label="Description"
              rows={2}
              onChange={(e) => onUpdate({ description: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="min-h-0 resize-none border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center justify-between gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs text-primary"
                disabled={aiLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAiSuggest();
                }}
              >
                <Sparkles className={cn("h-3.5 w-3.5", aiLoading && "animate-spin")} />
                {aiLoading ? "Writing…" : "AI describe"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove item"
                className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </motion.article>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleAiSuggest} disabled={aiLoading}>
          <Sparkles className="mr-2 h-4 w-4" />
          AI description
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onRemove} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
          <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
