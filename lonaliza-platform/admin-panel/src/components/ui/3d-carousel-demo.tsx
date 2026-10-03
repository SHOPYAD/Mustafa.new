"use client";

import React from "react";
import { ThreeDPhotoCarousel } from "@/components/ui/3d-carousel";

export function ThreeDPhotoCarouselDemo() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="min-h-[500px] flex flex-col justify-center border border-dashed border-cyan-500/30 rounded-2xl bg-slate-950/40 p-4">
        <ThreeDPhotoCarousel />
      </div>
    </div>
  );
}

export default ThreeDPhotoCarouselDemo;
