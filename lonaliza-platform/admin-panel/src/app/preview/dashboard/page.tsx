"use client";

import { AdminStatsDashboard } from "@/components/admin/dashboard/AdminStatsDashboard";

export default function PreviewDashboardPage() {
  return (
    <div className="space-y-6">
      <AdminStatsDashboard statsEndpoint="/api/preview/stats" />
    </div>
  );
}
