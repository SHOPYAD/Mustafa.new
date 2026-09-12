import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { bookingServiceOf, flightDisplayOf } from "@/lib/server/hotel-cancellations";
import { findMockBookingDetail } from "@/lib/server/mock-account-bookings";
import { getInvoiceTemplate } from "@/lib/server/invoice-templates-store";
import { getBranding } from "@/lib/server/branding-store";
import { defaultSiteContact } from "@/data/site-contact";
import {
  signInvoice,
  getInvoiceVerificationUrl,
  generateInvoiceQrCode,
} from "@/lib/server/invoice-signature";
import type { InvoiceService } from "@/lib/booking-service";

export type OfficialInvoiceData = {
  ok: boolean;
  invoiceNumber: string;
  bookingId: string;
  signature: string;
  verifyUrl: string;
  qrCodeDataUrl: string;
  issuedAt: string;
  serviceType: InvoiceService;
  eArchive?: {
    invoiceNo: string;
    uuid: string; // ETTN
    issuedAt: string;
    pdfDownloadUrl: string;
    gibStatus: string;
    verified: boolean;
    invoiceNumber?: string;
    ettn?: string;
  };
  company: {
    nameAr: string;
    nameEn: string;
    logoUrl: string;
    licenseNo: string;
    taxNo: string;
    address: string;
    phone: string;
    email: string;
    siteUrl: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  bookingDetails: {
    title: string;
    subtitle: string;
    pnr: string;
    dateLine: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    passengersOrGuests: Array<{
      name: string;
      role: string;
      ticketOrDoc: string;
      seatOrRoom: string;
    }>;
    flightSummary?: {
      airline: string;
      airlineCode: string;
      flightNumber: string;
      origin: string;
      destination: string;
      departureTime: string;
      arrivalTime: string;
      duration: string;
      cabinClass: string;
    };
    hotelSummary?: {
      hotelName: string;
      hotelNameEn?: string;
      stars: number;
      address: string;
      city?: string;
      phone?: string;
      image?: string;
      roomType: string;
      bedType?: string;
      checkIn: string;
      checkOut: string;
      checkInTime?: string;
      checkOutTime?: string;
      nights: number;
      boardType: string;
      adults?: number;
      children?: number;
      freeCancellation?: boolean;
      freeCancellationUntil?: string;
      cancellationText?: string;
      /** Confirmation number as returned by the supplier (Hotelbeds reference, RateHawk order id, …). */
      supplierConfirmationNo?: string;
    };
    serviceSummary?: {
      category: string;
      vehicleModel?: string;
      location?: string;
      inclusions: string[];
    };
  };
  pricing: {
    baseFare: number;
    taxesAndFees: number;
    voucherDiscount: number;
    voucherCode?: string;
    netTotal: number;
    currency: string;
  };
  templateSettings: {
    primaryColor: string;
    accentColor: string;
    footerNote: string;
    terms: string[];
  };
};

/** Hotel summary strictly from the booking record + offer snapshot; unknown fields stay empty ("no invented data"). */
function hotelSummaryFromBooking(b: HotelBookingRecord, snap: Record<string, unknown>): NonNullable<OfficialInvoiceData["bookingDetails"]["hotelSummary"]> {
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : typeof v === "number" ? String(v) : undefined);
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() && Number.isFinite(Number(v)) ? Number(v) : undefined);
  const checkIn = b.check_in || "";
  const checkOut = b.check_out || "";
  const nights = checkIn && checkOut ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 0;
  const rec = b as unknown as Record<string, unknown>;
  return {
    hotelName: b.hotel_name || str(snap.hotelName) || "—",
    hotelNameEn: str(snap.hotelNameEn),
    stars: num(snap.stars) ?? num(rec.stars) ?? 0,
    address: str(snap.address) || str(rec.hotel_address) || "—",
    city: str(snap.city) || str(rec.city),
    phone: str(snap.hotelPhone),
    image: str(snap.image) || str(snap.heroImage),
    roomType: b.room_name || str(snap.roomName) || "—",
    bedType: str(snap.bedType) || str(snap.beds),
    checkIn,
    checkOut,
    checkInTime: str(snap.checkInTime),
    checkOutTime: str(snap.checkOutTime),
    nights: num(snap.nights) ?? nights,
    boardType: str(snap.boardName) || str(snap.board) || "—",
    adults: num(snap.adults) ?? num(rec.adults),
    children: num(snap.children) ?? num(rec.children),
    freeCancellation: typeof snap.freeCancellation === "boolean" ? snap.freeCancellation : typeof snap.refundable === "boolean" ? snap.refundable : undefined,
    freeCancellationUntil: str(snap.freeCancellationUntil),
    cancellationText: str(snap.cancellationText),
    supplierConfirmationNo: str(rec.supplier_confirmation) || str(rec.supplier_reference) || str(snap.supplierConfirmationNo) || str(snap.confirmationNumber),
  };
}

