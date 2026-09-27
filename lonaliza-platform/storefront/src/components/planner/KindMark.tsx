import {
  Car,
  Hotel,
  Landmark,
  MapPin,
  Plane,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/types";
import type { PlannerStopKind } from "@/types/planner";

const ICONS: Record<PlannerStopKind, typeof Landmark> = {
  attraction: Landmark,
  hotel: Hotel,
  food: UtensilsCrossed,
  restaurant: UtensilsCrossed,
  shopping: ShoppingBag,
  airport: Plane,
  transfer: Car,
  viewpoint: Landmark,
  custom: MapPin,
};

const TONE: Record<PlannerStopKind, string> = {
  attraction: "bg-[#F3E8FF] text-[#6D28D9]",
  hotel: "bg-[#FEF3C7] text-[#B45309]",
  food: "bg-[#FEE2E2] text-[#B91C1C]",
  restaurant: "bg-[#FEE2E2] text-[#B91C1C]",
  shopping: "bg-[#DBEAFE] text-[#1D4ED8]",
  airport: "bg-[#E0E7FF] text-[#3730A3]",
  transfer: "bg-[#ECFDF5] text-[#047857]",
  viewpoint: "bg-[#E0E7FF] text-[#4338CA]",
  custom: "bg-[#F4F2FA] text-[#4B4568]",
};

export function KindMark({
  kind,
  size = 14,
}: {
  kind: PlannerStopKind;
  size?: number;
}) {
  const Icon = ICONS[kind] || MapPin;
  return (
    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${TONE[kind] || TONE.custom}`}>
      <Icon size={size} />
    </span>
  );
}

export function kindLabel(kind: PlannerStopKind, locale: Locale | boolean) {
  const lang = locale === true ? "ar" : locale === false ? "en" : locale;
  const maps: Record<Locale, Record<PlannerStopKind, string>> = {
    ar: {
      attraction: "معلم",
      hotel: "فندق",
      food: "مطعم",
      restaurant: "مطعم",
      shopping: "تسوق",
      airport: "مطار",
      transfer: "انتقال",
      viewpoint: "مطل بانورامي",
      custom: "نشاط",
    },
    en: {
      attraction: "Sight",
      hotel: "Hotel",
      food: "Food",
      restaurant: "Restaurant",
      shopping: "Shop",
      airport: "Airport",
      transfer: "Transfer",
      viewpoint: "Viewpoint",
      custom: "Activity",
    },
    tr: {
      attraction: "Gezilecek yer",
      hotel: "Otel",
      food: "Yemek",
      restaurant: "Restoran",
      shopping: "Alışveriş",
      airport: "Havalimanı",
      transfer: "Transfer",
      viewpoint: "Manzara noktası",
      custom: "Aktivite",
    },
    fr: {
      attraction: "Site",
      hotel: "Hôtel",
      food: "Restaurant",
      restaurant: "Restaurant",
      shopping: "Boutique",
      airport: "Aéroport",
      transfer: "Transfert",
      viewpoint: "Point de vue",
      custom: "Activité",
    },
  };
  return (maps[lang] || maps.en)[kind] || maps.en.custom;
}
