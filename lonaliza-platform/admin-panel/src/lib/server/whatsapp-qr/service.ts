export {
  getAllWhatsAppSlotsStatus,
  getWhatsAppSlotStatus,
  startWhatsAppSlotSession,
  logoutWhatsAppSlotSession,
  updateWhatsAppSlotConfig,
  sendMultiQrWhatsAppMessage,
  type WhatsAppSlotConfig,
  type WhatsAppSlotStatus,
} from "./multi-service";

import {
  getWhatsAppSlotStatus,
  startWhatsAppSlotSession,
  logoutWhatsAppSlotSession,
  sendMultiQrWhatsAppMessage,
  type WhatsAppSlotStatus,
} from "./multi-service";

export type WhatsAppQrStatus = WhatsAppSlotStatus;

export async function getWhatsAppQrStatus(): Promise<WhatsAppQrStatus> {
  return getWhatsAppSlotStatus(1);
}

export async function startWhatsAppQrSession(): Promise<WhatsAppQrStatus> {
  return startWhatsAppSlotSession(1);
}

export async function logoutWhatsAppQrSession(): Promise<WhatsAppQrStatus> {
  return logoutWhatsAppSlotSession(1);
}

export async function sendQrWhatsAppMessage(input: {
  to: string;
  body: string;
}): Promise<{ ok: boolean; error?: string; providerId?: string }> {
  return sendMultiQrWhatsAppMessage({ slotId: 1, to: input.to, body: input.body });
}

