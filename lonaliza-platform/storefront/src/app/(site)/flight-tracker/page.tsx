import type { Metadata } from "next";
import FlightTrackerClient from "./FlightTrackerClient";

export const metadata: Metadata = {
  title: "رادار تتبع رحلات الطيران مباشرة مجاناً | لوناليزا رادار الرحلات الجوية",
  description:
    "تعقب مسار طائرتك أو طائرة عائلتك لحظة بلحظة عبر رادار الطيران المباشر التفاعلي لجميع الرحلات القادمة والمغادرة من مطارات تركيا والخليج والعالم بدقة فائقة.",
  keywords: [
    "تتبع رحلات الطيران",
    "رادار الطيران المباشر",
    "تعقب رحلات مطار اسطنبول",
    "الخطوط التركية تتبع",
    "الخطوط السعودية رادار",
    "فلاي دبي تتبع الرحلة",
    "Live Flight Radar",
    "Flight Tracker Turkey",
  ],
  openGraph: {
    title: "رادار تتبع رحلات الطيران مباشرة مجاناً | لوناليزا VIP",
    description:
      "شاهد طائرتك في الجو مباشرة وتعقب موعد الهبوط ووقت الوصول المتبقي وصالة المطار لحظة بلحظة مجاناً.",
    url: "https://lonaliza.com/flight-tracker",
    siteName: "لوناليزا للسياحة والنقل الفاخر Lonaliza VIP",
    locale: "ar_SA",
    type: "website",
  },
  alternates: {
    canonical: "https://lonaliza.com/flight-tracker",
  },
};

export default function FlightTrackerPage() {
  return <FlightTrackerClient />;
}
