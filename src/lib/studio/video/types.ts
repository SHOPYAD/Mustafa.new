export const VIDEO_FAMILIES = ["veo", "omni", "omni11", "storyboard"] as const;
export type VideoFamily = (typeof VIDEO_FAMILIES)[number];

export type GeminiListedModel = {
  name: string;
  methods: string[];
};

export type DetectedStudioModels = {
  listed: string[];
  image: string[];
  veo: string[];
  omni: string[];
  omni11: string[];
  flow: string[];
  notes: string[];
};

export type StudioVideoAttempt = {
  family: VideoFamily | "flow";
  model: string;
  ok: boolean;
  detail: string;
};

export type StudioVideoArtifact = {
  fileName: string;
  relativePath: string;
  absolutePath: string;
  url: string;
  mimeType: string;
  bytes: number;
  durationSeconds: number;
};

export type GenerateStudioVideoInput = {
  prompt: string;
  durationMinutes?: unknown;
  locale?: unknown;
  loudnorm?: unknown;
};

export type GenerateStudioVideoResult = {
  ok: boolean;
  prompt: string;
  locale: string;
  requestedMinutes: number;
  targetSeconds: number;
  durationEnforced: boolean;
  engine: VideoFamily;
  model: string;
  attempts: StudioVideoAttempt[];
  frames: Array<{ relativePath: string; url: string; absolutePath: string }>;
  video: StudioVideoArtifact | null;
  ffmpeg: { available: boolean; path: string | null };
  notify: {
    channel: "paths-only";
    message: string;
    paths: string[];
    urls: string[];
  };
  error?: string;
};

export type EditStudioVideoInput = {
  inputPath?: string;
  name?: string;
  durationMinutes: unknown;
  loudnorm?: unknown;
};
