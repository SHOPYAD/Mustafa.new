import { catalogForPrompt } from "@/lib/automation/catalog";
import { SCOPE_SYSTEM_PROMPTS } from "@/lib/builder-agent/defaults";
import { getBuilderAgentPack } from "@/lib/server/builder-agent-store";
import { getGeminiPublicConfig } from "@/lib/server/gemini";
import { listEnabledMcpTools } from "@/lib/server/mcp/store";
import type { CopilotScope } from "@/lib/builder-agent/types";

export async function buildBuilderAgentSystemPrompt(
  scope: CopilotScope,
  mode: "chat" | "automation" = "chat"
): Promise<string> {
  const [pack, config] = await Promise.all([getBuilderAgentPack(scope), getGeminiPublicConfig()]);
  const skills = pack.skills
    .filter((item) => item.enabled)
    .map((item) => `### ${item.title}\n${item.markdown}`)
    .join("\n\n");
  const rules = pack.rules
    .filter((item) => item.enabled)
    .map((item) => `- ${item.title}: ${item.markdown}`)
    .join("\n");
  const memory = pack.memory
    .slice(0, 20)
    .map((item) => `- ${item.note}`)
    .join("\n");

  const deepEditor =
    scope === "editor"
      ? `
## Deep source editing (required)
/* Agent C: the agent SHOULD redesign structure when asked, not only tweak tokens. */
You can read and patch this project's homepage files (templates, CSS, JS, section registry).
For "أعد التصميم من الصفر" / structural / from-scratch work:
- resolveSectionSource → readProjectFile → applyProjectPatch (or createHomepageSection)
- Change layout, markup, typography, and components — not just color/padding tokens
- Always name every file you changed
Light tweaks (hide, one title, one color) may use JSON section tools.
Stay inside this site root. No secrets. No other vhosts. Confirm destructive overwrites/deletes.
`
      : "";

  if (mode === "automation") {
    const mcpTools = await listEnabledMcpTools();
    const mcpList = mcpTools.length
      ? mcpTools.map((tool) => `- ${tool.serverName}: ${tool.name}${tool.description ? ` — ${tool.description}` : ""}`).join("\n")
      : "_No MCP tools discovered. Operator can add servers in /admin/automation → MCP._";
    return `You are the Alrayyan AUTOMATION agent (وضع أتمتة).
The operator describes a recurring job in Arabic or English. You MUST call upsertAutomationJob (or setAutomationJobEnabled / runAutomationJobNow). Do not only chat.

Default timezone: Europe/Istanbul.
Messaging jobs (email, WhatsApp, Telegram, OTP, reminders, campaigns) REQUIRE consentSource. Only CRM / opt-in contacts. Never scrape emails.

## Job types
${catalogForPrompt()}

## Tools
- upsertAutomationJob — create/update from the brief
- listAutomationJobs
- setAutomationJobEnabled
- runAutomationJobNow (prefer dryRun=true first)
- listMcpTools

## Enabled MCP tools (read-only discovery)
${mcpList}

Do not write article bodies. Do not send WhatsApp/Telegram messages. Those belong to AUTO-CONTENT / AUTO-COMMS handlers.
`;
  }

  return `${SCOPE_SYSTEM_PROMPTS[scope]}

You are locked to the "${scope}" domain. Load only this pack. Refuse requests for other admin domains and tell the operator to open that panel.
Invoice tools cannot patch homepage sections. Editor tools cannot edit invoices, email, or catalog imports.
${deepEditor}
## Deep rules (must follow)
${rules || "- Follow brand and RTL rules. Stay in this domain."}

## Enabled skills
${skills || "_No extra skills enabled._"}

## Persistent memory (this scope only)
${memory || "_Empty._"}

## Extra admin writing notes
${config.systemInstructions || ""}
${config.writingRules || ""}
`;
}
