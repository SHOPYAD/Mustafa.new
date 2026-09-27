import { promises as fs } from "fs";
import path from "path";
import { generateBrandedStudioImages } from "@/lib/studio/creative/slides";
import { publicStudioUrl } from "@/lib/studio/creative/store";
import { editVideoToDuration } from "@/lib/studio/video/edit";
import {
  resolveFfmpeg,
  runProcess,
  targetSecondsFromMinutes,
} from "@/lib/studio/video/ffmpeg";
import type { GenerateStudioVideoResult } from "@/lib/studio/video/types";

export async function assembleStoryboardVideo(input: {
  prompt: string;
  locale: "ar" | "en" | "tr";
  durationMinutes: number;
  loudnorm?: boolean;
}): Promise<Pick<GenerateStudioVideoResult, "frames" | "video" | "durationEnforced" | "error">> {
  const slides = await generateBrandedStudioImages({
    prompt: input.prompt,
    title: input.prompt.slice(0, 72),
    destination: input.locale === "en" ? "Turkey" : input.locale === "tr" ? "Türkiye" : "تركيا",
    locale: input.locale,
    format: "reel",
    count: 3,
  });
  const frames = slides.artifacts
    .filter((row) => row.kind === "slide")
    .map((row) => ({
      relativePath: row.relativePath,
      url: row.url,
      absolutePath: row.absolutePath,
    }));

  const runtime = await resolveFfmpeg();
  if (!runtime.available || !runtime.ffmpeg) {
    return {
      frames,
      video: null,
      durationEnforced: false,
      error:
        "إطارات القصة جاهزة لكن ffmpeg غير متاح لتجميع 9:16 بالمدة المطلوبة.",
    };
  }

  const target = targetSecondsFromMinutes(input.durationMinutes);
  const perFrame = Math.max(2, target / Math.max(1, frames.length));
  const listPath = path.join(
    process.cwd(),
    ".data",
    "uploads",
    "studio",
    "frames",
    `concat-${Date.now().toString(36)}.txt`
  );
  await fs.mkdir(path.dirname(listPath), { recursive: true });
  const list = frames
    .map((frame) => {
      const escaped = frame.absolutePath.replace(/'/g, "'\\''");
      return `file '${escaped}'\nduration ${perFrame}`;
    })
    .join("\n");
  const last = frames[frames.length - 1];
  const concatBody = last
    ? `${list}\nfile '${last.absolutePath.replace(/'/g, "'\\''")}'\n`
    : list;
  await fs.writeFile(listPath, concatBody, "utf8");

  const rawOut = path.join(
    process.cwd(),
    ".data",
    "uploads",
    "studio",
    "video",
    `storyboard-raw-${Date.now().toString(36)}.mp4`
  );
  await fs.mkdir(path.dirname(rawOut), { recursive: true });
  const assembled = await runProcess(
    runtime.ffmpeg,
    [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listPath,
      "-vf",
      "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x0f172a,setsar=1",
      "-r",
      "30",
      "-pix_fmt",
      "yuv420p",
      "-c:v",
      "libx264",
      "-movflags",
      "+faststart",
      rawOut,
    ],
    180_000
  );
  if (assembled.code !== 0) {
    return {
      frames,
      video: null,
      durationEnforced: false,
      error: assembled.stderr.slice(-400) || "فشل تجميع إطارات القصة",
    };
  }

  const edited = await editVideoToDuration({
    inputPath: rawOut,
    durationMinutes: input.durationMinutes,
    loudnorm: input.loudnorm,
  });
  return {
    frames,
    video: edited.video
      ? { ...edited.video, url: publicStudioUrl("video", edited.video.relativePath) }
      : null,
    durationEnforced: edited.durationEnforced,
    error: edited.error,
  };
}
