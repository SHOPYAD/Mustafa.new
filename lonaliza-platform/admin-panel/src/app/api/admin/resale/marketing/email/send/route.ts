import { NextResponse } from "next/server";
import { sendMarketingEmail } from "@/lib/server/email/marketing-smtp";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LEADS_FILE = "/www/wwwroot/lonaliza.com/lonaliza-platform/database/data/reseller-leads/leads.json";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, toName, subject, html, text, companyId } = body;

    if (!to || !to.includes("@")) {
      return NextResponse.json({ ok: false, error: "عنوان البريد الإلكتروني للمستلم غير صالح" }, { status: 400 });
    }
    if (!subject || !html) {
      return NextResponse.json({ ok: false, error: "عنوان الرسالة والمحتوى مطلوبان" }, { status: 400 });
    }

    const result = await sendMarketingEmail({
      to,
      toName,
      subject,
      html,
      text,
      companyId,
    });

    if (result.ok && companyId) {
      // Mark lead as contacted in database
      try {
        if (fs.existsSync(LEADS_FILE)) {
          const leads = JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
          const idx = leads.findIndex((l: { id: string }) => l.id === companyId);
          if (idx >= 0) {
            leads[idx].outreachStatus = "contacted";
            leads[idx].lastContactedAt = new Date().toISOString();
            leads[idx].contactChannel = "email";
            fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
          }
        }
      } catch (e) {
        console.error("Failed to update lead status:", e);
      }
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "خطأ أثناء إرسال البريد";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
