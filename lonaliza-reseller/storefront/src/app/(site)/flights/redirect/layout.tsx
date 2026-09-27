import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "جاري التحويل | لوناليزا للسياحة والسفر",
  robots: { index: false, follow: false },
};

export default function FlightsRedirectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
