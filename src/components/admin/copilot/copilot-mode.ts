export const COPILOT_MODES = ["chat", "automation"] as const;
export type CopilotMode = (typeof COPILOT_MODES)[number];

export function parseCopilotMode(value: unknown): CopilotMode {
  return value === "automation" ? "automation" : "chat";
}
