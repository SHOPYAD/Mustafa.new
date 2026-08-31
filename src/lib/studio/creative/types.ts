import type { StudioFormat, StudioLocale } from "@/lib/studio/planner/types";

export type StudioImageKind = "photo" | "slide";

export type StudioImageArtifact = {
  id: string;
  kind: StudioImageKind;
  format: StudioFormat;
  model: string;
  title: string;
  destination: string;
  cta: string;
  locale: StudioLocale;
  fileName: string;
  relativePath: string;
  absolutePath: string;
  url: string;
  mimeType: string;
  bytes: number;
};

export type GenerateStudioImagesInput = {
  prompt?: string;
  title?: string;
  destination?: string;
  cta?: string;
  locale?: unknown;
  format?: unknown;
  count?: unknown;
};

export type GenerateStudioImagesResult = {
  ok: true;
  model: string;
  triedModels: string[];
  artifacts: StudioImageArtifact[];
  notify: StudioNotifyPayload;
};

export type StudioNotifyPayload = {
  channel: "paths-only";
  message: string;
  paths: string[];
  urls: string[];
};
