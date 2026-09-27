export {
  runEmailCampaign,
  runTelegramCampaign,
  runWhatsAppCampaign,
  sendOtp,
  sendOtpIfEnabled,
  verifyOtp,
} from "@/lib/automation/handlers/comms";
export type {
  AutomationCtx,
  AutomationJob,
  AutomationJobContext,
  AutomationJobResult,
  CampaignResult,
  SendOtpInput,
  SendOtpResult,
  VerifyOtpInput,
  VerifyOtpResult,
} from "@/lib/automation/types";
