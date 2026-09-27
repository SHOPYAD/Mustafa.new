/**
 * Client-side PNG resize for PWA icons (192 / 512 / apple-touch 180).
 * No extra image library — Canvas only.
 */

export const PWA_ICON_SIZES = {
  apple: 180,
  icon192: 192,
  icon512: 512,
} as const;

function fillSquare(
  ctx: CanvasRenderingContext2D,
  size: number,
  background: string
) {
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, size, size);
}

export async function resizeImageToPng(
  source: Blob,
  size: number,
  background = "#051741"
): Promise<Blob> {
  const bitmap = await createImageBitmap(source);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  fillSquare(ctx, size, background);
  const scale = Math.min(size / bitmap.width, size / bitmap.height);
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("png"))),
      "image/png"
    );
  });
}

export async function buildPwaIconSet(
  source: Blob,
  background = "#051741"
): Promise<{ apple: Blob; icon192: Blob; icon512: Blob }> {
  const [apple, icon192, icon512] = await Promise.all([
    resizeImageToPng(source, PWA_ICON_SIZES.apple, background),
    resizeImageToPng(source, PWA_ICON_SIZES.icon192, background),
    resizeImageToPng(source, PWA_ICON_SIZES.icon512, background),
  ]);
  return { apple, icon192, icon512 };
}

export function blobToFile(blob: Blob, name: string): File {
  return new File([blob], name, { type: "image/png" });
}
