import { invoiceServiceTitle, type InvoiceService } from "@/lib/booking-service";
import type { ServiceInvoiceModel } from "@/lib/pdf/service-invoice-html";

function baseSample(
  extras: Pick<ServiceInvoiceModel, "service"> & Partial<ServiceInvoiceModel>
): ServiceInvoiceModel {
  return {
    service: extras.service,
    id: extras.id || "INV-SAMPLE-001",
    issuedAt: "2026-08-30",
    brandNameAr: extras.brandNameAr || "لوناليزا للسياحة والسفر",
    brandNameEn: extras.brandNameEn || "Lonaliza Travel",
    logoDataUri: extras.logoDataUri || "",
    fontDataUri: extras.fontDataUri || "",
    phone: extras.phone || "+971 50 000 0000",
    email: extras.email || "info@lonaliza.com",
    address: extras.address || "دبي، الإمارات العربية المتحدة",
    siteUrl: extras.siteUrl || "lonaliza.com",
    customerName: extras.customerName || "أحمد عبدالله",
    customerEmail: extras.customerEmail || "ahmed@example.com",
    customerPhone: extras.customerPhone || "+971 55 123 4567",
    guestNames: extras.guestNames || ["أحمد عبدالله", "سارة عبدالله"],
    currency: extras.currency || "USD",
    total: extras.total ?? 842,
    taxes: extras.taxes ?? 96,
    baseFare: extras.baseFare ?? 746,
    status: extras.status || "confirmed",
    paymentStatus: extras.paymentStatus || "paid",
    paymentMethod: extras.paymentMethod || "card",
    hotelName: extras.hotelName,
    roomName: extras.roomName,
    checkIn: extras.checkIn,
    checkOut: extras.checkOut,
    nights: extras.nights,
    hotelImage: extras.hotelImage,
    route: extras.route,
    flightNumbers: extras.flightNumbers,
    departDate: extras.departDate,
    returnDate: extras.returnDate,
    fareClass: extras.fareClass,
    baggage: extras.baggage,
    cabinBaggage: extras.cabinBaggage,
    checkedBaggage: extras.checkedBaggage,
    extrasTotal: extras.extrasTotal,
    extras: extras.extras,
    tripType: extras.tripType,
    pnr: extras.pnr,
    pnrIsDummy: extras.pnrIsDummy,
    ticketNumber: extras.ticketNumber,
    ticketIssued: extras.ticketIssued,
    issuanceNotice: extras.issuanceNotice,
    passengers: extras.passengers,
    legs: extras.legs,
    serviceTitle: extras.serviceTitle,
    details: extras.details,
  };
}

