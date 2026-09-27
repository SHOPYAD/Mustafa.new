import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "حجز الطيران | لوناليزا للسياحة والسفر",
  robots: { index: false, follow: false },
};

export default function FlightBookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
