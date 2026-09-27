export type AdvisorAttachment = {
  name: string;
  mimeType: string;
  dataBase64: string;
};

export type AdvisorAudio = {
  base64: string;
  mime: string;
};

let attachments: AdvisorAttachment[] = [];
let audio: AdvisorAudio | null = null;
let plannerMode = false;

export function setAdvisorPlannerMode(on: boolean) {
  plannerMode = on;
}

export function isAdvisorPlannerMode() {
  return plannerMode;
}

export function setAdvisorExtras(next: {
  attachments?: AdvisorAttachment[];
  audio?: AdvisorAudio | null;
}) {
  if (next.attachments) attachments = next.attachments;
  if (next.audio !== undefined) audio = next.audio;
}

export function takeAdvisorExtras(): {
  attachments: AdvisorAttachment[];
  audio: AdvisorAudio | null;
  plannerMode: boolean;
} {
  const out = { attachments, audio, plannerMode };
  attachments = [];
  audio = null;
  return out;
}
