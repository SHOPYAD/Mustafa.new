import { promises as fs } from "fs";
import path from "path";
import type { EmailTemplateKind, EmailTemplateRecord } from "@/lib/server/email/types";
import type { EmailVisualDocument } from "@/lib/email/visual-doc";

export const EMAIL_I18N_PREFIX = "email.templates.";

export type EmailI18nLocales = {
  ar: string;
  en: string;
  tr: string;
};

export type ExtraEmailKeyMap = Record<string, { ar: string; en: string }>;

const EXTRA_FILE = path.join(process.cwd(), ".data", "email-template-i18n.json");

function triple(ar: string, en: string, tr: string): EmailI18nLocales {
  return { ar, en, tr };
}

export const KIND_SLUG: Record<Exclude<EmailTemplateKind, "custom">, string> = {
  offers_reminder: "offers-reminder",
  flight_reminder: "flight-reminder",
  hotel_reminder: "hotel-reminder",
  package_reminder: "package-reminder",
  tour_reminder: "tour-reminder",
  transfer_reminder: "transfer-reminder",
  car_reminder: "car-reminder",
  visa_reminder: "visa-reminder",
  booking_success: "booking-success",
  hotel_success: "hotel-success",
  flight_success: "flight-success",
  package_success: "package-success",
  tour_success: "tour-success",
  transfer_success: "transfer-success",
  car_success: "car-success",
  visa_success: "visa-success",
  invoice: "booking-invoice",
};

