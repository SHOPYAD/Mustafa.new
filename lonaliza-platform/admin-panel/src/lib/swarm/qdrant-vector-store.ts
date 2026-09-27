/**
 * Qdrant Enterprise Vector Store for Lonaliza Autonomous Swarm
 * 
 * Manages 4 dedicated collections:
 * 1. swarm_episodic_deliberations: Historic multi-agent decisions & strategies
 * 2. swarm_customer_conversations: Long-term customer preferences & chat history
 * 3. swarm_market_catalog_index: Fast semantic catalog of packages, tours, hotels
 * 4. swarm_design_patches_history: Visual editor schema changes & layout designs
 */

import { QdrantClient } from "@qdrant/js-client-rest";
import { generateTextEmbedding } from "./agent-episodic-memory";
import type { SwarmEpisodicMemoryEntry } from "./agent-episodic-memory";
import fs from "fs";
import path from "path";

// Vector dimension: 768 standard for Gemini embedding models
export const VECTOR_DIMENSION = 768;

export const SWARM_COLLECTIONS = {
  DELIBERATIONS: "swarm_episodic_deliberations",
  CUSTOMER_CONVERSATIONS: "swarm_customer_conversations",
  MARKET_CATALOG: "swarm_market_catalog_index",
  DESIGN_PATCHES: "swarm_design_patches_history",
} as const;

export type SwarmCollectionName = typeof SWARM_COLLECTIONS[keyof typeof SWARM_COLLECTIONS];

let qdrantClientInstance: QdrantClient | null = null;
let collectionsInitialized = false;

export function getQdrantClient(): QdrantClient {
  if (!qdrantClientInstance) {
    const url = process.env.QDRANT_URL || "http://127.0.0.1:6333";
    const apiKey = process.env.QDRANT_API_KEY;
    qdrantClientInstance = new QdrantClient({
      url,
      ...(apiKey ? { apiKey } : {}),
      timeout: 8000,
    });
  }
  return qdrantClientInstance;
}

/**
 * Normalizes vector dimensionality to match Qdrant collection specification (VECTOR_DIMENSION)
 */
export function normalizeVectorDimension(vec: number[], targetDim = VECTOR_DIMENSION): number[] {
  if (!vec || vec.length === 0) {
    return new Array(targetDim).fill(0);
  }
  if (vec.length === targetDim) {
    return vec;
  }
  if (vec.length > targetDim) {
    // Truncate and re-normalize
    const truncated = vec.slice(0, targetDim);
    const mag = Math.sqrt(truncated.reduce((acc, v) => acc + v * v, 0));
    return mag > 0 ? truncated.map((v) => Number((v / mag).toFixed(6))) : truncated;
  }
  // Expand with deterministic projection if shorter
  const expanded = new Array(targetDim).fill(0);
  for (let i = 0; i < targetDim; i++) {
    expanded[i] = vec[i % vec.length] * Math.cos((i * Math.PI) / targetDim);
  }
  const mag = Math.sqrt(expanded.reduce((acc, v) => acc + v * v, 0));
  return mag > 0 ? expanded.map((v) => Number((v / mag).toFixed(6))) : expanded;
}

/**
 * Idempotently initialize all 4 Qdrant collections with HNSW indexing and payload schemas
 */
export async function ensureQdrantCollections(): Promise<boolean> {
  if (collectionsInitialized) return true;
  try {
    const client = getQdrantClient();
    const { collections } = await client.getCollections();
    const existingNames = new Set(collections.map((c) => c.name));

    const allCollections = [
      SWARM_COLLECTIONS.DELIBERATIONS,
      SWARM_COLLECTIONS.CUSTOMER_CONVERSATIONS,
      SWARM_COLLECTIONS.MARKET_CATALOG,
      SWARM_COLLECTIONS.DESIGN_PATCHES,
    ];

    for (const collName of allCollections) {
      if (!existingNames.has(collName)) {
        await client.createCollection(collName, {
          vectors: {
            size: VECTOR_DIMENSION,
            distance: "Cosine",
          },
          optimizers_config: {
            default_segment_number: 2,
          },
          hnsw_config: {
            m: 16,
            ef_construct: 100,
          },
        });

        // Create fast payload indexes for filtering
        if (collName === SWARM_COLLECTIONS.DELIBERATIONS) {
          await client.createPayloadIndex(collName, {
            field_name: "agentId",
            field_schema: "keyword",
          });
          await client.createPayloadIndex(collName, {
            field_name: "category",
            field_schema: "keyword",
          });
          await client.createPayloadIndex(collName, {
            field_name: "tags",
            field_schema: "keyword",
          });
        } else if (collName === SWARM_COLLECTIONS.CUSTOMER_CONVERSATIONS) {
          await client.createPayloadIndex(collName, {
            field_name: "customerId",
            field_schema: "keyword",
          });
          await client.createPayloadIndex(collName, {
            field_name: "channel",
            field_schema: "keyword",
          });
        } else if (collName === SWARM_COLLECTIONS.MARKET_CATALOG) {
          await client.createPayloadIndex(collName, {
            field_name: "itemType",
            field_schema: "keyword",
          });
          await client.createPayloadIndex(collName, {
            field_name: "destination",
            field_schema: "keyword",
          });
        } else if (collName === SWARM_COLLECTIONS.DESIGN_PATCHES) {
          await client.createPayloadIndex(collName, {
            field_name: "sectionId",
            field_schema: "keyword",
          });
          await client.createPayloadIndex(collName, {
            field_name: "layoutType",
            field_schema: "keyword",
          });
        }
      }
    }

    collectionsInitialized = true;
    return true;
  } catch (err) {
    console.error("[Qdrant] Failed to ensure collections:", err);
    return false;
  }
}

