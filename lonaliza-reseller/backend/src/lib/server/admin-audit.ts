import { promises as fs } from "fs";
import path from "path";
import { clientIp } from "@/lib/server/rate-limit";

const AUDIT_FILE = path.join(process.cwd(), ".data", "admin-audit.jsonl");

export type AdminAuditEvent = {
  at: string;
  action: string;
  ok: boolean;
  ip?: string;
  detail?: string;
};

function isServerlessHosting(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null;
}

function auditPath(): string {
  if (isServerlessHosting()) return path.join("/tmp", "alrayyan-admin-audit.jsonl");
  return AUDIT_FILE;
}

function sanitizeDetail(detail?: string): string | undefined {
  if (!detail) return undefined;
  return detail
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]")
    .replace(/(password|secret|token|key)\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .slice(0, 240);
}

export async function writeAdminAudit(event: AdminAuditEvent): Promise<void> {
  const line =
    JSON.stringify({
      at: event.at || new Date().toISOString(),
      action: event.action.slice(0, 80),
      ok: Boolean(event.ok),
      ...(event.ip ? { ip: event.ip.slice(0, 64) } : {}),
      ...(sanitizeDetail(event.detail)
        ? { detail: sanitizeDetail(event.detail) }
        : {}),
    }) + "\n";
  try {
    await fs.mkdir(path.dirname(auditPath()), { recursive: true });
    await fs.appendFile(auditPath(), line, { mode: 0o600 });
  } catch {
    /* never block the request on audit I/O */
  }
}

export async function auditFromRequest(
  req: Request,
  action: string,
  ok: boolean,
  detail?: string
): Promise<void> {
  await writeAdminAudit({
    at: new Date().toISOString(),
    action,
    ok,
    ip: clientIp(req),
    detail,
  });
}
