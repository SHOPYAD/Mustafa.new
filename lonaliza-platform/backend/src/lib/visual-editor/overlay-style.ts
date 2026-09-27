export type OverlaySettings = {
  color: string;
  opacity: number;
  image: string;
};

const DEFAULT_OVERLAY: OverlaySettings = {
  color: "#051741",
  opacity: 0.48,
  image: "",
};

export function clampOverlayOpacity(value: number): number {
  if (Number.isNaN(value)) return DEFAULT_OVERLAY.opacity;
  return Math.min(1, Math.max(0, value));
}

export function parseOverlaySettings(
  settings: Record<string, string | number | boolean> | undefined,
  fallbackCss?: string
): OverlaySettings {
  const color =
    (typeof settings?.overlayColor === "string" && settings.overlayColor.trim()) ||
    DEFAULT_OVERLAY.color;
  const opacityRaw =
    typeof settings?.overlayOpacity === "number"
      ? settings.overlayOpacity
      : typeof settings?.overlayOpacity === "string"
        ? Number(settings.overlayOpacity)
        : DEFAULT_OVERLAY.opacity;
  const image =
    (typeof settings?.overlayImage === "string" && settings.overlayImage.trim()) || "";
  if (color !== DEFAULT_OVERLAY.color || image || settings?.overlayOpacity != null) {
    return { color, opacity: clampOverlayOpacity(opacityRaw), image };
  }
  if (fallbackCss && fallbackCss.trim()) {
    return { ...DEFAULT_OVERLAY, image: "" };
  }
  return { color, opacity: clampOverlayOpacity(opacityRaw), image };
}

export function buildOverlayCss(overlay: OverlaySettings): string {
  const alpha = clampOverlayOpacity(overlay.opacity);
  const wash = hexToRgba(overlay.color || DEFAULT_OVERLAY.color, alpha);
  const light = hexToRgba(overlay.color || DEFAULT_OVERLAY.color, Math.max(0.12, alpha * 0.45));
  const gradient = `linear-gradient(180deg, ${wash} 0%, ${light} 42%, ${wash} 100%)`;
  if (overlay.image) {
    return `${gradient}, url('${overlay.image.replace(/'/g, "%27")}')`;
  }
  return gradient;
}

function hexToRgba(input: string, alpha: number): string {
  const hex = input.trim();
  const short = hex.match(/^#([0-9a-f]{3})$/i);
  const long = hex.match(/^#([0-9a-f]{6})$/i);
  if (short?.[1]) {
    const [r, g, b] = short[1].split("").map((ch) => parseInt(ch + ch, 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (long?.[1]) {
    const r = parseInt(long[1].slice(0, 2), 16);
    const g = parseInt(long[1].slice(2, 4), 16);
    const b = parseInt(long[1].slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (hex.startsWith("rgb")) {
    return hex.replace(/rgba?\(([^)]+)\)/, (_, body: string) => {
      const parts = body.split(",").map((p) => p.trim());
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
    });
  }
  return `rgba(5, 23, 65, ${alpha})`;
}
