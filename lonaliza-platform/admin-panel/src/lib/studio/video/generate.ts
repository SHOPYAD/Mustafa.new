import { promises as fs } from "fs";
import path from "path";
import { studioNotifyPaths } from "@/lib/studio/creative/notify";
import { resolveGeminiApiKey } from "@/lib/server/gemini";
import { parseStudioLocale } from "@/lib/studio/planner/weekly-plan";
import { detectStudioModels } from "@/lib/studio/video/detect-models";
import { editVideoToDuration } from "@/lib/studio/video/edit";
import {
  clampDurationMinutes,
  resolveFfmpeg,
  targetSecondsFromMinutes,
} from "@/lib/studio/video/ffmpeg";
import { assembleStoryboardVideo } from "@/lib/studio/video/storyboard";
import { publicStudioUrl, sanitizeStudioFileName } from "@/lib/studio/creative/store";
import type {
  GenerateStudioVideoInput,
  GenerateStudioVideoResult,
  StudioVideoAttempt,
  VideoFamily,
} from "@/lib/studio/video/types";

const GEMINI_ROOT = "https://generativelanguage.googleapis.com/v1beta";

type SavedClip = { absolutePath: string };

async function saveMp4(buffer: Buffer, hint: string): Promise<SavedClip> {
  const fileName = sanitizeStudioFileName(hint, ".mp4");
  const dir = path.join(process.cwd(), ".data", "uploads", "studio", "video");
  await fs.mkdir(dir, { recursive: true });
  const absolutePath = path.join(dir, fileName);
  await fs.writeFile(absolutePath, buffer);
  return { absolutePath };
}

function extractBase64Video(payload: unknown): string | null {
  const walk = (node: unknown): string | null => {
    if (!node || typeof node !== "object") return null;
    if (Array.isArray(node)) {
      for (const item of node) {
        const found = walk(item);
        if (found) return found;
      }
      return null;
    }
    const rec = node as Record<string, unknown>;
    if (typeof rec.data === "string" && rec.data.length > 200) {
      const mime = String(rec.mime_type || rec.mimeType || "");
      if (!mime || mime.includes("video") || mime.includes("mp4")) return rec.data;
    }
    if (typeof rec.uri === "string" && rec.uri.includes("http")) {
      return `uri:${rec.uri}`;
    }
    for (const value of Object.values(rec)) {
      const found = walk(value);
      if (found) return found;
    }
    return null;
  };
  return walk(payload);
}

async function downloadGoogleMedia(
  uri: string,
  apiKey: string
): Promise<Buffer | null> {
  const res = await fetch(uri, {
    headers: { "x-goog-api-key": apiKey },
    redirect: "follow",
  });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

async function tryVeo(input: {
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<{ clip?: SavedClip; detail: string }> {
  const res = await fetch(
    `${GEMINI_ROOT}/models/${input.model}:predictLongRunning`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": input.apiKey,
      },
      body: JSON.stringify({
        instances: [{ prompt: input.prompt }],
        parameters: {
          aspectRatio: "9:16",
          durationSeconds: 8,
        },
      }),
    }
  );
  const started = (await res.json()) as {
    name?: string;
    error?: { message?: string };
  };
  if (!res.ok || !started.name) {
    return { detail: started.error?.message || `veo http ${res.status}` };
  }

  const deadline = Date.now() + 240_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 5000));
    const poll = await fetch(
      `${GEMINI_ROOT}/${started.name}?key=${encodeURIComponent(input.apiKey)}`,
      { cache: "no-store" }
    );
    const body = (await poll.json()) as {
      done?: boolean;
      error?: { message?: string };
      response?: unknown;
    };
    if (body.error?.message) return { detail: body.error.message };
    if (!body.done) continue;
    const extracted = extractBase64Video(body.response);
    if (!extracted) return { detail: "veo done بدون فيديو" };
    if (extracted.startsWith("uri:")) {
      const buf = await downloadGoogleMedia(extracted.slice(4), input.apiKey);
      if (!buf) return { detail: "فشل تنزيل عيّنة Veo" };
      return { clip: await saveMp4(buf, input.model), detail: "predictLongRunning" };
    }
    return {
      clip: await saveMp4(Buffer.from(extracted, "base64"), input.model),
      detail: "predictLongRunning inline",
    };
  }
  return { detail: "انتهت مهلة انتظار عملية Veo" };
}

function omniVideoFromInteraction(payload: unknown): string | null {
  const data = payload as {
    steps?: Array<{ content?: Array<{ type?: string; data?: string; mime_type?: string }> }>;
    output_video?: { data?: string };
  };
  if (data.output_video?.data) return data.output_video.data;
  for (const step of data.steps || []) {
    for (const part of step.content || []) {
      if (part.type === "video" && part.data) return part.data;
    }
  }
  return extractBase64Video(payload);
}

