import { describe, expect, it } from "vitest";
import { logoAttachmentForHtml } from "./logo-policy";
import type { EmailLogoAttachment } from "./logo";

const logo: EmailLogoAttachment = {
  filename: "logo.png",
  content: Buffer.from("png"),
  contentType: "image/png",
  cid: "brand-logo@lonaliza.com",
  contentDisposition: "inline",
};

describe("email logo attachment policy", () => {
  it("does not attach logo.png when HTML has no CID reference", () => {
    const html = "<p>تأكيد حالة الحجز\nالحالة: pending_payment</p>";
    expect(logoAttachmentForHtml(html, logo)).toEqual([]);
  });

  it("attaches the mark inline only when the header uses cid:", () => {
    const html = '<img src="cid:brand-logo@lonaliza.com" alt="Lonaliza" />';
    const parts = logoAttachmentForHtml(html, logo);
    expect(parts).toHaveLength(1);
    expect(parts[0].filename).toBe("brand-logo");
    expect(parts[0].contentDisposition).toBe("inline");
    expect(parts[0].filename).not.toBe("logo.png");
  });
});
