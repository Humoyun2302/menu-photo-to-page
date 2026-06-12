import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Pencil, Sparkles, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  loadMenu,
  normalizeMenu,
  saveMenu,
  type MenuData,
} from "@/lib/menu/menu-data";
import { buildShareUrl, decodeSharePayload, parseShareHash } from "@/lib/menu/menu-share-codec";
import { fetchPublishedMenu, publishMenu } from "@/lib/menu/publish.functions";
import { getQrColors, getTemplate, resolveTemplateId } from "@/lib/menu/templates";
import { ShareSection } from "@/lib/menu/templates/share-section";

export const Route = createFileRoute("/menu/$menuId")({
  head: () => ({
    meta: [
      { title: "Digital Menu | MenuSnap" },
      {
        name: "description",
        content: "A beautiful digital restaurant menu created with MenuSnap.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MenuPage,
});

type LoadState = "loading" | "ready" | "missing";

function MenuPage() {
  const { menuId } = Route.useParams();
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let found = loadMenu(menuId);
      let fromHash = false;

      if (!found) {
        try {
          found = await fetchPublishedMenu({ data: { menuId } });
        } catch {
          // cloud fetch unavailable
        }
      }

      if (!found) {
        const encoded = parseShareHash(window.location.hash);
        if (encoded) {
          found = decodeSharePayload(encoded);
          fromHash = !!found;
        }
      }

      if (cancelled) return;

      if (found) {
        const normalized = normalizeMenu(found);
        saveMenu(menuId, normalized);
        setMenu(normalized);
        setState("ready");

        if (fromHash) {
          try {
            await publishMenu({ data: { menuId, menu: normalized } });
          } catch {
            // keep hash fallback available offline
          }
        }

        if (window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      } else {
        setState("missing");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [menuId]);

  const template = useMemo(() => (menu ? getTemplate(menu.templateId, menu) : null), [menu]);
  const templateId = menu ? resolveTemplateId(menu) : "classic";
  const TemplateComponent = template?.component;

  const shareUrl = useMemo(() => {
    if (!menu) return "";
    return buildShareUrl(window.location.origin, menuId);
  }, [menu, menuId]);

  useEffect(() => {
    if (!shareUrl || !menu) return;
    QRCode.toDataURL(shareUrl, {
      width: 560,
      margin: 1,
      color: getQrColors(menu),
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [shareUrl, menu]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select the link and copy manually.");
    }
  };

  if (state === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <UtensilsCrossed className="h-8 w-8 animate-pulse text-primary" />
      </main>
    );
  }

  if (state === "missing" || !menu || !TemplateComponent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
        <UtensilsCrossed className="h-10 w-10 text-primary" />
        <h1 className="font-display text-3xl font-semibold">Menu not found</h1>
        <p className="max-w-sm text-muted-foreground">
          This menu may have expired or the link is invalid. Ask the owner to publish again.
        </p>
        <Button asChild>
          <Link to="/">
            <Sparkles className="mr-1.5 h-4 w-4" />
            Create your own menu
          </Link>
        </Button>
      </main>
    );
  }

  return (
    <>
      <div className="fixed top-3 right-3 z-50">
        <Button asChild size="sm" variant="secondary" className="shadow-card backdrop-blur">
          <Link to="/edit/$menuId" params={{ menuId }}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit menu
          </Link>
        </Button>
      </div>

      {menu.isDemo ? (
        <div className="bg-primary/5 border-b border-primary/10 px-4 py-3 text-center text-xs text-primary flex items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span>
            This is a mock menu created in <strong>Demo Mode</strong>. Configure a valid Gemini API key to use your own menus.
          </span>
        </div>
      ) : null}

      <TemplateComponent
        menu={menu}
        footer={
          <ShareSection
            restaurantName={menu.restaurantName}
            menuId={menuId}
            shareUrl={shareUrl}
            qrDataUrl={qrDataUrl}
            copied={copied}
            onCopy={handleCopy}
            variant={templateId}
            customTheme={menu.customTheme}
          />
        }
      />
    </>
  );
}
