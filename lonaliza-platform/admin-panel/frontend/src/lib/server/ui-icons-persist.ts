/**
 * Disk persistence for UI icon assignments (`.data/ui-icons.json`).
 */

import { promises as fs } from "fs";
import path from "path";
import {
  DEFAULT_UI_ICONS,
  normalizeUiIcons,
  type UiIconsFile,
} from "@/lib/ui-icons-store";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "ui-icons.json");

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-ui-icons.json");
  }
  return STORE_FILE;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

export async function getUiIcons(): Promise<UiIconsFile> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    return normalizeUiIcons(JSON.parse(raw));
  } catch {
    return normalizeUiIcons(DEFAULT_UI_ICONS);
  }
}

export async function saveUiIcons(input: unknown): Promise<UiIconsFile> {
  const next = normalizeUiIcons(input);
  await ensureDir();
  await fs.writeFile(getStoreFile(), JSON.stringify(next, null, 2), "utf8");
  return next;
}
