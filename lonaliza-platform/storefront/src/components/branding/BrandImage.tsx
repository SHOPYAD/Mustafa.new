"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

function isNextImageSafe(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return url.hostname === "images.unsplash.com";
  } catch {
    return false;
  }
}

type BrandImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
};

export default function BrandImage({
  src,
  alt,
  className,
  width,
  height,
  fill,
  priority,
  sizes,
}: BrandImageProps) {
  const safe = src || "/logo.png";

  if (isNextImageSafe(safe)) {
    if (fill) {
      return (
        <Image
          src={safe}
          alt={alt}
          fill
          className={className}
          priority={priority}
          sizes={sizes}
        />
      );
    }
    return (
      <Image
        src={safe}
        alt={alt}
        width={width || 160}
        height={height || 55}
        className={className}
        priority={priority}
      />
    );
  }

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={safe}
        alt={alt}
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={safe}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}
