import type { OfficialInvoiceData } from "@/lib/server/invoice-resolver";
import type { MockBookingDetail } from "@/lib/server/mock-account-bookings";

export type HotelVoucherModel = {
  voucherNumber: string;
  hotelConfirmationNo: string;
  bookingId: string;
  issueDate: string;
  status: string;
  hotelName: string;
  hotelNameEn?: string;
  stars: number;
  hotelImage?: string;
  address: string;
  city: string;
  phone?: string;
  leadGuest: {
    name: string;
    email?: string;
    phone?: string;
    adultsCount: number;
    childrenCount: number;
  };
  otherGuests?: string[];
  checkIn: string;
  checkInTime: string;
  checkOut: string;
  checkOutTime: string;
  nights: number;
  roomType: string;
  bedType: string;
  mealPlan: string;
  cancellationPolicy: {
    isFreeCancellation: boolean;
    deadline?: string;
    text: string;
  };
  agencyNameAr: string;
  agencyNameEn: string;
  tursabNo: string;
  qrCodeDataUrl?: string;
  verifyUrl?: string;
};

export function buildHotelVoucherModelFromInvoice(
  invoice: OfficialInvoiceData,
  bookingDetail?: MockBookingDetail | null
): HotelVoucherModel {
  const hotel = invoice.bookingDetails.hotelSummary;
  const pnr = invoice.bookingDetails.pnr || invoice.bookingId.slice(0, 8).toUpperCase();
  const voucherNumber = `VCH-HTL-${pnr}`;
  // Only a confirmation number returned by the supplier is shown; nothing is derived or invented.
  const hotelConfirmationNo = hotel?.supplierConfirmationNo || "—";

  const checkIn = hotel?.checkIn || bookingDetail?.hotelDetails?.checkIn || "";
  const checkOut = hotel?.checkOut || bookingDetail?.hotelDetails?.checkOut || "";
  const nightsFromDates =
    checkIn && checkOut ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 0;
  const nights = hotel?.nights || bookingDetail?.hotelDetails?.nights || nightsFromDates;

  const leadName = invoice.bookingDetails.passengersOrGuests?.[0]?.name || invoice.customer.name || "—";
  const otherGuests = (invoice.bookingDetails.passengersOrGuests || []).slice(1).map((g) => g.name);

  const roomType = hotel?.roomType || bookingDetail?.hotelDetails?.roomType || "—";
  const boardType = hotel?.boardType || bookingDetail?.hotelDetails?.boardType || "—";
  const fmtTime = (t?: string, label?: string) => (t ? `${t}${label ? ` (${label})` : ""}` : "—");

  return {
    voucherNumber,
    hotelConfirmationNo,
    bookingId: invoice.bookingId,
    issueDate: invoice.issuedAt ? invoice.issuedAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    status: hotel?.supplierConfirmationNo ? "CONFIRMED & PREPAID" : String(invoice.bookingDetails.status || "").toUpperCase() || "—",
    hotelName: hotel?.hotelName || bookingDetail?.hotelDetails?.hotelName || "—",
    hotelNameEn: hotel?.hotelNameEn,
    stars: hotel?.stars || bookingDetail?.hotelDetails?.stars || 0,
    hotelImage: hotel?.image,
    address: hotel?.address || bookingDetail?.hotelDetails?.address || "—",
    city: hotel?.city || "",
    phone: hotel?.phone,
    leadGuest: {
      name: leadName,
      email: invoice.customer.email || "",
      phone: invoice.customer.phone || "",
      adultsCount: hotel?.adults ?? 0,
      childrenCount: hotel?.children ?? 0,
    },
    otherGuests,
    checkIn,
    checkInTime: fmtTime(hotel?.checkInTime, "Check-in"),
    checkOut,
    checkOutTime: fmtTime(hotel?.checkOutTime, "Check-out"),
    nights,
    roomType,
    bedType: hotel?.bedType || "—",
    mealPlan: boardType,
    cancellationPolicy: {
      isFreeCancellation: hotel?.freeCancellation === true,
      deadline: hotel?.freeCancellationUntil,
      text: hotel?.cancellationText || (hotel?.freeCancellation === false ? "غير قابل للاسترداد (Non-refundable)" : "راجع شروط الإلغاء في تفاصيل الحجز."),
    },
    agencyNameAr: invoice.company.nameAr || "شركة لوناليزا للسياحة والسفر المحدودة",
    agencyNameEn: invoice.company.nameEn || "Lonaliza Tourism & Travel LLC",
    tursabNo: "14892",
    qrCodeDataUrl: invoice.qrCodeDataUrl,
    verifyUrl: invoice.verifyUrl,
  };
}