async function tryOmniInteractions(input: {
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<{ clip?: SavedClip; detail: string }> {
  const res = await fetch(`${GEMINI_ROOT}/interactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": input.apiKey,
    },
    body: JSON.stringify({
      model: input.model,
      input: input.prompt,
      response_format: {
        type: "video",
        aspect_ratio: "9:16",
        duration: "8s",
      },
    }),
  });
  const body = (await res.json()) as {
    id?: string;
    status?: string;
    error?: { message?: string };
    steps?: unknown;
  };
  if (!res.ok) {
    return { detail: body.error?.message || `interactions http ${res.status}` };
  }

  let current = body;
  if (current.status && current.status !== "completed" && current.id) {
    const deadline = Date.now() + 180_000;
    while (Date.now() < deadline && current.status !== "completed") {
      await new Promise((r) => setTimeout(r, 4000));
      const poll = await fetch(`${GEMINI_ROOT}/interactions/${current.id}`, {
        headers: { "x-goog-api-key": input.apiKey },
      });
      current = (await poll.json()) as typeof current;
      if (!poll.ok) {
        return { detail: `poll interactions ${poll.status}` };
      }
    }
  }

  const b64 = omniVideoFromInteraction(current);
  if (!b64) return { detail: "interactions بلا فيديو" };
  if (b64.startsWith("uri:")) {
    const buf = await downloadGoogleMedia(b64.slice(4), input.apiKey);
    if (!buf) return { detail: "فشل تنزيل Omni" };
    return { clip: await saveMp4(buf, input.model), detail: "interactions uri" };
  }
  return {
    clip: await saveMp4(Buffer.from(b64, "base64"), input.model),
    detail: "interactions",
  };
}

async function tryOmniGenerateContent(input: {
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<{ clip?: SavedClip; detail: string }> {
  const res = await fetch(
    `${GEMINI_ROOT}/models/${input.model}:generateContent?key=${encodeURIComponent(input.apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: input.prompt }] }],
        generationConfig: {
          responseModalities: ["VIDEO"],
        },
      }),
    }
  );
  const body = await res.json();
  if (!res.ok) {
    const err = body as { error?: { message?: string } };
    return { detail: err.error?.message || `generateContent http ${res.status}` };
  }
  const extracted = extractBase64Video(body);
  if (!extracted) return { detail: "generateContent بلا فيديو" };
  if (extracted.startsWith("uri:")) {
    const buf = await downloadGoogleMedia(extracted.slice(4), input.apiKey);
    if (!buf) return { detail: "فشل تنزيل generateContent" };
    return { clip: await saveMp4(buf, input.model), detail: "generateContent uri" };
  }
  return {
    clip: await saveMp4(Buffer.from(extracted, "base64"), input.model),
    detail: "generateContent",
  };
}

async function artifactFromPath(
  absolutePath: string,
  durationSeconds: number
): Promise<GenerateStudioVideoResult["video"]> {
  const stat = await fs.stat(absolutePath);
  const fileName = path.basename(absolutePath);
  const relativePath = `video/${fileName}`;
  return {
    fileName,
    relativePath,
    absolutePath,
    url: publicStudioUrl("video", relativePath),
    mimeType: "video/mp4",
    bytes: stat.size,
    durationSeconds,
  };
}

async function finalizeClip(input: {
  clip: SavedClip;
  durationMinutes: number;
  loudnorm: boolean;
  engine: VideoFamily;
  model: string;
  prompt: string;
  locale: string;
  attempts: StudioVideoAttempt[];
}): Promise<GenerateStudioVideoResult> {
  const ffmpeg = await resolveFfmpeg();
  const edited = await editVideoToDuration({
    inputPath: input.clip.absolutePath,
    durationMinutes: input.durationMinutes,
    loudnorm: input.loudnorm,
  });
  const video =
    edited.video ||
    (await artifactFromPath(
      input.clip.absolutePath,
      8
    ));
  return {
    ok: Boolean(video),
    prompt: input.prompt,
    locale: input.locale,
    requestedMinutes: input.durationMinutes,
    targetSeconds: targetSecondsFromMinutes(input.durationMinutes),
    durationEnforced: edited.durationEnforced,
    engine: input.engine,
    model: input.model,
    attempts: input.attempts,
    frames: [],
    video,
    ffmpeg: { available: ffmpeg.available, path: ffmpeg.ffmpeg },
    notify: studioNotifyPaths({
      title: `فيديو استوديو · ${input.model}`,
      paths: video ? [video.absolutePath] : [],
      urls: video ? [video.url] : [],
    }),
    error: edited.durationEnforced
      ? undefined
      : edited.error || "المقطع محفوظ لكن المدة لم تُفرض بدون ffmpeg",
  };
}