export const EMAIL_I18N_SEED: Record<string, EmailI18nLocales> = {
  "email.templates.common.fallbackName": triple(
    "العميل العزيز",
    "Dear customer",
    "Değerli müşterimiz"
  ),
  "email.templates.common.cta.completeBooking": triple(
    "إكمال الحجز",
    "Complete booking",
    "Rezervasyonu tamamla"
  ),
  "email.templates.common.cta.continueBooking": triple(
    "متابعة الحجز",
    "Continue booking",
    "Rezervasyona devam et"
  ),
  "email.templates.common.cta.viewBooking": triple(
    "عرض الحجز",
    "View booking",
    "Rezervasyonu görüntüle"
  ),
  "email.templates.common.cta.continueRequest": triple(
    "متابعة الطلب",
    "Continue request",
    "Talebe devam et"
  ),
  "email.templates.common.cta.viewRequest": triple(
    "تفاصيل الطلب",
    "View request",
    "Talebi görüntüle"
  ),
  "email.templates.common.cta.downloadInvoice": triple(
    "تحميل الفاتورة",
    "Download invoice",
    "Faturayı indir"
  ),
  "email.templates.common.cta.browseOffers": triple(
    "تصفح العروض",
    "Browse offers",
    "Teklifleri incele"
  ),
  "email.templates.common.cta.visitSite": triple(
    "زيارة الموقع",
    "Visit website",
    "Siteyi ziyaret et"
  ),
  "email.templates.common.label.route": triple("المسار", "Route", "Güzergah"),
  "email.templates.common.label.depart": triple("المغادرة", "Departure", "Gidiş"),
  "email.templates.common.label.return": triple("العودة", "Return", "Dönüş"),
  "email.templates.common.label.passengers": triple("المسافرون", "Passengers", "Yolcular"),
  "email.templates.common.label.fare": triple("السعر التقريبي", "Approx. fare", "Yaklaşık ücret"),
  "email.templates.common.label.hotel": triple("الفندق", "Hotel", "Otel"),
  "email.templates.common.label.room": triple("الغرفة", "Room", "Oda"),
  "email.templates.common.label.checkIn": triple("الوصول", "Check-in", "Giriş"),
  "email.templates.common.label.checkOut": triple("المغادرة", "Check-out", "Çıkış"),
  "email.templates.common.label.nights": triple("الليالي", "Nights", "Gece"),
  "email.templates.common.label.total": triple("الإجمالي", "Total", "Toplam"),
  "email.templates.common.label.bookingId": triple("رقم الحجز", "Booking no.", "Rezervasyon no."),
  "email.templates.common.label.service": triple("الخدمة", "Service", "Hizmet"),
  "email.templates.common.label.details": triple("التفاصيل", "Details", "Detaylar"),
  "email.templates.common.label.amount": triple("المبلغ", "Amount", "Tutar"),
  "email.templates.common.label.requestId": triple("رقم الطلب", "Request no.", "Talep no."),
  "email.templates.common.label.paid": triple("المبلغ المدفوع", "Paid", "Ödenen"),
  "email.templates.common.label.baggage": triple("الأمتعة", "Baggage", "Bagaj"),
  "email.templates.common.label.address": triple("العنوان", "Address", "Adres"),
  "email.templates.common.label.breakfast": triple("الإفطار / الإعاشة", "Board / breakfast", "Pansiyon"),
  "email.templates.common.label.vehicle": triple("المركبة", "Vehicle", "Araç"),
  "email.templates.common.label.pickup": triple("الاستلام", "Pickup", "Teslim alma"),
  "email.templates.common.label.driverNotes": triple("ملاحظات السائق", "Driver notes", "Sürücü notları"),
  "email.templates.common.label.paymentRef": triple("مرجع الدفع", "Payment ref.", "Ödeme ref."),
  "email.templates.common.mailCheck.subject": triple(
    "تحقق من إعداد البريد",
    "Mail setup check",
    "E-posta kurulumu kontrolü"
  ),
  "email.templates.common.mailCheck.heading": triple(
    "تحقق من إعداد البريد",
    "Mail setup check",
    "E-posta kurulumu kontrolü"
  ),
  "email.templates.common.mailCheck.p1": triple(
    "هذه رسالة تحقق من {{brand}}. تؤكد أن الخادم يقبل الإرسال من نطاق {{host}} بعنوان المرسل المعتمد.",
    "This is a setup check from {{brand}}. It confirms the server can send from {{host}} using the configured From address.",
    "Bu {{brand}} tarafından gönderilen bir kurulum kontrolüdür. Sunucunun {{host}} üzerinden tanımlı gönderen adresiyle e-posta gönderebildiğini doğrular."
  ),
  "email.templates.common.mailCheck.p2": triple(
    "ليست عرضاً ولا حملة تسويق، ولا تتطلّب أي إجراء. إن وصلت إلى مجلد غير مرغوب، علّمها «ليست سبام» حتى تتعرّف صناديق البريد على النطاق.",
    "It is not a promotion and needs no action. If it landed in spam, mark it as not spam so mailbox providers can learn the domain.",
    "Bu bir kampanya değildir ve işlem gerektirmez. Spam klasörüne düşerse «spam değil» olarak işaretleyin."
  ),
  "email.templates.common.mailCheck.p3": triple(
    "فريق {{brand}} — {{host}}",
    "{{brand}} — {{host}}",
    "{{brand}} — {{host}}"
  ),
  "email.templates.offers-reminder.subject": triple(
    "{{offer_title}} — عرض من لوناليزا للسياحة والسفر",
    "{{offer_title}} — offer from Alrayyan Tourism",
    "{{offer_title}} — Alrayyan Turizm teklifi"
  ),
  "email.templates.offers-reminder.heading": triple(
    "عرض لا يفوتك، {{name}}",
    "A trip worth opening, {{name}}",
    "Kaçırılmayacak bir teklif, {{name}}"
  ),
  "email.templates.offers-reminder.lead": triple(
    "أعدنا ترتيب أفضل العروض هذا الأسبوع خصيصاً لك.",
    "We saved this week's strongest offers for you.",
    "Bu haftanın en güçlü tekliflerini sizin için ayırdık."
  ),
  "email.templates.offers-reminder.text": triple(
    "مرحباً {{name}}\n{{offer_title}}\n{{offer_detail}}\n{{cta_url}}",
    "Hello {{name}}\n{{offer_title}}\n{{offer_detail}}\n{{cta_url}}",
    "Merhaba {{name}}\n{{offer_title}}\n{{offer_detail}}\n{{cta_url}}"
  ),
  "email.templates.flight-reminder.subject": triple(
    "تذكير رحلتك {{route}}",
    "Reminder: your flight {{route}}",
    "Uçuş hatırlatması {{route}}"
  ),
  "email.templates.flight-reminder.heading": triple(
    "رحلتك بانتظار التأكيد",
    "Your flight is waiting",
    "Uçuşunuz onay bekliyor"
  ),
  "email.templates.flight-reminder.lead": triple(
    "{{name}}، لم نُكمل بعد حجز الطيران. المقاعد والأسعار تتغير بسرعة.",
    "{{name}}, this itinerary is not confirmed yet. Seats and fares move quickly.",
    "{{name}}, uçuş rezervasyonunuz henüz tamamlanmadı. Koltuklar ve fiyatlar hızla değişir."
  ),
  "email.templates.flight-reminder.text": triple(
    "{{name}} — تذكير رحلة {{route}} — {{cta_url}}",
    "{{name}} — flight reminder {{route}} — {{cta_url}}",
    "{{name}} — uçuş hatırlatması {{route}} — {{cta_url}}"
  ),
  "email.templates.hotel-reminder.subject": triple(
    "أكمل حجزك في {{hotel_name}}",
    "Finish your stay at {{hotel_name}}",
    "{{hotel_name}} konaklamanızı tamamlayın"
  ),
  "email.templates.hotel-reminder.heading": triple(
    "غرفتكم ما زالت بانتظاركم",
    "Your room is still on hold",
    "Odanız sizi bekliyor"
  ),
  "email.templates.hotel-reminder.lead": triple(
    "{{name}}، بدأنا حجز الفندق ولم يُستكمل بعد.",
    "{{name}}, the hotel reservation was started and is not complete yet.",
    "{{name}}, otel rezervasyonunuz başlatıldı ancak tamamlanmadı."
  ),
  "email.templates.hotel-reminder.text": triple(
    "{{name}} — تذكير فندق {{hotel_name}} — {{cta_url}}",
    "{{name}} — hotel reminder {{hotel_name}} — {{cta_url}}",
    "{{name}} — otel hatırlatması {{hotel_name}} — {{cta_url}}"
  ),
  "email.templates.booking-success.subject": triple(
    "تم تأكيد الدفع والحجز {{booking_id}}",
    "Payment confirmed {{booking_id}}",
    "Ödeme onaylandı {{booking_id}}"
  ),
  "email.templates.booking-success.heading": triple(
    "تم تأكيد حجزك",
    "Your booking is confirmed",
    "Rezervasyonunuz onaylandı"
  ),
  "email.templates.booking-success.lead": triple(
    "شكراً {{name}}. استلمنا الدفع بنجاح وسيتابع فريق لوناليزا إصدار المستندات.",
    "Thank you {{name}}. Payment is confirmed and the Alrayyan team will issue your documents.",
    "Teşekkürler {{name}}. Ödemeniz alındı, Alrayyan ekibi belgelerinizi hazırlar."
  ),
  "email.templates.booking-success.text": triple(
    "حجز مؤكد {{booking_id}} — {{service_name}} — {{amount}} {{currency}}",
    "Booking confirmed {{booking_id}} — {{service_name}} — {{amount}} {{currency}}",
    "Rezervasyon onaylandı {{booking_id}} — {{service_name}} — {{amount}} {{currency}}"
  ),
  "email.templates.booking-invoice.subject": triple(
    "فاتورة الحجز {{booking_id}}",
    "Invoice for booking {{booking_id}}",
    "Rezervasyon faturası {{booking_id}}"
  ),
  "email.templates.booking-invoice.heading": triple("فاتورة الدفع", "Payment invoice", "Ödeme faturası"),
  "email.templates.booking-invoice.lead": triple(
    "{{name}}، تم تأكيد الدفع عبر البطاقة. هذه فاتورة حجزك لدى لوناليزا.",
    "{{name}}, card payment is confirmed. This is your Alrayyan booking invoice.",
    "{{name}}, kart ödemeniz onaylandı. Bu Alrayyan rezervasyon faturanızdır."
  ),
  "email.templates.booking-invoice.text": triple(
    "فاتورة {{booking_id}} — {{amount}} {{currency}} — {{invoice_url}}",
    "Invoice {{booking_id}} — {{amount}} {{currency}} — {{invoice_url}}",
    "Fatura {{booking_id}} — {{amount}} {{currency}} — {{invoice_url}}"
  ),
};

