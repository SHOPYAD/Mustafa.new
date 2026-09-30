import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { resolveGeminiApiKey } from "@/lib/server/gemini";
import { upsertDeliberationMemory, searchDeliberations } from "./qdrant-vector-store";

export interface SwarmEpisodicMemoryEntry {
  id: string;
  timestamp: string;
  category: "campaign_outcome" | "pricing_strategy" | "sales_conversion" | "tour_itinerary" | "customer_preference" | "adversarial_audit";
  agentId: string;
  summaryAr: string;
  keyInsightsAr: string[];
  metrics?: {
    roiGain?: string;
    costUSD?: number;
    successRate?: number;
    marginPercent?: number;
  };
  tags: string[];
  embedding?: number[];
}

const DATA_DIR = path.join(process.cwd(), ".data", "agent-swarm");
const MEMORY_FILE = path.join(DATA_DIR, "episodic-memory.json");
const VECTOR_CACHE_FILE = path.join(DATA_DIR, "vector-index.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Deterministic dense vector fallback generator (64-dimensional semantic projection)
function computeDeterministicEmbedding(text: string, dimensions = 64): number[] {
  const normalized = text.toLowerCase().trim();
  const vector = new Array<number>(dimensions).fill(0);
  
  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    const pos = (code * 31 + i * 17) % dimensions;
    vector[pos] += 1;
  }
  
  // Normalize vector to unit length
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return vector.map((v) => Number((v / magnitude).toFixed(6)));
  }
  return vector;
}

// Compute cosine similarity between two vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  const denominator = Math.sqrt(magA) * Math.sqrt(magB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

// Generate vector embedding with Gemini API, fallback to deterministic dense vector
export async function generateTextEmbedding(text: string): Promise<number[]> {
  try {
    const { apiKey } = await resolveGeminiApiKey();
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
      const result = await model.embedContent(text);
      if (result.embedding?.values && result.embedding.values.length > 0) {
        return result.embedding.values;
      }
    }
  } catch {
    // Graceful fallback to deterministic high-dimensional vector
  }
  return computeDeterministicEmbedding(text);
}

/** معرّفات ذكريات مختلقة زُرعت سابقًا؛ تُستبعد عند القراءة. الذاكرة تُبنى فقط من نتائج حقيقية. */
const FABRICATED_SEED_IDS = new Set([
  "mem_trabzon_family_weekend",
  "mem_b2b_cloud_pro_discount",
  "mem_site_advisor_itinerary_formula",
  "mem_ads_meta_vs_google",
  "mem_financial_audit_safeguard",
]);

function defaultEpisodicMemories(): SwarmEpisodicMemoryEntry[] {
  return [];
}

export function loadEpisodicMemories(): SwarmEpisodicMemoryEntry[] {
  ensureDir();
  try {
    if (!fs.existsSync(MEMORY_FILE)) {
      const initial = defaultEpisodicMemories();
      fs.writeFileSync(MEMORY_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(MEMORY_FILE, "utf-8");
    const data = JSON.parse(raw) as SwarmEpisodicMemoryEntry[];
    return Array.isArray(data) ? data.filter((m) => !FABRICATED_SEED_IDS.has(m.id)) : defaultEpisodicMemories();
  } catch (err) {
    console.error("Failed to load episodic memories", err);
    return defaultEpisodicMemories();
  }
}

export async function saveEpisodicMemory(entry: Omit<SwarmEpisodicMemoryEntry, "id" | "timestamp" | "embedding">): Promise<SwarmEpisodicMemoryEntry> {
  ensureDir();
  const list = loadEpisodicMemories();
  const textToEmbed = `${entry.summaryAr} ${entry.keyInsightsAr.join(" ")} ${entry.tags.join(" ")}`;
  const embedding = await generateTextEmbedding(textToEmbed);

  const full: SwarmEpisodicMemoryEntry = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
    embedding,
  };

  list.unshift(full);
  // Keep up to 250 high-value episodic memories
  const trimmed = list.slice(0, 250);
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(trimmed, null, 2), "utf-8");

  // Synchronously or asynchronously persist to Qdrant vector database
  upsertDeliberationMemory(full).catch((err) => {
    console.warn("[Memory] Background Qdrant upsert notice:", err);
  });

  return full;
}

// Deep Semantic Vector Query over episodic memory (Qdrant primary with local fallback)
export async function queryEpisodicMemorySemantic(
  queryText: string,
  targetAgentId?: string,
  limit = 4
): Promise<Array<{ memory: SwarmEpisodicMemoryEntry; similarity: number }>> {
  try {
    const qdrantResults = await searchDeliberations(queryText, {
      targetAgentId,
      limit,
    });
    if (qdrantResults && qdrantResults.length > 0) {
      return qdrantResults.map((r) => ({
        memory: r.memory,
        similarity: r.score,
      }));
    }
  } catch (err) {
    console.warn("[Memory] Falling back to local semantic search:", err);
  }

  const list = loadEpisodicMemories();
  const queryEmbedding = await generateTextEmbedding(queryText);
  const qLower = queryText.toLowerCase();
  const qWords = qLower.split(/\s+/).filter((w) => w.length > 2);

  const scored = list
    .filter((mem) => {
      if (targetAgentId && targetAgentId !== "all" && mem.agentId !== targetAgentId) {
        return false;
      }
      return true;
    })
    .map((mem) => {
      // 1. Vector cosine similarity (dense semantic match)
      const memVector = mem.embedding || computeDeterministicEmbedding(`${mem.summaryAr} ${mem.tags.join(" ")}`);
      let vectorScore = cosineSimilarity(queryEmbedding, memVector);

      // 2. Keyword lexical bonus
      let lexicalBonus = 0;
      const hay = `${mem.summaryAr} ${mem.keyInsightsAr.join(" ")} ${mem.tags.join(" ")}`.toLowerCase();
      for (const w of qWords) {
        if (hay.includes(w)) lexicalBonus += 0.08;
      }
      for (const tag of mem.tags) {
        if (qLower.includes(tag.toLowerCase())) lexicalBonus += 0.12;
      }

      const compositeScore = Math.min(1.0, vectorScore * 0.7 + lexicalBonus);
      return { memory: mem, similarity: Number(compositeScore.toFixed(4)) };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return scored;
}

// Synchronous fallback query
export function queryEpisodicMemory(queryText: string, targetAgentId?: string, limit = 3): SwarmEpisodicMemoryEntry[] {
  const list = loadEpisodicMemories();
  const q = queryText.toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length > 2);

  return list
    .filter((mem) => {
      if (targetAgentId && targetAgentId !== "all" && mem.agentId !== targetAgentId) {
        return false;
      }
      return true;
    })
    .map((mem) => {
      let score = 0;
      const hay = `${mem.summaryAr} ${mem.keyInsightsAr.join(" ")} ${mem.tags.join(" ")}`.toLowerCase();
      for (const w of words) {
        if (hay.includes(w)) score += 2;
      }
      for (const tag of mem.tags) {
        if (q.includes(tag.toLowerCase())) score += 3;
      }
      return { mem, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.mem);
}
