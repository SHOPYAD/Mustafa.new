import { promises as dns } from "fs";
import { resolve4 } from "dns/promises";
import { NextResponse } from "next/server";
import { getAuthenticatedPartnerCompany } from "@/lib/server/partner-session";
import {
  getCompanyLicense,
  getCompanyServer,
  getResellerSettings,
} from "@/lib/server/resale-store";
import { createAdminPocketBase } from "@/lib/pocketbase/admin";

export const runtime = "nodejs";

function cleanDomainName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
}

export async function POST(req: Request) {
  try {
    const company = await getAuthenticatedPartnerCompany();
    if (!company) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      action?: "save" | "test";
      domain: string;
    };

    const domain = cleanDomainName(body.domain || "");
    if (!domain || domain.length < 4 || !domain.includes(".")) {
      return NextResponse.json(
        { ok: false, error: "يرجى إدخال اسم دومين صالح (مثال: company.com)" },
        { status: 400 }
      );
    }

    const pb = await createAdminPocketBase();

    // 1. Save Domain Action
    if (body.action === "save" || !body.action) {
      await pb.collection("reseller_companies").update(company.id, {
        requestedDomain: domain,
      });

      return NextResponse.json({
        ok: true,
        message: "تم حفظ الدومين بنجاح",
        domain,
      });
    }

    // 2. Test Connection Action
    if (body.action === "test") {
      const server = await getCompanyServer(company.id);
      const settings = await getResellerSettings();

      if (!server?.ipAddress) {
        return NextResponse.json({
          ok: true,
          connected: false,
          errorCode: "server_not_set",
          errorMessage:
            "السيرفر الخاص بك قيد التجهيز من قبل فريق الدعم، ولم يتم ربط الـ IP بعد. يرجى الانتظار أو التواصل معنا.",
          showSupportButton: true,
          supportWhatsapp: settings.supportWhatsapp,
        });
      }

      const expectedIp = server.ipAddress.trim();
      let resolvedIps: string[] = [];

      try {
        resolvedIps = await resolve4(domain);
      } catch (err: unknown) {
        const dnsErr = err as { code?: string };
        const isNotFound = dnsErr?.code === "ENOTFOUND" || dnsErr?.code === "ENODATA";

        // Log domain event
        try {
          await pb.collection("reseller_domain_events").create({
            company: company.id,
            domain,
            eventType: "dns_check",
            success: false,
            expectedIp,
            errorCode: "no_a_record",
            errorMessage: "No A record found in DNS",
          });
        } catch {
          /* non-blocking */
        }

        return NextResponse.json({
          ok: true,
          connected: false,
          errorCode: "no_a_record",
          errorMessage:
            "لم يتم العثور على سجل A Record للدومين في DNS. تأكد من إضافة الدومين في Cloudflare وتوجيه A Record إلى IP السيرفر.",
          showSupportButton: true,
          expectedIp,
          supportWhatsapp: settings.supportWhatsapp,
        });
      }

      // Check if resolved IP matches or Cloudflare proxy is active
      const ipMatches = resolvedIps.includes(expectedIp);

      // Try HTTP connection challenge
      let httpOk = false;
      let httpStatus = 0;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`http://${domain}`, {
          method: "HEAD",
          signal: controller.signal,
          headers: { "User-Agent": "LIOTRIP-License-Tester/1.0" },
        });
        clearTimeout(timeoutId);
        httpStatus = res.status;
        httpOk = res.status < 500;
      } catch {
        httpOk = false;
      }

      if (ipMatches || httpOk) {
        // Success! Bind domain to license and notify super admin
        const license = await getCompanyLicense(company.id);
        if (license) {
          await pb.collection("reseller_licenses").update(license.id, {
            boundDomain: domain,
            status: "bound",
            firstActivation: license.firstActivation || new Date().toISOString(),
          });
        }

        await pb.collection("reseller_companies").update(company.id, {
          requestedDomain: domain,
          status: "active",
        });

        // Log success event
        try {
          await pb.collection("reseller_domain_events").create({
            company: company.id,
            domain,
            eventType: "bind_success",
            success: true,
            resolvedIp: resolvedIps[0] || expectedIp,
            expectedIp,
          });

          // Create notification for Super Admin
          await pb.collection("admin_notifications").create({
            title: "تم ربط دومين بنجاح",
            message: `تم ربط وتفعيل الدومين ${domain} لشركة ${company.companyName} بنجاح.`,
            type: "system",
            read: false,
          });
        } catch {
          /* non-blocking */
        }

        return NextResponse.json({
          ok: true,
          connected: true,
          domain,
          resolvedIp: resolvedIps[0] || expectedIp,
          message: "تهانينا! تم التحقق من اتصال الدومين بنجاح وربط الترخيص الرسمي به.",
        });
      }

      // IP Mismatch error
      try {
        await pb.collection("reseller_domain_events").create({
          company: company.id,
          domain,
          eventType: "bind_fail",
          success: false,
          resolvedIp: resolvedIps.join(", "),
          expectedIp,
          errorCode: "ip_mismatch",
          errorMessage: `Resolved IP (${resolvedIps.join(", ")}) does not match expected (${expectedIp})`,
        });
      } catch {
        /* non-blocking */
      }

      return NextResponse.json({
        ok: true,
        connected: false,
        errorCode: "ip_mismatch",
        errorMessage: `الدومين يشير حالياً إلى الـ IP: (${resolvedIps.join(", ")}) بينما عنوان سيرفرك الصحيح هو: (${expectedIp}). يرجى تعديل الـ A Record في لوحة استضافتك أو Cloudflare.`,
        resolvedIp: resolvedIps[0],
        expectedIp,
        showSupportButton: true,
        supportWhatsapp: settings.supportWhatsapp,
      });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process domain request";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
