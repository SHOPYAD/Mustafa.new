import arabicReshaper from "arabic-reshaper";
import bidiFactory from "bidi-js";
import sharp from "sharp";
import { generateNanoBananaImage } from "@/lib/studio/creative/nano-banana";
import { studioNotifyTelegram } from "@/lib/studio/creative/notify";
import { writeStudioLastOutput } from "@/lib/studio/last-output";
import { siteOrigin } from "@/lib/automation/site-url";
import { queueStudioPublishApproval } from "@/lib/server/mcp/connectors/studio-handoff";

import {
  publicStudioUrl,
  sanitizeStudioFileName,
  writeStudioBuffer,
} from "@/lib/studio/creative/store";
import type {
  GenerateStudioImagesInput,
  GenerateStudioImagesResult,
  StudioImageArtifact,
} from "@/lib/studio/creative/types";
import { parseStudioLocale } from "@/lib/studio/planner/weekly-plan";
import {
  type StudioFormat,
  isStudioFormat,
} from "@/lib/studio/planner/types";

const bidi = bidiFactory();

const SLIDE_SIZE: Record<StudioFormat, { w: number; h: number; ratio: "9:16" | "4:5" | "1:1" }> = {
  reel: { w: 1080, h: 1920, ratio: "9:16" },
  story: { w: 1080, h: 1920, ratio: "9:16" },
  slide: { w: 1080, h: 1350, ratio: "4:5" },
};

function parseFormat(raw: unknown): StudioFormat {
  return typeof raw === "string" && isStudioFormat(raw) ? raw : "slide";
}

function parseCount(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 1;
  return Math.min(4, Math.max(1, Math.round(n)));
}

