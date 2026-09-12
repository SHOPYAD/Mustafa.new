import { sendCommsEmail } from "@/lib/automation/channels/email";
import { sendTelegramMessage } from "@/lib/automation/channels/telegram";
import { sendWhatsAppMessage } from "@/lib/automation/channels/whatsapp";
import { getCommsSettings } from "@/lib/automation/comms-settings";
import { formatOfferText, getOfferForUser } from "@/lib/automation/offers";

export async function notifyBookingChannels(input: {
  bookingId: string;
  name: string;
  email?: string;
  phone?: string;
  telegramChatId?: string;
  status: string;
  service: string;
  userId?: string;
}): Promise<void> {
  const locale = "ar";
  const offer = await getOfferForUser(input.userId, locale);
  const body = [
    `تأكيد حالة الحجز ${input.bookingId}`,
    input.service,
    `الحالة: ${input.status}`,
    input.name ? `الاسم: ${input.name}` : "",
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
      templateParams: [input.bookingId, input.status, input.service],
    }).catch(() => undefined);
  }
  if (input.telegramChatId) {
    await sendTelegramMessage({ chatId: input.telegramChatId, text: body }).catch(() => undefined);
  }
  if (input.email) {
    await sendCommsEmail({
      to: input.email,
      name: input.name,
      subject: `حالة الحجز ${input.bookingId}`,
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
