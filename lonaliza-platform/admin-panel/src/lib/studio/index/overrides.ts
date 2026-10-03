/** مرادفات يدوية → nodeId (يجب أن ت exist في platform-index.generated). */
export const KEYWORD_OVERRIDES: Record<string, string[]> = {
  // Reviews & Ratings (تقييمات وريفيوز)
  ريفيوز: ["hub.hotels.reviews", "hub.bookings.reviews"],
  الريفيوز: ["hub.hotels.reviews", "hub.bookings.reviews"],
  reviews: ["hub.hotels.reviews", "hub.bookings.reviews"],
  تقييمات: ["hub.hotels.reviews", "hub.bookings.reviews"],
  التقييمات: ["hub.hotels.reviews", "hub.bookings.reviews"],
  "تقييمات الفنادق": ["hub.hotels.reviews"],
  "تقييم الفنادق": ["hub.hotels.reviews"],
  "تقييمات النزلاء": ["hub.hotels.reviews"],
  "تقييمات العملاء": ["hub.bookings.reviews", "hub.crm.reviews"],
  "التقييمات الموثقة": ["hub.bookings.reviews"],
  "درجات التقييم": ["hub.hotels.reviews"],

  // Hotels & Stays (الفنادق)
  "ثيمات الفنادق": ["hub.hotels.catalog", "hub.hotels.content"],
  "ثيمات فندقية": ["hub.hotels.catalog"],
  "حجوزات الفنادق": ["hub.hotels.bookings", "hub.bookings.hotel"],
  "موردي الفنادق": ["hub.hotels.suppliers"],
  "بنوك الاسرة": ["hub.hotels.suppliers"],
  "بنوك الأسرة": ["hub.hotels.suppliers"],
  "اسعار الفنادق": ["hub.hotels.catalog"],
  فنادق: ["screen.05", "hub.hotels.bookings"],

  // Bookings, Cancellations & Financial Refunds (الحجوزات والإلغاء)
  كنسل: ["hub.bookings.cancellations"],
  cancel: ["hub.bookings.cancellations"],
  "طلبات الالغاء": ["hub.bookings.cancellations"],
  "طلبات الإلغاء": ["hub.bookings.cancellations"],
  "استرداد الاموال": ["hub.bookings.cancellations"],
  "الاسترداد المالي": ["hub.bookings.cancellations"],
  "مدفوعات الحجوزات": ["hub.bookings.payments"],
  "حجوزات b2b": ["hub.bookings.b2b"],
  "طلبات الحجز": ["hub.bookings.enquiries"],

  // Flights & Aviation (الطيران)
  gds: ["hub.flights.settings"],
  pkfare: ["hub.flights.settings", "screen.04"],
  بكفير: ["hub.flights.settings"],
  طيران: ["screen.04"],
  "حجوزات الطيران": ["screen.04", "hub.flights.postops"],

  // Agent Swarm & AI (غرفة الوكلاء والذكاء الاصطناعي)
  jarvis: ["screen.20"],
  جارvis: ["screen.20"],
  المشرف: ["screen.20", "screen.11"],
  "الوكيل المشرف": ["screen.20", "screen.11"],
  "خلية الوكلاء": ["screen.11", "hub.agents.warroom"],
  "غرفة العمليات": ["screen.11", "hub.agents.warroom"],
  "برامج الذكاء": ["hub.agents.programs"],
  "نماذج الذكاء": ["hub.agents.models"],

  // Automation & Loops (الأتمتة والتنفيذ)
  "محرك الاتمتة": ["screen.12", "hub.auto.tools"],
  "استوديو الاتمتة": ["screen.12", "hub.auto.tools"],
  "المهام المجدولة": ["hub.auto.jobs"],
  "سجل التنفيذ": ["hub.auto.logs"],
  "خوادم mcp": ["hub.auto.mcp"],

  // Screens & Navigation (الواجهات والشاشات)
  الاطلس: ["screen.01"],
  atlas: ["screen.01"],
  نكسus: ["screen.21"],
  nexus: ["screen.21"],
  orbital: ["screen.21"],
  هولوغر: ["screen.21"],
  deck: ["screen.21"],
  سلايد: ["screen.21"],
  "بطاقات سلايد": ["screen.21"],
  "visual loops": ["screen.22"],
  blueprint: ["screen.22"],
  "العقد والأتمتة": ["screen.22"],
  "العقد والاتمتة": ["screen.22"],
};
