"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { parseHotelApiJson } from "@/lib/hotels-config";

type Props = {
  images: string[];
  name: string;
  className?: string;
  hotelId?: string;
};

export default function HotelPhotoSlider({ images, name, className, hotelId }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [extra, setExtra] = useState<string[]>([]);
  const photos = Array.from(new Set([...images, ...extra].filter(Boolean)));
  const [index, setIndex] = useState(0);
  const current = photos[Math.min(index, Math.max(photos.length - 1, 0))];

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setVisible(true);
      },
      { rootMargin: "200px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !hotelId || images.length >= 3) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/hotels/photos?id=${encodeURIComponent(hotelId)}`, {
          cache: "no-store",
        });
        const json = parseHotelApiJson(await res.text());
        const list = Array.isArray(json.photos) ? (json.photos as string[]) : [];
        if (!cancelled && list.length) setExtra(list);
      } catch {
        /* keep the search photo */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, hotelId, images.length]);

  if (!photos.length) {
    return (
      <div
        ref={rootRef}
        className={`flex h-full min-h-0 items-center justify-center bg-slate-200 text-slate-500 ${className || ""}`}
      >
        <span className="inline-flex items-center gap-2 text-sm px-3 text-center">
          <ImageOff size={16} />
          {name}
        </span>
      </div>
    );
  }

  const go = (next: number, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((next + photos.length) % photos.length);
  };

  return (
    <div
      ref={rootRef}
      className={`relative h-full min-h-0 overflow-hidden bg-slate-200 ${className || ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== "/images/hotel-placeholder.jpg") {
            target.src = "/images/hotel-placeholder.jpg";
          }
        }}
      />
      {photos.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => go(index - 1, e)}
            className="absolute start-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => go(index + 1, e)}
            className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1">
            {photos.slice(0, 8).map((src, i) => (
              <button
                key={src + i}
                type="button"
                aria-label={`Photo ${i + 1}`}
                onClick={(e) => go(i, e)}
                className={`h-1.5 rounded-full ${i === index ? "w-4 bg-white" : "w-1.5 bg-white/60"}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
