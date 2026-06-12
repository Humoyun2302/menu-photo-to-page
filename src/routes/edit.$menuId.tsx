import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, UtensilsCrossed } from "lucide-react";

import { MenuEditor } from "@/components/menu/MenuEditor";
import { Button } from "@/components/ui/button";
import { decodeMenu, loadMenu, type MenuData } from "@/lib/menu/menu-data";

export const Route = createFileRoute("/edit/$menuId")({
  head: () => ({
    meta: [
      { title: "Edit Menu | MenuSnap" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditMenuPage,
});

function EditMenuPage() {
  const { menuId } = Route.useParams();
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let found = loadMenu(menuId);
    if (!found) {
      const match = window.location.hash.match(/[#&]d=([^&]+)/);
      if (match) found = decodeMenu(match[1]);
    }
    setMenu(found);
    setReady(true);
  }, [menuId]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <UtensilsCrossed className="h-8 w-8 animate-pulse text-primary" />
      </main>
    );
  }

  if (!menu) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
        <UtensilsCrossed className="h-10 w-10 text-primary" />
        <h1 className="font-display text-3xl font-semibold">Menu not found</h1>
        <p className="max-w-sm text-muted-foreground">
          Open this page from a menu you created on this device, or start fresh.
        </p>
        <Button asChild>
          <Link to="/">
            <Sparkles className="mr-1.5 h-4 w-4" />
            Create a menu
          </Link>
        </Button>
      </main>
    );
  }

  return <MenuEditor initialMenu={menu} draftId={menuId} onBack={() => window.history.back()} />;
}
