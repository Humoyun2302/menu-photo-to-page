import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IMAGE_ACCEPT, fileToDataUrl, isImageFile } from "@/lib/menu/image-utils";
import { toast } from "sonner";

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  label: string;
  maxDimension?: number;
  previewClassName?: string;
  compact?: boolean;
}

export function ImageUploadField({
  value,
  onChange,
  label,
  maxDimension = 400,
  previewClassName = "h-20 w-20",
  compact = false,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!isImageFile(file)) {
      toast.error("Please upload a JPG, PNG, or WebP image.");
      return;
    }
    try {
      onChange(await fileToDataUrl(file, { maxDimension, quality: 0.8 }));
    } catch {
      toast.error("Couldn't read that image — try another.");
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {value ? (
          <div className="relative shrink-0">
            <img
              src={value}
              alt={label}
              className={`rounded-lg border object-cover ${previewClassName}`}
            />
            <button
              type="button"
              aria-label={`Remove ${label}`}
              onClick={() => onChange(undefined)}
              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`Add ${label}`}
            className="h-16 w-16 shrink-0"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="relative overflow-hidden rounded-xl border">
          <img src={value} alt={label} className="max-h-40 w-full object-cover" />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => onChange(undefined)}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-6 text-center transition-colors hover:border-primary/50 hover:bg-accent/40"
        >
          <ImagePlus className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">JPG, PNG, or WebP</span>
        </button>
      )}
    </div>
  );
}