/**
 * Upsert an episodic deliberation into Qdrant
 */
export async function upsertDeliberationMemory(
  entry: SwarmEpisodicMemoryEntry
): Promise<boolean> {
  try {
    await ensureQdrantCollections();
    const client = getQdrantClient();

    let rawVector = entry.embedding;
    if (!rawVector || rawVector.length === 0) {
      const textToEmbed = `${entry.summaryAr} ${entry.keyInsightsAr.join(" ")} ${entry.tags.join(" ")}`;
      rawVector = await generateTextEmbedding(textToEmbed);
    }
    const vector = normalizeVectorDimension(rawVector);

    // Qdrant point IDs should be UUID or unsigned integer
    // Use positive hash of string id or UUID
    const pointId = Math.abs(hashStringToNumber(entry.id));

    await client.upsert(SWARM_COLLECTIONS.DELIBERATIONS, {
      wait: true,
      points: [
        {
          id: pointId,
          vector,
          payload: {
            entryId: entry.id,
            timestamp: entry.timestamp,
            category: entry.category,
            agentId: entry.agentId,
            summaryAr: entry.summaryAr,
            keyInsightsAr: entry.keyInsightsAr,
            metrics: entry.metrics || {},
            tags: entry.tags,
          },
        },
      ],
    });

    return true;
  } catch (err) {
    console.error("[Qdrant] Error upserting deliberation:", err);
    return false;
  }
}

/**
 * Search historic deliberations using Dense Vector + Payload Filtering
 */
export async function searchDeliberations(
  queryText: string,
  options?: {
    targetAgentId?: string;
    category?: string;
    limit?: number;
    scoreThreshold?: number;
  }
): Promise<Array<{ memory: SwarmEpisodicMemoryEntry; score: number }>> {
  try {
    await ensureQdrantCollections();
    const client = getQdrantClient();

    const rawEmbedding = await generateTextEmbedding(queryText);
    const vector = normalizeVectorDimension(rawEmbedding);

    const filter: Record<string, unknown> = {
      must: [] as Array<Record<string, unknown>>,
    };

    if (options?.targetAgentId && options.targetAgentId !== "all") {
      (filter.must as Array<Record<string, unknown>>).push({
        key: "agentId",
        match: { value: options.targetAgentId },
      });
    }

    if (options?.category) {
      (filter.must as Array<Record<string, unknown>>).push({
        key: "category",
        match: { value: options.category },
      });
    }

    const hasFilters = (filter.must as Array<Record<string, unknown>>).length > 0;

    const response = await client.query(SWARM_COLLECTIONS.DELIBERATIONS, {
      query: vector,
      limit: options?.limit || 4,
      score_threshold: options?.scoreThreshold || 0.01,
      with_payload: true,
      filter: hasFilters ? filter : undefined,
    });

    const points = response.points || [];

    return points.map((r) => {
      const p = (r.payload || {}) as Record<string, unknown>;
      return {
        memory: {
          id: (p.entryId as string) || String(r.id),
          timestamp: (p.timestamp as string) || new Date().toISOString(),
          category: (p.category as SwarmEpisodicMemoryEntry["category"]) || "campaign_outcome",
          agentId: (p.agentId as string) || "sales",
          summaryAr: (p.summaryAr as string) || "",
          keyInsightsAr: (p.keyInsightsAr as string[]) || [],
          metrics: p.metrics as SwarmEpisodicMemoryEntry["metrics"],
          tags: (p.tags as string[]) || [],
        },
        score: Number((r.score ?? 0).toFixed(4)),
      };
    });
  } catch (err) {
    console.error("[Qdrant] Error searching deliberations:", err);
    return [];
  }
}

/**
 * Search Customer Conversations & Preferences
 */
