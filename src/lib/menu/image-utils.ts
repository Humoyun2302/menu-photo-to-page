export interface ImageResizeOptions {
  maxDimension?: number;
  quality?: number;
}

export async function fileToDataUrl(
  file: File,
  { maxDimension = 1600, quality = 0.85 }: ImageResizeOptions = {},
): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not load image"));
      image.src = objectUrl;
    });
    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp";

export function isImageFile(file: File): boolean {
  return /^image\/(png|jpe?g|webp)$/.test(file.type);
}
