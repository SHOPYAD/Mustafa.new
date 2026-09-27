/**
 * Publish AI media: Nano Banana / Gemini image, plus Postiz-style video options
 * (slides + Veo-like) wired to the existing Lonaliza studio generators.
 * Generating media does not publish; posts still require approved=true.
 */

import { generateNanoBananaImage } from "@/lib/studio/creative/nano-banana";
import {
  publicStudioUrl,
  sanitizeStudioFileName,
  writeStudioBuffer,
} from "@/lib/studio/creative/store";
import { resolveGeminiApiKey } from "@/lib/server/gemini";
import { detectStudioModels } from "@/lib/studio/video/detect-models";
import { resolveFfmpeg } from "@/lib/studio/video/ffmpeg";
import { generateStudioVideo } from "@/lib/studio/video/generate";
import { assembleStoryboardVideo } from "@/lib/studio/video/storyboard";
import { parseStudioLocale } from "@/lib/studio/planner/weekly-plan";
import { saveMedia, type PublishMediaRecord } from "./media-store";

export type PublishVideoPlacement = "text-to-image" | "image-to-video" | "video-to-video";

export type PublishVideoOption = {
  identifier: string;
  title: string;
  titleAr: string;
  description: string;
  placement: PublishVideoPlacement;
  output: "vertical|horizontal";
  available: boolean;
  reasonAr?: string;
  customParams: Array<{ key: string; type: string; description: string }>;
};

export type PublishAiMediaResult = {
  ok: boolean;
  approved: false;
  identifier?: string;
  engine?: string;
  model?: string;
  available: boolean;
  media?: PublishMediaRecord;
  frames?: Array<{ url: string }>;
  error?: string;
  attempts?: Array<{ family: string; model: string; ok: boolean; detail: string }>;
};

const IMAGE_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

function mimeExt(mime: string): string {
  return IMAGE_EXT[mime] || ".png";
}

export async function listPublishVideoOptions(): Promise<PublishVideoOption[]> {
  const { apiKey } = await resolveGeminiApiKey();
  const ffmpeg = await resolveFfmpeg();
  let veo: string[] = [];
  let omni: string[] = [];
  let omni11: string[] = [];
  let notes: string[] = [];
  if (apiKey) {
    try {
      const detected = await detectStudioModels(apiKey);
      veo = detected.veo;
      omni = detected.omni;
      omni11 = detected.omni11;
      notes = detected.notes;
    } catch (err) {
      notes = [err instanceof Error ? err.message : "تعذّر اكتشاف نماذج Gemini"];
    }
  }
  const seedanceKey = (process.env.EVOLINK_API_KEY || "").trim();
  const slidesAvailable = Boolean(apiKey);
  const veoAvailable = veo.length > 0;
  const omniAvailable = omni.length > 0 || omni11.length > 0;
  return [
    {
      identifier: "image-text-slides",
      title: "Image Text Slides",
      titleAr: "شرائح صور + تجميع",
      description:
        "شرائح سياحية من المطالبة عبر Nano Banana ثم تجميع عمودي (مفهوم Postiz image-text-slides / TTS slides).",
      placement: "text-to-image",
      output: "vertical|horizontal",
      available: slidesAvailable,
      reasonAr: slidesAvailable
        ? ffmpeg.available
          ? undefined
          : "النماذج جاهزة لكن ffmpeg غير متاح لتجميع الفيديو — قد تُحفظ الإطارات فقط."
        : "مفتاح Gemini غير مُعدّ — لن يُدّعى نجاح التوليد.",
      customParams: [
        { key: "prompt", type: "string", description: "وصف الشرائح" },
        { key: "locale", type: "string", description: "ar | en | tr" },
      ],
    },
    {
      identifier: "veo",
      title: "Veo-like cinematic",
      titleAr: "فيديو سينمائي (Veo)",
      description: "توليد فيديو عبر نماذج Veo على مفتاح Gemini إن وُجدت.",
      placement: "text-to-image",
      output: "vertical|horizontal",
      available: veoAvailable,
      reasonAr: veoAvailable
        ? undefined
        : apiKey
          ? `لا نماذج Veo على المفتاح.${notes[0] ? ` ${notes[0]}` : ""}`
          : "مفتاح Gemini غير مُعدّ.",
      customParams: [{ key: "prompt", type: "string", description: "وصف المشهد" }],
    },
    {
      identifier: "omni",
      title: "Omni video",
      titleAr: "فيديو Omni",
      description: "مسار Gemini Omni إن ظهر على المفتاح.",
      placement: "text-to-image",
      output: "vertical|horizontal",
      available: omniAvailable,
      reasonAr: omniAvailable ? undefined : "لا نماذج Omni ظاهرة على المفتاح.",
      customParams: [{ key: "prompt", type: "string", description: "وصف المشهد" }],
    },
    {
      identifier: "seedance",
      title: "Seedance 2.0",
      titleAr: "سيدانس 2.0",
      description: "مولّد Postiz Seedance — غير موصول في لوناليزا بدون EVOLINK_API_KEY.",
      placement: "text-to-image",
      output: "vertical|horizontal",
      available: Boolean(seedanceKey),
      reasonAr: seedanceKey ? undefined : "EVOLINK_API_KEY غير موجود — الخيار معروض فقط ولن يُولَّد فيديو.",
      customParams: [{ key: "prompt", type: "string", description: "وصف المشهد" }],
    },
  ];
}

