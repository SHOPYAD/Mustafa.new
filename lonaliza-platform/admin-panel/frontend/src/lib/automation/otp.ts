import { createHash, randomBytes, randomInt, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import {
  isOtpPurpose,
  type OtpChannel,
  type OtpPurpose,
  type VerifyOtpResult,
} from "@/lib/automation/types";

export const DEFAULT_OTP_TTL_MS = 10 * 60 * 1000;
export const DEFAULT_OTP_LENGTH = 6;
export const DEFAULT_OTP_MAX_ATTEMPTS = 5;

export type OtpRecord = {
  id: string;
  to: string;
  purpose: OtpPurpose;
  channel: OtpChannel;
  hash: string;
  expiresAt: number;
  attempts: number;
  consumed: boolean;
  createdAt: number;
};

export type OtpRepository = {
  get(to: string, purpose: OtpPurpose): Promise<OtpRecord | null>;
  put(record: OtpRecord): Promise<void>;
  delete(to: string, purpose: OtpPurpose): Promise<void>;
};

export function normalizeOtpTarget(to: string): string {
  const raw = String(to || "").trim().toLowerCase();
  if (raw.includes("@")) return raw;
  return raw.replace(/\D/g, "");
}

export function generateOtpCode(length = DEFAULT_OTP_LENGTH): string {
  const digits = Math.max(4, Math.min(8, Math.round(length)));
  const max = 10 ** digits;
  return String(randomInt(0, max)).padStart(digits, "0");
}

export function hashOtp(code: string, pepper: string, to: string, purpose: OtpPurpose): string {
  return createHash("sha256")
    .update(`${pepper}:${normalizeOtpTarget(to)}:${purpose}:${String(code || "").trim()}`)
    .digest("hex");
}

export function hashesMatch(left: string, right: string): boolean {
  const a = Buffer.from(String(left || ""), "utf8");
  const b = Buffer.from(String(right || ""), "utf8");
  if (a.length !== b.length) {
    const dummy = createHash("sha256").update(a).digest();
    timingSafeEqual(dummy, dummy);
    return false;
  }
  return timingSafeEqual(a, b);
}

export function otpRecordKey(to: string, purpose: OtpPurpose): string {
  return `${normalizeOtpTarget(to)}:${purpose}`;
}

export function issueOtpRecord(input: {
  to: string;
  purpose: OtpPurpose;
  channel: OtpChannel;
  pepper: string;
  ttlMs?: number;
  code?: string;
  now?: number;
}): { record: OtpRecord; code: string } {
  const now = input.now ?? Date.now();
  const code = input.code || generateOtpCode();
  const to = normalizeOtpTarget(input.to);
  return {
    code,
    record: {
      id: `otp_${randomBytes(6).toString("hex")}`,
      to,
      purpose: input.purpose,
      channel: input.channel,
      hash: hashOtp(code, input.pepper, to, input.purpose),
      expiresAt: now + (input.ttlMs ?? DEFAULT_OTP_TTL_MS),
      attempts: 0,
      consumed: false,
      createdAt: now,
    },
  };
}

export function evaluateOtp(
  record: OtpRecord | null,
  input: { to: string; code: string; purpose: OtpPurpose; pepper: string; now?: number }
): { ok: true; next: OtpRecord } | { ok: false; error: string; next: OtpRecord | null } {
  const now = input.now ?? Date.now();
  if (!record) return { ok: false, error: "not_found", next: null };
  if (record.purpose !== input.purpose) return { ok: false, error: "purpose_mismatch", next: record };
  if (record.consumed) return { ok: false, error: "consumed", next: record };
  if (now > record.expiresAt) return { ok: false, error: "expired", next: record };
  if (record.attempts >= DEFAULT_OTP_MAX_ATTEMPTS) {
    return { ok: false, error: "locked", next: record };
  }
  const next: OtpRecord = { ...record, attempts: record.attempts + 1 };
  const expected = hashOtp(input.code, input.pepper, input.to, input.purpose);
  if (!hashesMatch(record.hash, expected)) {
    return { ok: false, error: "invalid", next };
  }
  return { ok: true, next: { ...next, consumed: true } };
}

export class MemoryOtpStore implements OtpRepository {
  private readonly rows = new Map<string, OtpRecord>();

  async get(to: string, purpose: OtpPurpose): Promise<OtpRecord | null> {
    return this.rows.get(otpRecordKey(to, purpose)) || null;
  }

  async put(record: OtpRecord): Promise<void> {
    this.rows.set(otpRecordKey(record.to, record.purpose), record);
  }

  async delete(to: string, purpose: OtpPurpose): Promise<void> {
    this.rows.delete(otpRecordKey(to, purpose));
  }
}

function storeFile(): string {
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null) {
    return path.join("/tmp", "lonaliza-otp-store.json");
  }
  return path.join(process.cwd(), ".data", "otp-store.json");
}

async function readFileStore(): Promise<Record<string, OtpRecord>> {
  try {
    const raw = JSON.parse(await fs.readFile(storeFile(), "utf8")) as Record<string, unknown>;
    const out: Record<string, OtpRecord> = {};
    for (const [key, value] of Object.entries(raw)) {
      const rec = value && typeof value === "object" ? (value as OtpRecord) : null;
      if (!rec?.id || !rec.to || !isOtpPurpose(rec.purpose) || !rec.hash) continue;
      out[key] = rec;
    }
    return out;
  } catch {
    return {};
  }
}

let fileWriteChain: Promise<void> = Promise.resolve();

export const fileOtpStore: OtpRepository = {
  async get(to, purpose) {
    const rows = await readFileStore();
    return rows[otpRecordKey(to, purpose)] || null;
  },
  async put(record) {
    fileWriteChain = fileWriteChain.then(async () => {
      const rows = await readFileStore();
      rows[otpRecordKey(record.to, record.purpose)] = record;
      await fs.mkdir(path.dirname(storeFile()), { recursive: true });
      await fs.writeFile(storeFile(), JSON.stringify(rows, null, 2), { mode: 0o600 });
    });
    await fileWriteChain;
  },
  async delete(to, purpose) {
    fileWriteChain = fileWriteChain.then(async () => {
      const rows = await readFileStore();
      delete rows[otpRecordKey(to, purpose)];
      await fs.mkdir(path.dirname(storeFile()), { recursive: true });
      await fs.writeFile(storeFile(), JSON.stringify(rows, null, 2), { mode: 0o600 });
    });
    await fileWriteChain;
  },
};

export async function persistIssuedOtp(
  store: OtpRepository,
  input: Parameters<typeof issueOtpRecord>[0]
): Promise<{ record: OtpRecord; code: string }> {
  const issued = issueOtpRecord(input);
  await store.put(issued.record);
  return issued;
}

export async function verifyStoredOtp(
  store: OtpRepository,
  input: { to: string; code: string; purpose: OtpPurpose; pepper: string; now?: number }
): Promise<VerifyOtpResult> {
  const to = normalizeOtpTarget(input.to);
  const current = await store.get(to, input.purpose);
  const result = evaluateOtp(current, { ...input, to });
  if (result.next) await store.put(result.next);
  if (result.ok) {
    return { ok: true, purpose: input.purpose, to };
  }
  return { ok: false, purpose: input.purpose, to, error: result.error };
}