const SERVICE_REMINDER_KINDS: Array<Exclude<EmailTemplateKind, "custom">> = [
  "package_reminder",
  "tour_reminder",
  "transfer_reminder",
  "car_reminder",
  "visa_reminder",
];

const SERVICE_SUCCESS_KINDS: Array<Exclude<EmailTemplateKind, "custom">> = [
  "hotel_success",
  "flight_success",
  "package_success",
  "tour_success",
  "transfer_success",
  "car_success",
  "visa_success",
];

const SERVICE_REMINDER_COPY = {
  heading: triple("طلبك بانتظار الإكمال", "Your request is waiting", "Talebiniz tamamlanmayı bekliyor"),
  lead: triple(
    "{{name}}، بدأنا تجهيز {{service_name}} ولم يُستكمل بعد.",
    "{{name}}, we started {{service_name}} and it is not complete yet.",
    "{{name}}, {{service_name}} talebiniz başlatıldı ancak tamamlanmadı."
  ),
  text: triple(
    "{{name}} — تذكير {{service_name}} — {{cta_url}}",
    "{{name}} — reminder {{service_name}} — {{cta_url}}",
    "{{name}} — hatırlatma {{service_name}} — {{cta_url}}"
  ),
};

const SERVICE_SUCCESS_COPY = {
  heading: triple("تم تأكيد حجزك", "Your booking is confirmed", "Rezervasyonunuz onaylandı"),
  lead: triple(
    "شكراً {{name}}. استلمنا الدفع لـ {{service_name}} ومرفق المستندات عند جاهزيتها.",
    "Thank you {{name}}. Payment for {{service_name}} is confirmed and documents are attached when ready.",
    "Teşekkürler {{name}}. {{service_name}} ödemeniz onaylandı, belgeler hazır olduğunda eklenir."
  ),
  text: triple(
    "حجز مؤكد {{booking_id}} — {{service_name}}",
    "Confirmed {{booking_id}} — {{service_name}}",
    "Onaylandı {{booking_id}} — {{service_name}}"
  ),
};

