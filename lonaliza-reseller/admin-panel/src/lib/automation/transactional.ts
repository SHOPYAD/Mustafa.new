import { sendTelegramMessage } from "@/lib/automation/channels/telegram";
import { sendWhatsAppMessage } from "@/lib/automation/channels/whatsapp";
import { getCommsSettings } from "@/lib/automation/comms-settings";
import { formatOfferText, getOfferForUser } from "@/lib/automation/offers";
import { humanPaymentStatusLabel } from "@/lib/server/email/booking-message";
import { paymentEmailGate } from "@/lib/server/email/payment-gate";

export async function notifyBookingChannels(input: {
  bookingId: string;
  name: string;
  email?: string;
  phone?: string;
  telegramChatId?: string;
  status: string;
  service: string;
  userId?: string;
  /** Email is handled by notify.ts templates. WhatsApp/Telegram only unless explicitly requested. */
  sendEmail?: boolean;
  resumeUrl?: string;
}): Promise<void> {
  const locale = "ar";
  const offer = await getOfferForUser(input.userId, locale);
  const gate = paymentEmailGate({ status: input.status, payment_status: input.status });
  const statusLabel = humanPaymentStatusLabel(input.status, locale);
  const heading =
    gate === "paid"
      ? `تم تأكيد الدفع ${input.bookingId}`
      : gate === "failed"
        ? `فشل الدفع ${input.bookingId}`
        : `بانتظار إكمال الدفع ${input.bookingId}`;
  const body = [
    heading,
    input.service,
    `الحالة: ${statusLabel}`,
    input.name ? `الاسم: ${input.name}` : "",
    input.resumeUrl && gate !== "paid" ? `أكمل الحجز: ${input.resumeUrl}` : "",
    offer.pointsEnabled && offer.pointsBalance
      ? `رصيد النقاط: ${offer.pointsBalance}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (input.phone) {
    await sendWhatsAppMessage({
      to: input.phone,
      body,
      kind: "transactional",
      templateParams: [input.bookingId, statusLabel, input.service],
    }).catch(() => undefined);
  }
  if (input.telegramChatId) {
    await sendTelegramMessage({ chatId: input.telegramChatId, text: body }).catch(() => undefined);
  }
  if (input.sendEmail && input.email) {
    const { sendCommsEmail } = await import("@/lib/automation/channels/email");
    await sendCommsEmail({
      to: input.email,
      name: input.name,
      subject: heading,
      text: body,
      locale,
    }).catch(() => undefined);
  }
}

export async function notifyOfferToContact(input: {
  name?: string;
  email?: string;
  phone?: string;
  telegramChatId?: string;
  userId?: string;
  locale?: string;
}): Promise<{ sent: number }> {
  const settings = await getCommsSettings();
  const locale = input.locale || "ar";
  const offer = await getOfferForUser(input.userId, locale);
  const text = formatOfferText(offer, locale);
  if (!text) return { sent: 0 };
  let sent = 0;
  if (input.phone && settings.whatsappPhoneNumberId) {
    const result = await sendWhatsAppMessage({
      to: input.phone,
      body: text,
      kind: "transactional",
      templateParams: [offer.couponCode || "OFFER", offer.discountLabel || "", String(offer.pointsBalance)],
    });
    if (result.ok) sent += 1;
  }
  if (input.telegramChatId && settings.telegramBotToken) {
    const result = await sendTelegramMessage({ chatId: input.telegramChatId, text });
    if (result.ok) sent += 1;
  }
  if (input.email) {
    const { sendCommsEmail } = await import("@/lib/automation/channels/email");
    const result = await sendCommsEmail({
      to: input.email,
      name: input.name,
      subject: locale === "en" ? "Your Alrayyan offer" : "عرض من لوناليزا",
      text,
      locale,
    });
    if (result.ok) sent += 1;
  }
  return { sent };
}
