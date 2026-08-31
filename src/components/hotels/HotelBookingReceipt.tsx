"use client";

import { BedDouble, CalendarDays, Download, MessageCircle, Star, Users } from "lucide-react";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export type HotelReceiptModel = {
  id: string;
  hotel_name: string;
  hotel_image: string;
  stars: number;
  rating: number;
  room_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  guest_names: string[];
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  nightly: number;
  price: number;
  currency: string;
  payment_method: "card" | "whatsapp" | "other";
  status: string;
  payment_status: string;
  confirm: string;
  service?: "flight" | "hotel" | "transfer" | "car" | "package" | "tour" | "visa";
};

type Props = {
  booking: HotelReceiptModel;
  paymentQuery?: string;
  onReopenWhatsApp?: () => void;
};

function isPaid(booking: HotelReceiptModel, paymentQuery?: string): boolean {
  const status = `${booking.status} ${booking.payment_status} ${paymentQuery || ""}`.toLowerCase();
  return status.includes("paid") && !status.includes("pending_review");
}

export default function HotelBookingReceipt({ booking, paymentQuery, onReopenWhatsApp }: Props) {
  const { t } = useLocale();
  const { formatPrice } = useCurrency();
  const cardPaid = booking.payment_method === "card" && isPaid(booking, paymentQuery);
  const whatsappPath = booking.payment_method === "whatsapp";
  const pdfHref = `/api/hotel-bookings/${encodeURIComponent(booking.id)}/pdf?confirm=${encodeURIComponent(booking.confirm)}`;

  return (
    <article className="overflow-hidden rounded-3xl border border-[#d9cbb3] bg-white shadow-[0_18px_50px_rgba(16,32,51,0.08)]">
      <div className="flex items-center justify-between gap-3 bg-[#051741] px-5 py-3.5 text-white md:px-7">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">{t.hotels.receiptTitle}</p>
          <p className="text-sm font-bold">
            {t.hotels.bookingRef}: <span dir="ltr">{booking.id}</span>
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
          {cardPaid ? t.hotels.paidStatusLabel : whatsappPath ? t.hotels.pendingPayment : booking.payment_status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
        <div className="border-b border-[#efe6d8] lg:border-b-0 lg:border-e">
          <div className="relative h-48 bg-slate-200 sm:h-56">
            {booking.hotel_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={booking.hotel_image} alt={booking.hotel_name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                <BedDouble size={36} />
              </div>
            )}
          </div>
          <div className="space-y-3 p-5 md:p-6">
            <div>
              <h2 className="text-xl font-bold text-[#102033]">{booking.hotel_name}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm">
                {booking.stars > 0
                  ? Array.from({ length: Math.min(5, booking.stars) }).map((_, i) => (
                      <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                    ))
                  : null}
                {booking.rating > 0 ? (
                  <span className="rounded-md bg-[#051741] px-1.5 py-0.5 text-[11px] font-bold text-white">
                    {booking.rating.toFixed(1)}
                  </span>
                ) : null}
              </div>
            </div>
            {booking.room_name ? (
              <p className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                <BedDouble size={15} /> {booking.room_name}
              </p>
            ) : null}
            <p className="inline-flex items-center gap-1.5 text-sm text-slate-700">
              <CalendarDays size={15} /> {booking.check_in} → {booking.check_out} ·{" "}
              {t.hotels.nightsCount(booking.nights)}
            </p>
            <p className="inline-flex items-center gap-1.5 text-sm text-slate-700">
              <Users size={15} /> {t.hotels.guestsLine(booking.adults, booking.children)}
            </p>
            {booking.guest_names.length ? (
              <ul className="space-y-1 text-sm text-slate-600">
                {booking.guest_names.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-5 bg-[#fbf7f0] p-5 md:p-7">
          <div className="space-y-4">
            {cardPaid ? (
              <div className="rounded-2xl bg-[#051741] px-4 py-4 text-white">
                <p className="text-lg font-bold leading-snug">{t.hotels.bookingPaid}</p>
                <p className="mt-1 text-sm text-white/75">{t.hotels.paymentMethodCard}</p>
              </div>
            ) : whatsappPath ? (
              <div className="space-y-2">
                <p className="text-lg font-bold text-[#102033]">{t.hotels.bookingSaved}</p>
                <p className="text-sm text-slate-600">{t.hotels.pendingPayment}</p>
                <p className="text-sm text-slate-700">{t.hotels.whatsappSentNote}</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-bold text-[#102033]">{t.hotels.bookingSaved}</p>
                <p className="mt-1 text-sm text-slate-600">{t.hotels.pendingPayment}</p>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>{t.hotels.nightlyRate}</span>
                <span>
                  {formatPrice(booking.nightly, booking.currency || "USD")}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t.hotels.nightsCount(booking.nights)}</span>
                <span>× {booking.nights}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{t.hotels.taxesFees}</span>
                <span>{t.hotels.includesTaxes}</span>
              </div>
              <div className="flex justify-between border-t border-[#e8dcc8] pt-2 text-base font-bold text-[#102033]">
                <span>{t.hotels.alrayyanTotal}</span>
                <span>
                  {formatPrice(booking.price, booking.currency || "USD")}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t.hotels.paymentMethodQuestion}:{" "}
                {booking.payment_method === "card" ? t.hotels.paymentMethodCard : t.hotels.paymentMethodWhatsApp}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <a
              href={pdfHref}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#051741] py-3 text-sm font-bold text-white"
            >
              <Download size={16} /> {t.hotels.downloadBookingPdf}
            </a>
            {whatsappPath && onReopenWhatsApp ? (
              <button
                type="button"
                onClick={onReopenWhatsApp}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#051741] py-3 text-sm font-bold text-[#051741]"
              >
                <MessageCircle size={16} /> {t.hotels.reopenWhatsApp}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
