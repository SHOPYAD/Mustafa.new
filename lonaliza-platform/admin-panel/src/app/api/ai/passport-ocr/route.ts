import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { resolveGeminiApiKey, resolveGeminiFreeApiKey } from "@/lib/server/gemini";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(`passport-ocr:${clientIp(req)}`, 20, 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  try {
    let imageBase64 = "";
    let mimeType = "image/jpeg";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ ok: false, error: "ملف الجواز مطلوب" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      imageBase64 = buffer.toString("base64");
      mimeType = file.type || "image/jpeg";
    } else {
      const body = await req.json();
      imageBase64 = body.imageBase64 || "";
      mimeType = body.mimeType || "image/jpeg";
    }

    if (!imageBase64) {
      return NextResponse.json({ ok: false, error: "بيانات صورة الجواز مفقودة" }, { status: 400 });
    }

    // Strip data URL prefix if present (e.g. data:image/jpeg;base64,...)
    if (imageBase64.includes(",")) {
      imageBase64 = imageBase64.split(",")[1];
    }

    // Resolve API key
    const primary = await resolveGeminiApiKey();
    const free = await resolveGeminiFreeApiKey();
    const apiKey = primary.apiKey || free.apiKey;

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "مفتاح Gemini الذكي غير مهيأ في النظام" },
        { status: 503 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const prompt = `You are a high-precision travel Passport & ID OCR reader.
Examine this passport or travel ID document image. Read both the visual inspection zone and the MRZ (Machine Readable Zone at the bottom).
Extract the traveler identity fields accurately.
Return a single valid JSON object strictly matching this schema:
{
  "firstName": "GIVEN NAMES (in English, capitalize first letter, e.g. John Ahmed)",
  "lastName": "SURNAME / FAMILY NAME (in English, capitalize first letter, e.g. Al-Mansoor)",
  "title": "mr" or "mrs" or "ms",
  "gender": "male" or "female",
  "dateOfBirth": "YYYY-MM-DD (e.g. 1990-05-14)",
  "nationality": "3-letter ISO country code or English country name (e.g. SAU, TUR, UAE, EGY, KWT)",
  "passportNumber": "PASSPORT NUMBER (digits and uppercase letters, no spaces, e.g. A12345678)",
  "passportCountry": "3-letter ISO issuing country code or English country name (e.g. SAU, TUR, UAE, EGY)",
  "passportExpiry": "YYYY-MM-DD (e.g. 2030-10-25)"
}

Rules:
1. If year of birth is 2-digit from MRZ, deduce 19XX or 20XX correctly.
2. If gender is M, set gender to "male" and title to "mr". If F, set gender to "female" and title to "ms" or "mrs".
3. If any field cannot be determined, set it to empty string "".
4. Ensure dates follow YYYY-MM-DD format strictly.
5. Return ONLY the raw JSON object, without markdown blocks.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);

    const rawText = result.response.text().trim();
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    const traveler = {
      firstName: String(parsed.firstName || "").trim(),
      lastName: String(parsed.lastName || "").trim(),
      title: (parsed.title === "mrs" || parsed.title === "ms" ? parsed.title : "mr") as "mr" | "mrs" | "ms",
      gender: (parsed.gender === "female" ? "female" : "male") as "male" | "female",
      dateOfBirth: String(parsed.dateOfBirth || "").trim(),
      nationality: String(parsed.nationality || "").trim().toUpperCase(),
      passportNumber: String(parsed.passportNumber || "").trim().toUpperCase(),
      passportCountry: String(parsed.passportCountry || "").trim().toUpperCase(),
      passportExpiry: String(parsed.passportExpiry || "").trim(),
    };

    return NextResponse.json({
      ok: true,
      traveler,
      extractedFieldsCount: Object.values(traveler).filter(Boolean).length,
    });
  } catch (error) {
    console.error("[Passport OCR Error]:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "فشل استخراج بيانات الجواز",
      },
      { status: 500 }
    );
  }
}
