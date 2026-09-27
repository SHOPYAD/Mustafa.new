import { NextResponse } from "next/server";
import { translateMany, translateText } from "@/lib/server/libretranslate";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      text?: string;
      texts?: string[];
      targetLang?: string;
      sourceLang?: string;
    };

    const targetLang = (body.targetLang || "ar").toLowerCase();
    const sourceLang = body.sourceLang || "auto";

    if (body.texts && Array.isArray(body.texts)) {
      const translations = await translateMany(body.texts, targetLang, sourceLang);
      return NextResponse.json({ ok: true, translations });
    }

    const text = body.text?.trim() || "";
    if (!text) {
      return NextResponse.json({ ok: false, error: "Text is required" }, { status: 400 });
    }

    const translatedText = await translateText(text, targetLang, sourceLang);
    return NextResponse.json({
      ok: true,
      translatedText,
      translated: translatedText,
      sourceLang,
      targetLang,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
