import { motion } from "framer-motion";
import { Check, Loader2, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateStyleFromPrompt } from "@/lib/menu/ai-assist.functions";
import type { MenuCustomTheme } from "@/lib/menu/templates/custom-theme";
import { cn } from "@/lib/utils";

const EXAMPLE_PROMPTS = [
  "Mediterranean seaside terrace at sunset",
  "Dark luxury sushi bar with gold accents",
  "Playful pastel dessert shop",
  "Neon Tokyo street food at night",
];

interface AiStyleGeneratorProps {
  restaurantName: string;
  activeCustomTheme?: MenuCustomTheme;
  isActive: boolean;
  onApply: (theme: MenuCustomTheme) => void;
}

export function AiStyleGenerator({
  restaurantName,
  activeCustomTheme,
  isActive,
  onApply,
}: AiStyleGeneratorProps) {
  const [prompt, setPrompt] = useState(activeCustomTheme?.prompt ?? "");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (trimmed.length < 3) {
      toast.error("Describe your style in a few words.");
      return;
    }

    setLoading(true);
    try {
      const theme = await generateStyleFromPrompt({
        data: { prompt: trimmed, restaurantName },
      });
      onApply(theme);
      toast.success(`"${theme.name}" style applied`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Style generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Wand2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold">Create style with AI</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe the mood, colors, or vibe — AI builds a unique 2-column product card theme.
          </p>
        </div>
        {isActive ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
            <Check className="h-3.5 w-3.5" />
            Active
          </span>
        ) : null}
      </div>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g. Cozy autumn bistro with burgundy and cream, soft serif typography..."
        className="mt-4 min-h-[88px] resize-none bg-background/80"
        disabled={loading}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLE_PROMPTS.map((example) => (
          <button
            key={example}
            type="button"
            disabled={loading}
            onClick={() => setPrompt(example)}
            className="rounded-full border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {example}
          </button>
        ))}
      </div>

      <Button
        type="button"
        className="mt-4 w-full sm:w-auto"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        {loading ? "Designing your style…" : "Generate style"}
      </Button>

      {activeCustomTheme && isActive ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 overflow-hidden rounded-xl border"
          style={{
            borderColor: activeCustomTheme.colors.border,
            backgroundColor: activeCustomTheme.colors.cardBg,
          }}
        >
          <div
            className="grid grid-cols-2 gap-1.5 p-2.5"
            style={{ backgroundColor: activeCustomTheme.colors.background }}
          >
            {[0, 1].map((i) => (
              <div
                key={i}
                className={cn(
                  "overflow-hidden border",
                  activeCustomTheme.cardRoundness === "pill"
                    ? "rounded-2xl"
                    : activeCustomTheme.cardRoundness === "rounded"
                      ? "rounded-xl"
                      : "rounded-sm",
                )}
                style={{
                  borderColor: activeCustomTheme.colors.border,
                  backgroundColor: activeCustomTheme.colors.cardBg,
                }}
              >
                <div
                  className="aspect-[4/3] w-full opacity-25"
                  style={{ backgroundColor: activeCustomTheme.colors.text }}
                />
                <div className="space-y-1 p-1.5">
                  <div
                    className="h-1 w-full rounded-full opacity-40"
                    style={{ backgroundColor: activeCustomTheme.colors.text }}
                  />
                  <div
                    className="h-1 w-6 rounded-full"
                    style={{ backgroundColor: activeCustomTheme.colors.accent }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t px-3 py-2" style={{ borderColor: activeCustomTheme.colors.border }}>
            <p className="text-sm font-semibold" style={{ color: activeCustomTheme.colors.text }}>
              {activeCustomTheme.name}
            </p>
            <p className="text-xs opacity-70" style={{ color: activeCustomTheme.colors.text }}>
              {activeCustomTheme.description}
            </p>
          </div>
        </motion.div>
      ) : null}
    </section>
  );
}
