import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Loader2, ScanLine, Sparkles, UtensilsCrossed } from "lucide-react";

import heroImage from "@/assets/hero-menu.jpg";
import { MenuEditor } from "@/components/menu/MenuEditor";
import { Button } from "@/components/ui/button";
import { extractMenu } from "@/lib/menu/extract.functions";
import { fileToDataUrl, isImageFile } from "@/lib/menu/image-utils";
import { withIds, type MenuData } from "@/lib/menu/menu-data";

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

function Index() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!isImageFile(file)) {
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
      <MenuEditor
        initialMenu={menu}
        onBack={() => {
          setStage("upload");
          setMenu(null);
        }}
      />
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
              AI menu studio
            </p>
            <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl lg:text-6xl">
              Your paper menu, reborn as a{" "}
              <em className="text-primary">digital page</em>.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Snap a photo — AI extracts every dish in seconds. Then polish it in our
              drag-and-drop studio with live preview, product-card editing, and
              marketplace-style templates before you share via QR.
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
