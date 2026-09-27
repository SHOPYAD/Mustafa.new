import { GoogleGenerativeAI } from "@google/generative-ai";
import { resolveGeminiApiKey } from "@/lib/server/gemini";
import { listGeminiModelsOnKey } from "@/lib/studio/video/detect-models";

/** Original Nano Banana, then current image-capable models on this key. */
export const NANO_BANANA_CANDIDATES = [
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-lite-image",
  "gemini-3.1-flash-image",
  "gemini-3.1-flash-image-preview",
  "nano-banana-pro-preview",
  "gemini-3-pro-image",
  "gemini-3-pro-image-preview",
] as const;

type InlineImage = {
  model: string;
  mimeType: string;
  buffer: Buffer;
};

type ImageGenConfig = {
  responseModalities: Array<"TEXT" | "IMAGE">;
  imageConfig?: { aspectRatio: string };
};

function extractInlineImage(payload: unknown): { mimeType: string; data: string } | null {
  const data = payload as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { mimeType?: string; mime_type?: string; data?: string };
          inline_data?: { mimeType?: string; mime_type?: string; data?: string };
        }>;
      };
    }>;
  };
  const parts = data.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    const inline = part.inlineData || part.inline_data;
    const b64 = inline?.data;
    const mime = inline?.mimeType || inline?.mime_type || "image/png";
    if (b64) return { mimeType: mime, data: b64 };
  }
  return null;
}

async function generateViaSdk(
  apiKey: string,
  model: string,
  prompt: string,
  aspectRatio: string
): Promise<InlineImage | null> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const generationConfig: ImageGenConfig = {
    responseModalities: ["TEXT", "IMAGE"],
    imageConfig: { aspectRatio },
  };
  try {
    const generative = genAI.getGenerativeModel({
      model,
      generationConfig: generationConfig as never,
    });
    const result = await generative.generateContent(prompt);
    const found = extractInlineImage(result.response);
    if (found) {
      return {
        model,
        mimeType: found.mimeType,
        buffer: Buffer.from(found.data, "base64"),
      };
    }
  } catch {
    /* retry without imageConfig */
  }
  try {
    const generative = genAI.getGenerativeModel({
      model,
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      } as never,
    });
    const result = await generative.generateContent(prompt);
    const found = extractInlineImage(result.response);
    if (!found) return null;
    return {
      model,
      mimeType: found.mimeType,
      buffer: Buffer.from(found.data, "base64"),
    };
  } catch {
    return null;
  }
}

export async function resolveImageModels(apiKey: string): Promise<string[]> {
  const listed = await listGeminiModelsOnKey(apiKey);
  const names = new Set(listed.map((row) => row.name));
  return NANO_BANANA_CANDIDATES.filter((id) => names.has(id));
}

export async function generateNanoBananaImage(input: {
  prompt: string;
  aspectRatio?: "9:16" | "4:5" | "1:1";
}): Promise<{ image: InlineImage; tried: string[] }> {
  const { apiKey } = await resolveGeminiApiKey();
  if (!apiKey) {
    throw new Error("مفتاح Gemini غير مُعدّ لتوليد صور Nano Banana.");
  }
  const candidates = await resolveImageModels(apiKey);
  const tried: string[] = [];
  const ratio = input.aspectRatio || "9:16";
  for (const model of candidates) {
    tried.push(model);
    const image = await generateViaSdk(apiKey, model, input.prompt, ratio);
    if (image && image.buffer.length > 800) {
      return { image, tried };
    }
  }
  throw new Error(
    `تعذّر توليد صورة. جُرّبت: ${tried.join(", ") || "لا نماذج صور على المفتاح"}`
  );
}
