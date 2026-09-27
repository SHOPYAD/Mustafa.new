import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getCommsConversations,
  loadCommsMessages,
  saveCommsMessage,
  type MessageChannel,
  type MessageCategory,
} from "@/lib/automation/comms-message-store";
import { sendMultiQrWhatsAppMessage } from "@/lib/server/whatsapp-qr/multi-service";
import { sendWhatsAppMessage } from "@/lib/automation/channels/whatsapp";
import { getCommsSettings } from "@/lib/automation/comms-settings";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await assertAdminApi(request);
  if (denied) return denied;

  try {
    const url = new URL(request.url);
    const contact = url.searchParams.get("contact");
    const channel = (url.searchParams.get("channel") as MessageChannel) || "whatsapp";
    const slotIdStr = url.searchParams.get("slotId");
    const slotId = slotIdStr && slotIdStr !== "all" ? Number(slotIdStr) : undefined;

    const allMessages = loadCommsMessages();
    let conversations = getCommsConversations();

    if (slotId) {
      conversations = conversations.filter((c) => {
        const lastSlot = c.lastMessage.metadata?.slotId;
        return Number(lastSlot) === slotId;
      });
    }

    let filteredMessages = allMessages;
    if (slotId) {
      filteredMessages = filteredMessages.filter((m) => Number(m.metadata?.slotId) === slotId);
    }
    if (contact) {
      filteredMessages = filteredMessages.filter(
        (m) => m.channel === channel && (m.from === contact || m.to === contact)
      );
    }

    return NextResponse.json({
      ok: true,
      conversations,
      messages: filteredMessages.slice(0, 100),
      totalCount: allMessages.length,
    });
  } catch (err) {
    console.error("[api/admin/automation/messages] GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await assertAdminApi(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as {
      to: string;
      body: string;
      slotId?: number;
      channel?: MessageChannel;
      category?: MessageCategory;
      customerName?: string;
    };

    if (!body.to || !body.body) {
      return NextResponse.json({ ok: false, error: "Missing 'to' or 'body'" }, { status: 400 });
    }

    const channel = body.channel || "whatsapp";
    const category = (body.category as "otp" | "booking" | "marketing" | "manual" | "ai_sales") || "manual";
    const slotId = body.slotId ? Number(body.slotId) : undefined;
    const settings = await getCommsSettings();

    let sendOk = false;
    let errorMsg: string | undefined;

    if (channel === "whatsapp") {
      if (settings.whatsappMode === "qr" || !settings.whatsappPhoneNumberId) {
        const qrRes = await sendMultiQrWhatsAppMessage({
          slotId,
          to: body.to,
          body: body.body,
          category,
          customerName: body.customerName,
        });
        sendOk = qrRes.ok;
        errorMsg = qrRes.error;
      } else {
        const waRes = await sendWhatsAppMessage({
          to: body.to,
          body: body.body,
          settings,
          category,
          customerName: body.customerName,
        });
        sendOk = waRes.ok;
        errorMsg = waRes.error;
      }
    }

    return NextResponse.json({
      ok: sendOk,
      error: errorMsg,
    });
  } catch (err) {
    console.error("[api/admin/automation/messages] POST error:", err);
    return NextResponse.json({ ok: false, error: "Failed to send message" }, { status: 500 });
  }
}

