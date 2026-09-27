import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getGeminiSettingsSnapshot,
  saveGeminiApiKey,
  saveGeminiFreeApiKey,
  saveGeminiPublicConfig,
} from "@/lib/server/gemini";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const snapshot = await getGeminiSettingsSnapshot();
  return NextResponse.json({ ok: true, settings: snapshot });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const model = typeof body.model === "string" ? body.model.trim() : undefined;
    const systemInstructions =
      typeof body.systemInstructions === "string"
        ? body.systemInstructions
        : undefined;
    const writingRules =
      typeof body.writingRules === "string" ? body.writingRules : undefined;
    const salesWhatsApp =
      typeof body.salesWhatsApp === "string"
        ? body.salesWhatsApp.trim()
        : undefined;
    const salesMarkupPercent =
      body.salesMarkupPercent !== undefined
        ? Number(body.salesMarkupPercent)
        : undefined;
    const salesInstructions =
      typeof body.salesInstructions === "string"
        ? body.salesInstructions
        : undefined;
    const salesWelcomeAr =
      typeof body.salesWelcomeAr === "string" ? body.salesWelcomeAr : undefined;
    const salesWelcomeEn =
      typeof body.salesWelcomeEn === "string" ? body.salesWelcomeEn : undefined;
    const salesBehaviorRules =
      typeof body.salesBehaviorRules === "string"
        ? body.salesBehaviorRules
        : undefined;
    const salesTone = typeof body.salesTone === "string" ? body.salesTone : undefined;
    const salesUpsellNotes =
      typeof body.salesUpsellNotes === "string" ? body.salesUpsellNotes : undefined;
    const salesSaveProgramRules =
      typeof body.salesSaveProgramRules === "string"
        ? body.salesSaveProgramRules
        : undefined;
    const salesPreferLiteModel =
      typeof body.salesPreferLiteModel === "boolean"
        ? body.salesPreferLiteModel
        : undefined;
    const salesUseGoogleSearch =
      typeof body.salesUseGoogleSearch === "boolean"
        ? body.salesUseGoogleSearch
        : undefined;
    const dailyFreeChatLimit =
      body.dailyFreeChatLimit !== undefined
        ? Number(body.dailyFreeChatLimit)
        : undefined;
    const dailyPaidChatLimit =
      body.dailyPaidChatLimit !== undefined
        ? Number(body.dailyPaidChatLimit)
        : undefined;
    const salesPaidKeyEnabled =
      typeof body.salesPaidKeyEnabled === "boolean"
        ? body.salesPaidKeyEnabled
        : undefined;

    await saveGeminiPublicConfig({
      ...(model ? { model } : {}),
      ...(systemInstructions !== undefined ? { systemInstructions } : {}),
      ...(writingRules !== undefined ? { writingRules } : {}),
      ...(salesWhatsApp !== undefined ? { salesWhatsApp } : {}),
      ...(Number.isFinite(salesMarkupPercent)
        ? { salesMarkupPercent: salesMarkupPercent as number }
        : {}),
      ...(salesInstructions !== undefined ? { salesInstructions } : {}),
      ...(salesWelcomeAr !== undefined ? { salesWelcomeAr } : {}),
      ...(salesWelcomeEn !== undefined ? { salesWelcomeEn } : {}),
      ...(salesBehaviorRules !== undefined ? { salesBehaviorRules } : {}),
      ...(salesTone !== undefined ? { salesTone } : {}),
      ...(salesUpsellNotes !== undefined ? { salesUpsellNotes } : {}),
      ...(salesSaveProgramRules !== undefined ? { salesSaveProgramRules } : {}),
      ...(salesPreferLiteModel !== undefined ? { salesPreferLiteModel } : {}),
      ...(salesUseGoogleSearch !== undefined ? { salesUseGoogleSearch } : {}),
      ...(Number.isFinite(dailyFreeChatLimit)
        ? { dailyFreeChatLimit: dailyFreeChatLimit as number }
        : {}),
      ...(Number.isFinite(dailyPaidChatLimit)
        ? { dailyPaidChatLimit: dailyPaidChatLimit as number }
        : {}),
      ...(salesPaidKeyEnabled !== undefined ? { salesPaidKeyEnabled } : {}),
    });

    let keyNote: string | undefined;
    if (typeof body.apiKey === "string") {
      const incoming = body.apiKey.trim();
      const isMasked = incoming.includes("••••") || /^\•+$/.test(incoming);
      if (incoming && !isMasked) {
        if (process.env.GEMINI_API_KEY?.trim()) {
          keyNote = "تم الحفظ.";
        } else {
          await saveGeminiApiKey(incoming);
          keyNote = "تم الحفظ.";
        }
      } else if (
        body.clearApiKey === true &&
        !process.env.GEMINI_API_KEY?.trim()
      ) {
        await saveGeminiApiKey("");
        keyNote = "تم حذف المفتاح.";
      }
    }

    if (typeof body.freeApiKey === "string") {
      const incoming = body.freeApiKey.trim();
      const isMasked = incoming.includes("••••") || /^\•+$/.test(incoming);
      if (incoming && !isMasked) {
        if (process.env.GEMINI_FREE_API_KEY?.trim()) {
          keyNote = "تم الحفظ.";
        } else {
          await saveGeminiFreeApiKey(incoming);
          keyNote = "تم الحفظ.";
        }
      } else if (
        body.clearFreeApiKey === true &&
        !process.env.GEMINI_FREE_API_KEY?.trim()
      ) {
        await saveGeminiFreeApiKey("");
        keyNote = "تم الحفظ.";
      }
    }

    const snapshot = await getGeminiSettingsSnapshot();
    return NextResponse.json({
      ok: true,
      message: keyNote || "تم حفظ الإعدادات",
      settings: snapshot,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
