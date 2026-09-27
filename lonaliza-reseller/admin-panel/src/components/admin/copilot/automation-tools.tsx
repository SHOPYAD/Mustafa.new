"use client";

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { AUTOMATION_JOB_CATALOG } from "@/lib/automation/catalog";
import { isAutomationJobType } from "@/lib/automation/types";

async function adminJson(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    credentials: "same-origin",
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  return (await res.json()) as Record<string, unknown>;
}

/**
 * Copilot automation-mode tools: the agent CREATES/UPDATES jobs via APIs.
 */
export function AutomationCopilotTools() {
  useCopilotReadable({
    description:
      "Automation studio. Prefer proposeAutomation then submitForApproval. NEVER enable cron until approveAutomation. Messaging jobs require consentSource=crm_opt_in only. No scraped phone lists. autoPublish stays false. Studio: /admin/automation-studio.",
    value: {
      catalog: AUTOMATION_JOB_CATALOG.map((item) => ({
        type: item.type,
        titleAr: item.titleAr,
        consentRequired: item.consentRequired,
      })),
      timezone: "Europe/Istanbul",
      adminUrl: "/admin/automation-studio",
      approvalCommands: ["انشر", "أطلق", "ارفض", "عدّل"],
      states: ["draft", "awaiting_approval", "active", "rejected"],
    },
  });

  useCopilotAction({
    name: "listAutomationJobs",
    description: "List saved automation jobs and their schedules.",
    parameters: [],
    handler: async () => {
      const data = await adminJson("/api/admin/automation/jobs");
      if (!data.ok) return String(data.error || "تعذّر جلب الوظائف");
      return JSON.stringify(data.jobs || [], null, 2);
    },
  });

  useCopilotAction({
    name: "upsertAutomationJob",
    description:
      "Save a DISABLED job draft to the jobs store. Cron stays off unless enabled is explicitly true AND the operator already approved. Prefer proposeAutomation + submitForApproval.",
    parameters: [
      { name: "fromPrompt", type: "string", description: "Arabic or English job brief", required: true },
      { name: "name", type: "string" },
      { name: "type", type: "string", description: "Catalog job type" },
      { name: "cron", type: "string" },
      { name: "maxPerRun", type: "number" },
      { name: "maxPerDay", type: "number" },
      { name: "enabled", type: "boolean" },
      { name: "dryRun", type: "boolean" },
      { name: "consentSource", type: "string" },
      { name: "locales", type: "string", description: "Comma list ar,tr,en" },
    ],
    handler: async (args: Record<string, unknown>) => {
      const type = typeof args.type === "string" && isAutomationJobType(args.type) ? args.type : undefined;
      const locales =
        typeof args.locales === "string"
          ? args.locales.split(",").map((item) => item.trim()).filter(Boolean)
          : undefined;
      const data = await adminJson("/api/admin/automation/jobs", {
        method: "POST",
        body: JSON.stringify({
          fromPrompt: args.fromPrompt,
          name: args.name,
          type,
          cron: args.cron,
          maxPerRun: args.maxPerRun,
          maxPerDay: args.maxPerDay,
          enabled: false,
          dryRun: args.dryRun !== false,
          consentSource: args.consentSource,
          locales,
        }),
      });
      if (!data.ok) return String(data.error || "تعذّر حفظ الوظيفة");
      return `حُفظت معطّلة (بلا كرون). للاعتماد استخدم submitForApproval. ${JSON.stringify(data.job)}`;
    },
  });

  useCopilotAction({
    name: "proposeAutomation",
    description:
      "Build a COMPLETE job draft from an Arabic brief (catalog type, cron, Europe/Istanbul, accounts/budget placeholders, locales, dryRun, autoPublish=false). Does not enable cron.",
    parameters: [
      { name: "prompt", type: "string", required: true, description: "Arabic operator brief" },
      { name: "notes", type: "string", description: "Revision notes" },
      { name: "approvalId", type: "string", description: "Existing draft id to revise" },
    ],
    handler: async ({ prompt, notes, approvalId }: { prompt: string; notes?: string; approvalId?: string }) => {
      const data = await adminJson("/admin/automation-studio/api", {
        method: "POST",
        body: JSON.stringify({ action: "propose", prompt, notes, approvalId, actor: "copilot" }),
      });
      if (!data.ok) return String(data.error || "تعذّر بناء المسودة");
      return typeof data.reply === "string" ? data.reply : JSON.stringify(data.record || {});
    },
  });

  useCopilotAction({
    name: "submitForApproval",
    description: "Move a draft to awaiting_approval and send a Telegram review card. Cron stays disabled.",
    parameters: [{ name: "approvalId", type: "string", required: true }],
    handler: async ({ approvalId }: { approvalId: string }) => {
      const data = await adminJson("/admin/automation-studio/api", {
        method: "POST",
        body: JSON.stringify({ action: "submit", approvalId, actor: "copilot" }),
      });
      if (!data.ok) return String(data.error || "تعذّر الإرسال للاعتماد");
      return typeof data.reply === "string" ? data.reply : "بانتظار الموافقة";
    },
  });

  useCopilotAction({
    name: "approveAutomation",
    description: "Approve a pending draft and enable the cron job. autoPublish remains false.",
    parameters: [{ name: "approvalId", type: "string", required: true }],
    handler: async ({ approvalId }: { approvalId: string }) => {
      const data = await adminJson("/admin/automation-studio/api", {
        method: "POST",
        body: JSON.stringify({ action: "approve", approvalId, actor: "copilot" }),
      });
      if (!data.ok) return String(data.error || "تعذّر الاعتماد");
      return typeof data.reply === "string" ? data.reply : "تم الاعتماد";
    },
  });

  useCopilotAction({
    name: "rejectAutomation",
    description: "Reject a pending automation draft. No cron is enabled.",
    parameters: [
      { name: "approvalId", type: "string", required: true },
      { name: "reason", type: "string" },
    ],
    handler: async ({ approvalId, reason }: { approvalId: string; reason?: string }) => {
      const data = await adminJson("/admin/automation-studio/api", {
        method: "POST",
        body: JSON.stringify({ action: "reject", approvalId, reason, actor: "copilot" }),
      });
      if (!data.ok) return String(data.error || "تعذّر الرفض");
      return typeof data.reply === "string" ? data.reply : "رُفض الطلب";
    },
  });

  useCopilotAction({
    name: "setAutomationJobEnabled",
    description: "Enable or pause an existing automation job by id.",
    parameters: [
      { name: "id", type: "string", required: true },
      { name: "enabled", type: "boolean", required: true },
    ],
    handler: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const data = await adminJson(`/api/admin/automation/jobs/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled }),
      });
      return data.ok ? `enabled=${enabled}` : String(data.error || "فشل");
    },
  });

  useCopilotAction({
    name: "runAutomationJobNow",
    description: "Run a job immediately. Use dryRun=true to test without side effects.",
    parameters: [
      { name: "id", type: "string", required: true },
      { name: "dryRun", type: "boolean" },
    ],
    handler: async ({ id, dryRun }: { id: string; dryRun?: boolean }) => {
      const data = await adminJson(`/api/admin/automation/jobs/${encodeURIComponent(id)}/run`, {
        method: "POST",
        body: JSON.stringify({ dryRun: dryRun !== false }),
      });
      return data.ok ? JSON.stringify(data.result) : String(data.error || "فشل التشغيل");
    },
  });

  useCopilotAction({
    name: "listMcpTools",
    description: "List enabled MCP servers and discovered tool names (read-only).",
    parameters: [],
    handler: async () => {
      const data = await adminJson("/api/admin/mcp");
      if (!data.ok) return String(data.error || "تعذّر جلب MCP");
      return JSON.stringify({ servers: data.servers, tools: data.tools }, null, 2);
    },
  });

  useCopilotAction({
    name: "callMcpTool",
    description:
      "Invoke a connected MCP tool (builtin LIOTRIP packs or verified servers). Publishing still requires approved=true.",
    parameters: [
      { name: "serverId", type: "string", required: true },
      { name: "toolName", type: "string", required: true },
      { name: "argsJson", type: "string", description: "JSON object of tool arguments" },
    ],
    handler: async ({
      serverId,
      toolName,
      argsJson,
    }: {
      serverId: string;
      toolName: string;
      argsJson?: string;
    }) => {
      let args: Record<string, unknown> = {};
      if (argsJson) {
        try {
          args = JSON.parse(argsJson) as Record<string, unknown>;
        } catch {
          return "argsJson ليس JSON صالحاً";
        }
      }
      const data = await adminJson("/api/admin/mcp/call", {
        method: "POST",
        body: JSON.stringify({ serverId, tool: toolName, arguments: args }),
      });
      if (!data.ok) return String(data.error || "فشل استدعاء الأداة");
      return typeof data.result === "string" ? data.result : JSON.stringify(data.result);
    },
  });

  return null;
}
