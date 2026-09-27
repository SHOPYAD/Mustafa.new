"use client";

import { Suspense } from "react";
import CommunityFeedPage from "@/app/(site)/community/page";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function PortalSocialPreview() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      }
    >
      <div className="w-full min-h-screen bg-slate-50">
        <CommunityFeedPage />
      </div>
    </Suspense>
  );
}
