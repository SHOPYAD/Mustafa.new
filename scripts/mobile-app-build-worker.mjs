#!/usr/bin/env node
/**
 * Out-of-process Android APK builder. Never runs inside a Next.js route.
 * Concurrency is 1 via the build-status file. iOS IPA is not produced on Linux.
 */
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BUILD_FILE = path.join(ROOT, ".data/mobile-app-build.json");
const SETTINGS_FILE = path.join(ROOT, ".data/mobile-app-studio.json");
const LOCK_FILE = path.join(ROOT, ".data/mobile-app-build.lock");
const APP_DIR = path.join(ROOT, "Lonalizamobilapp");
const FLUTTER = process.env.FLUTTER_BIN || "/opt/flutter-latest/bin/flutter";

async function writeStatus(status) {
  await fs.mkdir(path.dirname(BUILD_FILE), { recursive: true });
  await fs.writeFile(BUILD_FILE, JSON.stringify(status, null, 2));
}

async function acquireLock() {
  try {
    await fs.writeFile(LOCK_FILE, String(process.pid), { flag: "wx" });
    return true;
  } catch {
    return false;
  }
}

async function releaseLock() {
  await fs.unlink(LOCK_FILE).catch(() => {});
}

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit", env: process.env });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}`));
    });
  });
}

async function main() {
  if (!(await acquireLock())) {
    await writeStatus({ state: "failed", error: "another_build_running", finishedAt: new Date().toISOString() });
    process.exit(1);
  }

  let settings = { apiBase: "https://lonaliza.com" };
  try {
    settings = { ...settings, ...JSON.parse(await fs.readFile(SETTINGS_FILE, "utf8")) };
  } catch {
    /* defaults */
  }

  await writeStatus({ state: "running", startedAt: new Date().toISOString() });
  try {
    await run(FLUTTER, [
      "build",
      "apk",
      "--release",
      "--flavor",
      "lonaliza",
      `--dart-define=MOBILE_API_BASE=${settings.apiBase || "https://lonaliza.com"}`,
    ], APP_DIR);
    const artifact = path.join(APP_DIR, "build/app/outputs/flutter-apk/app-lonaliza-release.apk");
    await writeStatus({
      state: "succeeded",
      artifact,
      finishedAt: new Date().toISOString(),
    });
  } catch (err) {
    await writeStatus({
      state: "failed",
      error: err instanceof Error ? err.message : String(err),
      finishedAt: new Date().toISOString(),
    });
    process.exitCode = 1;
  } finally {
    await releaseLock();
  }
}

main();
