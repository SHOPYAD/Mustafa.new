import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "معاينة منشور",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

/** Unlisted approval preview — not the marketing storefront. */
export default function PublishPreviewLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-zinc-50 text-zinc-900">{children}</div>;
}
