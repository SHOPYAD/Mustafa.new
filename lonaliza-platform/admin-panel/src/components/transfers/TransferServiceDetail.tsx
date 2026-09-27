"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Briefcase,
  Clock,
  Check,
  Car,
  MapPin,
  MessageCircle,
  Star,
  User,
  XCircle,
} from "lucide-react";
import { getTransferBySlug } from "@/data/transfers";
import type { TransferService } from "@/types/transfer";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import { buildBusinessWhatsAppLink } from "@/lib/site-whatsapp";
import EnquiryModal from "@/components/ui/EnquiryModal";
import VerifiedCustomerReviews from "@/components/reviews/VerifiedCustomerReviews";

const OsmRouteMap = dynamic(() => import("@/components/maps/OsmRouteMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] rounded-2xl bg-slate-100 animate-pulse" />
  ),
});

type TransferServiceDetailProps = {
  slug: string;
  backHref: string;
  backLabel: string;
};

export default function TransferServiceDetail({
  slug,
  backHref,
  backLabel,
}: TransferServiceDetailProps) {
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const [item, setItem] = useState<TransferService | null | undefined>(undefined);
  const [activeImage, setActiveImage] = useState(0);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  useEffect(() => {
    setItem(getTransferBySlug(slug) || null);
    setActiveImage(0);
  }, [slug]);

  const mapPoints = useMemo(() => {
    if (!item?.mapRoute?.length) return [];
    return item.mapRoute.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      label:
        locale === "ar"
          ? p.labelAr
          : locale === "tr"
            ? p.labelTr || p.labelEn
            : p.labelEn,
      description:
        locale === "ar"
          ? p.descriptionAr
          : locale === "tr"
            ? p.descriptionTr || p.descriptionEn
            : p.descriptionEn,
      photo: p.photo,
    }));
  }, [item, locale]);

  if (item === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!item || !item.isActive) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-slate-500 text-lg">{t.transfers.noTransfers}</p>
        <Link href={backHref} className="text-orange-600 font-semibold hover:underline">
          ← {backLabel}
        </Link>
      </div>
    );
  }

  const title = tContent(item, "title", locale);
  const description = tContent(item, "description", locale);
  const highlights = locale === "ar" || locale === "tr" ? item.highlightsAr : item.highlightsEn;
  const includes = locale === "ar" || locale === "tr" ? item.includesAr : item.includesEn;
  const program = locale === "ar" || locale === "tr" ? item.programAr || [] : item.programEn || [];
  const tips = locale === "ar" || locale === "tr" ? item.tipsAr || [] : item.tipsEn || [];
  const excluded = locale === "ar" || locale === "tr" ? item.excludedAr || [] : item.excludedEn || [];
  const driverName = locale === "ar" || locale === "tr" ? item.driverNameAr : item.driverNameEn;
  const driverBio = locale === "ar" || locale === "tr" ? item.driverBioAr : item.driverBioEn;
  const routeFrom =
    locale === "ar" ? item.routeFromAr || item.routeFrom : item.routeFrom || item.routeFromAr;
  const routeTo =
    locale === "ar" ? item.routeToAr || item.routeTo : item.routeTo || item.routeToAr;
  const gallery = [...item.images, ...(item.carPhotos || [])].filter(Boolean);
  const images =
    gallery.length > 0
      ? gallery
      : ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200"];
  const mainImage = images[activeImage] || images[0];
  const waMessage =
    locale === "ar" || locale === "tr" ? item.whatsappMessageAr : item.whatsappMessageEn;
  const waLink = buildBusinessWhatsAppLink(waMessage);
  const reviews = item.reviews || [];

  return (
    <>
      <section className="relative h-[55vh] min-h-[420px]">
        <Image src={mainImage} alt={title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <Link
          href={backHref}
          className="absolute top-24 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>{backLabel}</span>
        </Link>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <span
              className={`inline-block px-3 py-1 text-white text-xs font-bold rounded-full mb-4 ${
                item.type === "transfer" ? "bg-sky-600" : "bg-amber-600"
              }`}
            >
              {item.type === "transfer"
                ? t.transfers.airportTransfer
                : t.transfers.vipTours}
            </span>
            <h1
              className="text-3xl md:text-5xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-sora)" }}
            >
              {title}
            </h1>
            <div className="flex items-center gap-2 text-white/80">
              <Car size={16} />
              <span>
                {item.vehicleName} · {item.vehicleType} · {item.vehicleClass}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        activeImage === i
                          ? "border-amber-500"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={src} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
                {description}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl text-center">
                  <Users size={20} className="mx-auto mb-2 text-amber-600" />
                  <p className="text-xl font-bold text-slate-900">{item.seats}</p>
                  <p className="text-xs text-slate-500">{t.transfers.passengers}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl text-center">
                  <Briefcase size={20} className="mx-auto mb-2 text-amber-600" />
                  <p className="text-xl font-bold text-slate-900">{item.luggage}</p>
                  <p className="text-xs text-slate-500">{t.transfers.luggagePieces}</p>
                </div>
                {item.durationHours != null && (
                  <div className="p-4 bg-slate-50 rounded-2xl text-center">
                    <Clock size={20} className="mx-auto mb-2 text-amber-600" />
                    <p className="text-xl font-bold text-slate-900">{item.durationHours}</p>
                    <p className="text-xs text-slate-500">{t.transfers.hoursUnit}</p>
                  </div>
                )}
                <div className="p-4 bg-slate-50 rounded-2xl text-center">
                  <Car size={20} className="mx-auto mb-2 text-amber-600" />
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {item.vehicleClass}
                  </p>
                  <p className="text-xs text-slate-500">{item.vehicleType}</p>
                </div>
              </div>

              {(routeFrom || routeTo) && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-amber-600" />
                    {t.admin.route}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 p-5 bg-slate-50 rounded-2xl">
                    <span className="px-4 py-2 bg-white rounded-xl text-slate-800 font-semibold shadow-sm">
                      {routeFrom || "—"}
                    </span>
                    <span className="text-amber-600 font-bold">→</span>
                    <span className="px-4 py-2 bg-white rounded-xl text-slate-800 font-semibold shadow-sm">
                      {routeTo || "—"}
                    </span>
                  </div>
                </div>
              )}

              {program.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {t.admin.tourProgram}
                  </h2>
                  <ol className="space-y-3">
                    {program.map((step, i) => (
                      <li
                        key={step}
                        className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-amber-400 text-sm font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <p className="text-slate-700 leading-relaxed pt-1">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {mapPoints.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {t.admin.routeMap}
                  </h2>
                  <OsmRouteMap points={mapPoints} height={360} />
                </div>
              )}

              {(driverName || driverBio) && (
                <div className="rounded-2xl border border-slate-200 p-6 flex gap-4">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                    {item.driverPhoto ? (
                      <Image src={item.driverPhoto} alt={driverName || ""} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <User size={28} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-amber-700 mb-1">
                      {t.admin.driver}
                    </p>
                    <h3 className="text-lg font-bold text-slate-900">{driverName}</h3>
                    {driverBio && (
                      <p className="text-slate-600 text-sm mt-2 leading-relaxed">{driverBio}</p>
                    )}
                  </div>
                </div>
              )}

              {highlights.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {t.admin.highlights}
                  </h2>
                  <ul className="space-y-2">
                    {highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-slate-600">
                        <Check size={16} className="text-amber-600 flex-shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {includes.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {t.admin.includes}
                  </h2>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {includes.map((inc) => (
                      <li
                        key={inc}
                        className="flex items-center gap-2 text-slate-600 p-3 bg-emerald-50/60 rounded-xl"
                      >
                        <Check size={16} className="text-emerald-500 flex-shrink-0" />
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {excluded.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {t.admin.notIncluded}
                  </h2>
                  <ul className="space-y-2">
                    {excluded.map((ex) => (
                      <li key={ex} className="flex items-center gap-2 text-slate-600">
                        <XCircle size={16} className="text-rose-400 flex-shrink-0" />
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tips.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {t.admin.tips}
                  </h2>
                  <ul className="space-y-2">
                    {tips.map((tip) => (
                      <li key={tip} className="text-slate-600 text-sm leading-relaxed pl-3 border-s-2 border-amber-400">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {reviews.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    {t.admin.guestReviews}
                  </h2>
                  <p className="text-xs text-slate-400 mb-4">{t.catalog.sampleReviewsNote}</p>
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <p className="font-semibold text-slate-900">{r.name}</p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {locale === "ar"
                            ? r.textAr
                            : locale === "tr"
                              ? r.textTr || r.textEn
                              : r.textEn}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">{r.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <VerifiedCustomerReviews
                serviceType={item.type === "vip_tour" ? "tour" : "transfer"}
                serviceId={item.id}
                serviceName={tContent(item, "name", locale)}
              />
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-24 bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
                <p className="text-white/40 text-sm mb-1">{t.common.from}</p>
                <p className="text-4xl font-bold text-amber-400 mb-1">
                  {formatPrice(item.price, item.currency || "USD")}
                </p>
                {item.type === "vip_tour" && (
                  <p className="text-white/50 text-sm mb-6">{t.catalog.perVehicle}</p>
                )}
                <div className="space-y-2 text-sm text-white/60 mb-6">
                  <p>
                    {item.vehicleName} · {item.vehicleType}
                  </p>
                  <p>
                    {item.seats} {t.transfers.passengers} · {item.luggage}{" "}
                    {t.transfers.luggagePieces}
                  </p>
                  {item.durationHours != null && (
                    <p>
                      {item.durationHours} {t.transfers.hoursUnit}
                    </p>
                  )}
                </div>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all mb-3"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setEnquiryOpen(true)}
                  className="block w-full text-center py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-all"
                >
                  {t.transfers.bookNow}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <EnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        bookingType={item.type === "vip_tour" ? "tour" : "transfer"}
        packageName={title}
        destination={[routeFrom, routeTo].filter(Boolean).join(" → ")}
      />
    </>
  );
}
