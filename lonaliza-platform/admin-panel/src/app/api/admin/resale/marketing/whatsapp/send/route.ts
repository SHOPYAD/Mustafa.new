import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sendMultiQrWhatsAppMessage } from "@/lib/server/whatsapp-qr/multi-service";
import { sendWhatsAppMessage } from "@/lib/automation/channels/whatsapp";
import { getCommsSettings } from "@/lib/automation/comms-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LEADS_FILE = "/www/wwwroot/lonaliza.com/lonaliza-platform/database/data/reseller-leads/leads.json";
const ALT_LEADS_FILE = path.join(process.cwd(), ".data/reseller-leads/leads.json");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, phone, message, slotId } = body;

    if (!phone) {
      return NextResponse.json({ ok: false, error: "رقم الواتساب غير محدد" }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ ok: false, error: "محتوى الرسالة مطلوب" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const settings = await getCommsSettings();
    let sendOk = false;
    let errorMsg: string | undefined;

    // Send through internal WhatsApp Gateway
    try {
      if (settings.whatsappMode === "qr" || !settings.whatsappPhoneNumberId) {
        const qrRes = await sendMultiQrWhatsAppMessage({
          slotId: slotId ? Number(slotId) : undefined,
          to: cleanPhone,
          body: message,
          category: "marketing",
        });
        sendOk = qrRes.ok;
        errorMsg = qrRes.error;
      } else {
        const waRes = await sendWhatsAppMessage({
          to: cleanPhone,
          body: message,
          settings,
          category: "marketing",
        });
        sendOk = waRes.ok;
        errorMsg = waRes.error;
      }
    } catch (sendErr) {
      console.error("[resale/marketing/whatsapp/send] internal gateway error:", sendErr);
      errorMsg = sendErr instanceof Error ? sendErr.message : "خطأ أثناء الإرسال من البوابة الداخلية";
    }

    // Update lead outreach status in both files
    for (const filePath of [LEADS_FILE, ALT_LEADS_FILE]) {
      if (companyId && fs.existsSync(filePath)) {
        try {
          const leads = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          const idx = leads.findIndex((l: { id: string }) => l.id === companyId);
          if (idx >= 0) {
            leads[idx].outreachStatus = "contacted_whatsapp";
            leads[idx].lastContactedAt = new Date().toISOString();
            leads[idx].contactChannel = "whatsapp";
            fs.writeFileSync(filePath, JSON.stringify(leads, null, 2), "utf-8");
          }
        } catch (e) {
          console.error("Failed to update lead status in", filePath, e);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      sentViaGateway: sendOk,
      warning: !sendOk ? (errorMsg || "تم حفظ الرسالة في سجل المحادثات الداخلية، يرجى التأكد من ربط رقم واتساب في قسم الأتمتة") : undefined,
      message: sendOk
        ? "تم إرسال الرسالة بنجاح عبر بوابة واتساب الداخلية!"
        : "تم تسجيل وتجهيز الرسالة في صندوق المحادثات الداخلية بنجاح",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error sending whatsapp";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
