import type { InvoiceLanguage } from "@/types/invoice-template";

export type InvoiceLabelKey =
  | "officialReceipt"
  | "invoiceNo"
  | "paymentMethod"
  | "customer"
  | "email"
  | "phone"
  | "passenger"
  | "guest"
  | "person"
  | "route"
  | "departDate"
  | "returnDate"
  | "flightNumbers"
  | "fareClass"
  | "baggage"
  | "hotel"
  | "room"
  | "checkIn"
  | "checkOut"
  | "nights"
  | "service"
  | "routeOrDetails"
  | "date"
  | "details"
  | "baseFare"
  | "taxes"
  | "total"
  | "card"
  | "whatsapp"
  | "other"
  | "paid"
  | "pendingReview"
  | "pending"
  | "bookingReference"
  | "ticketNumber"
  | "ticketPending"
  | "issuanceNotice"
  | "tripType"
  | "oneWay"
  | "roundTrip"
  | "multiCity"
  | "aircraft"
  | "terminal"
  | "layover"
  | "duration"
  | "extras"
  | "cabinBaggage"
  | "checkedBaggage"
  | "farePackage"
  | "itinerary"
  | "outbound"
  | "inbound"
  | "document"
  | "operatedBy";

const AR: Record<InvoiceLabelKey, string> = {
  officialReceipt: "إيصال رسمي",
  invoiceNo: "رقم الفاتورة",
  paymentMethod: "طريقة الدفع",
  customer: "العميل",
  email: "البريد",
  phone: "الهاتف",
  passenger: "مسافر",
  guest: "ضيف",
  person: "اسم",
  route: "المسار",
  departDate: "تاريخ المغادرة",
  returnDate: "تاريخ العودة",
  flightNumbers: "أرقام الرحلات",
  fareClass: "درجة السعر",
  baggage: "الأمتعة",
  hotel: "الفندق",
  room: "الغرفة",
  checkIn: "تاريخ الوصول",
  checkOut: "تاريخ المغادرة",
  nights: "عدد الليالي",
  service: "الخدمة",
  routeOrDetails: "المسار / التفاصيل",
  date: "التاريخ",
  details: "التفاصيل",
  baseFare: "الأجرة الأساسية",
  taxes: "الضرائب والرسوم",
  total: "الإجمالي",
  card: "بطاقة iyzico",
  whatsapp: "رابط بنكي عبر واتساب",
  other: "أخرى",
  paid: "مدفوع — مؤكد",
  pendingReview: "بانتظار مراجعة الدفع",
  pending: "بانتظار الدفع",
  bookingReference: "مرجع الحجز",
  ticketNumber: "رقم التذكرة",
  ticketPending: "قيد الإصدار",
  issuanceNotice: "سيتم إصدار التذكرة خلال ساعتين وإرسالها إلى بريدكم الإلكتروني.",
  tripType: "نوع الرحلة",
  oneWay: "ذهاب فقط",
  roundTrip: "ذهاب وعودة",
  multiCity: "وجهات متعددة",
  aircraft: "الطائرة",
  terminal: "الصالة",
  layover: "توقف",
  duration: "المدة",
  extras: "إضافات",
  cabinBaggage: "حقيبة المقصورة",
  checkedBaggage: "أمتعة مسجّلة",
  farePackage: "باقة السعر",
  itinerary: "خط السير",
  outbound: "الذهاب",
  inbound: "العودة",
  document: "وثيقة",
  operatedBy: "التشغيل",
};

const EN: Record<InvoiceLabelKey, string> = {
  officialReceipt: "Official receipt",
  invoiceNo: "Invoice no.",
  paymentMethod: "Payment method",
  customer: "Customer",
  email: "Email",
  phone: "Phone",
  passenger: "Passenger",
  guest: "Guest",
  person: "Name",
  route: "Route",
  departDate: "Departure",
  returnDate: "Return",
  flightNumbers: "Flight numbers",
  fareClass: "Fare class",
  baggage: "Baggage",
  hotel: "Hotel",
  room: "Room",
  checkIn: "Check-in",
  checkOut: "Check-out",
  nights: "Nights",
  service: "Service",
  routeOrDetails: "Route / details",
  date: "Date",
  details: "Details",
  baseFare: "Base fare",
  taxes: "Taxes & fees",
  total: "Total",
  card: "iyzico card",
  whatsapp: "Bank transfer via WhatsApp",
  other: "Other",
  paid: "Paid — confirmed",
  pendingReview: "Pending payment review",
  pending: "Awaiting payment",
  bookingReference: "Booking reference",
  ticketNumber: "Ticket number",
  ticketPending: "PENDING",
  issuanceNotice: "Your ticket will be issued within 2 hours and sent to your email.",
  tripType: "Trip type",
  oneWay: "One-way",
  roundTrip: "Round-trip",
  multiCity: "Multi-city",
  aircraft: "Aircraft",
  terminal: "Terminal",
  layover: "Layover",
  duration: "Duration",
  extras: "Extras",
  cabinBaggage: "Cabin bag",
  checkedBaggage: "Checked bag",
  farePackage: "Fare package",
  itinerary: "Itinerary",
  outbound: "Outbound",
  inbound: "Return",
  document: "Document",
  operatedBy: "Operated by",
};

const TR: Record<InvoiceLabelKey, string> = {
  officialReceipt: "Resmi makbuz",
  invoiceNo: "Fatura no.",
  paymentMethod: "Ödeme yöntemi",
  customer: "Müşteri",
  email: "E-posta",
  phone: "Telefon",
  passenger: "Yolcu",
  guest: "Misafir",
  person: "Ad",
  route: "Güzergah",
  departDate: "Gidiş",
  returnDate: "Dönüş",
  flightNumbers: "Uçuş numaraları",
  fareClass: "Sınıf",
  baggage: "Bagaj",
  hotel: "Otel",
  room: "Oda",
  checkIn: "Giriş",
  checkOut: "Çıkış",
  nights: "Gece",
  service: "Hizmet",
  routeOrDetails: "Güzergah / detay",
  date: "Tarih",
  details: "Detaylar",
  baseFare: "Baz ücret",
  taxes: "Vergiler ve harçlar",
  total: "Toplam",
  card: "iyzico kart",
  whatsapp: "WhatsApp ile havale",
  other: "Diğer",
  paid: "Ödendi — onaylı",
  pendingReview: "Ödeme incelemesi bekleniyor",
  pending: "Ödeme bekleniyor",
  bookingReference: "Rezervasyon referansı",
  ticketNumber: "Bilet numarası",
  ticketPending: "BEKLEMEDE",
  issuanceNotice: "Biletiniz 2 saat içinde düzenlenip e-postanıza gönderilecektir.",
  tripType: "Yolculuk tipi",
  oneWay: "Tek yön",
  roundTrip: "Gidiş-dönüş",
  multiCity: "Çoklu şehir",
  aircraft: "Uçak",
  terminal: "Terminal",
  layover: "Aktarma",
  duration: "Süre",
  extras: "Ekstralar",
  cabinBaggage: "Kabin bagajı",
  checkedBaggage: "Kayıtlı bagaj",
  farePackage: "Tarife paketi",
  itinerary: "Güzergah",
  outbound: "Gidiş",
  inbound: "Dönüş",
  document: "Belge",
  operatedBy: "İşleten",
};

export function invoiceLabels(language: InvoiceLanguage): Record<InvoiceLabelKey, string> {
  switch (language) {
    case "ar":
      return AR;
    case "en":
      return EN;
    case "tr":
      return TR;
    default: {
      const _exhaustive: never = language;
      return _exhaustive;
    }
  }
}