const SERVICE_SUCCESS_HEADINGS: Partial<
  Record<Exclude<EmailTemplateKind, "custom">, EmailI18nLocales>
> = {
  hotel_success: triple("تم تأكيد حجز الفندق", "Hotel booking confirmed", "Otel rezervasyonu onaylandı"),
  flight_success: triple("تم تأكيد حجز الطيران", "Flight booking confirmed", "Uçuş rezervasyonu onaylandı"),
  transfer_success: triple("تم تأكيد الترانسفير", "Transfer confirmed", "Transfer onaylandı"),
  car_success: triple("تم تأكيد تأجير السيارة", "Car rental confirmed", "Araç kiralama onaylandı"),
};

const SERVICE_SUCCESS_LEADS: Partial<
  Record<Exclude<EmailTemplateKind, "custom">, EmailI18nLocales>
> = {
  flight_success: triple(
    "شكراً {{name}}. الدفع مؤكد. أرفقنا تذكرة إلكترونية عند صدور رقم التذكرة ورمز PNR. يُرجى الوصول للمطار قبل الرحلة الدولية بثلاث ساعات مع جواز السفر.",
    "Thank you {{name}}. Payment is confirmed. Your e-ticket is attached when the ticket number and PNR are issued. Please arrive 3 hours before an international flight with your passport.",
    "Teşekkürler {{name}}. Ödeme onaylandı. Bilet numarası ve PNR hazır olduğunda e-bilet eklenir. Uluslararası uçuşlarda pasaportunuzla 3 saat önce havalimanında olun."
  ),
  hotel_success: triple(
    "شكراً {{name}}. الدفع مؤكد. أرفقنا قسيمة الفندق وفاتورة الضريبة. أبرزوا القسيمة عند تسجيل الوصول.",
    "Thank you {{name}}. Payment is confirmed. The hotel voucher and tax invoice are attached. Present the voucher at check-in.",
    "Teşekkürler {{name}}. Ödeme onaylandı. Otel voucher’ı ve vergi faturası ektedir. Girişte voucher’ı gösterin."
  ),
};

