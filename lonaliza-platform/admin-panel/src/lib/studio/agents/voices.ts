export const AGENT_VOICES = [
  "ar-SA-HamedNeural",
  "ar-SA-ZariyahNeural",
  "ar-EG-ShakirNeural",
  "ar-EG-SalmaNeural",
  "ar-AE-HamdanNeural",
  "ar-AE-FatimaNeural",
  "ar-KW-FahedNeural",
  "ar-QA-AmalNeural",
  "ar-BH-AliNeural",
] as const;

export function voiceForAgent(agentId: string, index = 0) {
  if (!agentId || agentId === "supervisor" || agentId === "panel_operator") return AGENT_VOICES[0];
  return AGENT_VOICES[(Math.max(0, index) % (AGENT_VOICES.length - 1)) + 1];
}