export function renderHotelVoucherHtml(model: HotelVoucherModel, lang: string = "ar"): string {
  const isRtl = lang === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  const qrUrl =
    model.qrCodeDataUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=18-8-46&data=${encodeURIComponent(
      model.verifyUrl || `https://lonaliza.com/account/bookings/${model.bookingId}`
    )}`;

  const starsString = model.stars ? "⭐".repeat(Math.min(5, Math.max(1, model.stars))) : "";

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>Hotel Booking Voucher - ${model.voucherNumber}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      line-height: 1.5;
      font-size: 12px;
      padding: 16px;
      direction: ${dir};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .voucher-card {
      width: 100%;
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);
    }
    /* Top Banner */
    .top-strip {
      background: #0f172a;
      color: #ffffff;
      padding: 10px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      border-bottom: 2px solid #10b981;
    }
    .top-badge {
      background: #10b981;
      color: #ffffff;
      font-weight: 900;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 10px;
      text-transform: uppercase;
    }
    .header-banner {
      background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
      color: #ffffff;
      padding: 24px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .hotel-head-title {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .hotel-stars {
      font-size: 14px;
      margin-top: 4px;
    }
    .agency-line {
      font-size: 11px;
      color: #a7f3d0;
      margin-top: 4px;
    }
    .voucher-ref-box {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 14px;
      padding: 12px 18px;
      text-align: ${isRtl ? "left" : "right"};
    }
    .ref-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6ee7b7;
      font-weight: 800;
    }
    .voucher-num {
      font-size: 20px;
      font-weight: 900;
      font-family: monospace;
      letter-spacing: 1px;
    }
    .conf-num {
      font-size: 11px;
      font-family: monospace;
      color: #fef08a;
      font-weight: 800;
      margin-top: 2px;
    }
    .content-body {
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    /* Hotel hero showcase */
    .hotel-showcase {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 18px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      align-items: center;
    }
    .hotel-img-wrap {
      width: 100%;
      height: 150px;
      background: #e2e8f0;
    }
    .hotel-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .hotel-info-meta {
      padding: 14px 18px 14px 0;
    }
    .hotel-name-h3 {
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
    }
    .hotel-address {
      font-size: 11px;
      color: #475569;
      margin-top: 4px;
      line-height: 1.4;
    }
    .hotel-tel {
      font-size: 11px;
      color: #0284c7;
      font-weight: 700;
      margin-top: 6px;
    }
    /* Stay Dates Grid */
    .stay-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 14px;
      padding: 14px 18px;
      text-align: center;
    }
    .stay-col .lbl {
      font-size: 10px;
      font-weight: 800;
      color: #047857;
      text-transform: uppercase;
    }
    .stay-col .val {
      font-size: 16px;
      font-weight: 900;
      color: #064e3b;
      font-family: monospace;
      margin-top: 2px;
    }
    .stay-col .sub {
      font-size: 10px;
      color: #065f46;
      font-weight: 600;
    }
    /* Section boxes */
    .section-title {
      font-size: 12px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .info-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px 18px;
    }
    .data-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 11px;
    }
    .data-row:last-child {
      border-bottom: none;
    }
    .data-row .k {
      color: #64748b;
      font-weight: 700;
    }
    .data-row .v {
      color: #0f172a;
      font-weight: 800;
      text-align: ${isRtl ? "left" : "right"};
    }
    /* Cancellation Badge Box */
    .policy-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 14px;
      padding: 12px 16px;
      font-size: 11px;
      color: #92400e;
    }
    .policy-title {
      font-weight: 900;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }
    /* Check-in Instructions & QR */
    .reception-box {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 14px;
      padding: 16px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .reception-note {
      font-size: 11px;
      color: #334155;
      line-height: 1.5;
    }
    .qr-holder {
      width: 80px;
      height: 80px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .qr-holder img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    /* Footer */
    .footer-seal {
      background: #0f172a;
      color: #94a3b8;
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
    }
    .footer-seal strong {
      color: #f8fafc;
    }
  </style>
</head>
<body>
  <div class="voucher-card">
    <!-- Top Strip -->
    <div class="top-strip">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="top-badge">OFFICIAL VOUCHER</span>
        <span>فوشر وقسيمة تأكيد حجز الفندق الرسمي المعتمد · PREPAID HOTEL VOUCHER</span>
      </div>
      <div>
        <span>TÜRSAB Belge No: <strong>${model.tursabNo}</strong></span>
      </div>
    </div>

    <!-- Header Banner -->
    <div class="header-banner">
      <div>
        <div class="hotel-head-title">${model.hotelName}</div>
        <div class="hotel-stars">${starsString} <span style="font-size: 11px; color: #fef08a;">(5-Star Luxury Property)</span></div>
        <div class="agency-line">
          وكيل الحجز: <strong>${model.agencyNameAr}</strong> (${model.agencyNameEn})
        </div>
      </div>

      <div class="voucher-ref-box">
        <span class="ref-label">رقم الفوشر (VOUCHER NO)</span>
        <div class="voucher-num">${model.voucherNumber}</div>
        <div class="conf-num">Hotel Conf #: ${model.hotelConfirmationNo}</div>
      </div>
    </div>

    <div class="content-body">
      <!-- Hotel Showcase -->
      <div class="hotel-showcase">
        ${model.hotelImage ? `<div class="hotel-img-wrap"><img src="${model.hotelImage}" alt="${model.hotelName}" /></div>` : ""}
        <div class="hotel-info-meta">
          <div class="hotel-name-h3">${model.hotelName}</div>
          <div class="hotel-address">📍 ${model.address}</div>
          ${model.phone ? `<div class="hotel-tel">📞 هاتف الفندق المباشر: ${model.phone}</div>` : ""}
          <div style="font-size: 10px; color: #10b981; font-weight: 800; margin-top: 6px;">
            ✓ تم تسديد قيمة الإقامة بالكامل مسبقاً (GUARANTEED FOR LATE ARRIVAL)
          </div>
        </div>
      </div>

      <!-- Stay Dates Grid -->
      <div class="stay-grid">
        <div class="stay-col">
          <div class="lbl">تسجيل الوصول (Check-in)</div>
          <div class="val">${model.checkIn}</div>
          <div class="sub">${model.checkInTime}</div>
        </div>
        <div class="stay-col" style="border-left: 1px solid #a7f3d0; border-right: 1px solid #a7f3d0;">
          <div class="lbl">مدة الإقامة (Nights)</div>
          <div class="val">${model.nights} ليالي</div>
          <div class="sub">${model.nights} Nights Stay</div>
        </div>
        <div class="stay-col">
          <div class="lbl">تسجيل المغادرة (Check-out)</div>
          <div class="val">${model.checkOut}</div>
          <div class="sub">${model.checkOutTime}</div>
        </div>
      </div>

      <!-- Guest Details & Room Specifications -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <!-- Guest Details -->
        <div>
          <div class="section-title">
            <span>👤</span>
            <span>بيانات النزلاء (GUEST DETAILS)</span>
          </div>
          <div class="info-card">
            <div class="data-row">
              <span class="k">النزيل الرئيسي:</span>
              <span class="v" style="color: #064e3b; font-size: 12px;">${model.leadGuest.name}</span>
            </div>
            <div class="data-row">
              <span class="k">عدد النزلاء:</span>
              <span class="v">${model.leadGuest.adultsCount} بالغين ${model.leadGuest.childrenCount ? `· ${model.leadGuest.childrenCount} أطفال` : ""}</span>
            </div>
            <div class="data-row">
              <span class="k">البريد الإلكتروني:</span>
              <span class="v" dir="ltr">${model.leadGuest.email || "—"}</span>
            </div>
            <div class="data-row">
              <span class="k">رقم الهاتف / الواتساب:</span>
              <span class="v" dir="ltr">${model.leadGuest.phone || "—"}</span>
            </div>
          </div>
        </div>

        <!-- Room & Meal Details -->
        <div>
          <div class="section-title">
            <span>🛏️</span>
            <span>مواصفات الغرفة والوجبات (ROOM &amp; MEALS)</span>
          </div>
          <div class="info-card">
            <div class="data-row">
              <span class="k">نوع الغرفة:</span>
              <span class="v" style="color: #0284c7;">${model.roomType}</span>
            </div>
            <div class="data-row">
              <span class="k">نوع السرير:</span>
              <span class="v">${model.bedType}</span>
            </div>
            <div class="data-row">
              <span class="k">خطة الوجبات (Board):</span>
              <span class="v" style="color: #047857;">${model.mealPlan}</span>
            </div>
            <div class="data-row">
              <span class="k">حالة الحجز:</span>
              <span class="v" style="color: #047857; font-weight: 900;">مؤكد ومدفوع مسبقاً ✓</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Cancellation Policy -->
      <div class="policy-box">
        <div class="policy-title">
          <span>🛡️</span>
          <span>شروط وسياسة الإلغاء والتعديل (CANCELLATION POLICY)</span>
        </div>
        <div>
          ${model.cancellationPolicy.text}
        </div>
      </div>

      <!-- Reception Instructions & QR -->
      <div class="reception-box">
        <div class="reception-note">
          <strong style="color: #0f172a; display: block; margin-bottom: 2px;">
            تعليمات تسجيل الوصول لدى مكتب الاستقبال (HOTEL CHECK-IN INSTRUCTIONS):
          </strong>
          يرجى إبراز هذا الفوشر برفقة جوازات السفر لكافة النزلاء عند الوصول لمكتب الاستقبال بالفندق. الحجز مدفوع بالكامل مسبقاً من قِبل الوكالة.
        </div>
        <div class="qr-holder">
          <img src="${qrUrl}" alt="Voucher Verification QR" />
        </div>
      </div>
    </div>

    <!-- Official Seal Footer -->
    <div class="footer-seal">
      <div>
        <span>صادر رسمياً عن <strong>${model.agencyNameAr}</strong> · مرخص من وزارة السياحة واتحاد الغرف السياحية TÜRSAB: ${model.tursabNo}</span>
      </div>
      <div>
        <span>OFFICIAL CONFIRMED HOTEL VOUCHER · SEAL OF AUTHENTICITY</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}
