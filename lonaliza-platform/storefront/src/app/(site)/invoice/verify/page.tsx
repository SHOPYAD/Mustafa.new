import { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Plane,
  Hotel,
  Car,
  Bus,
  MapPin,
  Calendar,
  Clock,
  UserRound,
  CreditCard,
  Building,
  Phone,
  Mail,
  ExternalLink,
  Languages,
} from "lucide-react";
import { verifyInvoiceSignature } from "@/lib/server/invoice-signature";
import { resolveOfficialInvoice } from "@/lib/server/invoice-resolver";
import { getInvoiceTranslations, type InvoiceLang } from "@/lib/server/invoice-i18n";
import AirlineLogo from "@/components/flights/AirlineLogo";
import PrintInvoiceButton from "@/components/invoice/PrintInvoiceButton";

export const metadata: Metadata = {
  title: "التحقق من الفاتورة الرسمية | لوناليزا للسياحة والسفر",
  description: "نظام التحقق المالي الرقمي الرسمي من صحة فواتير الحجوزات الصادرة من شركة لوناليزا للسياحة والسفر.",
};

type Props = {
  searchParams: Promise<{ id?: string; inv?: string; sig?: string; lang?: string }>;
};

export default async function InvoiceVerifyPage({ searchParams }: Props) {
  const params = await searchParams;
  const bookingId = params.id || "";
  const invoiceNumber = params.inv || "";
  const signature = params.sig || "";
  const requestedLang = params.lang || "ar";

  const isValidSignature = await verifyInvoiceSignature(bookingId, invoiceNumber, signature);
  const invoice = isValidSignature ? await resolveOfficialInvoice(bookingId) : null;

  if (!isValidSignature || !invoice) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 py-20">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-4">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-xl font-black text-slate-900">تعذر التحقق من صحة الفاتورة</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            الرابط أو التوقيع الرقمي المشفر غير مطابق لقواعد التوثيق الرسمية المعتمدة لشركة لوناليزا للسياحة والسفر، أو ربما تم تعديل بيانات الرابط.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-[#18082e] text-amber-300 px-6 py-3 text-xs font-bold shadow-md"
            >
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { t, lang, dir } = getInvoiceTranslations(requestedLang);
  const { company, customer, bookingDetails, pricing, templateSettings } = invoice;
  const isFlight = invoice.serviceType === "flight";
  const isHotel = invoice.serviceType === "hotel";

  const langLinks: Array<{ code: InvoiceLang; label: string }> = [
    { code: "ar", label: "العربية" },
    { code: "en", label: "English" },
    { code: "tr", label: "Türkçe" },
    { code: "fr", label: "Français" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8" dir={dir}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Language Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 px-5 rounded-2xl border border-slate-200 shadow-sm text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-bold">
            <Languages size={16} className="text-purple-700" />
            <span>لغة عرض وتنزيل الفاتورة (Invoice Language):</span>
          </div>
          <div className="flex items-center gap-1">
            {langLinks.map((item) => (
              <Link
                key={item.code}
                href={`/invoice/verify?id=${bookingId}&inv=${invoiceNumber}&sig=${signature}&lang=${item.code}`}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  lang === item.code
                    ? "bg-[#18082e] text-amber-300 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Verification Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-emerald-900 via-[#18082e] to-emerald-950 p-5 px-6 text-white shadow-xl">
          <div className="flex items-center gap-3 text-center sm:text-start">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40">
              <ShieldCheck size={26} />
            </span>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {t.qrSection.verifiedBadge}
                </span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h2 className="text-base sm:text-lg font-black mt-0.5">
                {t.documentSubtitle}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direct PDF Download */}
            <a
              href={`/api/account/invoices/${bookingId}/pdf?lang=${lang}`}
              download
              className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-[#18082e] font-black px-4 py-2.5 text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Download size={14} />
              <span>{t.downloadPdf}</span>
            </a>

            <PrintInvoiceButton />
          </div>
        </div>

        {/* Printable Official Invoice Document */}
        <div
          id="official-tax-invoice"
          className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-2xl space-y-8 print:p-0 print:border-none print:shadow-none"
        >
          {/* Header with Company Details & QR Code */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#18082e] text-amber-300 font-black text-xl shadow-md">
                  LL
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#18082e] tracking-tight">
                    {company.nameAr}
                  </h1>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                    {company.nameEn}
                  </p>
                </div>
              </div>

              {/* Official Registration & TÜRSAB / IATA Numbers */}
              <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                <p className="font-semibold text-slate-800">
                  {t.companyInfo.tursab} · {t.companyInfo.iata}
                </p>
                <p>{t.companyInfo.taxOffice}</p>
                <p>
                  {t.companyInfo.phone} · {t.companyInfo.email}
                </p>
              </div>
            </div>

            {/* QR Code with Cryptographic Seal */}
            <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
              <div className="relative rounded-2xl border-2 border-[#18082e]/20 bg-white p-2 shadow-md">
                <img
                  src={invoice.qrCodeDataUrl}
                  alt="Official Verification QR"
                  className="h-28 w-28 object-contain"
                />
              </div>
              <div className="text-center sm:text-end">
                <span className="font-mono text-xs font-black text-[#18082e] block">
                  {invoice.invoiceNumber}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mt-0.5">
                  ✓ {t.statusPaid}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Issue Metadata Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl bg-slate-50 p-4 sm:p-5 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t.customerSection.name}
              </span>
              <p className="text-sm font-black text-slate-900 mt-0.5">{customer.name}</p>
              <p className="font-mono text-slate-500 text-[11px] mt-0.5">{customer.email}</p>
              <p className="font-mono text-slate-500 text-[11px]">{customer.phone}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t.issuedAt}
              </span>
              <p className="font-mono font-black text-slate-800 text-xs mt-0.5">
                {invoice.issuedAt.slice(0, 10)}
              </p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mt-2">
                {t.pricingSection.paymentMethod}
              </span>
              <p className="font-bold text-slate-800 text-xs mt-0.5">
                {bookingDetails.paymentMethod}
              </p>
            </div>

            <div className="text-start sm:text-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {t.pnr}
              </span>
              <p className="font-mono text-lg font-black text-[#b45309] mt-0.5">
                {bookingDetails.pnr}
              </p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mt-1">
                {t.eTicket}
              </span>
              <p className="font-mono text-xs font-bold text-slate-700">
                {bookingDetails.passengersOrGuests[0]?.ticketOrDoc || bookingDetails.pnr}
              </p>
            </div>
          </div>

          {/* Booked Service Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>{t.serviceSection.title}</span>
              <span className="h-px flex-1 bg-slate-200" />
            </h3>

            <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-900 font-bold">
                    {isFlight ? <Plane size={16} /> : <Hotel size={16} />}
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{bookingDetails.title}</h4>
                    <p className="text-xs text-slate-500">{bookingDetails.subtitle}</p>
                  </div>
                </div>
                <span className="rounded-xl bg-purple-50 border border-purple-200 px-3 py-1 font-mono text-xs font-bold text-purple-950">
                  {bookingDetails.dateLine}
                </span>
              </div>

              {/* Flight Specifics */}
              {isFlight && bookingDetails.flightSummary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      {t.serviceSection.airline}
                    </span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {bookingDetails.flightSummary.airline}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      {t.serviceSection.flightNumber}
                    </span>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">
                      {bookingDetails.flightSummary.flightNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      {t.serviceSection.route}
                    </span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {bookingDetails.flightSummary.origin} ➔ {bookingDetails.flightSummary.destination}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      {t.serviceSection.cabinClass}
                    </span>
                    <p className="font-bold text-purple-900 mt-0.5">
                      {bookingDetails.flightSummary.cabinClass}
                    </p>
                  </div>
                </div>
              )}

              {/* Hotel Specifics */}
              {isHotel && bookingDetails.hotelSummary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">الفندق</span>
                    <p className="font-bold text-slate-800 mt-0.5">{bookingDetails.hotelSummary.hotelName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">نوع الغرفة</span>
                    <p className="font-bold text-slate-800 mt-0.5">{bookingDetails.hotelSummary.roomType}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">مدة الإقامة</span>
                    <p className="font-bold text-slate-800 mt-0.5">{bookingDetails.hotelSummary.nights} ليالٍ</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">نوع الوجبات</span>
                    <p className="font-bold text-emerald-800 mt-0.5">{bookingDetails.hotelSummary.boardType}</p>
                  </div>
                </div>
              )}

              {/* Passenger/Guest Names */}
              {bookingDetails.passengersOrGuests.length > 0 && (
                <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100 text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    {t.serviceSection.passengersOrGuests}
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {bookingDetails.passengersOrGuests.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-800">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-200 text-[10px] font-bold text-purple-950">
                          {idx + 1}
                        </span>
                        <span className="font-bold">{p.name}</span>
                        <span className="font-mono text-[11px] text-slate-500">({p.seatOrRoom})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>{t.pricingSection.title}</span>
              <span className="h-px flex-1 bg-slate-200" />
            </h3>

            <div className="rounded-2xl border border-slate-200 p-5 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{t.pricingSection.baseFare}:</span>
                <span className="font-mono font-bold text-slate-900">
                  ${pricing.baseFare.toFixed(2)} {pricing.currency}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>{t.pricingSection.taxesAndFees}:</span>
                <span className="font-mono font-bold text-slate-900">
                  ${pricing.taxesAndFees.toFixed(2)} {pricing.currency}
                </span>
              </div>

              {pricing.voucherDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>
                    {t.pricingSection.discount} ({pricing.voucherCode || "DISCOUNT"}):
                  </span>
                  <span className="font-mono">
                    -${pricing.voucherDiscount.toFixed(2)} {pricing.currency}
                  </span>
                </div>
              )}

              <div className="border-t-2 border-slate-200 pt-3 flex justify-between items-center text-sm font-black text-slate-900">
                <span>{t.pricingSection.netTotal}:</span>
                <span className="font-mono text-xl text-[#18082e]">
                  ${pricing.netTotal.toFixed(2)} {pricing.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Official Footer */}
          <div className="space-y-4 pt-4 border-t border-slate-200 text-xs">
            <div className="rounded-2xl bg-purple-50/50 p-4 border border-purple-100 text-slate-600 text-[11px] leading-relaxed space-y-1">
              <p className="font-bold text-[#18082e]">{templateSettings.footerNote}</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-500 pt-1">
                <li>{t.legalFooter.terms1}</li>
                <li>{t.legalFooter.terms2}</li>
                <li>{t.legalFooter.terms3}</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400 pt-2">
              <p>{t.legalFooter.sealText}</p>
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>CRYPTOGRAPHICALLY VERIFIED &amp; TAMPER PROOF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
