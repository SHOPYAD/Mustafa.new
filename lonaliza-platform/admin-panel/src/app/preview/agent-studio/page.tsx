"use client";

import React from "react";
import SciFiAgentHudStudio from "@/components/admin/automation/hud/SciFiAgentHudStudio";

export default function PreviewAgentStudioPage() {
  return (
    <div className="fixed inset-0 z-50 bg-[#020813] text-foreground">
      <SciFiAgentHudStudio
        apiEndpoint="/api/preview/war-room"
        onExit={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/preview/war-room";
          }
        }}
      />
    </div>
  );
}
