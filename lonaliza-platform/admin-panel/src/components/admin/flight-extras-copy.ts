import type { Locale } from "@/lib/i18n/types";
import type { AgencyExtraIcon, AgencyExtraService } from "@/types/agency-extra";

export type FlightExtrasAdminCopy = {
  title: string;
  subtitle: string;
  add: string;
  edit: string;
  save: string;
  cancel: string;
  delete: string;
  reset: string;
  resetConfirm: string;
  empty: string;
  active: string;
  inactive: string;
  sort: string;
  icon: string;
  price: string;
  priceType: string;
  fixed: string;
  percent: string;
  services: string;
  titleAr: string;
  titleEn: string;
  titleTr: string;
  descAr: string;
  descEn: string;
  descTr: string;
  loadFailed: string;
  saveFailed: string;
};

export function flightExtrasAdminCopy(locale: Locale): FlightExtrasAdminCopy {
  switch (locale) {
    case "ar":
      return {
        title: "باقات الإضافات (خدمات الوكالة)",
        subtitle: "تظهر في خطوة المراجعة. لا تُضاف إلى السعر إلا بعد اختيار العميل.",
        add: "إضافة باقة",
        edit: "تعديل",
        save: "حفظ",
        cancel: "إلغاء",
        delete: "حذف",
        reset: "استعادة الباقات الافتراضية",
        resetConfirm: "استعادة الباقات الافتراضية واستبدال القائمة الحالية؟",
        empty: "لا توجد باقات بعد",
        active: "نشط",
        inactive: "متوقف",
        sort: "الترتيب",
        icon: "الأيقونة",
        price: "السعر",
        priceType: "نوع السعر",
        fixed: "مبلغ ثابت",
        percent: "نسبة مئوية",
        services: "أنواع الخدمة",
        titleAr: "العنوان عربي",
        titleEn: "العنوان إنجليزي",
        titleTr: "العنوان تركي",
        descAr: "الوصف عربي",
        descEn: "الوصف إنجليزي",
        descTr: "الوصف تركي",
        loadFailed: "تعذر تحميل الباقات",
        saveFailed: "تعذر الحفظ",
      };
    case "tr":
      return {
        title: "Ek paketler (acente hizmetleri)",
        subtitle: "Özet adımında görünür. Müşteri seçene kadar toplama eklenmez.",
        add: "Paket ekle",
        edit: "Düzenle",
        save: "Kaydet",
        cancel: "Vazgeç",
        delete: "Sil",
        reset: "Varsayılan paketleri geri yükle",
        resetConfirm: "Varsayılan ek paketler yüklensin ve mevcut liste değişsin mi?",
        empty: "Henüz paket yok",
        active: "Aktif",
        inactive: "Kapalı",
        sort: "Sıra",
        icon: "İkon",
        price: "Fiyat",
        priceType: "Fiyat türü",
        fixed: "Sabit tutar",
        percent: "Yüzde",
        services: "Hizmet türleri",
        titleAr: "Başlık (Arapça)",
        titleEn: "Başlık (İngilizce)",
        titleTr: "Başlık (Türkçe)",
        descAr: "Açıklama (Arapça)",
        descEn: "Açıklama (İngilizce)",
        descTr: "Açıklama (Türkçe)",
        loadFailed: "Ek paketler yüklenemedi",
        saveFailed: "Kayıt başarısız",
      };
    case "en":
    default:
      return {
        title: "Add-on packages (agency services)",
        subtitle: "Shown on the review step. Not added to the total until the customer selects them.",
        add: "Add package",
        edit: "Edit",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        reset: "Restore seed packages",
        resetConfirm: "Restore the default extras and replace the current list?",
        empty: "No packages yet",
        active: "Active",
        inactive: "Off",
        sort: "Sort",
        icon: "Icon",
        price: "Price",
        priceType: "Price type",
        fixed: "Fixed amount",
        percent: "Percent",
        services: "Service types",
        titleAr: "Title (Arabic)",
        titleEn: "Title (English)",
        titleTr: "Title (Turkish)",
        descAr: "Description (Arabic)",
        descEn: "Description (English)",
        descTr: "Description (Turkish)",
        loadFailed: "Could not load extras",
        saveFailed: "Save failed",
      };
  }
}

export function extraIconLabel(icon: AgencyExtraIcon, locale: Locale): string {
  switch (icon) {
    case "refund":
      return locale === "ar" ? "استرداد" : locale === "tr" ? "İade" : "Refund";
    case "bag":
      return locale === "ar" ? "حقيبة" : locale === "tr" ? "Bagaj" : "Bag";
    case "insurance":
      return locale === "ar" ? "تأمين" : locale === "tr" ? "Sigorta" : "Insurance";
    case "priority":
      return locale === "ar" ? "أولوية" : locale === "tr" ? "Öncelik" : "Priority";
    case "sms":
      return "SMS";
    case "calendar":
      return locale === "ar" ? "تاريخ" : locale === "tr" ? "Tarih" : "Calendar";
    case "shield":
      return locale === "ar" ? "حماية" : locale === "tr" ? "Kalkan" : "Shield";
    case "star":
      return locale === "ar" ? "نجمة" : locale === "tr" ? "Yıldız" : "Star";
    default: {
      const _exhaustive: never = icon;
      return _exhaustive;
    }
  }
}

export function extraServiceLabel(service: AgencyExtraService, locale: Locale): string {
  switch (service) {
    case "flights":
      return locale === "ar" ? "طيران" : locale === "tr" ? "Uçuş" : "Flights";
    case "hotels":
      return locale === "ar" ? "فنادق" : locale === "tr" ? "Otel" : "Hotels";
    case "cars":
      return locale === "ar" ? "سيارات" : locale === "tr" ? "Araç" : "Cars";
    case "transfers":
      return locale === "ar" ? "ترانسفير" : locale === "tr" ? "Transfer" : "Transfers";
    case "tours":
      return locale === "ar" ? "جولات" : locale === "tr" ? "Tur" : "Tours";
    default: {
      const _exhaustive: never = service;
      return _exhaustive;
    }
  }
}
