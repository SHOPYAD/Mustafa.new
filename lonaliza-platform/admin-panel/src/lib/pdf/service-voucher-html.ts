import type { OfficialInvoiceData } from "@/lib/server/invoice-resolver";
import type { MockBookingDetail } from "@/lib/server/mock-account-bookings";

export type ServiceVoucherModel = {
  voucherNumber: string;
  serviceType: "transfer" | "car" | "tour" | "package" | "visa";
  title: string;
  bookingId: string;
  issueDate: string;
  status: string;
  serviceDate: string;
  pickupLocation: string;
  dropoffLocation?: string;
  leadGuest: {
    name: string;
    phone?: string;
    email?: string;
    passengersCount: number;
  };
  details: Array<{ label: string; value: string }>;
  notes: string[];
  agencyNameAr: string;
  agencyNameEn: string;
  tursabNo: string;
  qrCodeDataUrl?: string;
  verifyUrl?: string;
};

export function buildServiceVoucherModelFromInvoice(
  invoice: OfficialInvoiceData,
  bookingDetail?: MockBookingDetail | null
): ServiceVoucherModel {
  const pnr = invoice.bookingDetails.pnr || invoice.bookingId.slice(0, 8).toUpperCase();
  const serviceType = invoice.serviceType as ServiceVoucherModel["serviceType"];

  const leadName = invoice.bookingDetails.passengersOrGuests?.[0]?.name || invoice.customer.name || "—";
  const details: Array<{ label: string; value: string }> = [];

  if (serviceType === "transfer") {
    details.push(
      { label: "نوع المركبة", value: bookingDetail?.serviceDetails?.vehicleModel || "Mercedes-Benz Vito VIP (6 Seats)" },
      { label: "نقطة الاستقبال", value: bookingDetail?.serviceDetails?.pickupLocation || "مطار إسطنبول الدولي (IST Airport) - بوابة 13" },
      { label: "وجهة التوصيل", value: bookingDetail?.serviceDetails?.dropoffLocation || "فندق فور سيزونز البوسفور (بشكتاش)" },
      { label: "رقم الرحلة للمتابعة", value: "TK 1985 (متابعة حية لتأخير الطيران)" },
      { label: "السائق وخدمة الاستقبال", value: "سائق خاص يتحدث العربية والإنجليزية مع لوحة استقبال باسم العميل" }
    );
  } else if (serviceType === "car") {
    details.push(
      { label: "موديل السيارة", value: bookingDetail?.serviceDetails?.vehicleModel || "Renault Megane Sedan 2024 (Automatic / Diesel)" },
      { label: "مكتب الاستلام", value: bookingDetail?.serviceDetails?.pickupLocation || "مطار إسطنبول الدولي - صالة الوصول الدولية" },
      { label: "مكتب التسليم", value: bookingDetail?.serviceDetails?.dropoffLocation || "مطار إسطنبول الدولي - صالة المغادرة" },
      { label: "التأمين المشمول", value: "تأمين شامل بدون نسبة تحمل (Full CDW Protection + Theft Protection)" },
      { label: "الكيلومترات", value: "كيلومترات مفتوحة غير محدودة (Unlimited Mileage)" }
    );
  } else {
    details.push(
      { label: "اسم الجولة / الخدمة", value: invoice.bookingDetails.title },
      { label: "لغة المرشد السياحي", value: bookingDetail?.serviceDetails?.guideLanguage || "العربية والإنجليزية" },
      { label: "نقطة التجمع والانطلاق", value: bookingDetail?.serviceDetails?.pickupLocation || "لوبي الفندق في تمام الساعة 09:00 صباحاً" },
      { label: "المشمولات", value: (bookingDetail?.serviceDetails?.inclusions || ["وجبة غداء فاخرة", "تذاكر الدخول للمتاحف", "سيارة خاصة مكيفة"]).join(" · ") }
    );
  }

  return {
    voucherNumber: `VCH-${serviceType.toUpperCase()}-${pnr}`,
    serviceType,
    title: invoice.bookingDetails.title,
    bookingId: invoice.bookingId,
    issueDate: invoice.issuedAt ? invoice.issuedAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    status: "CONFIRMED & GUARANTEED",
    serviceDate: (invoice.issuedAt || new Date().toISOString()).slice(0, 10),
    pickupLocation: bookingDetail?.serviceDetails?.pickupLocation || "مطار إسطنبول الدولي",
    dropoffLocation: bookingDetail?.serviceDetails?.dropoffLocation,
    leadGuest: {
      name: leadName,
      phone: invoice.customer.phone || "+90 501 570 9201",
      email: invoice.customer.email || "support@lonaliza.com",
      passengersCount: invoice.bookingDetails.passengersOrGuests?.length || 2,
    },
    details,
    notes: [
      "يرجى إبراز هذا الفوشر ورقم الحجز للسائق أو ممثل الخدمة عند الاستقبال.",
      "يشمل الحجز خدمة انتظار مجانية في المطار لمدة 60 دقيقة بعد هبوط الطائرة.",
      "خط الطوارئ وخدمة العملاء المباشرة متاح 24/7 عبر الواتساب: 9201 570 501 90+.",
    ],
    agencyNameAr: invoice.company.nameAr || "شركة لوناليزا للسياحة والسفر المحدودة",
    agencyNameEn: invoice.company.nameEn || "Lonaliza Tourism & Travel LLC",
    tursabNo: "14892",
    qrCodeDataUrl: invoice.qrCodeDataUrl,
    verifyUrl: invoice.verifyUrl,
  };
}

