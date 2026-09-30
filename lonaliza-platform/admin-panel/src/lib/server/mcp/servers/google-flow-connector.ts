/**
 * Google Flow (Ultra Subscription) Video Connector & Montage Pipeline
 * Interfaces with Google Flow / Omni 1.1 / Veo using Ultra session credentials
 * Processes video with ffmpeg, dispatches to Telegram for review, and enables 1-click social publish & ads
 */

import path from "path";
import fs from "fs/promises";

const FLOW_DATA_DIR = path.join(process.cwd(), ".data", "google-flow");
const SESSION_FILE = path.join(FLOW_DATA_DIR, "session.json");

export interface GoogleFlowSession {
  bearerToken?: string;
  cookies?: string;
  updatedAt: string;
  accountEmail?: string;
  plan: "ultra" | "pro";
}

export interface GenerateFlowVideoInput {
  prompt: string;
  destination?: string;
  durationSeconds?: number;
  aspectRatio?: "9:16" | "16:9";
  approved?: boolean;
}

export interface FlowVideoOutput {
  ok: boolean;
  videoUrl?: string;
  filePath?: string;
  captionAr: string;
  telegramStatus?: string;
  error?: string;
}

export async function saveGoogleFlowSession(session: Partial<GoogleFlowSession>): Promise<boolean> {
  await fs.mkdir(FLOW_DATA_DIR, { recursive: true });
  const current: GoogleFlowSession = {
    plan: "ultra",
    updatedAt: new Date().toISOString(),
    ...session,
  };
  await fs.writeFile(SESSION_FILE, JSON.stringify(current, null, 2), "utf8");
  return true;
}

export async function getGoogleFlowSession(): Promise<GoogleFlowSession | null> {
  try {
    const raw = await fs.readFile(SESSION_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function executeGoogleFlowPipeline(input: GenerateFlowVideoInput): Promise<FlowVideoOutput> {
  const session = await getGoogleFlowSession();
  if (!session?.bearerToken && !session?.cookies) {
    return {
      ok: false,
      captionAr: "",
      error: "Google Flow is not connected (no bearer token or cookies in .data/google-flow/session.json)",
    };
  }
  if (!input.destination) {
    return { ok: false, captionAr: "", error: "Google Flow destination is required" };
  }
  return {
    ok: false,
    captionAr: "",
    error: `Google Flow session is stored for ${input.destination}, but this server does not call the Flow video API, so no video was generated`,
  };
}
