import { AnimatePresence, motion } from "framer-motion";
import { Layers, Plus, UtensilsCrossed } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditorFABProps {
  onAddItem: () => void;
  onAddSection: () => void;
}

export function EditorFAB({ onAddItem, onAddSection }: EditorFABProps) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed right-4 bottom-6 z-40 flex flex-col items-end gap-2 sm:right-6 sm:bottom-8">
        <AnimatePresence>
          {open ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-2 rounded-full shadow-card"
                      onClick={() => {
                        onAddSection();
                        setOpen(false);
                      }}
                    >
                      <Layers className="h-4 w-4" />
                      New section
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">⌘⇧N</TooltipContent>
                </Tooltip>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 28, delay: 0.03 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className="gap-2 rounded-full shadow-glow"
                      onClick={() => {
                        onAddItem();
                        setOpen(false);
                      }}
                    >
                      <UtensilsCrossed className="h-4 w-4" />
                      Add dish
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">⌘↵</TooltipContent>
                </Tooltip>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            size="icon"
            aria-label={open ? "Close actions" : "Quick actions"}
            aria-expanded={open}
            className="h-14 w-14 rounded-full shadow-glow"
            onClick={() => setOpen((v) => !v)}
          >
            <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
              <Plus className="h-6 w-6" />
            </motion.div>
          </Button>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
