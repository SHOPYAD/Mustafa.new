import { spawn } from "child_process";
import { promises as fs, statSync } from "fs";
import path from "path";

const LOCAL_FFMPEG = path.join(process.cwd(), ".data", "bin", "ffmpeg");
const LOCAL_FFPROBE = path.join(process.cwd(), ".data", "bin", "ffprobe");

export type FfmpegRuntime = {
  available: boolean;
  ffmpeg: string | null;
  ffprobe: string | null;
};

async function canExec(bin: string): Promise<boolean> {
  try {
    await fs.access(bin);
    return true;
  } catch {
    return false;
  }
}

function whichSync(name: string): string | null {
  const dirs = (process.env.PATH || "").split(path.delimiter);
  for (const dir of dirs) {
    const candidate = path.join(dir, name);
    try {
      if (statSync(candidate).isFile()) return candidate;
    } catch {
      /* next */
    }
  }
  return null;
}

let resolved: FfmpegRuntime | null = null;

export async function resolveFfmpeg(): Promise<FfmpegRuntime> {
  if (resolved) return resolved;
  const envFfmpeg = process.env.FFMPEG_PATH?.trim() || "";
  const envProbe = process.env.FFPROBE_PATH?.trim() || "";
  const ffmpeg =
    (envFfmpeg && (await canExec(envFfmpeg)) && envFfmpeg) ||
    ((await canExec(LOCAL_FFMPEG)) && LOCAL_FFMPEG) ||
    whichSync("ffmpeg");
  const ffprobe =
    (envProbe && (await canExec(envProbe)) && envProbe) ||
    ((await canExec(LOCAL_FFPROBE)) && LOCAL_FFPROBE) ||
    whichSync("ffprobe") ||
    ffmpeg;
  resolved = {
    available: Boolean(ffmpeg),
    ffmpeg: ffmpeg || null,
    ffprobe: ffprobe || null,
  };
  return resolved;
}

export function resetFfmpegCache(): void {
  resolved = null;
}

export function runProcess(
  bin: string,
  args: string[],
  timeoutMs = 180_000
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`انتهت مهلة ${path.basename(bin)}`));
    }, timeoutMs);
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

export async function probeDurationSeconds(filePath: string): Promise<number> {
  const runtime = await resolveFfmpeg();
  if (!runtime.ffprobe) return 0;
  const result = await runProcess(runtime.ffprobe, [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);
  const n = Number(result.stdout.trim());
  return Number.isFinite(n) ? n : 0;
}

export function clampDurationMinutes(raw: unknown, fallback = 1): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(10, Math.max(0.25, Math.round(n * 100) / 100));
}

export function targetSecondsFromMinutes(minutes: number): number {
  return Math.round(clampDurationMinutes(minutes) * 60);
}
