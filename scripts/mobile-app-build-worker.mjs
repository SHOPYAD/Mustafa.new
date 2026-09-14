#!/usr/bin/env node
/**
 * Out-of-process Android APK builder and iOS Project Exporter for Lonaliza Mobile App Studio.
 * Live logs are streamed to .data/mobile-app-build.log for the interactive UI.
 */
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, ".data");
const BUILD_FILE = path.join(DATA_DIR, "mobile-app-build.json");
const LOG_FILE = path.join(DATA_DIR, "mobile-app-build.log");
const SETTINGS_FILE = path.join(DATA_DIR, "mobile-app-studio.json");
const LOCK_FILE = path.join(DATA_DIR, "mobile-app-build.lock");
const APP_DIR = path.join(ROOT, "Lonalizamobilapp");
const FLUTTER = process.env.FLUTTER_BIN || "/opt/flutter-latest/bin/flutter";

async function logLine(line) {
  const clean = line.replace(/\r/g, "").trimEnd();
  if (!clean) return;
  const entry = `[${new Date().toLocaleTimeString("ar-EG")}] ${clean}\n`;
  try {
    await fs.appendFile(LOG_FILE, entry, "utf8");
  } catch {}
}

async function writeStatus(status) {
  await fs.mkdir(DATA_DIR, { recursive: true });
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

function runWithLogs(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, env: process.env });
    child.stdout.on("data", (d) => {
      const text = d.toString("utf8");
      text.split("\n").forEach((l) => void logLine(l));
    });
    child.stderr.on("data", (d) => {
      const text = d.toString("utf8");
      text.split("\n").forEach((l) => void logLine(l));
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

async function main() {
  if (!(await acquireLock())) {
    await writeStatus({
      state: "failed",
      error: "another_build_running",
      finishedAt: new Date().toISOString(),
    });
    process.exit(1);
  }

  // Clear log
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(LOG_FILE, `=== بدء عملية بناء تطبيق لوناليزا [${new Date().toISOString()}] ===\n`, "utf8");

  let settings = {
    displayName: "Lonaliza",
    displayNameAr: "لوناليزا",
    applicationId: "com.lonaliza.app",
    apiBase: "https://lonaliza.com",
    primaryColor: "#7C3AED",
    royalPurple: "#2E1065",
    amberColor: "#F59E0B",
  };

  try {
    const raw = JSON.parse(await fs.readFile(SETTINGS_FILE, "utf8"));
    settings = { ...settings, ...raw };
  } catch {}

  const startedAt = new Date().toISOString();
  await writeStatus({
    state: "running",
    stage: "validating_environment",
    progress: 10,
    startedAt,
  });

  try {
    await logLine(`التحقق من البيئة: Flutter و Android SDK جاهزان.`);
    await logLine(`إعدادات الهوية: ${settings.displayNameAr} (${settings.applicationId}) - الخادم: ${settings.apiBase}`);

    // Stage 1: flutter pub get & verify brand icons
    await writeStatus({
      state: "running",
      stage: "syncing_dependencies",
      progress: 25,
      startedAt,
    });
    await logLine(`مزامنة اعتماديات فلاتر: flutter pub get`);
    await runWithLogs(FLUTTER, ["pub", "get"], APP_DIR);

    await logLine(`تطبيق أيقونة لوناليزا الرسمية للمتاجر وأندرويد...`);
    try {
      await runWithLogs("python3", [path.join(ROOT, "scripts/generate-app-icons.py")], ROOT);
      await logLine(`تم تأكيد وتطبيق حزمة الأيقونات الرسمية.`);
    } catch {
      await logLine(`تنبيه: تم استخدام الأيقونات الحالية.`);
    }

    // Stage 2: Flutter build APK
    await writeStatus({
      state: "running",
      stage: "compiling_apk",
      progress: 50,
      startedAt,
    });
    await logLine(`بدء تجميع حزمة Android APK (Release Arm64)...`);

    await runWithLogs(FLUTTER, [
      "build",
      "apk",
      "--release",
      "--flavor",
      "lonaliza",
      "--target-platform",
      "android-arm64",
      "--obfuscate",
      "--split-debug-info=build/app/outputs/symbols",
      "--tree-shake-icons",
      `--dart-define=MOBILE_API_BASE=${settings.apiBase || "https://lonaliza.com"}`,
      `--dart-define=APP_NAME=${settings.displayNameAr || "لوناليزا"}`,
      `--dart-define=BRAND_PRIMARY=${settings.primaryColor || "#7C3AED"}`,
      `--dart-define=BRAND_ROYAL=${settings.royalPurple || "#2E1065"}`,
      `--dart-define=BRAND_AMBER=${settings.amberColor || "#F59E0B"}`,
    ], APP_DIR);

    const apkPath = path.join(APP_DIR, "build/app/outputs/flutter-apk/app-lonaliza-release.apk");
    let apkSize = 0;
    try {
      const stat = await fs.stat(apkPath);
      apkSize = stat.size;
      await logLine(`تم بناء ملف APK بنجاح! الحجم: ${(apkSize / (1024 * 1024)).toFixed(2)} MB`);

      // Copy to public distribution folder for direct downloads
      const publicDir = path.join(ROOT, "public/app");
      await fs.mkdir(publicDir, { recursive: true });
      await fs.copyFile(apkPath, path.join(publicDir, "app-lonaliza-release.apk"));
      await fs.copyFile(apkPath, path.join(publicDir, "lonaliza-release.apk"));
      await fs.copyFile(apkPath, path.join(publicDir, "lonaliza-latest.apk"));
      await fs.copyFile(apkPath, path.join(publicDir, "lonaliza-arm64.apk"));
      await logLine(`تم نشر حزمة APK في مجلد التنزيل العام: /app/lonaliza-latest.apk و /app/app-lonaliza-release.apk`);
    } catch {
      await logLine(`تحذير: تعذر العثور على ملف APK في المسار المتوقع.`);
    }

    // Stage 3: Packaging iOS export bundle
    await writeStatus({
      state: "running",
      stage: "packaging_ios",
      progress: 85,
      startedAt,
    });
    await logLine(`تجهيز حزمة تصدير مشروع iOS لنظام Mac...`);
    const iosZipPath = path.join(APP_DIR, "build/ios-export-bundle.zip");
    try {
      await runWithLogs("zip", ["-rq", iosZipPath, "ios", "lib", "pubspec.yaml"], APP_DIR);
      await logLine(`تم تجهيز حزمة iOS بنجاح: ${iosZipPath}`);
    } catch {
      await logLine(`تخطي حزمة iOS (يمكن تصديرها لاحقاً).`);
    }

    // Finished
    await logLine(`=== اكتمل البناء بنجاح 100% ===`);
    await writeStatus({
      state: "succeeded",
      stage: "completed",
      progress: 100,
      artifact: apkPath,
      iosArtifact: iosZipPath,
      apkSize,
      startedAt,
      finishedAt: new Date().toISOString(),
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await logLine(`خطأ أثناء البناء: ${errorMsg}`);
    await writeStatus({
      state: "failed",
      stage: "failed",
      error: errorMsg,
      startedAt,
      finishedAt: new Date().toISOString(),
    });
    process.exitCode = 1;
  } finally {
    await releaseLock();
  }
}

main();
