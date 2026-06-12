import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  Cloud,
  Eye,
  Redo2,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  title: string;
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  showPreview: boolean;
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onTogglePreview: () => void;
  onPublish: () => void;
}

export function EditorToolbar({
  title,
  canUndo,
  canRedo,
  isSaving,
  lastSavedAt,
  showPreview,
  onBack,
  onUndo,
  onRedo,
  onTogglePreview,
  onPublish,
}: EditorToolbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
        <Button variant="ghost" size="icon" aria-label="Back" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-base font-semibold sm:text-lg">{title}</h1>
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Cloud className={cn("h-3 w-3", isSaving && "animate-pulse text-primary")} />
            {isSaving
              ? "Saving…"
              : lastSavedAt
                ? `Saved ${formatDistanceToNow(lastSavedAt, { addSuffix: true })}`
                : "All changes saved"}
          </p>
        </div>

        <TooltipProvider delayDuration={400}>
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Undo"
                  disabled={!canUndo}
                  onClick={onUndo}
                  className="h-8 w-8"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (⌘Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Redo"
                  disabled={!canRedo}
                  onClick={onRedo}
                  className="h-8 w-8"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showPreview ? "secondary" : "ghost"}
                  size="icon"
                  aria-label="Toggle preview"
                  onClick={onTogglePreview}
                  className="h-8 w-8 lg:hidden"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview (⌘P)</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <Button onClick={onPublish} size="sm" className="shrink-0 shadow-glow">
          Publish
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
