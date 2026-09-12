"use client";

import { useEffect, useState } from "react";

type Props = {
  city: string;
  country?: string;
  alt: string;
  className?: string;
};

export default function DestinationCityImage({ city, country, alt, className }: Props) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    const qs = new URLSearchParams({ city });
    if (country) qs.set("country", country);
    void fetch(`/api/destination-image?${qs}`, { cache: "force-cache" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const url = typeof data?.url === "string" ? data.url : "";
        if (url.startsWith("https://")) setSrc(url);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [city, country]);

  if (!src) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2e1065] to-[#1e1b4b] text-white ${className || ""}`}>
        <span className="text-2xl font-black tracking-wide">{city.slice(0, 2).toUpperCase()}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} loading="lazy" />
  );
}
