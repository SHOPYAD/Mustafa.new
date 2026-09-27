import { describe, expect, it } from "vitest";
import {
  composerFileTooLarge,
  composerUploadErrorMessage,
  isComposerImageFile,
  isComposerVideoFile,
} from "./composer-media";

describe("composer media helpers", () => {
  it("classifies images and reels from mime or extension", () => {
    expect(isComposerImageFile({ type: "image/jpeg", name: "a.jpg" })).toBe(true);
    expect(isComposerVideoFile({ type: "video/mp4", name: "reel.mp4" })).toBe(true);
    expect(isComposerVideoFile({ type: "", name: "trip.mov" })).toBe(true);
    expect(isComposerImageFile({ type: "", name: "photo.heic" })).toBe(true);
  });

  it("rejects oversized media with a visible Arabic error", () => {
    expect(
      composerFileTooLarge({ type: "image/jpeg", name: "huge.jpg", size: 26 * 1024 * 1024 }),
    ).toMatch(/ميجابايت/);
    expect(
      composerFileTooLarge({ type: "video/mp4", name: "reel.mp4", size: 10 * 1024 * 1024 }),
    ).toBeNull();
  });

  it("does not hide HTTP / timeout upload failures behind a fake offline message", () => {
    const http = composerUploadErrorMessage(
      new Error("فشل رفع الوسائط HTTP 413 Content Too Large على blossom.primal.net: File too large"),
    );
    expect(http).toMatch(/413/);
    expect(http).not.toMatch(/تحقق من الاتصال/);
    const timedOut = composerUploadErrorMessage(
      new Error("انتهت مهلة رفع الوسائط (120ث) على blossom.primal.net أثناء انتظار رد الخادم بعد اكتمال الإرسال — الملف قد يغادر الجهاز لكن الخادم لم يؤكد الحفظ."),
    );
    expect(timedOut).toMatch(/مهلة/);
    expect(timedOut).not.toMatch(/تحقق من الاتصال/);
  });
});
