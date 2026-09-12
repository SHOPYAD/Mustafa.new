"use client";

import { useState } from "react";
import {
  Briefcase,
  Car,
  MessageCircle,
  Snowflake,
  Users,
} from "lucide-react";
import type { RentalCar } from "@/types/car";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { buildBusinessWhatsAppLink } from "@/lib/site-whatsapp";
import SafeImage from "@/components/ui/SafeImage";
import { carCategoryLabel, carDisplayName, carTransmissionLabel } from "@/lib/cars/labels";
import LoyaltyPointsRow from "@/components/loyalty/LoyaltyPointsRow";
import { useCurrency } from "@/components/ui/CurrencySelector";
import EnquiryModal from "@/components/ui/EnquiryModal";

type CarCardProps = {
  car: RentalCar;
  days?: number;
  whatsappMessage: string;
};

export default function CarCard({
  car,
  days = 1,
  whatsappMessage,
}: CarCardProps) {
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const name = carDisplayName(car, locale);
  const total = car.pricePerDay * Math.max(1, days);
  const waLink = buildBusinessWhatsAppLink(whatsappMessage);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <SafeImage
          src={
            car.image ||
            "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800"
          }
          alt={name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r from-[#1e3a5f] to-emerald-600 shadow-lg">
            {carCategoryLabel(car.category, locale)}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 text-white font-bold drop-shadow">
          {formatPrice(car.pricePerDay, car.currency || "USD")}
          <span className="text-xs font-medium opacity-80"> {t.cars.perDay}</span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3
          className="text-lg font-bold text-slate-900 mb-1"
          style={{ fontFamily: "var(--font-sora)" }}
        >
          {name}
        </h3>
        <p className="text-slate-500 text-sm mb-4">
          {carTransmissionLabel(car.transmission, locale)}
          {car.airConditioning ? ` · ${t.cars.airConditioning}` : ""}
        </p>

        <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-5">
          <span className="inline-flex items-center gap-1.5">
            <Users size={15} className="text-emerald-600" />
            {car.passengers} {t.cars.passengers}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Briefcase size={15} className="text-emerald-600" />
            {car.luggage} {t.cars.luggage}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Car size={15} className="text-emerald-600" />
            {car.doors} {t.cars.doors}
          </span>
          {car.airConditioning ? (
            <span className="inline-flex items-center gap-1.5">
              <Snowflake size={15} className="text-emerald-600" />
              A/C
            </span>
          ) : null}
        </div>

        <LoyaltyPointsRow
          amount={total}
          currency={car.currency || "USD"}
          service="cars"
          className="mb-4"
        />

        {days > 1 ? (
          <p className="text-sm text-slate-500 mb-4">
            {t.cars.estimatedTotal}:{" "}
            <span className="font-bold text-slate-900">
              {formatPrice(total, car.currency || "USD")}
            </span>{" "}
            <span className="text-slate-400">
              ({days} {t.cars.rentalDays})
            </span>
          </p>
        ) : null}

        <div className="mt-auto space-y-2">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0a1628] hover:bg-[#152d4a] text-white font-semibold transition-colors"
          >
            <MessageCircle size={18} className="text-emerald-400" />
            {t.cars.bookWhatsApp}
          </a>
          <button
            type="button"
            onClick={() => setEnquiryOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
          >
            {t.common.bookNow}
          </button>
        </div>
      </div>
      <EnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        bookingType="car"
        packageName={name}
        destination={car.pickupLocationIds?.[0] || ""}
      />
    </div>
  );
}
