import type { CapabilityRisk } from "./registry";

export interface CapabilityResponse {
  ok: boolean;
  status: number;
  capabilityId: string;
  risk: CapabilityRisk;
  dryRun: boolean;
  requiresApproval: boolean;
  approvalRef?: string;
  preview?: { summaryAr: string; before?: unknown; after?: unknown; effects: string[] };
  data?: unknown;
  error?: string;
  auditId?: string;
  replayed?: boolean;
}

let studioSession: string | undefined;
let studioAutoExecute = false;

export function setStudioContext(sessionId: string | undefined, autoExecute: boolean) {
  studioSession = sessionId;
  studioAutoExecute = autoExecute;
}

export function newIdempotencyKey() {
  return `idem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function callCapability(body: {
  capabilityId: string;
  input: Record<string, unknown>;
  dryRun: boolean;
  idempotencyKey?: string;
  approvalRef?: string;
  autoExecute?: boolean;
  sessionId?: string;
}): Promise<CapabilityResponse> {
  const res = await fetch("/api/admin/studio/capabilities/execute", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sessionId: studioSession, autoExecute: studioAutoExecute, ...body }),
  });
  const json = (await res.json().catch(() => null)) as CapabilityResponse | null;
  return json ?? { ok: false, status: res.status, capabilityId: body.capabilityId, risk: "low", dryRun: body.dryRun, requiresApproval: false, error: `http_${res.status}` };
}
