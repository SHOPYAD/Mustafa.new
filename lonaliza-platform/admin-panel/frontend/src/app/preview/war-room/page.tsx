"use client";

import AgentWarRoom from "@/components/admin/automation/AgentWarRoom";

export default function PreviewWarRoomPage() {
  return (
    <div className="space-y-6">
      <AgentWarRoom apiEndpoint="/api/preview/war-room" />
    </div>
  );
}
