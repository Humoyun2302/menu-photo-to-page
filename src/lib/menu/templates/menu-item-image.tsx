import type { CSSProperties } from "react";
import { Utensils } from "lucide-react";

import { cn } from "@/lib/utils";

export type ImageAspect = "banner" | "card" | "square";
export type ImageLayout = "fill" | "thumb";

const aspectClass: Record<ImageAspect, string> = {
  banner: "aspect-[2/1]",
  card: "aspect-[4/3]",
  square: "aspect-square",
};

const layoutClass: Record<ImageLayout, string> = {
  fill: "w-full",
  thumb: "size-16 shrink-0",
};

interface MenuItemImageProps {
  src?: string;
  alt: string;
  className?: string;
  rounded?: "md" | "lg" | "xl" | "2xl" | "full" | "none";
  aspect?: ImageAspect;
  layout?: ImageLayout;
}

const roundedClass = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
  none: "",
};

export function MenuItemImage({
  src,
  alt,
  className = "",
  rounded = "lg",
  aspect = "card",
  layout = "fill",
}: MenuItemImageProps) {
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn(
        "object-cover",
        aspectClass[aspect],
        layoutClass[layout],
        roundedClass[rounded],
        className,
      )}
    />
  );
}

export function MenuItemImagePlaceholder({
  className = "",
  rounded = "lg",
  aspect = "card",
  layout = "fill",
  style,
}: {
  className?: string;
  rounded?: MenuItemImageProps["rounded"];
  aspect?: ImageAspect;
  layout?: ImageLayout;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-black/20",
        aspectClass[aspect],
        layoutClass[layout],
        roundedClass[rounded],
        className,
      )}
      style={style}
      aria-hidden
    >
      <Utensils className="h-6 w-6 opacity-40" />
    </div>
  );
}
