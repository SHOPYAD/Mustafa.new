"use client";

export const dynamic = "force-dynamic";

export default function PortalSocialPreview() {
  return (
    <div className="w-full min-h-screen bg-slate-50">
      <iframe src="/community" title="Community Preview" className="w-full h-screen border-0" />
    </div>
  );
}