const KIND_LABELS: Record<Exclude<EmailTemplateKind, "custom">, EmailI18nLocales> = {
  offers_reminder: triple("تذكير عروض", "Offers reminder", "Teklif hatırlatması"),
  flight_reminder: triple("تذكير حجز طيران", "Flight booking reminder", "Uçuş rezervasyon hatırlatması"),
  hotel_reminder: triple("تذكير حجز فندق", "Hotel booking reminder", "Otel rezervasyon hatırlatması"),
  package_reminder: triple("تذكير باقة سياحية", "Package reminder", "Paket hatırlatması"),
  tour_reminder: triple("تذكير جولة يومية", "Tour reminder", "Tur hatırlatması"),
  transfer_reminder: triple("تذكير ترانسفير VIP", "Transfer reminder", "Transfer hatırlatması"),
  car_reminder: triple("تذكير تأجير سيارة", "Car rental reminder", "Araç kiralama hatırlatması"),
  visa_reminder: triple("تذكير طلب تأشيرة", "Visa reminder", "Vize hatırlatması"),
  booking_success: triple("إشعار حجز ناجح", "Booking success", "Rezervasyon onayı"),
  hotel_success: triple("حجز فندق مؤكد", "Hotel booking confirmed", "Otel rezervasyonu onaylandı"),
  flight_success: triple("حجز طيران مؤكد", "Flight booking confirmed", "Uçuş rezervasyonu onaylandı"),
  package_success: triple("حجز باقة ناجح", "Package booking success", "Paket rezervasyonu alındı"),
  tour_success: triple("حجز جولة ناجح", "Tour booking success", "Tur rezervasyonu alındı"),
  transfer_success: triple("حجز ترانسفير ناجح", "Transfer booking success", "Transfer rezervasyonu alındı"),
  car_success: triple("حجز سيارة ناجح", "Car rental success", "Araç kiralama alındı"),
  visa_success: triple("طلب تأشيرة مستلم", "Visa request received", "Vize talebi alındı"),
  invoice: triple("فاتورة حجز / دفع", "Booking / payment invoice", "Rezervasyon / ödeme faturası"),
};

for (const kind of SERVICE_REMINDER_KINDS) {
  const slug = KIND_SLUG[kind];
  const title = KIND_LABELS[kind];
  EMAIL_I18N_SEED[`email.templates.${slug}.subject`] = triple(
    `${title.ar} — {{service_name}}`,
    `${title.en} — {{service_name}}`,
    `${title.tr} — {{service_name}}`
  );
  EMAIL_I18N_SEED[`email.templates.${slug}.heading`] = SERVICE_REMINDER_COPY.heading;
  EMAIL_I18N_SEED[`email.templates.${slug}.lead`] = SERVICE_REMINDER_COPY.lead;
  EMAIL_I18N_SEED[`email.templates.${slug}.text`] = SERVICE_REMINDER_COPY.text;
}

for (const kind of SERVICE_SUCCESS_KINDS) {
  const slug = KIND_SLUG[kind];
  const title = KIND_LABELS[kind];
  EMAIL_I18N_SEED[`email.templates.${slug}.subject`] = triple(
    `${title.ar} {{booking_id}}`,
    `${title.en} {{booking_id}}`,
    `${title.tr} {{booking_id}}`
  );
  EMAIL_I18N_SEED[`email.templates.${slug}.heading`] =
    SERVICE_SUCCESS_HEADINGS[kind] || SERVICE_SUCCESS_COPY.heading;
  EMAIL_I18N_SEED[`email.templates.${slug}.lead`] =
    SERVICE_SUCCESS_LEADS[kind] || SERVICE_SUCCESS_COPY.lead;
  EMAIL_I18N_SEED[`email.templates.${slug}.text`] = SERVICE_SUCCESS_COPY.text;
}

