import { listRecentIyzicoBookings } from "@/lib/server/iyzico-bookings";
import { sendWhatsAppMessage } from "@/lib/automation/channels/whatsapp";
import { saveCommsMessage } from "@/lib/automation/comms-message-store";
import { getCommsSettings } from "@/lib/automation/comms-settings";

export type RecoveryCandidate = {
  bookingId: string;
  customerName: string;
  phone: string;
  itemTitle: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  couponCode: string;
};

export async function findAbandonedBookings(): Promise<RecoveryCandidate[]> {
  try {
    const bookings = await listRecentIyzicoBookings(50);
    const now = Date.now();
    const twentyMinsAgo = now - 20 * 60 * 1000;
    const twoDaysAgo = now - 48 * 60 * 60 * 1000;

    const candidates: RecoveryCandidate[] = [];

    for (const b of bookings) {
      if (b.payment_status === "pending_payment" || b.payment_status === "failed") {
        const createdMs = new Date(b.created || 0).getTime();
        if (createdMs > twoDaysAgo && createdMs < twentyMinsAgo) {
          const name = b.customer_name || "عزيزنا العميل";
          // If customer name has phone or default
          candidates.push({
            bookingId: b.id,
            customerName: name,
            phone: "905015709201",
            itemTitle: b.hotel_name || "حجز فندق",
            totalAmount: Number(b.charged_amount || b.display_amount || 0),
            currency: b.charged_currency || b.display_currency || "USD",
            createdAt: b.created || "",
            couponCode: "SAVE5EXTRA",
          });
        }
      }
    }

    return candidates;
  } catch (err) {
    console.error("[abandoned-recovery] Error finding candidates:", err);
    return [];
  }
}

export async function sendAbandonedCartRecoveryMessage(candidate: RecoveryCandidate): Promise<boolean> {
  const settings = await getCommsSettings();
  const digits = candidate.phone.replace(/\D/g, "");
  if (!digits) return false;

  const msgBody =
    `مرحباً ${candidate.customerName} 🌸\n\n` +
    `لاحظنا أنك بدأت بحجز (${candidate.itemTitle}) على منصة لوناليزا ولم تكمل عملية التأكيد والدفع.\n\n` +
    `🎁 تقديراً لاهتمامك، نهديك كود خصم إضافي: *${candidate.couponCode}*\n` +
    `يمكنك استخدامه فوراً لإتمام حجزك وضمان أفضل سعر!\n\n` +
    `🔗 لإتمام الحجز أو المساعدة المباشرة، تواصل معنا أو زر الموقع:\n` +
    `https://lonaliza.com`;

  try {
    const res = await sendWhatsAppMessage({
      to: digits,
      body: msgBody,
      settings,
      category: "marketing",
      customerName: candidate.customerName,
    });

    saveCommsMessage({
      channel: "whatsapp",
      direction: "outbound",
      category: "marketing",
      track: "b2c",
      from: "system",
      to: digits,
      body: msgBody,
      status: res.ok ? "sent" : "failed",
      customerName: candidate.customerName,
      intent: "abandoned_cart_recovery",
      leadScore: 85,
    });

    return res.ok;
  } catch (err) {
    console.error("[abandoned-recovery] Failed to send recovery message:", err);
    return false;
  }
}
