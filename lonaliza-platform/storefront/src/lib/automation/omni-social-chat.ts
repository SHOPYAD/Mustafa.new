import { processIncomingMessageAndReply } from "./ai-sales-agent";
import { saveCommsMessage, type MessageChannel } from "./comms-message-store";

export interface OmniSocialInboundMessage {
  platform: "facebook" | "instagram" | "tiktok" | "x";
  senderId: string;
  senderName?: string;
  messageText: string;
  adId?: string;
  campaignId?: string;
  metadata?: Record<string, unknown>;
}

export interface OmniSocialReplyResult {
  ok: boolean;
  replyText?: string;
  leadScore?: number;
  intent?: string;
  error?: string;
}

/**
 * Handles incoming direct messages from connected Social Platforms
 * (Facebook Messenger, Instagram Direct, TikTok DMs, X DMs)
 */
export async function handleOmniSocialInbound(
  msg: OmniSocialInboundMessage
): Promise<OmniSocialReplyResult> {
  try {
    const channel: MessageChannel = "whatsapp"; // mapped to unified comms channel or metadata
    const result = await processIncomingMessageAndReply({
      from: msg.senderId,
      body: msg.messageText,
      channel,
      customerName: msg.senderName,
      metadata: {
        platform: msg.platform,
        socialSenderId: msg.senderId,
        adId: msg.adId,
        campaignId: msg.campaignId,
        ...msg.metadata,
      },
    });

    if (!result || !result.replyText) {
      return { ok: false, error: "No AI reply generated" };
    }

    return {
      ok: true,
      replyText: result.replyText,
      leadScore: result.leadScore,
      intent: result.intent,
    };
  } catch (err) {
    console.error(`[OmniSocialChat:${msg.platform}] Error processing message:`, err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
