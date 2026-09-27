"use client";

import { AlertTriangle, BedDouble, CalendarDays, CheckCircle2, Download, Loader2, MessageCircle, Star, Users } from "lucide-react";
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
  /** Supplier reservation state for quote-backed bookings (see hotel-booking-confirm.ts). */
  fulfilment_status?: string;
  supplier?: string;
  supplier_reference?: string;
  hotel_confirmation_code?: string;
  fulfilment_error?: string;
};

const FULFILMENT_COPY: Record<string, Record<"ar" | "en" | "tr", { title: string; body: string }>> = {
  pending: {
    ar: { title: "جارٍ تأكيد الحجز مع الفندق", body: "استلمنا دفعتك ونقوم الآن بتثبيت الغرفة لدى المورد. يستغرق ذلك عادةً أقل من دقيقة، وسنرسل الفوشر إلى بريدك فور التأكيد." },
    en: { title: "Confirming with the hotel", body: "Your payment is received and we are securing the room with the supplier. This usually takes under a minute; the voucher is e-mailed as soon as it is confirmed." },
    tr: { title: "Otel ile onaylanıyor", body: "Ödemeniz alındı, oda tedarikçi nezdinde teyit ediliyor. Bu genellikle bir dakikadan kısa sürer; voucher onaylanır onaylanmaz e-postanıza gönderilir." },
  },
  confirmed: {
    ar: { title: "تم تأكيد الحجز مع الفندق", body: "الغرفة مثبّتة باسمك. رقم تأكيد الفندق مذكور أدناه، والفوشر الرسمي أُرسل إلى بريدك الإلكتروني." },
    en: { title: "Confirmed with the hotel", body: "The room is secured in your name. The hotel confirmation number is below and the official voucher has been e-mailed to you." },
    tr: { title: "Otel ile onaylandı", body: "Oda adınıza teyit edildi. Otel onay numarası aşağıda; resmi voucher e-postanıza gönderildi." },
  },
  failed: {
    ar: { title: "تعذّر تثبيت الغرفة لدى الفندق", body: "لم يقبل المورد الحجز بعد الدفع. تم بدء استرداد المبلغ كاملاً إلى وسيلة الدفع نفسها تلقائياً، وسيتواصل معك فريقنا لاختيار بديل." },
    en: { title: "The hotel could not confirm the room", body: "The supplier rejected the reservation after payment. A full refund to the same payment method has been started automatically and our team will contact you with alternatives." },
    tr: { title: "Otel odayı teyit edemedi", body: "Tedarikçi ödeme sonrası rezervasyonu kabul etmedi. Aynı ödeme yöntemine tam iade otomatik olarak başlatıldı; ekibimiz alternatifler için sizinle iletişime geçecek." },
  },
  refunded: {
    ar: { title: "تم استرداد المبلغ", body: "أُعيد المبلغ إلى وسيلة الدفع نفسها. قد يستغرق ظهوره في كشف حسابك من 3 إلى 10 أيام عمل حسب البنك." },
    en: { title: "Refund issued", body: "The amount has been returned to the same payment method. It may take 3–10 business days to appear on your statement depending on your bank." },
    tr: { title: "İade yapıldı", body: "Tutar aynı ödeme yöntemine iade edildi. Bankanıza göre hesap özetinizde görünmesi 3–10 iş günü sürebilir." },
  },
};

function fulfilmentKind(status?: string): keyof typeof FULFILMENT_COPY | null {
  switch (status) {
    case "supplier_pending":
      return "pending";
    case "supplier_confirmed":
    case "voucher_sent":
      return "confirmed";
    case "supplier_failed":
    case "refund_pending":
    case "refund_failed":
      return "failed";
    case "refunded":
      return "refunded";
    default:
      return null;
  }
}

export function FulfilmentBanner({ booking, locale }: { booking: HotelReceiptModel; locale: string }) {
  const kind = fulfilmentKind(booking.fulfilment_status);
  if (!kind) return null;
  const lang = (locale === "en" || locale === "tr" ? locale : "ar") as "ar" | "en" | "tr";
  const copy = FULFILMENT_COPY[kind][lang];
  const tone =
    kind === "confirmed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-950"
      : kind === "pending"
        ? "border-sky-200 bg-sky-50 text-sky-950"
        : "border-amber-300 bg-amber-50 text-amber-950";
  const Icon = kind === "confirmed" ? CheckCircle2 : kind === "pending" ? Loader2 : AlertTriangle;
  const code = booking.hotel_confirmation_code || booking.supplier_reference || "";
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${tone}`} role="status" aria-live="polite">
      <Icon size={18} className={`mt-0.5 shrink-0 ${kind === "pending" ? "animate-spin" : ""}`} />
      <div className="min-w-0 text-sm">
        <p className="font-bold">{copy.title}</p>
        <p className="mt-0.5 leading-relaxed opacity-90">{copy.body}</p>
        {kind === "confirmed" && code ? (
          <p className="mt-1.5 font-semibold" dir="ltr">
            {lang === "ar" ? "رقم تأكيد الفندق:" : lang === "tr" ? "Otel onay no:" : "Hotel confirmation no.:"} {code}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type Props = {
  booking: HotelReceiptModel;
  paymentQuery?: string;
  onReopenWhatsApp?: () => void;
};

function isPaid(booking: HotelReceiptModel): boolean {
  const status = String(booking.status || "").toLowerCase();
  const pay = String(booking.payment_status || "").toLowerCase();
  return status === "paid" && pay === "paid" && !pay.includes("pending_review");
}

export default function HotelBookingReceipt({ booking, paymentQuery: _paymentQuery, onReopenWhatsApp }: Props) {
  const { t, locale } = useLocale();
  const { formatPrice } = useCurrency();
  const cardPaid = booking.payment_method === "card" && isPaid(booking);
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
            <FulfilmentBanner booking={booking} locale={locale} />
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
