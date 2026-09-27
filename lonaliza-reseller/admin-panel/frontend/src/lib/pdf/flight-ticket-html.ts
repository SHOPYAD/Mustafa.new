import type { OfficialInvoiceData } from "@/lib/server/invoice-resolver";
import type { MockBookingDetail } from "@/lib/server/mock-account-bookings";

export type FlightTicketModel = {
  bookingId: string;
  pnr: string;
  ticketNumber: string;
  issueDate: string;
  status: string;
  airline: string;
  airlineCode?: string;
  airlineLogo?: string;
  agencyNameAr?: string;
  agencyNameEn?: string;
  iataCode?: string;
  tursabNo?: string;
  passengers: Array<{
    name: string;
    type?: string;
    ticketNumber?: string;
    seat?: string;
    baggage?: string;
    cabinBaggage?: string;
    meal?: string;
    passportNumber?: string;
  }>;
  segments: Array<{
    direction: "outbound" | "return";
    flightNumber: string;
    airline: string;
    aircraft?: string;
    cabinClass?: string;
    originCode: string;
    originCity: string;
    originAirport: string;
    originTerminal?: string;
    departureDate: string;
    departureTime: string;
    destinationCode: string;
    destinationCity: string;
    destinationAirport: string;
    destinationTerminal?: string;
    arrivalDate: string;
    arrivalTime: string;
    duration?: string;
    stops?: number;
  }>;
  verifyUrl?: string;
  barcodeData?: string;
  qrCodeDataUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
};