export async function searchCustomerMemories(
  queryText: string,
  options?: { customerId?: string; limit?: number }
): Promise<Array<{ payload: Record<string, unknown>; score: number }>> {
  try {
    await ensureQdrantCollections();
    const client = getQdrantClient();
    const rawEmbedding = await generateTextEmbedding(queryText);
    const vector = normalizeVectorDimension(rawEmbedding);

    const filter: Record<string, unknown> = { must: [] };
    if (options?.customerId) {
      (filter.must as Array<Record<string, unknown>>).push({
        key: "customerId",
        match: { value: options.customerId },
      });
    }
    const hasFilter = (filter.must as Array<Record<string, unknown>>).length > 0;

    const response = await client.query(SWARM_COLLECTIONS.CUSTOMER_CONVERSATIONS, {
      query: vector,
      limit: options?.limit || 5,
      with_payload: true,
      filter: hasFilter ? filter : undefined,
    });

    return (response.points || []).map((p) => ({
      payload: (p.payload || {}) as Record<string, unknown>,
      score: Number((p.score ?? 0).toFixed(4)),
    }));
  } catch (err) {
    console.error("[Qdrant] Error searching customer memories:", err);
    return [];
  }
}

/**
 * Search Visual Editor Design Patches & Historical Preferences
 */
export async function searchDesignPatches(
  queryText: string,
  options?: { sectionId?: string; limit?: number }
): Promise<Array<{ payload: Record<string, unknown>; score: number }>> {
  try {
    await ensureQdrantCollections();
    const client = getQdrantClient();
    const rawEmbedding = await generateTextEmbedding(queryText);
    const vector = normalizeVectorDimension(rawEmbedding);

    const filter: Record<string, unknown> = { must: [] };
    if (options?.sectionId) {
      (filter.must as Array<Record<string, unknown>>).push({
        key: "sectionId",
        match: { value: options.sectionId },
      });
    }
    const hasFilter = (filter.must as Array<Record<string, unknown>>).length > 0;

    const response = await client.query(SWARM_COLLECTIONS.DESIGN_PATCHES, {
      query: vector,
      limit: options?.limit || 5,
      with_payload: true,
      filter: hasFilter ? filter : undefined,
    });

    return (response.points || []).map((p) => ({
      payload: (p.payload || {}) as Record<string, unknown>,
      score: Number((p.score ?? 0).toFixed(4)),
    }));
  } catch (err) {
    console.error("[Qdrant] Error searching design patches:", err);
    return [];
  }
}

/**
 * Upsert Customer Preferences & Conversation Memory
 */
export async function upsertCustomerMemory(customerMem: {
  id: string;
  customerId: string;
  channel: "whatsapp" | "web" | "app" | "phone";
  summaryAr: string;
  destinationInterest: string[];
  budgetTier?: "economy" | "premium" | "vip";
  preferredLanguage?: string;
  lastContactIso: string;
}): Promise<boolean> {
  try {
    await ensureQdrantCollections();
    const client = getQdrantClient();
    const textToEmbed = `${customerMem.customerId} ${customerMem.summaryAr} ${customerMem.destinationInterest.join(" ")}`;
    const rawVector = await generateTextEmbedding(textToEmbed);
    const vector = normalizeVectorDimension(rawVector);
    const pointId = Math.abs(hashStringToNumber(customerMem.id));

    await client.upsert(SWARM_COLLECTIONS.CUSTOMER_CONVERSATIONS, {
      wait: true,
      points: [
        {
          id: pointId,
          vector,
          payload: customerMem,
        },
      ],
    });
    return true;
  } catch (err) {
    console.error("[Qdrant] Error upserting customer memory:", err);
    return false;
  }
}

/**
 * Upsert Visual Editor Design Patches & Historical Layout Token Choices
 */
export async function upsertDesignPatch(patch: {
  id: string;
  sectionId: string;
  layoutType: string;
  componentName: string;
  summaryAr: string;
  cssTokens: Record<string, string>;
  directorApproved: boolean;
  timestamp: string;
}): Promise<boolean> {
  try {
    await ensureQdrantCollections();
    const client = getQdrantClient();
    const text = `${patch.sectionId} ${patch.layoutType} ${patch.componentName} ${patch.summaryAr}`;
    const rawVector = await generateTextEmbedding(text);
    const vector = normalizeVectorDimension(rawVector);
    const pointId = Math.abs(hashStringToNumber(patch.id));

    await client.upsert(SWARM_COLLECTIONS.DESIGN_PATCHES, {
      wait: true,
      points: [
        {
          id: pointId,
          vector,
          payload: patch,
        },
      ],
    });
    return true;
  } catch (err) {
    console.error("[Qdrant] Error upserting design patch:", err);
    return false;
  }
}

/**
 * Automatic migration from local JSON file to Qdrant vector database
 */
export async function migrateLocalEpisodicMemoriesToQdrant(): Promise<number> {
  try {
    const memoryFile = path.join(process.cwd(), ".data", "agent-swarm", "episodic-memory.json");
    if (!fs.existsSync(memoryFile)) return 0;

    const raw = fs.readFileSync(memoryFile, "utf-8");
    const list: SwarmEpisodicMemoryEntry[] = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) return 0;

    await ensureQdrantCollections();
    let migratedCount = 0;
    for (const item of list) {
      const ok = await upsertDeliberationMemory(item);
      if (ok) migratedCount++;
    }

    return migratedCount;
  } catch (err) {
    console.error("[Qdrant] Migration failed:", err);
    return 0;
  }
}

// Deterministic 32-bit positive integer hash for Qdrant point IDs
function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}
