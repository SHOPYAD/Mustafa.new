import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "حجز الطيران | الريان للسياحة",
  robots: { index: false, follow: false },
};

export default function FlightBookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
