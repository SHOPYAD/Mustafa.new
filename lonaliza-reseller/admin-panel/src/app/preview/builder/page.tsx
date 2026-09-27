"use client";

import { BuilderShell } from "@/components/builder/builder-shell";

export default function PreviewBuilderPage() {
  return (
    <div className="h-[850px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-background">
      <BuilderShell />
    </div>
  );
}
