"use client";

import { Plug } from "lucide-react";
import ProvidersHub from "@/components/admin/providers/ProvidersHub";
import { EnterprisePageHeader } from "@/components/admin/enterprise";

export default function AdminProvidersPage() {
  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6">
      <EnterprisePageHeader
        icon={Plug}
        title="مزودو البحث والحجز والتوزيع"
        description="طيران، فنادق، سيارات، وترانسفير — تفعيل المزودين، إدارة مفاتيح API، وبوابات التوزيع المباشرة."
        badge="Suppliers & APIs"
      />
      <ProvidersHub />
    </div>
  );
}