export function sampleInvoiceModel(
  service: InvoiceService,
  extras?: Partial<Pick<ServiceInvoiceModel, "brandNameAr" | "brandNameEn" | "logoDataUri" | "fontDataUri">>
): ServiceInvoiceModel {
  const brand = extras || {};
  switch (service) {
    case "flight":
      return baseSample({
        ...brand,
        service,
        id: "FLT-88421",
        route: "DXB → IST",
        flightNumbers: "TK 759 · TK 758",
        departDate: "Sat, 12 Sep 2026",
        returnDate: "Sat, 19 Sep 2026",
        fareClass: "Economy Comfort",
        baggage: "23 kg",
        cabinBaggage: "8 kg",
        checkedBaggage: "23 kg",
        extrasTotal: 45,
        extras: [{ key: "extraBag", amount: 45 }],
        tripType: "round-trip",
        pnr: "K7M3QP",
        pnrIsDummy: true,
        ticketNumber: "PENDING",
        ticketIssued: false,
        issuanceNotice: true,
        total: 842,
        baseFare: 701,
        taxes: 96,
        passengers: [
          { name: "أحمد عبدالله", document: "A12345678" },
          { name: "سارة عبدالله", document: "A87654321" },
        ],
        legs: [
          {
            origin: "DXB",
            destination: "IST",
            originName: "Dubai International",
            originCity: "Dubai",
            originTerminal: "3",
            destinationName: "Istanbul Airport",
            destinationCity: "Istanbul",
            destinationTerminal: "1",
            departure: "2026-09-12T08:40:00",
            arrival: "2026-09-12T12:15:00",
            departureDate: "Sat, 12 Sep 2026",
            departureTime: "08:40",
            arrivalDate: "Sat, 12 Sep 2026",
            arrivalTime: "12:15",
            flightNumber: "TK 759",
            airline: "Turkish Airlines",
            airlineCode: "TK",
            airlineLogo: "https://images.kiwi.com/airlines/64/TK.png",
            aircraft: "Boeing 737-800",
            durationMinutes: 275,
            direction: "outbound",
          },
          {
            origin: "IST",
            destination: "DXB",
            originName: "Istanbul Airport",
            originCity: "Istanbul",
            originTerminal: "1",
            destinationName: "Dubai International",
            destinationCity: "Dubai",
            destinationTerminal: "3",
            departure: "2026-09-19T16:20:00",
            arrival: "2026-09-19T22:05:00",
            departureDate: "Sat, 19 Sep 2026",
            departureTime: "16:20",
            arrivalDate: "Sat, 19 Sep 2026",
            arrivalTime: "22:05",
            flightNumber: "TK 758",
            airline: "Turkish Airlines",
            airlineCode: "TK",
            airlineLogo: "https://images.kiwi.com/airlines/64/TK.png",
            aircraft: "Boeing 737-800",
            durationMinutes: 285,
            direction: "return",
          },
        ],
      });
    case "hotel":
      return baseSample({
        ...brand,
        service,
        id: "HTL-22091",
        hotelName: "ريكسوس بريميوم دبي",
        roomName: "غرفة ديلوكس مطلة على البحر",
        checkIn: "2026-10-03",
        checkOut: "2026-10-08",
        nights: 5,
        total: 1280,
        baseFare: 1100,
        taxes: 180,
      });
    case "transfer":
      return baseSample({
        ...brand,
        service,
        id: "TRF-1104",
        serviceTitle: invoiceServiceTitle("transfer").ar,
        route: "مطار دبي DXB → نخلة جميرا",
        checkIn: "2026-09-12 13:30",
        details: [
          { label: "المركبة", value: "فان VIP 6 مقاعد" },
          { label: "السائق", value: "استقبال مع لوحة الاسم" },
        ],
        total: 95,
        baseFare: 80,
        taxes: 15,
      });
    case "car":
      return baseSample({
        ...brand,
        service,
        id: "CAR-5520",
        serviceTitle: invoiceServiceTitle("car").ar,
        route: "دبي — تأجير أسبوعي",
        checkIn: "2026-09-14",
        checkOut: "2026-09-21",
        details: [
          { label: "السيارة", value: "تويوتا كامري 2025" },
          { label: "التأمين", value: "شامل" },
        ],
        total: 420,
        baseFare: 360,
        taxes: 60,
      });
    case "package":
      return baseSample({
        ...brand,
        service,
        id: "PKG-3301",
        serviceTitle: "أسبوع أنطاليا الشامل",
        hotelName: "ريكسوس بريميوم بيلك",
        checkIn: "2026-08-18",
        checkOut: "2026-08-25",
        nights: 7,
        route: "دبي → أنطاليا",
        details: [
          { label: "يشمل", value: "طيران + فندق + ترانسفير" },
        ],
        total: 1890,
        baseFare: 1650,
        taxes: 240,
      });
    case "tour":
      return baseSample({
        ...brand,
        service,
        id: "TOU-778",
        serviceTitle: "جولة كابادوكيا يومين",
        checkIn: "2026-09-20",
        details: [
          { label: "الموعد", value: "05:30 — مناطيد" },
          { label: "يشمل", value: "إفطار + دليل عربي" },
        ],
        total: 260,
        baseFare: 220,
        taxes: 40,
      });
    case "visa":
      return baseSample({
        ...brand,
        service,
        id: "VIS-441",
        serviceTitle: "تأشيرة شنغن — فرنسا",
        guestNames: ["أحمد عبدالله"],
        details: [
          { label: "نوع التأشيرة", value: "سياحة — دخول واحد" },
          { label: "مدة المعالجة", value: "12 يوم عمل" },
        ],
        total: 185,
        baseFare: 160,
        taxes: 25,
      });
    default: {
      const _exhaustive: never = service;
      return _exhaustive;
    }
  }
}
