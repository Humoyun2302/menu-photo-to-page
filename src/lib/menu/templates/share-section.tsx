import { Link } from "@tanstack/react-router";
import { Check, Copy, Download } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { MenuCustomTheme } from "./custom-theme";
import type { MenuTemplateId } from "./types";

interface ShareSectionProps {
  restaurantName: string;
  menuId: string;
  shareUrl: string;
  qrDataUrl: string | null;
  copied: boolean;
  onCopy: () => void;
  variant?: MenuTemplateId;
  customTheme?: MenuCustomTheme;
}

type PresetVariant = Exclude<MenuTemplateId, "custom">;

const variantStyles: Record<
  PresetVariant,
  {
    card: string;
    title: string;
    muted: string;
    urlBox: string;
    footer: string;
    link: string;
  }
> = {
  classic: {
    card: "rounded-2xl border border-[oklch(0.32_0.02_60)] bg-[oklch(0.205_0.016_55)] p-6 shadow-[0_14px_44px_-18px_oklch(0_0_0/0.7)] sm:p-8",
    title: "font-display text-2xl font-semibold",
    muted: "text-[oklch(0.68_0.027_78)]",
    urlBox: "rounded-lg border border-[oklch(0.32_0.02_60)] bg-[oklch(0.158_0.013_55)]/60",
    footer: "text-[oklch(0.68_0.027_78)]",
    link: "font-medium text-[oklch(0.8_0.125_80)] hover:underline",
  },
  modern: {
    card: "rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8",
    title: "text-xl font-bold",
    muted: "text-[#a1a1aa]",
    urlBox: "rounded-lg border border-white/10 bg-white/5",
    footer: "text-[#a1a1aa]",
    link: "font-medium text-[#a5b4fc] hover:underline",
  },
  rustic: {
    card: "rounded-xl border border-[#4a3828] bg-[#352618]/80 p-6 sm:p-8",
    title: "font-display text-2xl font-semibold text-[#e8dcc8]",
    muted: "text-[#a89880]",
    urlBox: "rounded-lg border border-[#4a3828] bg-[#2a1f14]/60",
    footer: "text-[#a89880]",
    link: "font-medium text-[#c4a574] hover:underline",
  },
  neon: {
    card: "rounded-xl border border-[#ff00ff]/30 bg-[#12121a]/80 p-6 shadow-[0_0_20px_-5px_#ff00ff40] sm:p-8",
    title: "text-xl font-bold text-white",
    muted: "text-[#a0a0b0]",
    urlBox: "rounded-lg border border-[#ff00ff]/20 bg-[#0a0a0f]/60",
    footer: "text-[#a0a0b0]",
    link: "font-medium text-[#00ffff] hover:underline",
  },
  luxury: {
    card: "rounded-sm border border-[#2a2a2a] bg-[#141414] p-6 sm:p-8",
    title: "font-display text-2xl font-light tracking-wide text-[#f5f0e8]",
    muted: "text-[#a89f8f]",
    urlBox: "rounded-sm border border-[#2a2a2a] bg-[#0d0d0d]/60",
    footer: "text-[#a89f8f]",
    link: "font-light tracking-wide text-[#c9a962] hover:underline",
  },
  cafe: {
    card: "rounded-2xl border border-[#e8ddd0] bg-[#fffdf9] p-6 shadow-[0_8px_30px_-12px_rgba(61,44,30,0.15)] sm:p-8",
    title: "font-display text-2xl font-semibold text-[#3d2c1e]",
    muted: "text-[#8b7355]",
    urlBox: "rounded-xl border border-[#e8ddd0] bg-[#faf6f1]",
    footer: "text-[#8b7355]",
    link: "font-semibold text-[#c4785a] hover:underline",
  },
};

export function ShareSection({
  restaurantName,
  menuId,
  shareUrl,
  qrDataUrl,
  copied,
  onCopy,
  variant = "classic",
  customTheme,
}: ShareSectionProps) {
  const isCustom = variant === "custom" && customTheme;
  const s = isCustom ? null : variantStyles[variant as PresetVariant];

  const cardStyle = isCustom
    ? {
        backgroundColor: customTheme.colors.cardBg,
        borderColor: customTheme.colors.border,
        color: customTheme.colors.text,
      }
    : undefined;

  const mutedStyle = isCustom ? { color: customTheme.colors.text, opacity: 0.75 } : undefined;
  const linkStyle = isCustom ? { color: customTheme.colors.accent } : undefined;
  const urlBoxStyle = isCustom
    ? {
        backgroundColor: customTheme.colors.background,
        borderColor: customTheme.colors.border,
      }
    : undefined;

  return (
    <>
      <section
        className={isCustom ? "rounded-xl border p-6 sm:p-8" : s!.card}
        style={cardStyle}
      >
        <h2
          className={isCustom ? "text-xl font-semibold" : s!.title}
          style={isCustom ? { color: customTheme.colors.text } : undefined}
        >
          Share this menu
        </h2>
        <p className={`mt-1 text-sm ${isCustom ? "" : s!.muted}`} style={mutedStyle}>
          Print the QR code for your tables, or send guests the link.
        </p>
        <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR code for the ${restaurantName} digital menu`}
              width={176}
              height={176}
              loading="lazy"
              className="h-44 w-44 shrink-0 rounded-xl border"
            />
          ) : null}
          <div className="w-full min-w-0 space-y-3">
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${isCustom ? "" : s!.urlBox}`}
              style={urlBoxStyle}
            >
              <span
                className={`min-w-0 flex-1 truncate text-sm ${isCustom ? "" : s!.muted}`}
                style={mutedStyle}
              >
                {shareUrl}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={onCopy} className="flex-1 sm:flex-none">
                {copied ? (
                  <Check className="mr-1.5 h-4 w-4" />
                ) : (
                  <Copy className="mr-1.5 h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy link"}
              </Button>
              {qrDataUrl ? (
                <Button variant="secondary" asChild>
                  <a href={qrDataUrl} download={`menusnap-${menuId}-qr.png`}>
                    <Download className="mr-1.5 h-4 w-4" />
                    Download QR
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <footer
        className={`pt-2 pb-6 text-center text-sm ${isCustom ? "" : s!.footer}`}
        style={mutedStyle}
      >
        Made with{" "}
        <Link
          to="/"
          className={isCustom ? "font-medium hover:underline" : s!.link}
          style={linkStyle}
        >
          MenuSnap
        </Link>{" "}
        — turn any menu photo into a digital menu.
      </footer>
    </>
  );
}
