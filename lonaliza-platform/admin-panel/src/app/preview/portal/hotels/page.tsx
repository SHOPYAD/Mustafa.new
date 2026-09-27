"use client";

import { Suspense } from "react";
import InternalHotelsContent from "@/components/hotels/InternalHotelsContent";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function PortalHotelsPreview() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      }
    >
      <div className="w-full min-h-screen bg-slate-50 text-slate-900">
        <InternalHotelsContent />
      </div>
    </Suspense>
  );
}
