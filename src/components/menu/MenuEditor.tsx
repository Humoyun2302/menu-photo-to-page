import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { EditorFAB } from "@/components/menu/EditorFAB";
import { EditorPreview } from "@/components/menu/EditorPreview";
import { EditorToolbar } from "@/components/menu/EditorToolbar";
import { SortableCategoryList } from "@/components/menu/CategorySection";
import { TemplateMarketplace } from "@/components/menu/TemplateMarketplace";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useMenuEditor } from "@/hooks/use-menu-editor";
import {
  createId,
  encodeMenu,
  normalizeMenu,
  saveMenu,
  type MenuData,
} from "@/lib/menu/menu-data";
import { DEFAULT_TEMPLATE_ID, type MenuTemplateId } from "@/lib/menu/templates";
import { cn } from "@/lib/utils";

interface MenuEditorProps {
  initialMenu: MenuData;
  draftId?: string;
  onBack: () => void;
}

export function MenuEditor({ initialMenu, draftId, onBack }: MenuEditorProps) {
  const navigate = useNavigate();
  const editor = useMenuEditor(initialMenu, draftId);
  const { menu, actions } = editor;

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [activeTab, setActiveTab] = useState<"items" | "style">("items");

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    for (const cat of menu.categories) {
      const item = cat.items.find((i) => i.id === selectedItemId);
      if (item) return { categoryId: cat.id, item };
    }
    return null;
  }, [menu.categories, selectedItemId]);

  const activeCategoryId = menu.categories[0]?.id ?? null;

  const handleAddItem = useCallback(() => {
    const categoryId = selectedItem?.categoryId ?? activeCategoryId;
    if (!categoryId) {
      actions.addCategory();
      toast.message("Created a section — add your first dish");
      return;
    }
    const newId = actions.addItem(categoryId);
    setSelectedItemId(newId);
  }, [actions, activeCategoryId, selectedItem?.categoryId]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedItem) return;
    actions.removeItem(selectedItem.categoryId, selectedItem.item.id);
    setSelectedItemId(null);
  }, [actions, selectedItem]);

  const handlePublish = () => {
    const trimmedName = menu.restaurantName.trim();
    const hasItems = menu.categories.some((c) => c.items.some((i) => i.name.trim()));
    if (!trimmedName) {
      toast.error("Please enter a restaurant name before publishing.");
      return;
    }
    if (!hasItems) {
      toast.error("Add at least one menu item before publishing.");
      return;
    }

    const id = createId();
    const finalMenu = normalizeMenu(menu);
    saveMenu(id, finalMenu);
    navigate({
      to: "/menu/$menuId",
      params: { menuId: id },
      hash: `d=${encodeMenu(finalMenu)}`,
    });
  };

  const forceSave = useCallback(() => {
    saveMenu(editor.draftId, menu);
    toast.success("Draft saved");
  }, [editor.draftId, menu]);

  useKeyboardShortcuts(
    {
      onUndo: editor.canUndo ? actions.undo : undefined,
      onRedo: editor.canRedo ? actions.redo : undefined,
      onSave: forceSave,
      onAddItem: handleAddItem,
      onAddSection: actions.addCategory,
      onDelete: selectedItem ? handleDeleteSelected : undefined,
      onTogglePreview: () => setShowMobilePreview((v) => !v),
    },
    true,
  );

  return (
    <div className="flex min-h-screen flex-col">
      <EditorToolbar
        title="Menu studio"
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        isSaving={editor.isSaving}
        lastSavedAt={editor.lastSavedAt}
        showPreview={showMobilePreview}
        onBack={onBack}
        onUndo={actions.undo}
        onRedo={actions.redo}
        onTogglePreview={() => setShowMobilePreview((v) => !v)}
        onPublish={handlePublish}
      />

      {menu.isDemo ? (
        <div className="flex items-center justify-center gap-2 border-b border-primary/10 bg-primary/5 px-4 py-2.5 text-center text-sm text-primary">
          <Sparkles className="h-4 w-4 shrink-0 animate-pulse" />
          <span>
            <strong>Demo mode</strong> — set <code className="text-xs">VITE_GEMINI_API_KEY</code> for
            real AI extraction and descriptions.
          </span>
        </div>
      ) : null}

      <div className="flex flex-1 overflow-hidden">
        <motion.div
          className={cn(
            "flex min-w-0 flex-1 flex-col overflow-y-auto",
            showMobilePreview && "hidden lg:flex",
          )}
        >
          <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 pb-28">
            <div className="space-y-2">
              <label
                htmlFor="restaurant-name"
                className="text-xs font-medium tracking-widest text-muted-foreground uppercase"
              >
                Restaurant name
              </label>
              <Input
                id="restaurant-name"
                value={menu.restaurantName}
                onChange={(e) => actions.setRestaurantName(e.target.value)}
                className="h-14 border-0 bg-card font-display text-2xl font-semibold shadow-card"
                placeholder="Your restaurant"
              />
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "items" | "style")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="items">Menu items</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="mt-6 space-y-6">
                {menu.categories.length === 0 ? (
                  <div className="rounded-xl border border-dashed bg-card/50 p-10 text-center">
                    <p className="text-muted-foreground">No sections yet.</p>
                    <button
                      type="button"
                      onClick={actions.addCategory}
                      className="mt-3 text-sm font-medium text-primary hover:underline"
                    >
                      Add your first section
                    </button>
                  </div>
                ) : (
                  <SortableCategoryList
                    categories={menu.categories}
                    restaurantName={menu.restaurantName}
                    selectedItemId={selectedItemId}
                    onSelectItem={setSelectedItemId}
                    onUpdateCategory={actions.updateCategory}
                    onRemoveCategory={actions.removeCategory}
                    onAddItem={actions.addItem}
                    onUpdateItem={actions.updateItem}
                    onRemoveItem={actions.removeItem}
                    onDuplicateItem={actions.duplicateItem}
                    onMoveItem={actions.moveItem}
                    onMoveCategory={actions.moveCategory}
                  />
                )}
              </TabsContent>

              <TabsContent value="style" className="mt-6">
                <TemplateMarketplace
                  menu={menu}
                  selectedId={menu.templateId ?? DEFAULT_TEMPLATE_ID}
                  onSelect={(templateId: MenuTemplateId) => actions.setTemplateId(templateId)}
                  onApplyCustomTheme={actions.applyCustomTheme}
                  onBackgroundChange={actions.setBackgroundImageUrl}
                />
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>

        <aside
          className={cn(
            "border-l bg-muted/20",
            showMobilePreview
              ? "fixed inset-0 top-14 z-20 flex flex-col lg:static lg:flex lg:w-[min(42vw,480px)]"
              : "hidden lg:flex lg:w-[min(42vw,480px)]",
          )}
        >
          <EditorPreview menu={menu} className="h-full" />
        </aside>
      </div>

      <EditorFAB onAddItem={handleAddItem} onAddSection={actions.addCategory} />
    </div>
  );
}
