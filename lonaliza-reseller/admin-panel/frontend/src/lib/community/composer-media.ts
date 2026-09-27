export const COMPOSER_PHOTO_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/*";

export const COMPOSER_VIDEO_ACCEPT =
  "video/mp4,video/quicktime,video/webm,video/x-m4v,video/*";

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|heic|heif)$/i;
const VIDEO_EXT = /\.(mp4|mov|webm|m4v|mkv|avi)$/i;

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_BYTES = 180 * 1024 * 1024;

export function isComposerVideoFile(file: { type?: string; name?: string }): boolean {
  const type = file.type || "";
  if (type.startsWith("video/")) return true;
  if (type.startsWith("image/")) return false;
  return VIDEO_EXT.test(file.name || "");
}

export function isComposerImageFile(file: { type?: string; name?: string }): boolean {
  const type = file.type || "";
  if (type.startsWith("image/")) return true;
  if (type.startsWith("video/")) return false;
  return IMAGE_EXT.test(file.name || "");
}

export function composerFileTooLarge(file: {
  type?: string;
  name?: string;
  size: number;
}): string | null {
  const video = isComposerVideoFile(file);
  const max = video ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size <= max) return null;
  return video
    ? "حجم فيديو الريلز أكبر من 180 ميجابايت. اختر فيديو أقصر."
    : "حجم الصورة أكبر من 25 ميجابايت. اختر صورة أصغر.";
}

export function composerUploadErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err || "");
  if (!raw.trim()) return "فشل رفع وسائط التجربة السياحية";
  // Already-formatted blossom / NIP-96 / timeout / CORS strings must stay visible.
  if (
    /HTTP\s+\d+|انتهت مهلة|CORS|WebView|Blossom|NIP-96|NIP-94|nip94|تحقق من صلاحيات/i.test(
      raw,
    )
  ) {
    return raw;
  }
  if (/permission|denied/i.test(raw) && !/HTTP\s+\d+/.test(raw)) {
    return "تعذر رفع الوسائط. تحقق من صلاحيات الحساب وحاول مرة أخرى.";
  }
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "فشل رفع الوسائط بسبب الشبكة. تحقق من الاتصال وحاول مرة أخرى.";
  }
  return raw;
}
