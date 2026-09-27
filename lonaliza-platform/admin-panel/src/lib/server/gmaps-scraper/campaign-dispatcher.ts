import type { B2BCampaign } from "./types";
import {
  getAllLeads,
  updateLeadOutreachStatus,
  saveCampaign,
  getAllTemplates,
} from "./reseller-leads-store";
import { sendWhatsAppMessage } from "@/lib/automation/channels/whatsapp";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function interpolateTemplate(
  text: string,
  variables: {
    company_name?: string;
    city?: string;
    country?: string;
    demo_url?: string;
    contact_name?: string;
  }
): string {
  let result = text;
  result = result.replace(/\{company_name\}/gi, variables.company_name || "شركتكم الموقرة");
  result = result.replace(/\{city\}/gi, variables.city || "مدينتكم");
  result = result.replace(/\{country\}/gi, variables.country || "وجهتكم");
  result = result.replace(/\{demo_url\}/gi, variables.demo_url || "https://lonaliza.com/demo");
  result = result.replace(/\{contact_name\}/gi, variables.contact_name || "عزيزنا الشريك");
  return result;
}

export async function executeCampaign(campaign: B2BCampaign): Promise<void> {
  const templates = getAllTemplates();
  const template = templates.find((t) => t.id === campaign.templateId);
  if (!template) {
    campaign.status = "failed";
    saveCampaign(campaign);
    return;
  }

  const allLeads = getAllLeads();
  const targetLeads = allLeads.filter((l) => campaign.targetLeadIds.includes(l.id));

  campaign.status = "sending";
  campaign.totalRecipients = targetLeads.length;
  campaign.sentCount = 0;
  campaign.failedCount = 0;
  campaign.logs = [];
  saveCampaign(campaign);

  const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL || "https://lonaliza.com/demo";

  for (let i = 0; i < targetLeads.length; i++) {
    const lead = targetLeads[i];

    if (campaign.channel === "whatsapp") {
      const phone = lead.whatsappPhone || lead.phone.replace(/\D/g, "");
      if (!phone || phone.length < 9) {
        campaign.failedCount++;
        campaign.logs.push({
          leadId: lead.id,
          target: phone || "no_phone",
          status: "failed",
          timestamp: new Date().toISOString(),
          error: "رقم هاتف غير صالح أو غير مكتمل",
        });
        saveCampaign(campaign);
        continue;
      }

      const personalizedBody = interpolateTemplate(template.body, {
        company_name: lead.title,
        city: lead.city,
        country: lead.country,
        demo_url: demoUrl,
      });

      try {
        const sendRes = await sendWhatsAppMessage({
          to: phone,
          body: personalizedBody,
          kind: "marketing",
          category: "marketing",
          customerName: lead.title,
        });

        if (sendRes.ok) {
          campaign.sentCount++;
          updateLeadOutreachStatus(lead.id, "contacted_whatsapp", `أُرسلت رسالة واتساب: ${template.title}`);
          campaign.logs.push({
            leadId: lead.id,
            target: phone,
            status: "sent",
            timestamp: new Date().toISOString(),
          });
        } else {
          campaign.failedCount++;
          campaign.logs.push({
            leadId: lead.id,
            target: phone,
            status: "failed",
            timestamp: new Date().toISOString(),
            error: sendRes.error || "فشل الإرسال عبر خادم الواتساب",
          });
        }
      } catch (err) {
        campaign.failedCount++;
        campaign.logs.push({
          leadId: lead.id,
          target: phone,
          status: "failed",
          timestamp: new Date().toISOString(),
          error: err instanceof Error ? err.message : "خطأ غير معروف",
        });
      }

      // Safe Jitter Delay between messages (Anti-Ban Protection)
      if (i < targetLeads.length - 1) {
        const minSec = campaign.jitterMinSeconds || 25;
        const maxSec = campaign.jitterMaxSeconds || 50;
        const delaySeconds = getRandomInt(minSec, maxSec);
        console.log(`[campaign-dispatcher] WhatsApp anti-ban delay: waiting ${delaySeconds}s before next lead...`);
        await sleep(delaySeconds * 1000);
      }
    } else if (campaign.channel === "email") {
      const email = lead.email;
      if (!email || !email.includes("@")) {
        campaign.failedCount++;
        campaign.logs.push({
          leadId: lead.id,
          target: email || "no_email",
          status: "failed",
          timestamp: new Date().toISOString(),
          error: "بريد إلكتروني غير متوفر",
        });
        saveCampaign(campaign);
        continue;
      }

      const personalizedSubject = interpolateTemplate(template.subject || template.title, {
        company_name: lead.title,
        city: lead.city,
      });

      const personalizedHtml = template.htmlBody
        ? interpolateTemplate(template.htmlBody, {
            company_name: lead.title,
            city: lead.city,
            country: lead.country,
            demo_url: demoUrl,
          })
        : undefined;

      const personalizedText = interpolateTemplate(template.body, {
        company_name: lead.title,
        city: lead.city,
        country: lead.country,
        demo_url: demoUrl,
      });

      try {
        const { sendMail } = await import("@/lib/automation/channels/email");
        const mailRes = await sendMail({
          to: email,
          subject: personalizedSubject,
          text: personalizedText,
          html: personalizedHtml,
        });

        if (mailRes.ok) {
          campaign.sentCount++;
          updateLeadOutreachStatus(lead.id, "contacted_email", `أُرسل إيميل تسويقي: ${template.title}`);
          campaign.logs.push({
            leadId: lead.id,
            target: email,
            status: "sent",
            timestamp: new Date().toISOString(),
          });
        } else {
          campaign.failedCount++;
          campaign.logs.push({
            leadId: lead.id,
            target: email,
            status: "failed",
            timestamp: new Date().toISOString(),
            error: mailRes.error || "فشل إرسال الإيميل",
          });
        }
      } catch (err) {
        campaign.failedCount++;
        campaign.logs.push({
          leadId: lead.id,
          target: email,
          status: "failed",
          timestamp: new Date().toISOString(),
          error: err instanceof Error ? err.message : "خطأ بالإيميل",
        });
      }

      // Respectful delay between cold emails (10-20 seconds)
      if (i < targetLeads.length - 1) {
        await sleep(getRandomInt(10, 20) * 1000);
      }
    }

    saveCampaign(campaign);
  }

  campaign.status = "completed";
  campaign.completedAt = new Date().toISOString();
  campaign.updatedAt = new Date().toISOString();
  saveCampaign(campaign);
}
