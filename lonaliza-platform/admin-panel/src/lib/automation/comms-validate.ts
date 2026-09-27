export function looksLikeEmail(value: string): boolean {
  return /@/.test(String(value || "").trim());
}

export function isNumericWhatsAppPhoneId(value: string): boolean {
  return /^\d{10,20}$/.test(String(value || "").trim());
}

export function sanitizeWhatsAppPhoneNumberId(value: string): string {
  const v = String(value || "").trim();
  if (!v || looksLikeEmail(v)) return "";
  return v;
}

export function validateWhatsAppPhoneNumberId(value: string): string | null {
  const v = String(value || "").trim();
  if (!v) return "معرّف رقم الهاتف مطلوب — رقم رقمي من لوحة Meta وليس إيميل.";
  if (looksLikeEmail(v)) {
    return "Phone Number ID يجب أن يكون رقماً (مثال 123456789012345) وليس عنوان بريد.";
  }
  if (!isNumericWhatsAppPhoneId(v)) {
    return "Phone Number ID غير صالح. انسخوا الرقم فقط من WhatsApp → API Setup → Phone number ID.";
  }
  return null;
}

export function validateWhatsAppAccessToken(value: string): string | null {
  const v = String(value || "").trim();
  if (!v) return "رمز الوصول مطلوب.";
  if (v.length < 20) return "رمز الوصول قصير جداً — الصقوا Permanent token من نظام المستخدم.";
  return null;
}

export function validateTelegramBotToken(value: string): string | null {
  const v = String(value || "").trim();
  if (!v) return "رمز البوت مطلوب من BotFather.";
  if (!/^\d{6,12}:[A-Za-z0-9_-]{20,}$/.test(v)) {
    return "صيغة رمز البوت غير صحيحة. الشكل: 123456789:AA… من BotFather.";
  }
  return null;
}

export function redactCommsError(message: string): string {
  return String(message || "")
    .replace(/\d{6,12}:[A-Za-z0-9_-]{10,}/g, "[bot-token]")
    .replace(/(Bearer|token|key|secret|password)\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .replace(/EAA[A-Za-z0-9]+/g, "[access-token]");
}
