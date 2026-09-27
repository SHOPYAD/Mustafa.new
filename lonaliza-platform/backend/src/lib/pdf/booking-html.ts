import { defaultSiteContact } from "@/data/site-contact";
import type { HotelBookingConfirmView } from "@/lib/server/hotel-booking-confirm";

export type BookingPdfModel = HotelBookingConfirmView & {
  brandNameAr: string;
  brandNameEn: string;
  logoDataUri: string;
  fontDataUri: string;
  phone: string;
  email: string;
  address: string;
  siteUrl: string;
};

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeUrl(raw: unknown): string {
  const url = String(raw || "").trim();
  if (!url) return "";
  if (url.startsWith("data:image/")) return url;
  if (/^https?:\/\//i.test(url) && !/^https?:\/\/javascript/i.test(url)) return url;
  return "";
}

function money(amount: number, currency: string): string {
  const n = Number(amount);
  const shown = Number.isFinite(n) ? n.toLocaleString("en-US") : "0";
  return `${esc(currency || "USD")} ${shown}`;
}

function paymentLabel(method: HotelBookingConfirmView["payment_method"]): string {
  if (method === "card") return "بطاقة iyzico";
  if (method === "whatsapp") return "رابط بنكي عبر واتساب";
  return "أخرى";
}

function statusLabel(status: string, paymentStatus: string): string {
  const raw = `${status} ${paymentStatus}`.toLowerCase();
  if (raw.includes("paid") && !raw.includes("pending")) return "مدفوع — مؤكد";
  if (raw.includes("pending_review")) return "بانتظار مراجعة الدفع";
  if (raw.includes("pending")) return "بانتظار الدفع";
  if (raw.includes("fail") || raw.includes("cancel")) return status || paymentStatus;
  return status || paymentStatus || "—";
}

export function renderBookingHtml(model: BookingPdfModel): string {
  const brandAr = esc(model.brandNameAr || "لوناليزا للسياحة");
  const brandEn = esc(model.brandNameEn || "Lonaliza Tourism");
  const photo = safeUrl(model.hotel_image);
  const guests = model.guest_names.map((g) => esc(g)).filter(Boolean);
  const phone = esc(model.phone || defaultSiteContact.customerServicePhones[0] || "");
  const email = esc(model.email || defaultSiteContact.email);
  const address = esc((model.address || defaultSiteContact.address).replace(/\n/g, " · "));

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>تأكيد الحجز ${esc(model.id)}</title>
  <style>
    @font-face {
      font-family: "Noto Naskh Arabic";
      src: url("${model.fontDataUri || ""}") format("truetype");
      font-weight: 400 700;
      font-style: normal;
      font-display: block;
      unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+0000-00FF;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #f4efe6;
      color: #122033;
      font-family: "Noto Naskh Arabic", Tahoma, sans-serif;
      direction: rtl;
      text-align: right;
    }
    body { font-size: 13.5px; line-height: 1.75; }
    .page { padding: 18px 20px 22px; }
    .brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 14px;
      border-bottom: 2px solid #051741;
    }
    .brand img { height: 46px; width: auto; }
    .brand-name { font-size: 18px; font-weight: 800; color: #051741; }
    .brand-en { color: #64748b; font-size: 12px; }
    h1 { margin: 16px 0 6px; font-size: 22px; color: #051741; }
    .sub { margin: 0 0 16px; color: #475569; }
    .hero {
      height: 190px;
      border-radius: 16px;
      overflow: hidden;
      background: #dbe3ee;
      margin-bottom: 16px;
    }
    .hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .card {
      background: #fff;
      border: 1px solid #e4d8c4;
      border-radius: 16px;
      padding: 14px 16px;
      margin-bottom: 12px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 6px 0;
      border-bottom: 1px solid #f1ebe1;
    }
    .row:last-child { border-bottom: 0; }
    .k { color: #64748b; }
    .v { font-weight: 700; color: #102033; }
    .total { font-size: 16px; color: #051741; }
    .badge {
      display: inline-block;
      background: #d1fae5;
      color: #065f46;
      font-weight: 800;
      border-radius: 999px;
      padding: 4px 12px;
      margin-bottom: 8px;
    }
    .foot {
      margin-top: 18px;
      color: #64748b;
      font-size: 11px;
      text-align: center;
      line-height: 1.8;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="brand">
      ${model.logoDataUri ? `<img src="${model.logoDataUri}" alt="${brandAr}" />` : ""}
      <div>
        <div class="brand-name">${brandAr}</div>
        <div class="brand-en">${brandEn}</div>
      </div>
    </div>
    <h1>تأكيد حجز الفندق</h1>
    <p class="sub">إيصال رسمي — ${esc(model.siteUrl || "lonaliza.com")}</p>
    ${photo ? `<div class="hero"><img src="${esc(photo)}" alt="" /></div>` : ""}
    <div class="card">
      <span class="badge">${esc(statusLabel(model.status, model.payment_status))}</span>
      <div class="row"><span class="k">رقم الحجز</span><span class="v" dir="ltr">${esc(model.id)}</span></div>
      <div class="row"><span class="k">طريقة الدفع</span><span class="v">${esc(paymentLabel(model.payment_method))}</span></div>
    </div>
    <div class="card">
      <div class="row"><span class="k">الفندق</span><span class="v">${esc(model.hotel_name)}</span></div>
      ${model.room_name ? `<div class="row"><span class="k">الغرفة</span><span class="v">${esc(model.room_name)}</span></div>` : ""}
      <div class="row"><span class="k">تاريخ الوصول</span><span class="v" dir="ltr">${esc(model.check_in)}</span></div>
      <div class="row"><span class="k">تاريخ المغادرة</span><span class="v" dir="ltr">${esc(model.check_out)}</span></div>
      <div class="row"><span class="k">عدد الليالي</span><span class="v">${esc(model.nights)}</span></div>
      <div class="row"><span class="k">الضيوف</span><span class="v">${esc(model.adults)} بالغ${model.children ? ` · ${esc(model.children)} طفل` : ""}</span></div>
    </div>
    ${
      guests.length
        ? `<div class="card">${guests
            .map((g) => `<div class="row"><span class="k">مسافر</span><span class="v">${g}</span></div>`)
            .join("")}</div>`
        : ""
    }
    <div class="card">
      <div class="row"><span class="k">سعر الليلة</span><span class="v">${money(model.nightly, model.currency)}</span></div>
      <div class="row"><span class="k">× الليالي</span><span class="v">${esc(model.nights)}</span></div>
      <div class="row total"><span class="k">الإجمالي</span><span class="v">${money(model.price, model.currency)}</span></div>
    </div>
    <p class="foot">
      ${brandAr} — ${brandEn}<br/>
      ${phone}${email ? ` · ${email}` : ""}<br/>
      ${address}
    </p>
  </div>
</body>
</html>`;
}
