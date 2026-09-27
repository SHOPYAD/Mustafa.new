"use client";

import { Suspense } from "react";
import HomepageView from "@/components/home/template/HomepageView";
import { defaultHomepageDraft } from "@/lib/visual-editor/schema";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

function HomepageContent() {
  const draft = defaultHomepageDraft();
  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <HomepageView initialDraft={draft} />
    </div>
  );
}

export default function PortalHomepagePreview() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      }
    >
      <HomepageContent />
    </Suspense>
  );
}
