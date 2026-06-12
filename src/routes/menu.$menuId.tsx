import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, Download, Sparkles, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  decodeMenu,
  encodeMenu,
  loadMenu,
  saveMenu,
  type MenuData,
} from "@/lib/menu/menu-data";

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
    let found = loadMenu(menuId);
    if (!found) {
      const match = window.location.hash.match(/[#&]d=([^&]+)/);
      if (match) {
        found = decodeMenu(match[1]);
        if (found) saveMenu(menuId, found);
      }
    }
    if (found) {
      setMenu(found);
      setState("ready");
    } else {
      setState("missing");
    }
  }, [menuId]);

  // The share URL embeds the (compressed) menu data so the QR code works on
  // any device, not just the one that created the menu.
  const shareUrl = useMemo(() => {
    if (!menu) return "";
    return `${window.location.origin}/menu/${menuId}#d=${encodeMenu(menu)}`;
  }, [menu, menuId]);

  useEffect(() => {
    if (!shareUrl) return;
    QRCode.toDataURL(shareUrl, {
      width: 560,
      margin: 1,
      color: { dark: "#191410", light: "#f3e9d6" },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [shareUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — the URL is still visible in the address bar
    }
  };

  if (state === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <UtensilsCrossed className="h-8 w-8 animate-pulse text-primary" />
      </main>
    );
  }

  if (state === "missing" || !menu) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
        <UtensilsCrossed className="h-10 w-10 text-primary" />
        <h1 className="font-display text-3xl font-semibold">Menu not found</h1>
        <p className="max-w-sm text-muted-foreground">
          This menu isn't stored on this device and the link doesn't include the menu
          data. Ask the owner to share their full QR code or link.
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
    <main className="min-h-screen pb-16">
      {menu.isDemo ? (
        <div className="bg-primary/5 border-b border-primary/10 px-4 py-3 text-center text-xs text-primary flex items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span>
            This is a mock menu created in <strong>Demo Mode</strong>. Configure a valid Gemini API key to use your own menus.
          </span>
        </div>
      ) : null}

      <header className="border-b">
        <div className="mx-auto max-w-2xl px-5 py-14 text-center sm:py-20">
          <p className="animate-fade-in text-xs font-medium tracking-[0.35em] text-primary uppercase">
            Menu
          </p>
          <h1 className="animate-fade-up mt-4 font-display text-4xl font-semibold text-balance sm:text-5xl">
            {menu.restaurantName}
          </h1>
          <div className="mx-auto mt-6 h-px w-16 bg-primary" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-14 px-5 pt-12">
        {menu.categories.map((category) => (
          <section key={category.id}>
            <div className="mb-6 flex items-center gap-4">
              <h2 className="font-display text-2xl font-semibold text-primary">
                {category.name}
              </h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {category.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border bg-card p-5 shadow-card transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="min-w-0 font-display text-lg font-medium">
                      {item.name}
                    </h3>
                    {item.price ? (
                      <span className="shrink-0 font-medium whitespace-nowrap text-primary">
                        {item.price}
                      </span>
                    ) : null}
                  </div>
                  {item.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
          <h2 className="font-display text-2xl font-semibold">Share this menu</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Print the QR code for your tables, or send guests the link.
          </p>
          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for the ${menu.restaurantName} digital menu`}
                width={176}
                height={176}
                loading="lazy"
                className="h-44 w-44 shrink-0 rounded-xl border"
              />
            ) : null}
            <div className="w-full min-w-0 space-y-3">
              <div className="flex items-center gap-2 rounded-lg border bg-background/60 px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                  {shareUrl}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleCopy} className="flex-1 sm:flex-none">
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

        <footer className="pt-2 pb-6 text-center text-sm text-muted-foreground">
          Made with{" "}
          <Link to="/" className="font-medium text-primary hover:underline">
            MenuSnap
          </Link>{" "}
          — turn any menu photo into a digital menu.
        </footer>
      </div>
    </main>
  );
}
