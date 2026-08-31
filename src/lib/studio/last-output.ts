import { promises as fs } from "fs";
import path from "path";

export type StudioLastOutput = {
  caption: string;
  imagePaths: string[];
  imageUrls: string[];
  videoPaths: string[];
  videoUrls: string[];
  platforms: string[];
  updatedAt: string;
};

const FILE = path.join(process.cwd(), ".data", "uploads", "studio", "last-output.json");

export async function readStudioLastOutput(): Promise<StudioLastOutput | null> {
  try {
    const raw = JSON.parse(await fs.readFile(FILE, "utf8")) as StudioLastOutput;
    if (!raw || typeof raw !== "object") return null;
    return raw;
  } catch {
    return null;
  }
}

export async function writeStudioLastOutput(
  patch: Partial<StudioLastOutput>
): Promise<StudioLastOutput> {
  const prev = (await readStudioLastOutput()) || {
    caption: "",
    imagePaths: [],
    imageUrls: [],
    videoPaths: [],
    videoUrls: [],
    platforms: ["facebook", "instagram"],
    updatedAt: new Date().toISOString(),
  };
  const next: StudioLastOutput = {
    ...prev,
    ...patch,
    imagePaths: patch.imagePaths ?? prev.imagePaths,
    imageUrls: patch.imageUrls ?? prev.imageUrls,
    videoPaths: patch.videoPaths ?? prev.videoPaths,
    videoUrls: patch.videoUrls ?? prev.videoUrls,
    platforms: patch.platforms ?? prev.platforms,
    updatedAt: new Date().toISOString(),
  };
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(next, null, 2), { mode: 0o600 });
  return next;
}
