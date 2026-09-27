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

// Seed default institutional memory if not present
function defaultEpisodicMemories(): SwarmEpisodicMemoryEntry[] {
  const now = new Date().toISOString();
  return [
    {
      id: "mem_trabzon_family_weekend",
      timestamp: now,
      category: "campaign_outcome",
      agentId: "sales",
      summaryAr: "حملات باقات طرابزون العائلية عبر واتساب تحقق أعلى نسبة إغلاق (38%) عند استهداف رحلات الجمعة والسبت مع سيارة VIP خاصة.",
      keyInsightsAr: [
        "العملاء الخليجيون يفضلون سيارة مرسيدس فيتو VIP خاصة مع سائق يتحدث العربية.",
        "تقديم باقة بـ 3 مستويات ميزانية يرفع سرعة اتخاذ القرار خلال 4 ساعات.",
      ],
      metrics: { roiGain: "+42%", successRate: 0.38, marginPercent: 24 },
      tags: ["trabzon", "sales", "whatsapp", "family_tours", "vip"],
      embedding: computeDeterministicEmbedding("حملات باقات طرابزون العائلية عبر واتساب سيارة فيتو VIP"),
    },
    {
      id: "mem_b2b_cloud_pro_discount",
      timestamp: now,
      category: "pricing_strategy",
      agentId: "b2b_landing",
      summaryAr: "منح المكاتب السياحية خصم ترحيبي 10% على باقة Pro السحابية يرفع نسبة التحويل التجاري بنسبة 3.2 أضعاف.",
      keyInsightsAr: [
        "التركيز على ميزة تذاكر الطيران المباشرة بدون وسيط في العرض هو العامل الحاسم في الإغلاق.",
        "التواصل المباشر عبر واتساب المخصص للشركات أسرع 5 مرات من البريد الإلكتروني.",
      ],
      metrics: { roiGain: "3.2x", successRate: 0.45, marginPercent: 40 },
      tags: ["b2b", "pro_cloud", "pricing", "travel_agencies"],
      embedding: computeDeterministicEmbedding("منح المكاتب السياحية خصم ترحيبي باقة Pro السحابية شركات"),
    },
    {
      id: "mem_site_advisor_itinerary_formula",
      timestamp: now,
      category: "tour_itinerary",
      agentId: "site_advisor",
      summaryAr: "صيغة الجداول الأيقونية بـ 3-4 محطات يومية في محيط جغرافي متقارب تمنع إجهاد العميل وتحقق تقييم 5 نجوم.",
      keyInsightsAr: [
        "دمج مقهى تاريخي صباحاً، معلم أيقوني ظهراً، وتجربة طعام محلية أصيلة مساءً يخلق تجربة متكاملة.",
        "حصر الجولات في نطاق 25 كم يمنع شكاوى الاختناقات المرورية في إسطنبول.",
      ],
      metrics: { successRate: 0.96, marginPercent: 18 },
      tags: ["itinerary", "site_advisor", "istanbul", "pacing"],
      embedding: computeDeterministicEmbedding("صيغة الجداول الأيقونية 3-4 محطات جولات سياحية إسطنبول"),
    },
    {
      id: "mem_ads_meta_vs_google",
      timestamp: now,
      category: "campaign_outcome",
      agentId: "ads",
      summaryAr: "إعلانات Meta Reels تحقق أعلى ROAS لحجوزات الشمال التركي مقارنة بـ Google Search بنسبة 3.8x مقابل 2.4x.",
      keyInsightsAr: [
        "مقاطع الفيديو القصيرة للطبيعة والبحيرات تحقق تفاعلاً مضاعفاً.",
        "إعادة استهداف زوار الموقع خلال 48 ساعة يقلل تكلفة الاستحواذ (CAC) بنسبة 35%.",
      ],
      metrics: { roiGain: "3.8x", successRate: 0.28, marginPercent: 32 },
      tags: ["meta_ads", "reels", "google_ads", "roas"],
      embedding: computeDeterministicEmbedding("إعلانات Meta Reels الشمال التركي ريلز فيديو بحيرات حملات ممولة"),
    },
    {
      id: "mem_financial_audit_safeguard",
      timestamp: now,
      category: "adversarial_audit",
      agentId: "lead_scout",
      summaryAr: "تدقيق هوامش الربح: أي عرض ترويجي يقل هامش ربحه الصافي عن 14% يتم رفضه آلياً وإعادته لإعادة تسعير الفنادق والسيارات.",
      keyInsightsAr: [
        "حساب تكلفة الدفع الإلكتروني (2.5%) ضمن التسعير الإجمالي يمنع التآكل المالي.",
        "مراجعة أسعار غرف الفنادق في مواسم الذروة قبل اعتماد أي حملة مبيعات.",
      ],
      metrics: { successRate: 1.0, marginPercent: 15 },
      tags: ["audit", "financial", "margin", "risk_control"],
      embedding: computeDeterministicEmbedding("تدقيق هوامش الربح المالي أي عرض يقل عن 14 بالمئة رفض وإعادة تسعير"),
    },
  ];
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
    return Array.isArray(data) ? data : defaultEpisodicMemories();
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
