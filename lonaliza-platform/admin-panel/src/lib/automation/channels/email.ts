import { sendMail } from "@/lib/server/email/send";

export async function sendCommsEmail(input: {
  to: string;
  name?: string;
  subject: string;
  text: string;
  locale?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const to = String(input.to || "").trim().toLowerCase();
  if (!to.includes("@")) return { ok: false, error: "invalid_email" };
  const html = `<p style="font-family:sans-serif;line-height:1.6;white-space:pre-wrap">${escapeHtml(input.text)}</p>`;
  const result = await sendMail({
    to,
    toName: input.name,
    subject: input.subject,
    html,
    text: input.text,
    listUnsubscribe: true,
    locale: input.locale,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

function escapeHtml(value: string): string {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
