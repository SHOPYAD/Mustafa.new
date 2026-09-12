import { resolve4, resolveCname } from "dns/promises";
import { NextResponse } from "next/server";
import { getAuthenticatedPartnerCompany } from "@/lib/server/partner-session";
import { getCompanyServer } from "@/lib/server/resale-store";
import { submitCustomDomainRequest } from "@/lib/server/reseller-whitelabel-store";

export const runtime = "nodejs";

function cleanDomain(raw: string): string {
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
      message?: string;
      domain?: string;
      action?: "check_dns" | "chat" | "submit_activation";
    };

    const domain = cleanDomain(body.domain || company.customDomain || company.requestedDomain || "");
    const server = await getCompanyServer(company.id);
    const expectedIp = server?.ipAddress?.trim() || "5.189.147.52"; // Lonaliza master IP fallback

    // 1. Action: check_dns
    if (body.action === "check_dns") {
      if (!domain || !domain.includes(".")) {
        return NextResponse.json({
          ok: true,
          status: "invalid_domain",
          reply: "يرجى كتابة اسم الدومين الخاص بشركتك بشكل صحيح (مثال: travel-alhayat.com) لنقوم بفحصه ومساعدتك.",
        });
      }

      let resolvedIps: string[] = [];
      let dnsError = "";

      try {
        resolvedIps = await resolve4(domain);
      } catch (err: unknown) {
        const dErr = err as { code?: string };
        dnsError = dErr?.code || "NOT_FOUND";
      }

      const matches = resolvedIps.includes(expectedIp);
      const isCloudflare = resolvedIps.some((ip) => ip.startsWith("104.") || ip.startsWith("172.67.") || ip.startsWith("188.114."));

      if (matches || isCloudflare) {
        // DNS points to our server or Cloudflare proxy is active!
        const request = await submitCustomDomainRequest({
          companyId: company.id,
          domain,
          dnsVerified: true,
          dnsDiagnostics: `تم الفحص الآلي للـ DNS بنجاح. IPs: ${resolvedIps.join(", ")} | متطابق مع الخادم أو مفعل عبر البروكسي.`,
        });

        return NextResponse.json({
          ok: true,
          status: "verified",
          domain,
          resolvedIps,
          expectedIp,
          request,
          reply: `🎉 ممتاز جداً! تم التحقق من ربط الدومين (${domain}) بنجاح تام! السجلات تشير إلى خوادمنا (${resolvedIps.join(", ")}). لقد قمت بإرسال طلب الاعتماد الفوري وتثبيت شهادة الـ SSL إلى لوحة السوبير أدمن الآن للموافقة النهائية.`,
        });
      }

      // DNS error or mismatch
      if (dnsError || resolvedIps.length === 0) {
        return NextResponse.json({
          ok: true,
          status: "missing_record",
          domain,
          expectedIp,
          reply: `⚠️ مرحباً بك! قمت بفحص الدومين (${domain}) ولم أجد أي سجل A Record مضاف في الـ DNS حالياً.\n\nخطوات الحل:\n1. افتح لوحة تحكم نطاقك (Cloudflare أو Namecheap أو GoDaddy).\n2. أضف سجل A Record:\n   - النوع: A\n   - الاسم (Name): @\n   - القيمة (IPv4): ${expectedIp}\n   - TTL: Auto\n3. أضف سجل CNAME للـ www:\n   - النوع: CNAME\n   - الاسم: www\n   - الهدف: ${domain}\n\nبعد إضافتها، اضغط على زر "إعادة فحص الاتصال" وسأتحقق لك فوراً!`,
        });
      }

      return NextResponse.json({
        ok: true,
        status: "ip_mismatch",
        domain,
        resolvedIps,
        expectedIp,
        reply: `⚠️ الدومين (${domain}) يشير حالياً إلى عنوان IP آخر: (${resolvedIps.join(", ")}) بينما عنوان سيرفر لوناليزا المخصص لموقعك هو: (${expectedIp}).\n\nيرجى تعديل سجل A Record في لوحة استضافتك ليشير إلى (${expectedIp})، ثم أخبرني هنا لأعيد الفحص واعتماد طلبك فوراً.`,
      });
    }

    // 2. Action: Chat conversation
    const userMsg = (body.message || "").toLowerCase();
    let reply = "";

    if (userMsg.includes("cloudflare") || userMsg.includes("كلود فلير")) {
      reply = `لربط دومينك عبر Cloudflare:\n1. أنشئ حساباً مجانياً على Cloudflare.com وأضف دومينك.\n2. انقل أسماء خوادم النطاق (Nameservers) المحددة من كلاود فلير إلى مسجل الدومين.\n3. داخل تبويب DNS، أضف:\n   - سجل A: الاسم @ والقيمة ${expectedIp} (مع تفعيل السحابة البرتقالية Proxy).\n   - سجل CNAME: الاسم www والهدف @.\n4. ضع تشفير SSL/TLS على وضع "Full".\nبعد الحفظ اضغط زر فحص الاتصال.`;
    } else if (userMsg.includes("سيرفر") || userMsg.includes("ip") || userMsg.includes("اي بي")) {
      reply = `عنوان الـ IP الخاص بسيرفر منصتك هو: ${expectedIp}\nيجب توجيه سجل الـ A Record الخاص بالنطاق الرئيسي إليه مباشرة.`;
    } else {
      reply = `أهلاً بك! أنا وكيلك الذكي لمساعدتك في ربط الدومين المخصص (${domain || "domain.com"}) وتجهيز إعدادات الـ DNS.\n\nعنوان IP السيرفر الخاص بك هو: ${expectedIp}\nيمكنك إخباري بأي استفسار أو النقر على زر "فحص اتصال الـ DNS الآن" وسأقوم بالتحقق ورفع طلب التفعيل للسوبير أدمن فورياً.`;
    }

    return NextResponse.json({
      ok: true,
      reply,
      expectedIp,
      domain,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Assistant error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
