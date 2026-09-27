import { NextResponse } from "next/server";
import { getAuthenticatedPartnerCompany } from "@/lib/server/partner-session";
import {
  getCompanyLicense,
  getCompanyProgress,
  getCompanyServer,
  getResellerSettings,
  updateResellerCompany,
} from "@/lib/server/resale-store";
import {
  getCompanyWallet,
  getCompanyTransactions,
  getOrProvisionCompanyApiKeys,
  getWhiteLabelSettings,
} from "@/lib/server/reseller-whitelabel-store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const company = await getAuthenticatedPartnerCompany();
    if (!company) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const [license, progress, server, settings, wallet, apiKeys, transactions, wlSettings] =
      await Promise.all([
        getCompanyLicense(company.id),
        getCompanyProgress(company.id),
        getCompanyServer(company.id),
        getResellerSettings(),
        getCompanyWallet(company.id),
        getOrProvisionCompanyApiKeys(company.id),
        getCompanyTransactions(company.id),
        getWhiteLabelSettings(),
      ]);

    return NextResponse.json({
      ok: true,
      company,
      license,
      progress,
      server,
      wallet,
      apiKeys,
      transactions,
      wlSettings,
      settings: {
        lifetimePrice: settings.lifetimePrice,
        updatePrice: settings.updatePrice,
        currency: settings.currency,
        deliveryHours: settings.deliveryHours,
        supportWhatsapp: settings.supportWhatsapp,
        contaboSpecs: settings.contaboSpecs,
        whatsappBankEnabled: settings.whatsappBankEnabled,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load company profile";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const company = await getAuthenticatedPartnerCompany();
    if (!company) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    const action = String(body.action || "save");

    if (action === "disconnect_whatsapp") {
      const updated = await updateResellerCompany(company.id, { phone: "" });
      return NextResponse.json({ ok: true, company: updated || company });
    }

    const patch: Record<string, unknown> = {};
    if (body.phone !== undefined) patch.phone = String(body.phone).trim();
    if (body.companyName !== undefined) patch.companyName = String(body.companyName).trim();
    if (body.companyNameAr !== undefined) patch.companyNameAr = String(body.companyNameAr).trim();
    if (body.taxId !== undefined) patch.taxId = String(body.taxId).trim();
    if (body.commercialReg !== undefined) patch.commercialReg = String(body.commercialReg).trim();
    if (body.legalAddress !== undefined) patch.legalAddress = String(body.legalAddress).trim();

    const updated = await updateResellerCompany(company.id, patch);

    return NextResponse.json({ ok: true, company: updated || company });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update company";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

