import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";
import { isMarketingSmtpConnected, sendMarketingEmail } from "@/lib/server/email/marketing-smtp";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CAMPAIGNS_FILE = "/www/wwwroot/lonaliza.com/lonaliza-platform/database/data/reseller-leads/campaigns.json";
const LEADS_FILE = "/www/wwwroot/lonaliza.com/lonaliza-platform/database/data/reseller-leads/leads.json";

function interpolate(template: string, vars: Record<string, string>): string {
  let res = template;
  for (const [k, v] of Object.entries(vars)) {
    res = res.replaceAll(`{${k}}`, v || "");
  }
  return res;
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const { title, templateBody, templateSubject, targetLeads, delaySeconds = 2 } = body;

    if (!Array.isArray(targetLeads) || targetLeads.length === 0) {
      return NextResponse.json({ ok: false, error: "يجب تحديد الشركات المستهدفة بالحملة" }, { status: 400 });
    }

    const campaignId = `camp_email_${Date.now()}`;
    const leadsWithEmail = targetLeads.filter((l: { email?: string }) => l.email && l.email.includes("@"));

    if (leadsWithEmail.length === 0) {
      return NextResponse.json({
        ok: false,
        error: "الشركات المحددة لا تحتوي على عناوين بريد إلكتروني صالحة",
      }, { status: 400 });
    }

    if (!(await isMarketingSmtpConnected())) {
      return NextResponse.json({ ok: false, error: "SMTP disconnected" }, { status: 503 });
    }

    // Record initial campaign
    const campaignRecord = {
      id: campaignId,
      title: title || `حملة بريد: ${new Date().toLocaleDateString("ar-SA")}`,
      channel: "email",
      status: "in_progress",
      totalRecipients: leadsWithEmail.length,
      sentCount: 0,
      failedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveCampaign(campaignRecord);

    // Run dispatch asynchronously in background
    (async () => {
      let sent = 0;
      let failed = 0;

      for (const lead of leadsWithEmail) {
        try {
          const emailBody = interpolate(templateBody, {
            company_name: lead.title || "شريكنا العزيز",
            city: lead.city || "إسطنبول",
            category: lead.category || "السياحة والسفر",
            phone: lead.phone || "",
            website: lead.website || "",
            demo_url: "https://lonaliza.com/demo",
          });

          const emailSubject = interpolate(templateSubject || "فرصة شراكة B2B مميزة مع منصة لوناليزا", {
            company_name: lead.title || "شريكنا العزيز",
            city: lead.city || "إسطنبول",
            demo_url: "https://lonaliza.com/demo",
          });

          const cleanParagraphs = emailBody
            .split("\n\n")
            .map((p: string) => `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.8; color: #334155;">${p.replace(/\n/g, "<br/>")}</p>`)
            .join("");

          const luxuryHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; direction: rtl; text-align: right;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 30px 10px;">
    <tr><td align="center">
      <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <tr>
          <td style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #312e81 100%); padding: 36px 32px; text-align: center;">
            <div style="display: inline-block; background-color: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 16px; padding: 10px 20px; margin-bottom: 14px;">
              <span style="color: #ffffff; font-size: 18px; font-weight: 900; letter-spacing: 1px;">LONALIZA B2B</span>
            </div>
            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; line-height: 1.4;">
              شراكة الحلول السياحية الرقمية المتكاملة
            </h1>
            <p style="margin: 8px 0 0; color: #cbd5e1; font-size: 13px;">
              عرض استراتيجي مخصص لإدارة ${lead.title} • ${lead.city}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 32px 20px;">
            ${cleanParagraphs}
            <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0 20px;">
              <tr>
                <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; vertical-align: top;">
                  <div style="font-size: 20px; margin-bottom: 6px;">🏨</div>
                  <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px;">500,000+ فندق</div>
                  <div style="font-size: 12px; color: #64748b; line-height: 1.5;">تأكيد فوري وأسعار جملة منافسة بدون وسيط.</div>
                </td>
                <td width="4%"></td>
                <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; vertical-align: top;">
                  <div style="font-size: 20px; margin-bottom: 6px;">✈️</div>
                  <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px;">طيران عالمي GDS</div>
                  <div style="font-size: 12px; color: #64748b; line-height: 1.5;">إصدار مباشر لكافة شركات الطيران العالمية.</div>
                </td>
              </tr>
              <tr><td colspan="3" height="12"></td></tr>
              <tr>
                <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; vertical-align: top;">
                  <div style="font-size: 20px; margin-bottom: 6px;">💳</div>
                  <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px;">بوابات دفع جاهزة</div>
                  <div style="font-size: 12px; color: #64748b; line-height: 1.5;">فيزا، ماستركارد، مدى، مع تسويات مالية سريعة.</div>
                </td>
                <td width="4%"></td>
                <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; vertical-align: top;">
                  <div style="font-size: 20px; margin-bottom: 6px;">🤖</div>
                  <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px;">وكيل واتساب ذكي</div>
                  <div style="font-size: 12px; color: #64748b; line-height: 1.5;">خدمة عملاء 24/7 بلهجات متعددة واقفال الحجوزات.</div>
                </td>
              </tr>
            </table>
            <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0 24px;">
              <tr>
                <td align="center">
                  <a href="https://lonaliza.com/demo" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);">
                    استكشف النسخة التجريبية الحية (Live Demo) ↗
                  </a>
                  <div style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
                    الرابط الرسمي: https://lonaliza.com/demo
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f1f5f9; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="margin: 0 0 6px; font-size: 12px; font-weight: bold; color: #475569;">
              منصة لوناليزا للسياحة والتقنية الفندقية (Lonaliza Travel Platform)
            </p>
            <p style="margin: 0; font-size: 11px; color: #94a3b8;">
              تم إرسال هذا العرض الرسمي لشركة ${lead.title} المعتمدة في ${lead.city}، ${lead.country}.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

          const res = await sendMarketingEmail({
            to: lead.email,
            toName: lead.title,
            subject: emailSubject,
            html: luxuryHtml,
            companyId: lead.id,
            campaignId,
          });

          if (res.ok) sent++;
          else failed++;

          // Anti-spam jitter delay
          await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
        } catch {
          failed++;
        }
      }

      // Update final campaign status
      saveCampaign({
        id: campaignId,
        status: "completed",
        sentCount: sent,
        failedCount: failed,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    })();

    return NextResponse.json({
      ok: true,
      campaignId,
      message: `تم إطلاق الحملة البريدية بنجاح لـ ${leadsWithEmail.length} شركة سياحية!`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error launching campaign";
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}

function saveCampaign(patch: { id: string; [key: string]: unknown }) {
  try {
    const dir = path.dirname(CAMPAIGNS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let camps: Array<{ id: string; [key: string]: unknown }> = [];
    if (fs.existsSync(CAMPAIGNS_FILE)) {
      try {
        camps = JSON.parse(fs.readFileSync(CAMPAIGNS_FILE, "utf-8"));
      } catch {}
    }

    const idx = camps.findIndex((c) => c.id === patch.id);
    if (idx >= 0) {
      camps[idx] = { ...camps[idx], ...patch };
    } else {
      camps.unshift(patch);
    }

    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(camps, null, 2), "utf-8");
  } catch (e) {
    console.error("Save campaign error:", e);
  }
}