export const EMAIL_TEMPLATE_KIND_LABELS = KIND_LABELS;

export function getEmailI18nSeedFlat(): {
  keys: string[];
  ar: Record<string, string>;
  en: Record<string, string>;
  tr: Record<string, string>;
} {
  const keys = Object.keys(EMAIL_I18N_SEED).sort();
  const ar: Record<string, string> = {};
  const en: Record<string, string> = {};
  const tr: Record<string, string> = {};
  for (const key of keys) {
    ar[key] = EMAIL_I18N_SEED[key].ar;
    en[key] = EMAIL_I18N_SEED[key].en;
    tr[key] = EMAIL_I18N_SEED[key].tr;
  }
  return { keys, ar, en, tr };
}

export function isEmailTemplateI18nKey(key: string): boolean {
  return key.startsWith(EMAIL_I18N_PREFIX);
}

export function templateKey(slug: string, part: string): string {
  return `${EMAIL_I18N_PREFIX}${slug}.${part}`;
}

export async function readExtraEmailI18nKeys(): Promise<ExtraEmailKeyMap> {
  try {
    const raw = await fs.readFile(EXTRA_FILE, "utf8");
    const parsed = JSON.parse(raw) as { keys?: ExtraEmailKeyMap };
    if (!parsed.keys || typeof parsed.keys !== "object") return {};
    const out: ExtraEmailKeyMap = {};
    for (const [key, value] of Object.entries(parsed.keys)) {
      if (!isEmailTemplateI18nKey(key) || !value || typeof value !== "object") continue;
      out[key] = {
        ar: String(value.ar || ""),
        en: String(value.en || ""),
      };
    }
    return out;
  } catch {
    return {};
  }
}

export async function writeExtraEmailI18nKeys(keys: ExtraEmailKeyMap): Promise<void> {
  await fs.mkdir(path.dirname(EXTRA_FILE), { recursive: true });
  await fs.writeFile(EXTRA_FILE, JSON.stringify({ keys }, null, 2), { mode: 0o600 });
}

export function extraKeysFromTemplate(
  template: Pick<EmailTemplateRecord, "slug" | "subject_ar" | "subject_en" | "document">
): ExtraEmailKeyMap {
  const slug = String(template.slug || "").trim();
  if (!slug) return {};
  const out: ExtraEmailKeyMap = {
    [templateKey(slug, "subject")]: {
      ar: String(template.subject_ar || ""),
      en: String(template.subject_en || ""),
    },
  };
  const doc = template.document as EmailVisualDocument | null;
  if (doc && Array.isArray(doc.blocks)) {
    for (const block of doc.blocks) {
      if (block.text) {
        out[templateKey(slug, `block.${block.id}`)] = { ar: block.text, en: "" };
      }
      (block.rows || []).forEach((row, index) => {
        if (row.label) {
          out[templateKey(slug, `block.${block.id}.row.${index}.label`)] = {
            ar: row.label,
            en: "",
          };
        }
      });
    }
  }
  return out;
}

export async function syncExtraEmailI18nKeys(template: EmailTemplateRecord): Promise<void> {
  if (template.is_builtin || template.source === "builtin") return;
  const next = extraKeysFromTemplate(template);
  if (!Object.keys(next).length) return;
  const current = await readExtraEmailI18nKeys();
  await writeExtraEmailI18nKeys({ ...current, ...next });
}

export function seedValue(key: string, locale: "ar" | "en" | "tr"): string {
  const row = EMAIL_I18N_SEED[key];
  if (!row) return "";
  return row[locale] || row.ar;
}