export function renderServiceVoucherHtml(model: ServiceVoucherModel, lang: string = "ar"): string {
  const isRtl = lang === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  const qrUrl =
    model.qrCodeDataUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=18-8-46&data=${encodeURIComponent(
      model.verifyUrl || `https://lonaliza.com/account/bookings/${model.bookingId}`
    )}`;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>Service Voucher - ${model.voucherNumber}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    @page { size: A4 portrait; margin: 8mm; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
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
    .card-wrap {
      width: 100%;
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);
    }
    .top-strip {
      background: #0f172a;
      color: #ffffff;
      padding: 10px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      border-bottom: 2px solid #0284c7;
    }
    .banner {
      background: linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%);
      color: #ffffff;
      padding: 24px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .title { font-size: 20px; font-weight: 900; }
    .sub { font-size: 11px; color: #bae6fd; margin-top: 4px; }
    .ref-box {
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 14px;
      padding: 12px 18px;
      text-align: ${isRtl ? "left" : "right"};
    }
    .v-no { font-size: 20px; font-weight: 900; font-family: monospace; }
    .body { padding: 24px 28px; display: flex; flex-direction: column; gap: 16px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
    .row:last-child { border-bottom: none; }
    .k { color: #64748b; font-weight: 700; }
    .v { color: #0f172a; font-weight: 800; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 20px; }
    .notes-card { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 14px 18px; color: #1e40af; font-size: 11px; }
    .seal { background: #0f172a; color: #94a3b8; padding: 14px 24px; display: flex; justify-content: space-between; font-size: 10px; }
    .seal strong { color: #ffffff; }
  </style>
</head>
<body>
  <div class="card-wrap">
    <div class="top-strip">
      <span>OFFICIAL SERVICE VOUCHER · قسيمة تأكيد الخدمة المعتمدة</span>
      <span>TÜRSAB Belge No: <strong>${model.tursabNo}</strong></span>
    </div>
    <div class="banner">
      <div>
        <div class="title">${model.title}</div>
        <div class="sub">صادر عن: <strong>${model.agencyNameAr}</strong> (${model.agencyNameEn})</div>
      </div>
      <div class="ref-box">
        <div style="font-size: 10px; color: #7dd3fc; font-weight: 800;">رقم القسيمة (VOUCHER NO)</div>
        <div class="v-no">${model.voucherNumber}</div>
        <div style="font-size: 10px; color: #e0f2fe; margin-top: 2px;">الحالة: ${model.status}</div>
      </div>
    </div>
    <div class="body">
      <!-- Guest Info -->
      <div class="info-card">
        <div style="font-weight: 900; font-size: 12px; color: #0f172a; margin-bottom: 8px;">👤 بيانات العميل المستفيد:</div>
        <div class="row"><span class="k">الاسم بالكامل:</span><span class="v">${model.leadGuest.name}</span></div>
        <div class="row"><span class="k">رقم الهاتف / الواتساب:</span><span class="v" dir="ltr">${model.leadGuest.phone || "—"}</span></div>
        <div class="row"><span class="k">عدد الركاب / المستفيدين:</span><span class="v">${model.leadGuest.passengersCount} أشخاص</span></div>
      </div>

      <!-- Service Details -->
      <div class="info-card">
        <div style="font-weight: 900; font-size: 12px; color: #0f172a; margin-bottom: 8px;">🚗 تفاصيل ومواصفات الخدمة:</div>
        ${model.details.map((d) => `<div class="row"><span class="k">${d.label}:</span><span class="v">${d.value}</span></div>`).join("")}
      </div>

      <!-- Notes -->
      <div class="notes-card">
        <div style="font-weight: 900; margin-bottom: 6px;">📌 إرشادات وتعليمات هامة:</div>
        <ul style="padding-${isRtl ? "right" : "left"}: 16px;">
          ${model.notes.map((n) => `<li>${n}</li>`).join("")}
        </ul>
      </div>

      <!-- Verification QR -->
      <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 14px; padding: 14px 18px;">
        <div>
          <div style="font-weight: 800; color: #0f172a;">كود التحقق الإلكتروني من القسيمة</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">يمكن مسح الكود مباشرة للتحقق من تفاصيل الخدمة وصلاحيتها.</div>
        </div>
        <div style="width: 70px; height: 70px; background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 3px;">
          <img src="${qrUrl}" alt="QR" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
      </div>
    </div>
    <div class="seal">
      <span>شركة لوناليزا للسياحة والسفر المحدودة · مرخص من وزارة السياحة TÜRSAB: ${model.tursabNo}</span>
      <span>CONFIRMED &amp; GUARANTEED SERVICE VOUCHER</span>
    </div>
  </div>
</body>
</html>`;
}
