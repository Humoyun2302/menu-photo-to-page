import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";

import { getTemplate, resolveTemplateId } from "@/lib/menu/templates";
import type { MenuData } from "@/lib/menu/menu-data";
import { cn } from "@/lib/utils";

interface EditorPreviewProps {
  menu: MenuData;
  className?: string;
}

export function EditorPreview({ menu, className }: EditorPreviewProps) {
  const templateId = resolveTemplateId(menu);
  const TemplateComponent = getTemplate(templateId, menu).component;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Live preview
          </span>
        </div>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
          Updates instantly
        </span>
      </div>

      <motion.div
        key={`${templateId}-${menu.customTheme?.name ?? ""}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex-1 overflow-y-auto"
      >
        <div className="mx-auto max-w-md shadow-2xl ring-1 ring-border/50">
          <TemplateComponent menu={menu} />
        </div>
      </motion.div>
    </div>
  );
}
