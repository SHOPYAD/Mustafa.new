import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getEmailBrand, htmlToPlainText } from "@/lib/server/email/brand";
import { sendMail, verifySmtpConnection } from "@/lib/server/email/send";
import { getAdminTestEmail } from "@/lib/server/email/smtp";
import { buildMailCheckHtml } from "@/lib/server/email/templates";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json().catch(() => ({}))) as {
      send?: boolean;
      to?: string;
    };
    const verified = await verifySmtpConnection();
    if (!verified.ok) {
      return NextResponse.json({ ok: false, error: verified.error }, { status: 400 });
    }
    if (!body.send) {
      return NextResponse.json({ ok: true, verified: true });
    }
    const to = String(body.to || (await getAdminTestEmail()) || "").trim();
    if (!to) {
      return NextResponse.json(
        { ok: false, error: "حدّد إيميل الأدمن للرسالة التجريبية" },
        { status: 400 }
      );
    }
    const brand = await getEmailBrand();
    const html = await buildMailCheckHtml(brand, "ar");
    const sent = await sendMail({
      to,
      toName: "Admin",
      subject: `تحقق من إعداد البريد — ${brand.brandNameAr}`,
      html,
      text: htmlToPlainText(html),
      listUnsubscribe: false,
      trackDelivery: true,
      locale: "ar",
    });
    if (!sent.ok) {
      return NextResponse.json({ ok: false, error: sent.error }, { status: 400 });
    }
    return NextResponse.json({
      ok: true,
      verified: true,
      sent: false,
      localAccepted: true,
      to,
      delivery: sent.delivery,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "فشل الاختبار" },
      { status: 500 }
    );
  }
}
