import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { MenuItemCard } from "@/components/menu/MenuItemCard";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MenuCategory, MenuItem } from "@/lib/menu/menu-data";
import { cn } from "@/lib/utils";

interface CategorySectionProps {
  category: MenuCategory;
  restaurantName: string;
  selectedItemId: string | null;
  onSelectItem: (itemId: string | null) => void;
  onUpdateCategory: (patch: Partial<MenuCategory>) => void;
  onRemoveCategory: () => void;
  onAddItem: () => void;
  onUpdateItem: (itemId: string, patch: Partial<MenuItem>) => void;
  onRemoveItem: (itemId: string) => void;
  onDuplicateItem: (itemId: string) => void;
  onMoveItem: (fromIndex: number, toIndex: number) => void;
  dragHandle?: boolean;
}

function CategoryHeader({
  category,
  onUpdateCategory,
  onRemoveCategory,
  dragListeners,
  dragAttributes,
}: {
  category: MenuCategory;
  onUpdateCategory: (patch: Partial<MenuCategory>) => void;
  onRemoveCategory: () => void;
  dragListeners?: Record<string, unknown>;
  dragAttributes?: Record<string, unknown>;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex items-center gap-2">
          {dragListeners ? (
            <button
              type="button"
              aria-label="Drag section"
              className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-accent active:cursor-grabbing"
              {...dragAttributes}
              {...dragListeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          ) : null}
          <Input
            value={category.name}
            onChange={(e) => onUpdateCategory({ name: e.target.value })}
            aria-label="Section name"
            className="h-10 min-w-0 flex-1 border-0 bg-transparent font-display text-lg font-semibold shadow-none focus-visible:ring-0"
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Remove section"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={onRemoveCategory}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onRemoveCategory} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete section
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function SortableCategoryWrapper({
  category,
  children,
  onDragHandle,
}: {
  category: MenuCategory;
  children: (props: {
    dragListeners: Record<string, unknown>;
    dragAttributes: Record<string, unknown>;
  }) => React.ReactNode;
  onDragHandle?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `category-${category.id}`,
    data: { type: "category", categoryId: category.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={cn(
        "space-y-4 rounded-xl border bg-card/50 p-4 backdrop-blur-sm",
        isDragging && "z-40 opacity-80 ring-2 ring-primary/40",
      )}
    >
      {onDragHandle ? children({ dragListeners: listeners, dragAttributes: attributes }) : children({ dragListeners: {}, dragAttributes: {} })}
    </section>
  );
}

export function CategorySection({
  category,
  restaurantName,
  selectedItemId,
  onSelectItem,
  onUpdateCategory,
  onRemoveCategory,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onDuplicateItem,
  onMoveItem,
  dragHandle = true,
}: CategorySectionProps) {
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const item = category.items.find((i) => i.id === event.active.id);
    setActiveItem(item ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = category.items.findIndex((i) => i.id === active.id);
    const toIndex = category.items.findIndex((i) => i.id === over.id);
    if (fromIndex >= 0 && toIndex >= 0) onMoveItem(fromIndex, toIndex);
  };

  return (
    <SortableCategoryWrapper category={category} onDragHandle={dragHandle}>
      {({ dragListeners, dragAttributes }) => (
        <>
          <CategoryHeader
            category={category}
            onUpdateCategory={onUpdateCategory}
            onRemoveCategory={onRemoveCategory}
            dragListeners={dragHandle ? dragListeners : undefined}
            dragAttributes={dragHandle ? dragAttributes : undefined}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={category.items.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid gap-3 sm:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {category.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      categoryId={category.id}
                      categoryName={category.name}
                      restaurantName={restaurantName}
                      isSelected={selectedItemId === item.id}
                      onSelect={() => onSelectItem(item.id)}
                      onUpdate={(patch) => onUpdateItem(item.id, patch)}
                      onRemove={() => onRemoveItem(item.id)}
                      onDuplicate={() => onDuplicateItem(item.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
              {activeItem ? (
                <div className="w-64 rotate-2 rounded-xl border-2 border-primary bg-card p-3 shadow-glow opacity-95">
                  <p className="font-display font-semibold">{activeItem.name || "Menu item"}</p>
                  {activeItem.price ? (
                    <p className="text-sm text-primary">{activeItem.price}</p>
                  ) : null}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          <Button variant="secondary" size="sm" onClick={onAddItem} className="w-full sm:w-auto">
            <Plus className="mr-1.5 h-4 w-4" />
            Add item
          </Button>
        </>
      )}
    </SortableCategoryWrapper>
  );
}

export function SortableCategoryList({
  categories,
  restaurantName,
  selectedItemId,
  onSelectItem,
  onUpdateCategory,
  onRemoveCategory,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onDuplicateItem,
  onMoveItem,
  onMoveCategory,
}: {
  categories: MenuCategory[];
  restaurantName: string;
  selectedItemId: string | null;
  onSelectItem: (itemId: string | null) => void;
  onUpdateCategory: (categoryId: string, patch: Partial<MenuCategory>) => void;
  onRemoveCategory: (categoryId: string) => void;
  onAddItem: (categoryId: string) => void;
  onUpdateItem: (categoryId: string, itemId: string, patch: Partial<MenuItem>) => void;
  onRemoveItem: (categoryId: string, itemId: string) => void;
  onDuplicateItem: (categoryId: string, itemId: string) => void;
  onMoveItem: (categoryId: string, fromIndex: number, toIndex: number) => void;
  onMoveCategory: (fromIndex: number, toIndex: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (
      String(active.id).startsWith("category-") &&
      String(over.id).startsWith("category-")
    ) {
      const fromIndex = categories.findIndex((c) => `category-${c.id}` === active.id);
      const toIndex = categories.findIndex((c) => `category-${c.id}` === over.id);
      if (fromIndex >= 0 && toIndex >= 0) onMoveCategory(fromIndex, toIndex);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={categories.map((c) => `category-${c.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-6">
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              restaurantName={restaurantName}
              selectedItemId={selectedItemId}
              onSelectItem={onSelectItem}
              onUpdateCategory={(patch) => onUpdateCategory(category.id, patch)}
              onRemoveCategory={() => onRemoveCategory(category.id)}
              onAddItem={() => onAddItem(category.id)}
              onUpdateItem={(itemId, patch) => onUpdateItem(category.id, itemId, patch)}
              onRemoveItem={(itemId) => onRemoveItem(category.id, itemId)}
              onDuplicateItem={(itemId) => onDuplicateItem(category.id, itemId)}
              onMoveItem={(from, to) => onMoveItem(category.id, from, to)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
