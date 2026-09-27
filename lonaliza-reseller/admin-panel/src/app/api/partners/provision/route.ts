import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import {
  getResellerCompanies,
  getResellerCompanyByEmail,
  issueLicenseForCompany,
  updateResellerCompany,
  type ResellerCompany,
} from "@/lib/server/resale-store";
import {
  getOrProvisionCompanyApiKeys,
  getWhiteLabelSettings,
} from "@/lib/server/reseller-whitelabel-store";
import { createAdminPocketBase } from "@/lib/pocketbase/admin";

export const runtime = "nodejs";

const RESERVED_SUBDOMAINS = new Set([
  "admin",
  "api",
  "www",
  "mail",
  "smtp",
  "ftp",
  "pocketbase",
  "pb",
  "demo",
  "search",
  "tpwl",
  "staging",
  "dev",
  "hotel",
  "flights",
  "resale",
  "partner",
  "partners",
]);

function cleanSubdomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      companyName: string;
      email: string;
      phone?: string;
      subdomain: string;
      planType?: "whitelabel_free" | "whitelabel_paid";
    };

    const companyName = (body.companyName || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const phone = (body.phone || "").trim();
    const planType = body.planType === "whitelabel_paid" ? "whitelabel_paid" : "whitelabel_free";
    const sub = cleanSubdomain(body.subdomain || "");

    if (!companyName || companyName.length < 2) {
      return NextResponse.json({ ok: false, error: "يرجى كتابة اسم الشركة بشكل صحيح" }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "يرجى إدخال بريد إلكتروني صالح" }, { status: 400 });
    }
    if (!sub || sub.length < 3 || sub.length > 30) {
      return NextResponse.json(
        { ok: false, error: "يجب أن يتراوح طول السابدومين بين 3 إلى 30 حرفاً باللغة الإنجليزية والأرقام فقط" },
        { status: 400 }
      );
    }
    if (RESERVED_SUBDOMAINS.has(sub)) {
      return NextResponse.json({ ok: false, error: "هذا النطاق الفرعي محجوز لخدمات المنظمة. اختر اسماً آخر" }, { status: 400 });
    }

    // Check if subdomain is already claimed
    const allCompanies = await getResellerCompanies();
    const existingSub = allCompanies.find(
      (c) => c.subdomain && c.subdomain.split(".")[0].toLowerCase() === sub
    );
    if (existingSub && existingSub.email !== email) {
      return NextResponse.json(
        { ok: false, error: `الاسم الفرعي (${sub}) محجوز لشركة أخرى. يرجى اختيار اسم مختلف` },
        { status: 409 }
      );
    }

    // Check or create company
    let company = await getResellerCompanyByEmail(email);
    const fullSubdomain = `${sub}.lonaliza.com`;

    // Generate random temporary password
    const tempPassword = `Lona#${randomBytes(4).toString("hex")}26`;

    if (company) {
      company = await updateResellerCompany(company.id, {
        companyName,
        phone: phone || company.phone,
        planType,
        subdomain: fullSubdomain,
        status: "active",
      });
    } else {
      const pb = await createAdminPocketBase();
      const created = await pb.collection("reseller_companies").create({
        email,
        companyName,
        phone,
        planType,
        subdomain: fullSubdomain,
        status: "active",
        walletBalance: 0,
        walletHoldBalance: 0,
      });

      company = {
        id: created.id,
        email: created.email,
        companyName: created.companyName,
        phone: created.phone || "",
        status: "active",
        planType,
        subdomain: fullSubdomain,
        walletBalance: 0,
        walletHoldBalance: 0,
        created: created.created,
        updated: created.updated,
      };
    }

    if (!company) {
      throw new Error("Could not initialize company account");
    }

    // Provision B2B API keys
    const apiKeys = await getOrProvisionCompanyApiKeys(company.id);

    // Issue license
    const license = await issueLicenseForCompany(company.id);

    return NextResponse.json({
      ok: true,
      companyId: company.id,
      companyName: company.companyName,
      subdomain: fullSubdomain,
      siteUrl: `https://${fullSubdomain}`,
      adminUrl: `https://${fullSubdomain}/admin`,
      adminUsername: "admin",
      adminPassword: tempPassword,
      planType,
      apiKeys,
      licenseKey: license.licenseKey,
      message: "تم إنشاء موقعك وتخصيص بيئتك المعزولة بنجاح!",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to provision instance";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