function shapeRtl(text: string): string {
  const converted = arabicReshaper.convertArabic(text);
  const levels = bidi.getEmbeddingLevels(converted, "rtl");
  return bidi.getReorderedString(converted, levels);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function defaultCta(locale: "ar" | "en" | "tr"): string {
  switch (locale) {
    case "ar":
      return "احجز مع لوناليزا";
    case "tr":
      return "Lonaliza ile rezervasyon";
    case "en":
    default:
      return "Book with Lonaliza";
  }
}

function overlaySvg(input: {
  width: number;
  height: number;
  title: string;
  destination: string;
  cta: string;
  locale: "ar" | "en" | "tr";
}): Buffer {
  const rtl = input.locale === "ar";
  const title = escapeXml(rtl ? shapeRtl(input.title) : input.title);
  const dest = escapeXml(rtl ? shapeRtl(input.destination) : input.destination);
  const cta = escapeXml(rtl ? shapeRtl(input.cta) : input.cta);
  const brand = rtl ? shapeRtl("لوناليزا للسياحة والسفر") : "ALRAYYAN TOURISM";
  const dir = rtl ? "rtl" : "ltr";
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${input.width}" height="${input.height}" viewBox="0 0 ${input.width} ${input.height}">
  <defs>
    <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0.78"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bot" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0"/>
      <stop offset="45%" stop-color="#0f172a" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#1e3a2f" stop-opacity="0.92"/>
    </linearGradient>
  </defs>
  <rect width="${input.width}" height="280" fill="url(#top)"/>
  <rect y="${input.height - 520}" width="${input.width}" height="520" fill="url(#bot)"/>
  <rect x="48" y="48" width="${input.width - 96}" height="6" fill="#c8922a"/>
  <text x="64" y="120" fill="#f4e4b4" font-family="Georgia, Times, serif" font-size="34" letter-spacing="3">${escapeXml(brand)}</text>
  <text x="64" y="${input.height - 280}" fill="#ffffff" font-family="Tahoma, Arial, sans-serif" font-size="56" font-weight="700" direction="${dir}">${title}</text>
  <text x="64" y="${input.height - 190}" fill="#f4e4b4" font-family="Tahoma, Arial, sans-serif" font-size="36" direction="${dir}">${dest}</text>
  <rect x="64" y="${input.height - 140}" width="${Math.min(920, input.width - 128)}" height="72" rx="16" fill="#c8922a"/>
  <text x="88" y="${input.height - 92}" fill="#0f172a" font-family="Tahoma, Arial, sans-serif" font-size="28" font-weight="700" direction="${dir}">${cta}</text>
</svg>`;
  return Buffer.from(svg);
}

export async function brandSlideBuffer(input: {
  photo: Buffer;
  title: string;
  destination: string;
  cta: string;
  locale: "ar" | "en" | "tr";
  format: StudioFormat;
}): Promise<Buffer> {
  const size = SLIDE_SIZE[input.format];
  const overlay = overlaySvg({
    width: size.w,
    height: size.h,
    title: input.title.slice(0, 72),
    destination: input.destination.slice(0, 48),
    cta: input.cta.slice(0, 64),
    locale: input.locale,
  });
  return sharp(input.photo)
    .rotate()
    .resize(size.w, size.h, { fit: "cover", position: "centre" })
    .composite([{ input: overlay, top: 0, left: 0 }])
    .webp({ quality: 86 })
    .toBuffer();
}

function visualPrompt(input: {
  prompt?: string;
  title: string;
  destination: string;
  locale: "ar" | "en" | "tr";
  index: number;
}): string {
  const scene = input.prompt?.trim() || `${input.destination}: ${input.title}`;
  return [
    "Professional travel photography for Alrayyan Tourism (UAE agency, Turkey specialist).",
    "Photorealistic, no logos, no watermarks, no text overlay, no letters.",
    `Destination: ${input.destination}. Scene: ${scene}.`,
    input.index === 0
      ? "Hero wide shot, golden-hour light, inviting for families from the Gulf."
      : `Alternate angle ${input.index + 1}, cinematic, clean composition.`,
    "Vertical social crop. Premium editorial quality.",
  ].join(" ");
}

export async function generateBrandedStudioImages(
  input: GenerateStudioImagesInput
): Promise<GenerateStudioImagesResult> {
  const locale = parseStudioLocale(input.locale);
  const format = parseFormat(input.format);
  const count = parseCount(input.count);
  const title =
    (typeof input.title === "string" && input.title.trim()) ||
    (locale === "en" ? "Turkey this week" : locale === "tr" ? "Bu hafta Türkiye" : "تركيا هذا الأسبوع");
  const destination =
    (typeof input.destination === "string" && input.destination.trim()) ||
    (locale === "en" ? "Turkey" : locale === "tr" ? "Türkiye" : "تركيا");
  const cta =
    (typeof input.cta === "string" && input.cta.trim()) || defaultCta(locale);
  const aspect = SLIDE_SIZE[format].ratio;

  const artifacts: StudioImageArtifact[] = [];
  let usedModel = "";
  let triedModels: string[] = [];

  for (let i = 0; i < count; i += 1) {
    const { image, tried } = await generateNanoBananaImage({
      prompt: visualPrompt({
        prompt: input.prompt,
        title,
        destination,
        locale,
        index: i,
      }),
      aspectRatio: aspect,
    });
    usedModel = image.model;
    triedModels = tried;
    const branded = await brandSlideBuffer({
      photo: image.buffer,
      title,
      destination,
      cta,
      locale,
      format,
    });
    const rawName = sanitizeStudioFileName(`${destination}-nano`, ".png");
    const rawSaved = await writeStudioBuffer({
      folder: "images",
      fileName: rawName,
      buffer: image.buffer,
    });
    const slideName = sanitizeStudioFileName(`${destination}-slide`, ".webp");
    const slideSaved = await writeStudioBuffer({
      folder: "slides",
      fileName: slideName,
      buffer: branded,
    });
    const rawArtifact: StudioImageArtifact = {
      id: rawSaved.fileName.replace(/\.[^.]+$/, ""),
      kind: "photo",
      format,
      model: image.model,
      title,
      destination,
      cta,
      locale,
      fileName: rawSaved.fileName,
      relativePath: rawSaved.relativePath,
      absolutePath: rawSaved.absolutePath,
      url: publicStudioUrl("creative", rawSaved.relativePath),
      mimeType: "image/png",
      bytes: rawSaved.bytes,
    };
    const slideArtifact: StudioImageArtifact = {
      id: slideSaved.fileName.replace(/\.[^.]+$/, ""),
      kind: "slide",
      format,
      model: image.model,
      title,
      destination,
      cta,
      locale,
      fileName: slideSaved.fileName,
      relativePath: slideSaved.relativePath,
      absolutePath: slideSaved.absolutePath,
      url: publicStudioUrl("creative", slideSaved.relativePath),
      mimeType: "image/webp",
      bytes: slideSaved.bytes,
    };
    artifacts.push(rawArtifact, slideArtifact);
  }

  const origin = siteOrigin();
  const slideArts = artifacts.filter((row) => row.kind === "slide");
  const notifyPaths = (slideArts.length ? slideArts : artifacts).map((row) => row.absolutePath);
  const notifyUrls = (slideArts.length ? slideArts : artifacts).map(
    (row) => `${origin}${row.url.startsWith("/") ? row.url : `/${row.url}`}`
  );
  await writeStudioLastOutput({
    caption: title,
    imagePaths: notifyPaths,
    imageUrls: notifyUrls,
    pendingPublish: true,
  });
  const notify = await studioNotifyTelegram({
    title: `شرائح لوناليزا · ${title}`,
    paths: notifyPaths,
    urls: notifyUrls,
  });
  await queueStudioPublishApproval(title);

  return {
    ok: true,
    model: usedModel,
    triedModels,
    artifacts,
    notify,
  };
}