export async function generatePublishImage(input: {
  prompt: string;
  aspectRatio?: "9:16" | "4:5" | "1:1";
}): Promise<PublishAiMediaResult> {
  const prompt = String(input.prompt || "").trim();
  if (!prompt) {
    return { ok: false, approved: false, available: false, error: "اكتب وصفاً للصورة أولاً." };
  }
  const { apiKey } = await resolveGeminiApiKey();
  if (!apiKey) {
    return {
      ok: false,
      approved: false,
      available: false,
      error: "مفتاح Gemini غير مُعدّ. لن يُحفظ ملف ولن يُدّعى نجاح التوليد.",
    };
  }
  try {
    const result = await generateNanoBananaImage({
      prompt,
      aspectRatio: input.aspectRatio || "9:16",
    });
    const ext = mimeExt(result.image.mimeType);
    const fileName = sanitizeStudioFileName("publish-ai", ext);
    const saved = await writeStudioBuffer({
      folder: "images",
      fileName,
      buffer: result.image.buffer,
    });
    const url = publicStudioUrl("creative", saved.relativePath);
    const media = await saveMedia({
      name: prompt.slice(0, 80) || "صورة مولَّدة",
      url,
      path: url,
      type: "image",
      mime: result.image.mimeType,
      size: saved.bytes,
      alt: prompt.slice(0, 200),
    });
    return {
      ok: true,
      approved: false,
      identifier: "nano-banana",
      engine: "nano-banana",
      model: result.image.model,
      available: true,
      media,
    };
  } catch (err) {
    return {
      ok: false,
      approved: false,
      available: true,
      error: err instanceof Error ? err.message : "تعذّر توليد الصورة.",
    };
  }
}

export async function generatePublishVideo(input: {
  identifier?: string;
  prompt: string;
  output?: "vertical" | "horizontal";
  locale?: string;
  durationMinutes?: number;
}): Promise<PublishAiMediaResult> {
  const prompt = String(input.prompt || "").trim();
  if (!prompt) {
    return { ok: false, approved: false, available: false, error: "اكتب وصفاً للفيديو أولاً." };
  }
  const identifier = String(input.identifier || "image-text-slides").trim() || "image-text-slides";
  const options = await listPublishVideoOptions();
  const option = options.find((row) => row.identifier === identifier);
  if (!option) {
    return { ok: false, approved: false, available: false, error: `خيار فيديو غير معروف: ${identifier}` };
  }
  if (!option.available) {
    return {
      ok: false,
      approved: false,
      identifier,
      available: false,
      error: option.reasonAr || "هذا الخيار غير متاح على المفتاح الحالي — لن يُدّعى نجاح التوليد.",
    };
  }

  if (identifier === "seedance") {
    return {
      ok: false,
      approved: false,
      identifier,
      available: true,
      error: "مسار Seedance غير منفَّذ في استوديو لوناليزا حتى مع المفتاح.",
    };
  }

  if (identifier === "image-text-slides") {
    const locale = parseStudioLocale(input.locale);
    try {
      const board = await assembleStoryboardVideo({
        prompt,
        locale,
        durationMinutes: input.durationMinutes || 1,
      });
      if (!board.video) {
        return {
          ok: false,
          approved: false,
          identifier,
          engine: "storyboard",
          available: true,
          frames: board.frames.map((row) => ({ url: row.url })),
          error: board.error || "أُنشئت إطارات الشرائح لكن الفيديو لم يُجمَّع.",
        };
      }
      const media = await saveMedia({
        name: prompt.slice(0, 80) || "فيديو شرائح",
        url: board.video.url,
        path: board.video.url,
        type: "video",
        mime: board.video.mimeType,
        size: board.video.bytes,
        alt: prompt.slice(0, 200),
      });
      return {
        ok: true,
        approved: false,
        identifier,
        engine: "storyboard",
        model: "nano-banana+ffmpeg",
        available: true,
        media,
        frames: board.frames.map((row) => ({ url: row.url })),
      };
    } catch (err) {
      return {
        ok: false,
        approved: false,
        identifier,
        available: true,
        error: err instanceof Error ? err.message : "تعذّر توليد شرائح الفيديو.",
      };
    }
  }

  void input.output;
  const generated = await generateStudioVideo({
    prompt,
    locale: input.locale,
    durationMinutes: input.durationMinutes || 1,
  });
  const engineOk =
    identifier === "veo"
      ? generated.engine === "veo"
      : identifier === "omni"
        ? generated.engine === "omni" || generated.engine === "omni11"
        : generated.ok;
  if (!generated.ok || !generated.video || !engineOk) {
    return {
      ok: false,
      approved: false,
      identifier,
      engine: generated.engine,
      model: generated.model,
      available: true,
      attempts: generated.attempts,
      error:
        generated.engine === "storyboard"
          ? "نماذج Veo/Omni لم تُنتج فيديو. لم يُحفظ كنجاح لهذا الخيار — استخدم شرائح الصور إن أردت المسار البديل."
          : generated.error || "تعذّر توليد الفيديو من النموذج المطلوب.",
    };
  }
  const media = await saveMedia({
    name: prompt.slice(0, 80) || "فيديو مولَّد",
    url: generated.video.url,
    path: generated.video.url,
    type: "video",
    mime: generated.video.mimeType,
    size: generated.video.bytes,
    alt: prompt.slice(0, 200),
  });
  return {
    ok: true,
    approved: false,
    identifier,
    engine: generated.engine,
    model: generated.model,
    available: true,
    media,
    attempts: generated.attempts,
  };
}