export async function generateStudioVideo(
  input: GenerateStudioVideoInput
): Promise<GenerateStudioVideoResult> {
  const locale = parseStudioLocale(input.locale);
  const durationMinutes = clampDurationMinutes(input.durationMinutes, 1);
  const prompt =
    typeof input.prompt === "string" && input.prompt.trim()
      ? input.prompt.trim()
      : locale === "en"
        ? "Cinematic 9:16 travel film of Turkey for Alrayyan Tourism, golden hour, no text."
        : locale === "tr"
          ? "Alrayyan için sinematik 9:16 Türkiye seyahat filmi, altın saat, metinsiz."
          : "فيلم سفر سينمائي عمودي 9:16 عن تركيا لوكالة لوناليزا، ضوء ذهبي، بدون نص.";
  const loudnorm = Boolean(input.loudnorm);
  const ffmpeg = await resolveFfmpeg();
  const attempts: StudioVideoAttempt[] = [];

  const { apiKey } = await resolveGeminiApiKey();
  if (!apiKey) {
    return {
      ok: false,
      prompt,
      locale,
      requestedMinutes: durationMinutes,
      targetSeconds: targetSecondsFromMinutes(durationMinutes),
      durationEnforced: false,
      engine: "storyboard",
      model: "",
      attempts,
      frames: [],
      video: null,
      ffmpeg: { available: ffmpeg.available, path: ffmpeg.ffmpeg },
      notify: studioNotifyPaths({ title: "لا مفتاح Gemini", paths: [], urls: [] }),
      error: "مفتاح Gemini غير مُعدّ.",
    };
  }

  const detected = await detectStudioModels(apiKey);
  const cinematic = [
    prompt,
    "Vertical 9:16, cinematic travel, Alrayyan Tourism brand mood, no captions, no logos.",
  ].join(" ");

  for (const model of detected.veo) {
    const result = await tryVeo({ apiKey, model, prompt: cinematic });
    attempts.push({
      family: "veo",
      model,
      ok: Boolean(result.clip),
      detail: result.detail,
    });
    if (result.clip) {
      return finalizeClip({
        clip: result.clip,
        durationMinutes,
        loudnorm,
        engine: "veo",
        model,
        prompt,
        locale,
        attempts,
      });
    }
  }

  for (const model of detected.omni) {
    const result = await tryOmniInteractions({ apiKey, model, prompt: cinematic });
    attempts.push({
      family: "omni",
      model,
      ok: Boolean(result.clip),
      detail: result.detail,
    });
    if (result.clip) {
      return finalizeClip({
        clip: result.clip,
        durationMinutes,
        loudnorm,
        engine: "omni",
        model,
        prompt,
        locale,
        attempts,
      });
    }
  }

  for (const model of detected.omni11) {
    let result = await tryOmniInteractions({ apiKey, model, prompt: cinematic });
    if (!result.clip) {
      result = await tryOmniGenerateContent({ apiKey, model, prompt: cinematic });
    }
    attempts.push({
      family: "omni11",
      model,
      ok: Boolean(result.clip),
      detail: result.detail,
    });
    if (result.clip) {
      return finalizeClip({
        clip: result.clip,
        durationMinutes,
        loudnorm,
        engine: "omni11",
        model,
        prompt,
        locale,
        attempts,
      });
    }
  }

  if (detected.flow.length) {
    attempts.push({
      family: "flow",
      model: detected.flow.join(","),
      ok: false,
      detail: "وُجد اسم Flow لكن لا نقطة نهاية رسمية منفصلة عن Veo/Omni.",
    });
  }

  const board = await assembleStoryboardVideo({
    prompt,
    locale,
    durationMinutes,
    loudnorm,
  });
  attempts.push({
    family: "storyboard",
    model: "nano-banana+ffmpeg",
    ok: Boolean(board.video),
    detail: board.error || "إطارات + تجميع",
  });

  return {
    ok: Boolean(board.video),
    prompt,
    locale,
    requestedMinutes: durationMinutes,
    targetSeconds: targetSecondsFromMinutes(durationMinutes),
    durationEnforced: board.durationEnforced,
    engine: "storyboard",
    model: "nano-banana+ffmpeg",
    attempts,
    frames: board.frames,
    video: board.video,
    ffmpeg: { available: ffmpeg.available, path: ffmpeg.ffmpeg },
    notify: studioNotifyPaths({
      title: "قصة مصورة + فيديو",
      paths: [
        ...board.frames.map((f) => f.absolutePath),
        ...(board.video ? [board.video.absolutePath] : []),
      ],
      urls: [
        ...board.frames.map((f) => f.url),
        ...(board.video ? [board.video.url] : []),
      ],
    }),
    error: board.video ? undefined : board.error,
  };
}
