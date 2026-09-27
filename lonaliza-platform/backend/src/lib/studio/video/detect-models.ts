import type {
  DetectedStudioModels,
  GeminiListedModel,
} from "@/lib/studio/video/types";

const VEO_CANDIDATES = [
  "veo-3.1-fast-generate-preview",
  "veo-3.1-lite-generate-preview",
  "veo-3.1-generate-preview",
] as const;

const OMNI_CANDIDATES = ["gemini-omni-flash-preview"] as const;
const OMNI11_CANDIDATES = ["gemini-omni-1.1-flash"] as const;

let cache: { at: number; apiKeyTail: string; models: GeminiListedModel[] } | null =
  null;

export async function listGeminiModelsOnKey(
  apiKey: string
): Promise<GeminiListedModel[]> {
  const tail = apiKey.slice(-6);
  if (cache && cache.apiKeyTail === tail && Date.now() - cache.at < 10 * 60_000) {
    return cache.models;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}&pageSize=200`;
  const res = await fetch(url, { cache: "no-store" });
  const data = (await res.json()) as {
    models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(data.error?.message || `تعذّر قائمة النماذج (${res.status})`);
  }
  const models = (data.models || []).map((row) => ({
    name: String(row.name || "").replace(/^models\//, ""),
    methods: row.supportedGenerationMethods || [],
  }));
  cache = { at: Date.now(), apiKeyTail: tail, models };
  return models;
}

export async function detectStudioModels(
  apiKey: string
): Promise<DetectedStudioModels> {
  const listed = await listGeminiModelsOnKey(apiKey);
  const names = new Set(listed.map((row) => row.name));
  const image = listed
    .filter((row) => /image|banana/i.test(row.name))
    .map((row) => row.name);
  const veo = VEO_CANDIDATES.filter((id) => names.has(id));
  const omni = OMNI_CANDIDATES.filter((id) => names.has(id));
  const omni11 = OMNI11_CANDIDATES.filter((id) => names.has(id));
  const flow = listed
    .filter((row) => /flow/i.test(row.name))
    .map((row) => row.name);
  const notes: string[] = [];
  if (!flow.length) {
    notes.push(
      "لا يوجد نموذج باسم Flow على المفتاح — Flow واجهة منتج تستخدم Veo/Omni."
    );
  }
  if (!veo.length) notes.push("لا نماذج Veo ظاهرة على المفتاح.");
  if (!omni.length && !omni11.length) {
    notes.push("لا نماذج Omni ظاهرة على المفتاح.");
  }
  return {
    listed: listed.map((row) => row.name),
    image,
    veo,
    omni,
    omni11,
    flow,
    notes,
  };
}