export function buildFlightTicketModelFromInvoice(
  invoice: OfficialInvoiceData,
  bookingDetail?: MockBookingDetail | null
): FlightTicketModel {
  const flight = invoice.bookingDetails.flightSummary;
  const refsPnr = invoice.bookingDetails.pnr || "";
  const pnr = refsPnr;
  const rawTicketNo = String(invoice.bookingDetails.passengersOrGuests?.[0]?.ticketOrDoc || "").trim();
  const invented = !rawTicketNo || rawTicketNo === "—" || rawTicketNo === "PENDING" || rawTicketNo.startsWith("TKT-");
  const ticketNumber = invented ? "PENDING" : rawTicketNo;

  const passengers = (invoice.bookingDetails.passengersOrGuests || []).map((p, idx) => {
    const mockP = bookingDetail?.passengers?.[idx];
    const seat = p.seatOrRoom && p.seatOrRoom !== "—" ? p.seatOrRoom : mockP?.seat || "";
    return {
      name: p.name || mockP?.name || "—",
      type: mockP?.type ? mockP.type.toUpperCase() : "ADULT",
      ticketNumber: invented ? ticketNumber : p.ticketOrDoc || mockP?.ticketNumber || ticketNumber,
      seat: seat === "14A" && !mockP?.seat ? "" : seat,
      baggage: mockP?.baggage || "",
      cabinBaggage: mockP ? "8 KG (Cabin)" : "",
      meal: mockP?.meal || "",
      passportNumber: mockP?.passportNumber || "",
    };
  });

  if (!passengers.length) {
    passengers.push({
      name: invoice.customer.name || "—",
      type: "ADULT",
      ticketNumber,
      seat: "",
      baggage: "",
      cabinBaggage: "",
      meal: "",
      passportNumber: "",
    });
  }

  const segments: FlightTicketModel["segments"] = [];

  const parsePlace = (raw: string) => {
    const text = String(raw || "").trim();
    const paren = text.split(/[()]/).map((s) => s.trim()).filter(Boolean);
    if (paren.length >= 2) return { city: paren[0], code: paren[1].slice(0, 3).toUpperCase() };
    if (/^[A-Za-z]{3}$/.test(text)) return { city: text.toUpperCase(), code: text.toUpperCase() };
    return { city: text, code: "" };
  };
  const origin = parsePlace(flight?.origin || "");
  const dest = parsePlace(flight?.destination || "");
  const originCity = origin.city;
  const originCode = origin.code;
  const destCity = dest.city;
  const destCode = dest.code;

  const departStamp = flight?.departureTime || "";
  const arriveStamp = flight?.arrivalTime || "";

  segments.push({
    direction: "outbound",
    flightNumber: flight?.flightNumber || bookingDetail?.flightDetails?.flightNumber || "",
    airline: flight?.airline || bookingDetail?.flightDetails?.airline || "",
    aircraft: bookingDetail?.flightDetails?.aircraft || "",
    cabinClass: flight?.cabinClass || bookingDetail?.flightDetails?.cabinClass || "",
    originCode,
    originCity,
    originAirport: bookingDetail?.flightDetails?.originAirport || originCity,
    originTerminal: bookingDetail?.flightDetails?.originTerminal || "",
    departureDate: departStamp.slice(0, 10),
    departureTime: departStamp.length > 11 && !/T00:00/.test(departStamp) ? departStamp.slice(11, 16) : "",
    destinationCode: destCode,
    destinationCity: destCity,
    destinationAirport: bookingDetail?.flightDetails?.destinationAirport || destCity,
    destinationTerminal: bookingDetail?.flightDetails?.destinationTerminal || "",
    arrivalDate: arriveStamp.slice(0, 10),
    arrivalTime: arriveStamp.length > 11 && !/T00:00/.test(arriveStamp) ? arriveStamp.slice(11, 16) : "",
    duration: flight?.duration || bookingDetail?.flightDetails?.duration || "",
    stops: 0,
  });

  if (bookingDetail?.flightDetails?.returnFlight) {
    const ret = bookingDetail.flightDetails.returnFlight;
    segments.push({
      direction: "return",
      flightNumber: ret.flightNumber || "TK 1986",
      airline: flight?.airline || "Turkish Airlines",
      aircraft: "Airbus A321neo",
      cabinClass: flight?.cabinClass || "Economy (Y)",
      originCode: destCode,
      originCity: destCity,
      originAirport: destCity,
      originTerminal: "",
      departureDate: ret.departureTime ? ret.departureTime.slice(0, 10) : "",
      departureTime: ret.departureTime && ret.departureTime.length > 11 && !/T00:00/.test(ret.departureTime) ? ret.departureTime.slice(11, 16) : "",
      destinationCode: originCode,
      destinationCity: originCity,
      destinationAirport: originCity,
      destinationTerminal: "",
      arrivalDate: ret.arrivalTime ? ret.arrivalTime.slice(0, 10) : "",
      arrivalTime: ret.arrivalTime && ret.arrivalTime.length > 11 && !/T00:00/.test(ret.arrivalTime) ? ret.arrivalTime.slice(11, 16) : "",
      duration: ret.duration || "",
      stops: 0,
    });
  }

  const barcodeData = [
    "M1",
    (passengers[0]?.name || "").toUpperCase().replace(/\s+/g, "/"),
    pnr || invoice.bookingId,
    originCode,
    destCode,
    segments[0]?.flightNumber || "",
    ticketNumber !== "PENDING" ? ticketNumber : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    bookingId: invoice.bookingId,
    pnr: pnr || invoice.bookingId,
    ticketNumber,
    issueDate: invoice.issuedAt ? invoice.issuedAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    status: ticketNumber !== "PENDING" ? "CONFIRMED / OK TO BOARD" : "PAYMENT RECEIVED — TICKET PENDING",
    airline: segments[0]?.airline || "",
    agencyNameAr: invoice.company.nameAr || "شركة لوناليزا للسياحة والسفر",
    agencyNameEn: invoice.company.nameEn || "Lonaliza Tourism & Travel LLC",
    iataCode: "42-2 9821",
    tursabNo: "14892",
    passengers,
    segments,
    verifyUrl: invoice.verifyUrl,
    barcodeData,
    qrCodeDataUrl: invoice.qrCodeDataUrl,
    contactPhone: invoice.company.phone || "+90 501 570 9201",
    contactEmail: invoice.company.email || "support@lonaliza.com",
  };
}