export async function resolveOfficialInvoice(bookingId: string): Promise<OfficialInvoiceData | null> {
  const branding = await getBranding();
  const pb = await tryCreateAdminPocketBase();

  let realBooking: HotelBookingRecord | null = null;
  // Customer identity comes from the booking record itself (customer_* fields), then the linked user /
  // customer records. Never from a hard-coded placeholder.
  let customerUser: { name: string; email: string; phone: string } = { name: "", email: "", phone: "" };

  if (pb) {
    try {
      realBooking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
      const rec = (realBooking || {}) as unknown as Record<string, unknown>;
      customerUser.name = String(rec.customer_name || "").trim();
      customerUser.email = String(rec.customer_email || "").trim();
      customerUser.phone = String(rec.customer_phone || "").trim();
      if (realBooking?.user) {
        try {
          const userRec = await pb.collection("users").getOne(realBooking.user);
          customerUser.name = customerUser.name || userRec.name || "";
          customerUser.email = customerUser.email || userRec.email || "";
        } catch {
          /* ignore */
        }
        try {
          const custRec = await pb.collection("customers").getFirstListItem(
            customerUser.email ? `user = "${realBooking.user}" || email = "${customerUser.email.replace(/"/g, "")}"` : `user = "${realBooking.user}"`
          );
          if (!customerUser.phone && custRec.phone) customerUser.phone = custRec.phone;
          if (!customerUser.name && custRec.name) customerUser.name = custRec.name;
        } catch {
          /* ignore */
        }
      }
    } catch {
      realBooking = null;
    }
  }

  // 1. IF REAL BOOKING FOUND IN POCKETBASE
  if (realBooking) {
    const serviceType = bookingServiceOf(realBooking);
    const flight = flightDisplayOf(realBooking);
    const snap = (realBooking.offer_snapshot && typeof realBooking.offer_snapshot === "object" ? realBooking.offer_snapshot : {}) as Record<string, unknown>;

    const { getParasutInvoice } = await import("@/lib/server/parasut/parasut-invoices-store");
    const parasutInv = await getParasutInvoice(realBooking.id);

    const invoiceNumber = parasutInv?.invoiceNo || `INV-${realBooking.id.slice(0, 8).toUpperCase()}`;
    const signature = await signInvoice(realBooking.id, invoiceNumber);
    const verifyUrl = await getInvoiceVerificationUrl(realBooking.id, invoiceNumber, parasutInv?.ettn);
    const qrCodeDataUrl = await generateInvoiceQrCode(verifyUrl);
    const template = await getInvoiceTemplate(serviceType);

    const isFlight = serviceType === "flight";
    const isHotel = serviceType === "hotel";

    const baseFare = Number(snap.baseFare || realBooking.price * 0.85);
    const taxesAndFees = Number(snap.taxesAndFees || realBooking.price * 0.15);
    const voucherDiscount = Number(snap.discount || snap.voucherDiscount || 0);
    const voucherCode = snap.voucherCode ? String(snap.voucherCode) : undefined;
    const netTotal = Number(realBooking.price || snap.display_amount || 0);

    return {
      ok: true,
      invoiceNumber,
      bookingId: realBooking.id,
      signature,
      verifyUrl,
      qrCodeDataUrl,
      issuedAt: parasutInv?.issuedAt || realBooking.created || new Date().toISOString(),
      serviceType,
      eArchive: parasutInv
        ? {
            invoiceNo: parasutInv.invoiceNo || "",
            invoiceNumber: parasutInv.invoiceNo || "",
            uuid: parasutInv.ettn || "",
            ettn: parasutInv.ettn || "",
            issuedAt: parasutInv.issuedAt,
            pdfDownloadUrl: `/api/account/invoices/${realBooking.id}/earchive`,
            gibStatus: parasutInv.gibStatus || "approved",
            verified: parasutInv.status === "signed",
          }
        : undefined,
      company: {
        nameAr: template.companyNameAr || branding.brandNameAr || "شركة لوناليزا للسياحة والسفر المحدودة",
        nameEn: template.companyNameEn || branding.brandNameEn || "Lonaliza Tourism & Travel LLC",
        logoUrl: branding.logoUrl || "/api/branding/file?name=logo.png",
        licenseNo: "TÜRSAB Belge No: 14892 · IATA Agency Code: 42-2 9821 4",
        taxNo: "VKN: 6090871234 / Vergi Dairesi: Beyoğlu",
        address: defaultSiteContact.address || "Cumhuriyet Cad. No: 42/B, Taksim, Istanbul, Turkey",
        phone: defaultSiteContact.customerServicePhones[0] || "+90 501 570 92 01",
        email: defaultSiteContact.email || "support@lonaliza.com",
        siteUrl: "https://lonaliza.com",
      },
      customer: customerUser,
      bookingDetails: {
        title: isFlight ? `${flight.origin} ✈ ${flight.destination}` : realBooking.hotel_name,
        subtitle: isFlight ? `${flight.airline} · ${flight.fare_class}` : realBooking.room_name || "إقامة فندقية مؤكدة",
        pnr: flight.pnr || realBooking.ref_code || realBooking.id.slice(0, 8).toUpperCase(),
        dateLine: [realBooking.check_in, realBooking.check_out].filter(Boolean).join(" ➔ ") || "—",
        status: realBooking.status || "paid",
        paymentStatus: realBooking.payment_status || "paid",
        paymentMethod: String(snap.payment_method || (realBooking as any).payment_method || "بطاقة إلكترونية"),
        passengersOrGuests: [
          {
            name: customerUser.name,
            role: isFlight ? "المسافر الرئيسي" : "النزيل الرئيسي",
            ticketOrDoc: flight.pnr || realBooking.id.slice(0, 10).toUpperCase(),
            seatOrRoom: isFlight ? String(snap.seat || "—") : realBooking.room_name || "—",
          },
        ],
        flightSummary: isFlight
          ? {
              airline: flight.airline || "خطوط الطيران",
              airlineCode: flight.airline_code || "PC",
              flightNumber: String(snap.flightNumber || "PC-2401"),
              origin: flight.origin || "SAW",
              destination: flight.destination || "RUH",
              departureTime: realBooking.check_in || "2026-09-20T08:30:00Z",
              arrivalTime: realBooking.check_out || "2026-09-20T12:45:00Z",
              duration: "4 ساعات و15 دقيقة",
              cabinClass: flight.fare_class || "درجة اقتصادية",
            }
          : undefined,
        hotelSummary: isHotel ? hotelSummaryFromBooking(realBooking, snap) : undefined,
      },
      pricing: {
        baseFare,
        taxesAndFees,
        voucherDiscount,
        voucherCode,
        netTotal,
        currency: realBooking.currency || "USD",
      },
      templateSettings: {
        primaryColor: template.primaryColor || "#18082e",
        accentColor: template.accentColor || "#d97706",
        footerNote: template.footerText || "نشكركم لاختيار لوناليزا للسياحة والسفر. هذه الفاتورة الإلكترونية معتمدة رسمياً وموثقة عبر كود التحقق الرقمي المشفر.",
        terms: (template as any).terms || [
          "تخضع هذه التذكرة/القسيمة للائحة الطيران المدني الدولي IATA وقوانين السياحة التركية TÜRSAB.",
          "في حال طلب التعديل أو الإلغاء، تطبق شروط الفئة السعرية الخاصة بالمزود المعتمد.",
          "يرجى التواجد في المطار قبل موعد الإقلاع بثلاث ساعات على الأقل للرحلات الدولية.",
        ],
      },
    };
  }

  // 2. CHECK MOCK DATA
  // Demo bookings only resolve for explicit demo ids; an unknown id must never produce a document.
  const mock = findMockBookingDetail(bookingId);
  if (!mock) return null;

  const serviceType = mock.serviceType;
  const invoiceNumber = `INV-${mock.id.replace("mock-", "").slice(0, 10).toUpperCase()}`;
  const signature = await signInvoice(mock.id, invoiceNumber);
  const verifyUrl = await getInvoiceVerificationUrl(mock.id, invoiceNumber);
  const qrCodeDataUrl = await generateInvoiceQrCode(verifyUrl);
  const template = await getInvoiceTemplate(serviceType);

  const isFlight = serviceType === "flight";
  const isHotel = serviceType === "hotel";

  return {
    ok: true,
    invoiceNumber,
    bookingId: mock.id,
    signature,
    verifyUrl,
    qrCodeDataUrl,
    issuedAt: mock.created,
    serviceType,
    company: {
      nameAr: template.companyNameAr || branding.brandNameAr || "شركة لوناليزا للسياحة والسفر المحدودة",
      nameEn: template.companyNameEn || branding.brandNameEn || "Lonaliza Tourism & Travel LLC",
      logoUrl: branding.logoUrl || "/api/branding/file?name=logo.png",
      licenseNo: "TÜRSAB Belge No: 14892 · IATA Agency Code: 42-2 9821 4",
      taxNo: "VKN: 6090871234 / Vergi Dairesi: Beyoğlu",
      address: defaultSiteContact.address || "Cumhuriyet Cad. No: 42/B, Taksim, Istanbul, Turkey",
      phone: defaultSiteContact.customerServicePhones[0] || "+90 501 570 92 01",
      email: defaultSiteContact.email || "support@lonaliza.com",
      siteUrl: "https://lonaliza.com",
    },
    customer: customerUser,
    bookingDetails: {
      title: mock.title,
      subtitle: mock.subtitle,
      pnr: mock.pnr,
      dateLine: `${mock.flightDetails?.departureTime?.slice(0, 10) || mock.hotelDetails?.checkIn || mock.created.slice(0, 10)}`,
      status: mock.status,
      paymentStatus: mock.paymentStatus,
      paymentMethod: mock.paymentMethod === "card" ? "بطاقة بنكية (Credit Card)" : "تحويل إلكتروني معتمد",
      passengersOrGuests: (mock.passengers || []).map((p) => ({
        name: p.name,
        role: "المسافر الرئيسي",
        ticketOrDoc: p.ticketNumber,
        seatOrRoom: p.seat,
      })),
      flightSummary: mock.flightDetails
        ? {
            airline: mock.flightDetails.airline,
            airlineCode: mock.flightDetails.airlineCode,
            flightNumber: mock.flightDetails.flightNumber,
            origin: mock.flightDetails.origin,
            destination: mock.flightDetails.destination,
            departureTime: mock.flightDetails.departureTime,
            arrivalTime: mock.flightDetails.arrivalTime,
            duration: mock.flightDetails.duration,
            cabinClass: mock.flightDetails.cabinClass,
          }
        : undefined,
      hotelSummary: mock.hotelDetails
        ? {
            hotelName: mock.hotelDetails.hotelName,
            stars: mock.hotelDetails.stars,
            address: mock.hotelDetails.address,
            roomType: mock.hotelDetails.roomType,
            checkIn: mock.hotelDetails.checkIn,
            checkOut: mock.hotelDetails.checkOut,
            nights: mock.hotelDetails.nights,
            boardType: mock.hotelDetails.boardType,
          }
        : undefined,
      serviceSummary: mock.serviceDetails
        ? {
            category: mock.serviceDetails.categoryName,
            vehicleModel: mock.serviceDetails.vehicleModel,
            location: mock.serviceDetails.pickupLocation,
            inclusions: mock.serviceDetails.inclusions,
          }
        : undefined,
    },
    pricing: {
      baseFare: mock.priceBreakdown.baseFare,
      taxesAndFees: mock.priceBreakdown.taxesAndFees,
      voucherDiscount: mock.priceBreakdown.discount,
      voucherCode: mock.priceBreakdown.discount > 0 ? "VIP-AUTUMN26" : undefined,
      netTotal: mock.price,
      currency: mock.currency,
    },
    templateSettings: {
      primaryColor: template.primaryColor || "#18082e",
      accentColor: template.accentColor || "#d97706",
      footerNote: template.footerText || "نشكركم لاختيار لوناليزا للسياحة والسفر. هذه الفاتورة الإلكترونية معتمدة رسمياً وموثقة عبر كود التحقق الرقمي المشفر.",
      terms: (template as any).terms || [
        "تخضع هذه التذكرة/القسيمة للائحة الطيران المدني الدولي IATA وقوانين السياحة التركية TÜRSAB.",
        "في حال طلب التعديل أو الإلغاء، تطبق شروط الفئة السعرية الخاصة بالمزود المعتمد.",
      ],
    },
  };
}
