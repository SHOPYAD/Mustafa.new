import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوناليزا | تحديث مجدول",
  robots: { index: false, follow: false },
};

/** Isolated shell route — do not wrap with site chrome or product carousels. */
export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
