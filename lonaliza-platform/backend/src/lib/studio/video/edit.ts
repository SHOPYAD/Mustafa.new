import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { studioNotifyPaths } from "@/lib/studio/creative/notify";
import {
  publicStudioUrl,
  sanitizeStudioFileName,
  STUDIO_UPLOAD_ROOT,
} from "@/lib/studio/creative/store";
import {
  clampDurationMinutes,
  probeDurationSeconds,
  resolveFfmpeg,
  runProcess,
  targetSecondsFromMinutes,
} from "@/lib/studio/video/ffmpeg";
import type { StudioVideoArtifact } from "@/lib/studio/video/types";

export const studioVideoEditInputSchema = z.object({
  inputPath: z.string().optional(),
  name: z.string().optional(),
  durationMinutes: z.number().min(0.25).max(10),
  loudnorm: z.boolean().optional(),
});

export type StudioVideoEditResult = {
  ok: boolean;
  durationEnforced: boolean;
  requestedMinutes: number;
  targetSeconds: number;
  sourceSeconds: number;
  outputSeconds: number;
  video: StudioVideoArtifact | null;
  notify: ReturnType<typeof studioNotifyPaths>;
  error?: string;
};

function resolveInputPath(input: { inputPath?: string; name?: string }): string {
  if (input.inputPath && path.isAbsolute(input.inputPath)) return input.inputPath;
  if (input.inputPath) {
    return path.join(STUDIO_UPLOAD_ROOT, input.inputPath.replace(/^\/+/, ""));
  }
  if (input.name) {
    return path.join(STUDIO_UPLOAD_ROOT, input.name.replace(/^\/+/, ""));
  }
  throw new Error("حدّد inputPath أو name للفيديو المراد تحريره.");
}

function portraitFilters(): string {
  return [
    "scale=1080:1920:force_original_aspect_ratio=decrease",
    "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x0f172a",
    "setsar=1",
  ].join(",");
}

export async function editVideoToDuration(input: {
  inputPath?: string;
  name?: string;
  durationMinutes: unknown;
  loudnorm?: unknown;
}): Promise<StudioVideoEditResult> {
  const requestedMinutes = clampDurationMinutes(input.durationMinutes);
  const targetSeconds = targetSecondsFromMinutes(requestedMinutes);
  const sourcePath = resolveInputPath(input);
  const notifyEmpty = studioNotifyPaths({
    title: "تحرير مدة الفيديو",
    paths: [],
    urls: [],
  });

  try {
    await fs.access(sourcePath);
  } catch {
    return {
      ok: false,
      durationEnforced: false,
      requestedMinutes,
      targetSeconds,
      sourceSeconds: 0,
      outputSeconds: 0,
      video: null,
      notify: notifyEmpty,
      error: `الملف غير موجود: ${sourcePath}`,
    };
  }

  const runtime = await resolveFfmpeg();
  if (!runtime.available || !runtime.ffmpeg) {
    return {
      ok: false,
      durationEnforced: false,
      requestedMinutes,
      targetSeconds,
      sourceSeconds: 0,
      outputSeconds: 0,
      video: null,
      notify: notifyEmpty,
      error:
        "ffmpeg غير مثبت على الخادم (which ffmpeg فشل). لم تُضف حزمة fluent-ffmpeg. ضع الثنائي في PATH أو .data/bin/ffmpeg.",
    };
  }

  const sourceSeconds = await probeDurationSeconds(sourcePath);
  const outName = sanitizeStudioFileName("edit-duration", ".mp4");
  const outPath = path.join(STUDIO_UPLOAD_ROOT, "video", outName);
  await fs.mkdir(path.dirname(outPath), { recursive: true });

  const useLoudnorm = Boolean(input.loudnorm);
  const args = [
    "-y",
    "-stream_loop",
    "-1",
    "-i",
    sourcePath,
    "-t",
    String(targetSeconds),
    "-vf",
    portraitFilters(),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-r",
    "30",
    "-movflags",
    "+faststart",
  ];
  if (useLoudnorm) {
    args.push("-af", "loudnorm=I=-16:TP=-1.5:LRA=11");
  }
  args.push("-c:a", "aac", "-b:a", "128k", "-shortest", outPath);

  const ran = await runProcess(runtime.ffmpeg, args, 240_000);
  if (ran.code !== 0) {
    const retry = await runProcess(
      runtime.ffmpeg,
      [
        "-y",
        "-stream_loop",
        "-1",
        "-i",
        sourcePath,
        "-t",
        String(targetSeconds),
        "-vf",
        portraitFilters(),
        "-an",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-r",
        "30",
        "-movflags",
        "+faststart",
        outPath,
      ],
      240_000
    );
    if (retry.code !== 0) {
      return {
        ok: false,
        durationEnforced: false,
        requestedMinutes,
        targetSeconds,
        sourceSeconds,
        outputSeconds: 0,
        video: null,
        notify: notifyEmpty,
        error: retry.stderr.slice(-400) || ran.stderr.slice(-400),
      };
    }
  }

  const outputSeconds = await probeDurationSeconds(outPath);
  const stat = await fs.stat(outPath);
  const relativePath = `video/${outName}`;
  const url = publicStudioUrl("video", relativePath);
  const video: StudioVideoArtifact = {
    fileName: outName,
    relativePath,
    absolutePath: outPath,
    url,
    mimeType: "video/mp4",
    bytes: stat.size,
    durationSeconds: Math.round(outputSeconds * 100) / 100,
  };
  const enforced =
    outputSeconds > 0 && Math.abs(outputSeconds - targetSeconds) <= 1.1;

  return {
    ok: true,
    durationEnforced: enforced,
    requestedMinutes,
    targetSeconds,
    sourceSeconds: Math.round(sourceSeconds * 100) / 100,
    outputSeconds: video.durationSeconds,
    video,
    notify: studioNotifyPaths({
      title: `فيديو ${requestedMinutes} دقيقة`,
      paths: [outPath],
      urls: [url],
    }),
  };
}

/** MCP-style tool export — STUDIO-CHAT can register this without publishing. */
export const studioVideoEditTool = {
  name: "studio_video_edit_duration",
  description:
    "Trim or loop-pad a studio MP4 to N minutes (9:16). Optional loudnorm. Returns file paths only.",
  inputSchema: studioVideoEditInputSchema,
  execute: editVideoToDuration,
};
