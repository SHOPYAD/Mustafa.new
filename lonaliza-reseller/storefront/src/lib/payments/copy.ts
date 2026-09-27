export type PaymentCopy = {
  title: string;
  close: string;
  cardholder: string;
  number: string;
  expiry: string;
  cvc: string;
  saveCard: string;
  pci: string;
  pay: string;
  processing: string;
  threeDs: string;
  sandbox: string;
  savedCards: string;
  useNewCard: string;
  emptyCards: string;
  deleteCard: string;
  awaitingWebhook: string;
  failed: string;
  cardholderRequired: string;
  numberInvalid: string;
  expiryInvalid: string;
  cvcInvalid: string;
};

const AR: PaymentCopy = {
  title: "بطاقة ائتمان / خصم",
  close: "إغلاق",
  cardholder: "اسم حامل البطاقة",
  number: "رقم البطاقة",
  expiry: "الانتهاء",
  cvc: "CVV",
  saveCard: "حفظ البطاقة للاستخدام في الحجوزات القادمة",
  pci: "لا نخزّن رقم البطاقة ولا رمز CVV. الحفظ يتم عبر ترميز بوابة iyzico فقط (PCI-DSS).",
  pay: "الدفع بالبطاقة",
  processing: "جارٍ تجهيز الدفع الآمن…",
  threeDs: "تحقق البنك (3-D Secure). أدخلوا رمز OTP هنا — لا تغادروا الصفحة حتى يكتمل التحقق.",
  sandbox: "وضع التجربة — يظهر داخل نموذج البطاقة فقط",
  savedCards: "بطاقاتي البنكية",
  useNewCard: "بطاقة جديدة",
  emptyCards: "لا توجد بطاقات محفوظة. فعّلوا الحفظ عند الدفع القادم.",
  deleteCard: "حذف",
  awaitingWebhook: "تم إرسال التحقق. نؤكد الدفع بعد إشعار البوابة — الحجز يبقى قيد الدفع حتى التأكيد.",
  failed: "تعذر إتمام الدفع. لم يُسجَّل الحجز كمدفوع.",
  cardholderRequired: "أدخلوا اسم حامل البطاقة.",
  numberInvalid: "رقم البطاقة غير صالح.",
  expiryInvalid: "تاريخ الانتهاء غير صالح.",
  cvcInvalid: "رمز CVV غير صالح.",
};

const EN: PaymentCopy = {
  title: "Credit / debit card",
  close: "Close",
  cardholder: "Cardholder name",
  number: "Card number",
  expiry: "Expiry",
  cvc: "CVV",
  saveCard: "Save this card for upcoming bookings",
  pci: "We do not store PAN or CVV. Saved cards are gateway tokens only (PCI-DSS).",
  pay: "Pay by card",
  processing: "Preparing secure payment…",
  threeDs: "Bank verification (3-D Secure). Enter the OTP here — stay on this page until it finishes.",
  sandbox: "Sandbox — shown only inside the card form",
  savedCards: "My bank cards",
  useNewCard: "New card",
  emptyCards: "No saved cards yet. Enable save-card at checkout.",
  deleteCard: "Delete",
  awaitingWebhook: "Verification sent. The booking stays unpaid until the gateway webhook confirms it.",
  failed: "Payment could not be completed. The booking was not marked paid.",
  cardholderRequired: "Enter the cardholder name.",
  numberInvalid: "Card number is invalid.",
  expiryInvalid: "Expiry date is invalid.",
  cvcInvalid: "CVV is invalid.",
};

const TR: PaymentCopy = {
  title: "Kredi / banka kartı",
  close: "Kapat",
  cardholder: "Kart üzerindeki ad",
  number: "Kart numarası",
  expiry: "SKT",
  cvc: "CVV",
  saveCard: "Kartı sonraki rezervasyonlar için kaydet",
  pci: "PAN veya CVV saklamayız. Kayıt yalnızca iyzico token’ıdır (PCI-DSS).",
  pay: "Kartla öde",
  processing: "Güvenli ödeme hazırlanıyor…",
  threeDs: "Banka doğrulaması (3-D Secure). OTP’yi burada girin — tamamlanana kadar sayfada kalın.",
  sandbox: "Sandbox — yalnızca kart formunda",
  savedCards: "Kartlarım",
  useNewCard: "Yeni kart",
  emptyCards: "Kayıtlı kart yok. Ödeme sırasında kaydı açın.",
  deleteCard: "Sil",
  awaitingWebhook: "Doğrulama gönderildi. Webhook onaylayana kadar rezervasyon ödenmedi kalır.",
  failed: "Ödeme tamamlanamadı. Rezervasyon ödendi işaretlenmedi.",
  cardholderRequired: "Kart sahibinin adını girin.",
  numberInvalid: "Kart numarası geçersiz.",
  expiryInvalid: "Son kullanma tarihi geçersiz.",
  cvcInvalid: "CVV geçersiz.",
};

const FR: PaymentCopy = {
  title: "Carte de crédit / débit",
  close: "Fermer",
  cardholder: "Nom du titulaire",
  number: "Numéro de carte",
  expiry: "Expiration",
  cvc: "CVV",
  saveCard: "Enregistrer la carte pour les prochaines réservations",
  pci: "Nous ne stockons ni PAN ni CVV. Les cartes enregistrées sont des jetons passerelle (PCI-DSS).",
  pay: "Payer par carte",
  processing: "Préparation du paiement sécurisé…",
  threeDs: "Vérification bancaire (3-D Secure). Saisissez l’OTP ici — restez sur cette page.",
  sandbox: "Sandbox — uniquement dans le formulaire carte",
  savedCards: "Mes cartes bancaires",
  useNewCard: "Nouvelle carte",
  emptyCards: "Aucune carte enregistrée. Activez l’enregistrement au paiement.",
  deleteCard: "Supprimer",
  awaitingWebhook: "Vérification envoyée. La réservation reste impayée jusqu’au webhook.",
  failed: "Paiement impossible. La réservation n’a pas été marquée payée.",
  cardholderRequired: "Saisissez le nom du titulaire.",
  numberInvalid: "Numéro de carte invalide.",
  expiryInvalid: "Date d’expiration invalide.",
  cvcInvalid: "CVV invalide.",
};

export function paymentCopy(locale: string): PaymentCopy {
  if (locale === "ar") return AR;
  if (locale === "tr") return TR;
  if (locale === "fr") return FR;
  return EN;
}