export function renderFlightTicketHtml(model: FlightTicketModel, lang: string = "ar"): string {
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
  <title>Electronic Flight Ticket - ${model.pnr} - ${model.ticketNumber}</title>
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
      background: #f1f5f9;
      color: #0f172a;
      line-height: 1.45;
      font-size: 12px;
      padding: 16px;
      direction: ${dir};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .ticket-container {
      width: 100%;
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);
    }
    /* Top IATA / Boarding Bar */
    .iata-bar {
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #f59e0b;
    }
    .iata-title {
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .iata-badge {
      background: #f59e0b;
      color: #0f172a;
      font-weight: 900;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
    }
    .header-section {
      background: linear-gradient(135deg, #18082e 0%, #2e1065 100%);
      color: #ffffff;
      padding: 24px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .airline-brand-title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .agency-sub {
      font-size: 11px;
      color: #cbd5e1;
      margin-top: 4px;
      font-weight: 500;
    }
    .ticket-ref-box {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 14px;
      padding: 12px 18px;
      text-align: ${isRtl ? "left" : "right"};
      backdrop-blur-sm;
    }
    .ref-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #fcd34d;
      font-weight: 800;
      display: block;
    }
    .pnr-code {
      font-size: 24px;
      font-weight: 900;
      font-family: monospace;
      letter-spacing: 2px;
      color: #ffffff;
    }
    .ticket-num {
      font-size: 12px;
      font-family: monospace;
      color: #cbd5e1;
      margin-top: 2px;
    }
    .content-body {
      padding: 24px 28px;
      display: flex;
      flex-col;
      gap: 20px;
    }
    /* Status banner */
    .status-banner {
      background: #ecfdf5;
      border: 1px solid #6ee7b7;
      border-radius: 12px;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #065f46;
      font-size: 11px;
      font-weight: 700;
    }
    .status-tag {
      background: #10b981;
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 900;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    /* Passenger Card */
    .section-title {
      font-size: 13px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pax-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
    }
    .pax-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .pax-table th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 800;
      padding: 10px 14px;
      text-align: ${isRtl ? "right" : "left"};
      border-bottom: 1px solid #e2e8f0;
      font-size: 10px;
      text-transform: uppercase;
    }
    .pax-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      font-weight: 600;
    }
    .pax-name {
      font-weight: 900;
      font-size: 13px;
      color: #0f172a;
      font-family: monospace;
      letter-spacing: 0.5px;
    }
    /* Flight Segments */
    .segment-wrap {
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 14px;
      background: #ffffff;
    }
    .segment-header {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .seg-badge {
      background: #3b82f6;
      color: #ffffff;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 800;
    }
    .seg-flight-num {
      font-weight: 900;
      font-size: 12px;
      color: #1e293b;
      font-family: monospace;
    }
    .segment-content {
      padding: 18px 20px;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 16px;
    }
    .station-box {
      display: flex;
      flex-direction: column;
    }
    .station-code {
      font-size: 26px;
      font-weight: 900;
      color: #0f172a;
      font-family: monospace;
      letter-spacing: 1px;
      line-height: 1;
    }
    .station-city {
      font-size: 13px;
      font-weight: 800;
      color: #1e293b;
      margin-top: 4px;
    }
    .station-name {
      font-size: 10px;
      color: #64748b;
      line-height: 1.3;
    }
    .time-badge {
      font-size: 16px;
      font-weight: 900;
      color: #0284c7;
      font-family: monospace;
      margin-top: 6px;
    }
    .date-badge {
      font-size: 11px;
      color: #475569;
      font-weight: 600;
    }
    .flight-path-middle {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 140px;
      padding: 0 10px;
    }
    .duration-tag {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 4px;
    }
    .path-line {
      width: 100%;
      height: 2px;
      background: #cbd5e1;
      position: relative;
      margin: 6px 0;
    }
    .plane-icon {
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      background: #ffffff;
      padding: 0 4px;
      font-size: 12px;
      color: #0284c7;
    }
    .nonstop-tag {
      font-size: 9px;
      background: #e0f2fe;
      color: #0369a1;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      margin-top: 4px;
    }
    /* Barcode & Security Card */
    .barcode-section {
      background: #f8fafc;
      border: 1px dashed #94a3b8;
      border-radius: 16px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .barcode-mock {
      font-family: monospace;
      font-size: 11px;
      letter-spacing: 3px;
      background: #0f172a;
      color: #ffffff;
      padding: 10px 16px;
      border-radius: 8px;
      display: inline-block;
      overflow-x: hidden;
      max-width: 440px;
      white-space: nowrap;
      border: 1px solid #334155;
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
    /* Notices Section */
    .notices-box {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      font-size: 10px;
      color: #64748b;
      line-height: 1.6;
    }
    .notices-box h4 {
      font-size: 11px;
      color: #0f172a;
      font-weight: 800;
      margin-bottom: 6px;
    }
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
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .ticket-container {
        box-shadow: none;
        border: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <!-- Top IATA Strip -->
    <div class="iata-bar">
      <div class="iata-title">
        <span class="iata-badge">IATA</span>
        <span>ELECTRONIC TICKET RECEIPT (PASSENGER ITINERARY) · إيصال تذكرة طيران إلكترونية رسمية معتمدة</span>
      </div>
      <div>
        <span>Agency: <strong>${model.iataCode || "42-2 9821"}</strong> · TÜRSAB: <strong>${model.tursabNo || "14892"}</strong></span>
      </div>
    </div>

    <!-- Main Airline & Ticket Banner -->
    <div class="header-section">
      <div>
        <div class="airline-brand-title">
          <span>✈️</span>
          <span>${model.airline}</span>
        </div>
        <div class="agency-sub">
          صادرة عن: <strong>${model.agencyNameAr}</strong> (${model.agencyNameEn}) · هاتف: ${model.contactPhone}
        </div>
      </div>

      <div class="ticket-ref-box">
        <span class="ref-label">Booking Reference / PNR كود الحجز</span>
        <div class="pnr-code">${model.pnr}</div>
        <div class="ticket-num">TKT No: ${model.ticketNumber}</div>
      </div>
    </div>

    <div class="content-body" style="padding: 20px 24px; display: flex; flex-direction: column; gap: 16px;">
      <!-- Status Banner -->
      <div class="status-banner">
        <div>
          <span>حالة التذكرة الرسمية: </span>
          <strong style="color: #047857;">مؤكدة ومصدرة برقم تذكرة رسمي (ISSUED &amp; CONFIRMED)</strong>
          <span style="margin: 0 8px;">·</span>
          <span>تاريخ الإصدار: ${model.issueDate}</span>
        </div>
        <span class="status-tag">OK TO BOARD</span>
      </div>

      <!-- Passengers Details -->
      <div>
        <div class="section-title">
          <span>👥</span>
          <span>معلومات المسافرين وبيانات الأمتعة (PASSENGERS &amp; BAGGAGE)</span>
        </div>
        <div class="pax-card">
          <table class="pax-table">
            <thead>
              <tr>
                <th>اسم المسافر (Passenger)</th>
                <th>رقم التذكرة (Ticket No)</th>
                <th>المقعد (Seat)</th>
                <th>حقائب الشحن (Checked)</th>
                <th>كابينة اليد (Cabin)</th>
                <th>الوجبة (Meal)</th>
              </tr>
            </thead>
            <tbody>
              ${model.passengers
                .map(
                  (pax) => `
                <tr>
                  <td>
                    <div class="pax-name">${pax.name}</div>
                    <div style="font-size: 10px; color: #64748b;">${pax.type || "ADULT"}${pax.passportNumber ? ` · Pass: ${pax.passportNumber}` : ""}</div>
                  </td>
                  <td style="font-family: monospace; font-weight: 800; color: #0f172a;">${pax.ticketNumber || model.ticketNumber}</td>
                  <td style="font-family: monospace; font-weight: 900; color: #0284c7;">${pax.seat || "14A"}</td>
                  <td style="font-weight: 700; color: #047857;">${pax.baggage || "20 KG"}</td>
                  <td style="font-weight: 700; color: #475569;">${pax.cabinBaggage || "8 KG"}</td>
                  <td style="color: #475569;">${pax.meal || "Standard"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Flight Segments Itinerary -->
      <div>
        <div class="section-title">
          <span>🛫</span>
          <span>خط سير ومواعيد الرحلة (FLIGHT ITINERARY)</span>
        </div>

        ${model.segments
          .map(
            (seg, idx) => `
          <div class="segment-wrap">
            <div class="segment-header">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="seg-badge" style="background: ${seg.direction === "return" ? "#7c3aed" : "#0284c7"};">
                  ${seg.direction === "return" ? "رحلة العودة (Inbound)" : "رحلة الذهاب (Outbound)"}
                </span>
                <span class="seg-flight-num">${seg.flightNumber}</span>
                <span style="color: #64748b; font-size: 11px;">· ${seg.airline}</span>
              </div>
              <div style="font-size: 11px; font-weight: 700; color: #475569;">
                <span>${seg.cabinClass || "Economy"}</span>
                ${seg.aircraft ? ` · <span>${seg.aircraft}</span>` : ""}
              </div>
            </div>

            <div class="segment-content">
              <!-- Origin Station -->
              <div class="station-box">
                <span class="station-code">${seg.originCode}</span>
                <span class="station-city">${seg.originCity}</span>
                <span class="station-name">${seg.originAirport}</span>
                ${seg.originTerminal ? `<span style="font-size: 10px; font-weight: 800; color: #d97706;">Terminal: ${seg.originTerminal}</span>` : ""}
                <span class="time-badge">${seg.departureTime}</span>
                <span class="date-badge">${seg.departureDate}</span>
              </div>

              <!-- Flight Graphic Middle -->
              <div class="flight-path-middle">
                <span class="duration-tag">⏱️ ${seg.duration || "Direct"}</span>
                <div class="path-line">
                  <span class="plane-icon">✈</span>
                </div>
                <span class="nonstop-tag">${seg.stops && seg.stops > 0 ? `${seg.stops} توقف` : "رحلة مباشرة (NON-STOP)"}</span>
              </div>

              <!-- Destination Station -->
              <div class="station-box" style="text-align: ${isRtl ? "left" : "right"};">
                <span class="station-code">${seg.destinationCode}</span>
                <span class="station-city">${seg.destinationCity}</span>
                <span class="station-name">${seg.destinationAirport}</span>
                ${seg.destinationTerminal ? `<span style="font-size: 10px; font-weight: 800; color: #d97706;">Terminal: ${seg.destinationTerminal}</span>` : ""}
                <span class="time-badge">${seg.arrivalTime}</span>
                <span class="date-badge">${seg.arrivalDate}</span>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>

      <!-- Confirmed E-Ticket Verification Section -->
      <div class="barcode-section" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; gap: 16px;">
        <div style="flex: 1;">
          <div style="font-weight: 800; font-size: 12px; color: #0f172a; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
            <span>توثيق التذكرة الإلكترونية الرسمية (CONFIRMED E-TICKET VERIFICATION)</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 8px 0;">
            <div style="background: #ffffff; padding: 5px 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 11px;">
              رمز حجز الخطوط (PNR): <strong style="color: #1e1b4b; font-family: monospace; font-size: 13px;">${model.pnr}</strong>
            </div>
            <div style="background: #ffffff; padding: 5px 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 11px;">
              رقم التذكرة الإلكترونية: <strong style="color: #1e1b4b; font-family: monospace; font-size: 13px;">${model.ticketNumber}</strong>
            </div>
            <div style="background: #ffffff; padding: 5px 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 11px;">
              الحالة: <strong style="color: #059669;">مؤكدة رسمياً (Confirmed)</strong>
            </div>
          </div>
          <div style="font-size: 10px; color: #475569; margin-top: 6px; line-height: 1.5; background: #fffbeb; border: 1px solid #fef3c7; padding: 6px 10px; border-radius: 6px;">
            <strong>تنبيه السفر وإصدار بطاقة الصعود:</strong> هذه الوثيقة هي تذكرة طيران إلكترونية مؤكدة صادرة من الوكيل المعتمد برقم الحجز والتذكرة الرسميين. بطاقة صعود الطائرة (Boarding Pass) تصدر حصراً من قِبل شركة الطيران المشغلة عبر موقعها الرسمي (Online Check-in) قبل موعد الرحلة بـ 24 إلى 48 ساعة أو مباشرة من كاونتر المطار باستخدام رمز الحجز (PNR) ورقم التذكرة المدونين أعلاه.
          </div>
        </div>

        <div class="qr-holder">
          <img src="${qrUrl}" alt="Ticket Verification QR" />
        </div>
      </div>

      <!-- Legal & Travel Notices -->
      <div class="notices-box">
        <h4>تعليمات السفر الهامة وشروط خطوط الطيران (IMPORTANT TRAVEL NOTICES):</h4>
        <ul style="padding-${isRtl ? "right" : "left"}: 16px; margin-top: 4px; space-y: 2px;">
          <li><strong>مواعيد الحضور للمطار:</strong> يجب الحضور للمطار قبل موعد الرحلة بـ 3 ساعات للرحلات الدولية وساعتين للرحلات الداخلية. تغلق كاونترات إنهاء إجراءات السفر قبل الإقلاع بـ 60 دقيقة، وتغلق بوابات الصعود قبل 20 دقيقة.</li>
          <li><strong>وثائق السفر والجوازات:</strong> تقع مسؤولية صلاحية جواز السفر (6 أشهر على الأقل) والتأشيرات اللازمة على عاتق المسافر بالكامل وفقاً لقوانين وجهات السفر.</li>
          <li><strong>المواد المحظورة والأمتعة:</strong> يمنع حمل المواد السائلة التي تزيد عن 100 مل في كابينة اليد، ويمنع حمل بطاريات الليثيوم في حقائب الشحن السفلية.</li>
        </ul>
      </div>
    </div>

    <!-- Official Seal Footer -->
    <div class="footer-seal">
      <div>
        <span>منصة لوناليزا للسياحة والسفر المحدودة · الوكيل الرسمي المعتمد <strong>${model.agencyNameEn}</strong></span>
      </div>
      <div>
        <span>IATA VALIDATED · CONFIRMED ELECTRONIC TICKET</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}
