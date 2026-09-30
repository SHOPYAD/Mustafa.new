"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UnifiedCyberneticStudio from "@/components/admin/automation/hud/studio/UnifiedCyberneticStudio";

function NeuralStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialScreen = searchParams?.get("screen") || "20";

  return (
    <div data-screen={initialScreen} className="w-full h-full">
      <UnifiedCyberneticStudio
        initialScreenId={initialScreen}
        onExit={() => {
          router.push("/admin/agent-war-room");
        }}
      />
    </div>
  );
}

export default function AdminNeuralStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#020c17] flex items-center justify-center text-cyan-400 font-mono">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_20px_#00e5ff]" />
            <span className="text-sm font-bold tracking-widest uppercase">
              جاري تحميل استوديو العمليات السيبراني...
            </span>
          </div>
        </div>
      }
    >
      <NeuralStudioContent />
    </Suspense>
  );
}
