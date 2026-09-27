import { AbortError } from "p-retry";
import { SocialHttpError } from "./http";
import { TIKTOK_APP_REQUIRED } from "./platforms/tiktok";
import type { PublishError, PublishErrorCode, SocialPlatform } from "./types";

export function publishError(
  code: PublishErrorCode,
  message: string,
  retryable = false
): PublishError {
  return { code, message, retryable };
}

export function notApprovedError(): PublishError {
  return publishError(
    "not_approved",
    "لن يُنشر شيء قبل موافقة STUDIO (approved=true)."
  );
}

export function mapUnknownError(
  platform: SocialPlatform,
  err: unknown
): PublishError {
  if (err instanceof AbortError && err.originalError) {
    return mapUnknownError(platform, err.originalError);
  }
  if (err instanceof SocialHttpError) {
    if (err.status === 429) {
      return publishError("rate_limited", err.message, true);
    }
    if (err.status === 401 || err.status === 403) {
      return publishError("needs_reauth", err.message);
    }
    if (platform === "tiktok" && /تيك توك|tiktok app/i.test(err.message)) {
      return TIKTOK_APP_REQUIRED;
    }
    return publishError("publish_failed", err.message, err.retryable);
  }
  if (err instanceof Error && err.message.trim()) {
    return publishError("publish_failed", err.message, false);
  }
  return publishError("publish_failed", `فشل النشر على ${platform}`, false);
}
