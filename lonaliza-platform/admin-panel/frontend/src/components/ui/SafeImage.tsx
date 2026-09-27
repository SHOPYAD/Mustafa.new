"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { unwrapCssUrl } from "@/lib/visual-editor/live-bind";

/** Reliable Turkey fallback when remote/CDN images 404 */
export const IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80";

type SafeImageProps = Omit<ImageProps, "onError" | "src"> & {
  src: string;
  fallbackSrc?: string;
  /* Agent L2: live inspector bind */
  builderId?: string;
  builderField?: string;
  builderInstanceId?: string;
};

const OPTIMIZED_HOSTS = new Set([
  "images.unsplash.com",
  "images.pexels.com",
  "media-cdn.tripadvisor.com",
  "dynamic-media-cdn.tripadvisor.com",
  "media.tacdn.com",
  "dynamic-media.tacdn.com",
]);

function canOptimize(src: string): boolean {
  if (!src) return true;
  if (src.startsWith("/") || src.startsWith("data:")) return true;
  try {
    return OPTIMIZED_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

/**
 * next/image wrapper that swaps to a known-good fallback when the source fails.
 * In the builder, always render a native img so inspector src writes stick.
 */
export default function SafeImage({
  src,
  fallbackSrc = IMAGE_FALLBACK,
  alt,
  className,
  fill,
  builderId,
  builderField,
  builderInstanceId,
  ...rest
}: SafeImageProps) {
  const resolved = unwrapCssUrl(src) || fallbackSrc;
  const bindAttrs = {
    "data-builder-id": builderId,
    "data-field": builderField,
    "data-builder-field": builderField,
    "data-instance-id": builderInstanceId,
  };
  const [current, setCurrent] = useState(resolved);
  const [failedOnce, setFailedOnce] = useState(false);
  const bound = Boolean(builderId || builderField);

  useEffect(() => {
    if (!resolved) return;
    setCurrent(resolved);
    setFailedOnce(false);
  }, [resolved]);

  const optimized = !bound && canOptimize(current || fallbackSrc);

  const onError = () => {
    if (bound) return;
    if (!failedOnce && current !== fallbackSrc) {
      setFailedOnce(true);
      setCurrent(fallbackSrc);
    }
  };

  if (!optimized) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={resolved}
        src={current || resolved}
        alt={alt}
        className={cn(
          fill && "absolute inset-0 h-full w-full object-cover",
          className
        )}
        onError={onError}
        {...bindAttrs}
      />
    );
  }

  return (
    <Image
      {...rest}
      key={resolved}
      fill={fill}
      className={className}
      src={current || fallbackSrc}
      alt={alt}
      onError={onError}
      {...bindAttrs}
    />
  );
}
