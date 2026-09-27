import type { OfficialInvoiceData } from "@/lib/server/invoice-resolver";
import { getInvoiceTranslations, type InvoiceLang } from "@/lib/server/invoice-i18n";

export function renderOfficialInvoiceStandaloneHtml(
  invoice: OfficialInvoiceData,
  langCode: string = "ar"
): string {
  const { t, dir } = getInvoiceTranslations(langCode);
  const isFlight = invoice.serviceType === "flight";
  const isHotel = invoice.serviceType === "hotel";
  const primaryColor = invoice.templateSettings.primaryColor || "#18082e";
  const accentColor = invoice.templateSettings.accentColor || "#d97706";

  const passengers = invoice.bookingDetails.passengersOrGuests || [];
  const flight = invoice.bookingDetails.flightSummary;
  const hotel = invoice.bookingDetails.hotelSummary;

  return `<!DOCTYPE html>
<html lang="${langCode}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>${t.documentTitle} - ${invoice.invoiceNumber}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #ffffff;
      color: #0f172a;
      line-height: 1.5;
      font-size: 12px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .invoice-card {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .header-banner {
      background: linear-gradient(135deg, ${primaryColor} 0%, #2a0e4c 100%);
      padding: 24px 28px;
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-logo-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-icon {
      width: 48px;
      height: 48px;
      background: #f59e0b;
      color: #18082e;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 900;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #cbd5e1;
      font-weight: 600;
    }
    .invoice-meta-top {
      text-align: ${dir === "rtl" ? "left" : "right"};
    }
    .doc-badge {
      display: inline-block;
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid #f59e0b;
      color: #fcd34d;
      font-size: 10px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 8px;
      text-transform: uppercase;
    }
    .inv-number {
      font-size: 16px;
      font-weight: 900;
      font-family: monospace;
      color: #ffffff;
      margin-top: 6px;
    }
    .earchive-banner {
      margin-top: 6px;
      background: rgba(239, 68, 68, 0.18);
      border: 1px solid rgba(248, 113, 113, 0.5);
      padding: 4px 8px;
      border-radius: 8px;
      display: inline-block;
      text-align: ${dir === "rtl" ? "left" : "right"};
    }
    .earchive-tag {
      font-size: 9px;
      font-weight: 800;
      color: #fecaca;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
    }
    .earchive-no {
      font-size: 12px;
      font-weight: 900;
      color: #ffffff;
      font-family: monospace;
      letter-spacing: 0.5px;
    }
    .earchive-ettn {
      font-size: 8px;
      color: #fca5a5;
      font-family: monospace;
    }
    .inv-date {
      font-size: 10px;
      color: #cbd5e1;
      font-family: monospace;
      margin-top: 4px;
    }
    .content-body {
      padding: 24px 28px;
    }
    .company-credentials {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px 16px;
      margin-bottom: 20px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 10px;
      font-size: 10.5px;
      color: #475569;
    }
    .company-credentials span {
      font-weight: 600;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      color: ${primaryColor};
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      border-bottom: 1.5px solid #f1f5f9;
      padding-bottom: 4px;
    }
    .customer-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      background: #f1f5f9;
      padding: 12px 16px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .data-label {
      font-size: 10px;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
    }
    .data-value {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }
    .service-box {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 20px;
      background: #ffffff;
    }
    .service-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .service-main-title {
      font-size: 14px;
      font-weight: 900;
      color: #0f172a;
    }
    .service-badge {
      background: #ede9fe;
      color: #5b21b6;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .service-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .pricing-qr-wrap {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .pricing-table {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px 16px;
      background: #ffffff;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 11.5px;
      color: #475569;
      border-bottom: 1px dashed #f1f5f9;
    }
    .price-row.discount {
      color: #059669;
      font-weight: 700;
    }
    .price-row.total {
      border-bottom: none;
      border-top: 2px solid #e2e8f0;
      padding-top: 10px;
      margin-top: 4px;
      font-size: 14px;
      font-weight: 900;
      color: ${primaryColor};
    }
    .qr-card {
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      justify-content: center;
    }
    .qr-img {
      width: 115px;
      height: 115px;
      object-fit: contain;
      background: #ffffff;
      padding: 5px;
      border-radius: 10px;
      border: 1px solid #d8b4fe;
      margin-bottom: 8px;
    }
    .qr-title {
      font-size: 11px;
      font-weight: 900;
      color: #581c87;
    }
    .qr-note {
      font-size: 9.5px;
      color: #6b21a8;
      margin-top: 2px;
      line-height: 1.3;
    }
    .terms-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 16px;
      font-size: 10px;
      color: #64748b;
      margin-bottom: 16px;
      line-height: 1.6;
    }
    .terms-card p {
      margin-bottom: 3px;
    }
    .footer-seal {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      font-size: 10px;
      color: #94a3b8;
    }
    .seal-pill {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <!-- Header Banner -->
    <div class="header-banner">
      <div class="brand-logo-wrap">
        <div class="brand-icon">LL</div>
        <div>
          <div class="brand-title">LONALIZA TOURISM &amp; TRAVEL</div>
          <div class="brand-subtitle">شركة لوناليزا للسياحة والسفر المحدودة</div>
        </div>
      </div>
      <div class="invoice-meta-top">
        <span class="doc-badge">${t.documentTitle}</span>
        <div class="inv-number">${invoice.invoiceNumber}</div>
        ${
          invoice.eArchive?.invoiceNo || invoice.eArchive?.invoiceNumber
            ? `<div class="earchive-banner">
                 <span class="earchive-tag">🇹🇷 T.C. GİB e-Arşiv Fatura</span>
                 <div class="earchive-no">${invoice.eArchive.invoiceNo || invoice.eArchive.invoiceNumber}</div>
                 <div class="earchive-ettn">ETTN: ${invoice.eArchive.uuid || invoice.eArchive.ettn}</div>
               </div>`
            : ""
        }
        <div class="inv-date">${t.issuedAt}: ${invoice.issuedAt.slice(0, 10)}</div>
      </div>
    </div>

    <div class="content-body">
      <!-- Legal Credentials -->
      <div class="company-credentials">
        <span>${t.companyInfo.tursab}</span>
        <span>${t.companyInfo.iata}</span>
        <span>${t.companyInfo.taxOffice}</span>
        <span>${invoice.eArchive?.invoiceNo || invoice.eArchive?.invoiceNumber ? "GİB e-Arşiv: Paraşüt API v4 Onaylı" : t.companyInfo.phone}</span>
        <span>${t.companyInfo.email}</span>
      </div>

      <!-- Customer Details -->
      <div class="section-title">${t.customerSection.title}</div>
      <div class="customer-grid">
        <div>
          <div class="data-label">${t.customerSection.name}</div>
          <div class="data-value">${invoice.customer.name}</div>
        </div>
        <div>
          <div class="data-label">${t.customerSection.email}</div>
          <div class="data-value" style="font-family: monospace;">${invoice.customer.email}</div>
        </div>
        <div>
          <div class="data-label">${t.customerSection.phone}</div>
          <div class="data-value" style="font-family: monospace;">${invoice.customer.phone}</div>
        </div>
      </div>

      <!-- Service Details -->
      <div class="section-title">${t.serviceSection.title}</div>
      <div class="service-box">
        <div class="service-header">
          <div class="service-main-title">${invoice.bookingDetails.title}</div>
          <span class="service-badge">
            ${isFlight ? t.serviceSection.flightDetails : isHotel ? t.serviceSection.hotelDetails : invoice.bookingDetails.subtitle}
          </span>
        </div>
        <div class="service-grid">
          <div>
            <div class="data-label">${t.pnr}</div>
            <div class="data-value" style="color: #b45309; font-family: monospace;">${invoice.bookingDetails.pnr}</div>
          </div>
          <div>
            <div class="data-label">${t.serviceSection.dates}</div>
            <div class="data-value" style="font-family: monospace;">${invoice.bookingDetails.dateLine}</div>
          </div>
          <div>
            <div class="data-label">${t.status}</div>
            <div class="data-value" style="color: #059669;">${t.statusPaid}</div>
          </div>
          ${
            flight
              ? `
          <div>
            <div class="data-label">${t.serviceSection.airline}</div>
            <div class="data-value">${flight.airline} (${flight.flightNumber})</div>
          </div>
          <div>
            <div class="data-label">${t.serviceSection.route}</div>
            <div class="data-value">${flight.origin} ➔ ${flight.destination}</div>
          </div>
          <div>
            <div class="data-label">${t.serviceSection.cabinClass}</div>
            <div class="data-value">${flight.cabinClass}</div>
          </div>
          `
              : ""
          }
          ${
            hotel
              ? `
          <div>
            <div class="data-label">${t.serviceSection.roomType}</div>
            <div class="data-value">${hotel.roomType}</div>
          </div>
          <div>
            <div class="data-label">${t.serviceSection.nights}</div>
            <div class="data-value">${hotel.nights} Nights (${hotel.boardType})</div>
          </div>
          <div>
            <div class="data-label">Hotel Address</div>
            <div class="data-value">${hotel.address}</div>
          </div>
          `
              : ""
          }
          ${
            passengers.length > 0
              ? `
          <div>
            <div class="data-label">${t.serviceSection.passengersOrGuests}</div>
            <div class="data-value">${passengers[0].name}</div>
          </div>
          <div>
            <div class="data-label">${t.eTicket}</div>
            <div class="data-value" style="font-family: monospace;">${passengers[0].ticketOrDoc}</div>
          </div>
          <div>
            <div class="data-label">${t.serviceSection.seatOrRoom}</div>
            <div class="data-value">${passengers[0].seatOrRoom}</div>
          </div>
          `
              : ""
          }
        </div>
      </div>

      <!-- Pricing & QR Section -->
      <div class="pricing-qr-wrap">
        <!-- Pricing Breakdown Table -->
        <div class="pricing-table">
          <div class="section-title" style="border: none; margin-bottom: 8px;">${t.pricingSection.title}</div>
          <div class="price-row">
            <span>${t.pricingSection.baseFare}:</span>
            <span style="font-family: monospace; font-weight: 700;">$${invoice.pricing.baseFare.toFixed(2)} ${invoice.pricing.currency}</span>
          </div>
          <div class="price-row">
            <span>${t.pricingSection.taxesAndFees}:</span>
            <span style="font-family: monospace; font-weight: 700;">$${invoice.pricing.taxesAndFees.toFixed(2)} ${invoice.pricing.currency}</span>
          </div>
          ${
            invoice.pricing.voucherDiscount > 0
              ? `
          <div class="price-row discount">
            <span>${t.pricingSection.discount} (${invoice.pricing.voucherCode || "VOUCHER"}):</span>
            <span style="font-family: monospace;">-$${invoice.pricing.voucherDiscount.toFixed(2)} ${invoice.pricing.currency}</span>
          </div>
          `
              : ""
          }
          ${
            invoice.eArchive
              ? `
          <div class="price-row" style="color: #64748b; font-size: 10px;">
            <span>KDV / VAT (Muafiyet Kod: 302):</span>
            <span style="font-family: monospace; font-weight: 700;">%0 ($0.00)</span>
          </div>
          `
              : ""
          }
          <div class="price-row">
            <span>${t.pricingSection.paymentMethod}:</span>
            <span style="font-weight: 700;">${invoice.bookingDetails.paymentMethod}</span>
          </div>
          <div class="price-row total">
            <span>${t.pricingSection.netTotal}:</span>
            <span style="font-family: monospace;">$${invoice.pricing.netTotal.toFixed(2)} ${invoice.pricing.currency}</span>
          </div>
        </div>

        <!-- Official Cryptographic QR Code -->
        <div class="qr-card">
          <img src="${invoice.qrCodeDataUrl}" alt="Official Verified QR" class="qr-img" />
          <div class="qr-title">${t.qrSection.title}</div>
          <div class="qr-note">${t.qrSection.description}</div>
        </div>
      </div>

      <!-- Legal Conditions -->
      <div class="terms-card">
        <p><strong>${t.legalFooter.termsTitle}</strong></p>
        <p>1. ${t.legalFooter.terms1}</p>
        <p>2. ${t.legalFooter.terms2}</p>
        <p>3. ${t.legalFooter.terms3}</p>
      </div>

      <!-- Seal and Signature -->
      <div class="footer-seal">
        <div>${t.legalFooter.disclaimer}</div>
        <div class="seal-pill">${t.qrSection.verifiedBadge}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
