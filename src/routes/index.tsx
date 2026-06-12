import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Loader2,
  Plus,
  ScanLine,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";

import heroImage from "@/assets/hero-menu.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { extractMenu } from "@/lib/menu/extract.functions";
import {
  createId,
  saveMenu,
  withIds,
  type MenuCategory,
  type MenuData,
  type MenuItem,
} from "@/lib/menu/menu-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MenuSnap — Turn a Menu Photo into a Digital Menu" },
      {
        name: "description",
        content:
          "Upload a photo of your restaurant menu and MenuSnap's AI turns it into a beautiful, shareable digital menu with a QR code in seconds.",
      },
      { property: "og:title", content: "MenuSnap — Turn a Menu Photo into a Digital Menu" },
      {
        property: "og:description",
        content:
          "Snap a photo of your paper menu, let AI extract every dish and price, and share a beautiful digital menu via QR code.",
      },
    ],
  }),
  component: Index,
});

type Stage = "upload" | "processing" | "edit";

async function fileToDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not load image"));
      image.src = objectUrl;
    });
    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function Index() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      setError("Please upload a JPG or PNG photo of your menu.");
      return;
    }
    setError(null);
    try {
      setPreview(await fileToDataUrl(file));
    } catch {
      setError("Couldn't read that image — try another photo.");
    }
  };

  const handleExtract = async () => {
    if (!preview) return;
    setStage("processing");
    setError(null);
    try {
      const raw = await extractMenu({ data: { imageDataUrl: preview } });
      setMenu(withIds(raw));
      setStage("edit");
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "Menu extraction failed. Please try again.",
      );
      setStage("upload");
    }
  };

  const updateMenu = (updater: (current: MenuData) => MenuData) =>
    setMenu((current) => (current ? updater(current) : current));

  const updateCategory = (categoryId: string, patch: Partial<MenuCategory>) =>
    updateMenu((m) => ({
      ...m,
      categories: m.categories.map((c) => (c.id === categoryId ? { ...c, ...patch } : c)),
    }));

  const removeCategory = (categoryId: string) =>
    updateMenu((m) => ({
      ...m,
      categories: m.categories.filter((c) => c.id !== categoryId),
    }));

  const addCategory = () =>
    updateMenu((m) => ({
      ...m,
      categories: [
        ...m.categories,
        { id: createId(6), name: "New section", items: [] },
      ],
    }));

  const updateItem = (categoryId: string, itemId: string, patch: Partial<MenuItem>) =>
    updateMenu((m) => ({
      ...m,
      categories: m.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              items: c.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
            }
          : c,
      ),
    }));

  const removeItem = (categoryId: string, itemId: string) =>
    updateMenu((m) => ({
      ...m,
      categories: m.categories.map((c) =>
        c.id === categoryId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c,
      ),
    }));

  const addItem = (categoryId: string) =>
    updateMenu((m) => ({
      ...m,
      categories: m.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              items: [
                ...c.items,
                { id: createId(6), name: "", description: "", price: "" },
              ],
            }
          : c,
      ),
    }));

  const handlePublish = () => {
    if (!menu) return;
    const id = createId();
    saveMenu(id, menu);
    navigate({ to: "/menu/$menuId", params: { menuId: id } });
  };

  if (stage === "processing") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="relative">
          {preview ? (
            <img
              src={preview}
              alt="Your uploaded menu"
              width={224}
              height={300}
              className="h-72 w-56 rounded-xl border object-cover opacity-60 shadow-card"
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-glow-pulse flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ScanLine className="h-7 w-7" />
            </div>
          </div>
        </div>
        <div className="animate-fade-up">
          <h1 className="font-display text-3xl font-semibold">Reading your menu…</h1>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Our AI is extracting every dish, description and price. This usually takes
            10–20 seconds.
          </p>
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </main>
    );
  }

  if (stage === "edit" && menu) {
    return (
      <main className="min-h-screen pb-24">
        <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
          <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Back to upload"
                onClick={() => setStage("upload")}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="truncate font-display text-lg font-semibold sm:text-xl">
                Review &amp; edit your menu
              </h1>
            </div>
            <Button onClick={handlePublish} className="shrink-0">
              Publish menu
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </header>

        {menu.isDemo ? (
          <div className="bg-primary/5 border-b border-primary/10 px-4 py-3.5 text-center text-sm text-primary flex items-center justify-center gap-2">
            <Sparkles className="h-4.5 w-4.5 shrink-0 animate-pulse" />
            <span>
              <strong>Demo Mode:</strong> Using a fallback menu because a valid Gemini API key is missing. Set a valid <code>VITE_GEMINI_API_KEY</code> in your <code>.env</code> file for real AI extraction.
            </span>
          </div>
        ) : null}

        <div className="mx-auto max-w-3xl space-y-8 px-4 pt-8">
          <p className="text-sm text-muted-foreground">
            Fix anything the AI misread, then publish to get your shareable page and QR
            code.
          </p>

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
              onChange={(e) => updateMenu((m) => ({ ...m, restaurantName: e.target.value }))}
              className="h-14 font-display text-2xl font-semibold"
            />
          </div>

          {menu.categories.map((category) => (
            <section
              key={category.id}
              className="space-y-4 rounded-xl border bg-card p-4 shadow-card sm:p-6"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={category.name}
                  onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                  aria-label="Section name"
                  className="h-11 min-w-0 font-display text-lg font-semibold"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove section"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {category.items.map((item) => (
                  <div key={item.id} className="space-y-2 rounded-lg border bg-background/50 p-3">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
                      <Input
                        value={item.name}
                        placeholder="Dish name"
                        aria-label="Dish name"
                        onChange={(e) =>
                          updateItem(category.id, item.id, { name: e.target.value })
                        }
                        className="min-w-0 font-medium"
                      />
                      <Input
                        value={item.price}
                        placeholder="$0.00"
                        aria-label="Price"
                        onChange={(e) =>
                          updateItem(category.id, item.id, { price: e.target.value })
                        }
                        className="w-24 text-right"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove item"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(category.id, item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={item.description}
                      placeholder="Description (optional)"
                      aria-label="Description"
                      rows={2}
                      onChange={(e) =>
                        updateItem(category.id, item.id, { description: e.target.value })
                      }
                      className="min-h-0 resize-none text-sm"
                    />
                  </div>
                ))}
              </div>

              <Button variant="secondary" size="sm" onClick={() => addItem(category.id)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add item
              </Button>
            </section>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" onClick={addCategory}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add section
            </Button>
            <Button onClick={handlePublish} size="lg">
              Publish menu
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <img
        src={heroImage}
        alt="Candlelit restaurant table with a handwritten paper menu"
        width={1536}
        height={896}
        className="absolute inset-0 h-full w-full object-cover object-right opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8">
        <nav className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          <span className="font-display text-xl font-semibold tracking-wide">
            Menu<span className="text-primary">Snap</span>
          </span>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="animate-fade-up max-w-xl">
            <p className="mb-4 text-xs font-medium tracking-[0.3em] text-primary uppercase">
              AI menu digitizer
            </p>
            <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">
              Your paper menu, reborn as a{" "}
              <em className="text-primary">digital page</em>.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Snap a photo of your menu. MenuSnap's AI reads every dish, description and
              price — then hands you a beautiful mobile menu with a QR code your guests
              can scan.
            </p>
            <ol className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:gap-8">
              <li className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/40 font-display text-primary">
                  1
                </span>
                Snap your menu
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/40 font-display text-primary">
                  2
                </span>
                AI extracts it
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/40 font-display text-primary">
                  3
                </span>
                Share the QR
              </li>
            </ol>
          </div>

          <div className="animate-fade-up rounded-2xl border bg-card/80 p-5 shadow-card backdrop-blur-md sm:p-7 [animation-delay:150ms]">
            <h2 className="font-display text-xl font-semibold">Upload your menu photo</h2>
            <p className="mt-1 text-sm text-muted-foreground">JPG or PNG, up to 20&nbsp;MB.</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            {preview ? (
              <div className="mt-5 space-y-4">
                <img
                  src={preview}
                  alt="Preview of your uploaded menu"
                  width={640}
                  height={480}
                  className="max-h-80 w-full rounded-xl border object-contain"
                />
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="mr-1.5 h-4 w-4" />
                    Change photo
                  </Button>
                  <Button onClick={handleExtract} className="flex-1 shadow-glow">
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    Extract menu with AI
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                className={`mt-5 flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                  dragOver
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/60 hover:bg-accent/40"
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Camera className="h-6 w-6" />
                </span>
                <span className="font-medium">Drag a photo of your menu here</span>
                <span className="text-sm text-muted-foreground">
                  or tap to browse your files
                </span>
              </button>
            )}

            {error ? (
              <p role="alert" className="mt-4 text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
