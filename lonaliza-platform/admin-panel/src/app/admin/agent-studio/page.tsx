"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SciFiAgentHudStudio from "@/components/admin/automation/hud/SciFiAgentHudStudio";

export default function AdminAgentStudioPage() {
  const router = useRouter();

  return (
    <SciFiAgentHudStudio
      onExit={() => {
        router.push("/admin/agent-war-room");
      }}
    />
  );
}
