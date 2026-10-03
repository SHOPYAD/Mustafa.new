/**
 * Lonaliza Sovereign Python Brain — Node.js IPC Client Bridge
 * Connects Next.js admin panel and storefront to Python Brain (port 8100)
 * Features: Circuit breaker, 3500ms timeout, automatic fallback, zero-downtime resilience.
 */

export interface BrainDeliberationIntent {
  primary_cluster: string;
  confidence: number;
  entities: {
    destinations: string[];
    vehicle_type: string | null;
    hotel_stars: number | null;
    flight_class: string;
    dialect: string;
    is_vip: boolean;
  };
  dialect: string;
  reasoning: string;
}

export interface BrainActionStep {
  step: number;
  action: string;
  target_nodes: string[];
  params: Record<string, unknown>;
}

export interface BrainDeliberationPayload {
  status: "ok";
  query: string;
  intent: BrainDeliberationIntent;
  candidate_nodes: Array<{ id: string; kind: string; labels: Record<string, string> }>;
  target_platform_nodes: string[];
  action_steps: BrainActionStep[];
  traveler_briefing: string;
  safety_status: "APPROVED" | "NEEDS_SUPERVISOR_APPROVAL";
  risk_notes: string[];
  execution_ms: number;
  timestamp: number;
}

export interface DeliberateResponse {
  ok: boolean;
  fallback?: boolean;
  deliberation: BrainDeliberationPayload;
  memories_recalled?: Array<{ id: string; content: string; similarity: number }>;
  procedural_rules_applied?: Array<{ id: string; rule_text: string }>;
  error?: string;
}

export interface BrainHealthResponse {
  status: string;
  service: string;
  uptime_seconds: number;
  frameworks: {
    dspy: string;
    mem0: string;
    fastembed: string;
    mcp: string;
  };
  telemetry: {
    platform_nodes_indexed: number;
    thesaurus_clusters: number;
    active_mcp_tools: number;
    fewshot_exemplars: number;
    memory_store: Record<string, unknown>;
  };
}

// ---------------------------------------------------------------------------
// Circuit Breaker State
// ---------------------------------------------------------------------------

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 3;
  private readonly resetTimeoutMs = 20_000;

  isOpen(): boolean {
    if (this.failures >= this.threshold) {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        // Half-open test
        this.failures = this.threshold - 1;
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess() {
    this.failures = 0;
  }

  recordFailure() {
    this.failures += 1;
    this.lastFailureTime = Date.now();
  }
}

const circuitBreaker = new CircuitBreaker();

const PYTHON_BRAIN_URL = process.env.PYTHON_BRAIN_URL || "http://127.0.0.1:8100";
const REQUEST_TIMEOUT_MS = 3500;

// ---------------------------------------------------------------------------
// Graceful Fallback Generator
// ---------------------------------------------------------------------------

function generateLocalFallbackDeliberation(query: string): BrainDeliberationPayload {
  const q = query.toLowerCase();
  let cluster = "general.inquiry";
  let dialect = "standard";
  let isVip = false;
  let vehicleType: string | null = null;
  let hotelStars: number | null = null;
  const destinations: string[] = [];

  if (/شوف لي|ابغى|ابي|كشخة|تكفى|فخم/.test(q)) dialect = "saudi_gulf";
  else if (/عاوز|عايز|ايه|بكام|فين/.test(q)) dialect = "egyptian";
  else if (/بدنا|بدي|شوفلنا|شوفير|سيران/.test(q)) dialect = "levantine";

  if (/اسطنبول|تقسيم|istanbul|taksim/.test(q)) destinations.push("istanbul");
  if (/بورصة|بورصه|bursa/.test(q)) destinations.push("bursa");
  if (/طرابزون|trabzon/.test(q)) destinations.push("trabzon");
  if (/انطاليا|antalya/.test(q)) destinations.push("antalya");

  if (/فندق|فنادق|hotel|resort|حجز فندقي/.test(q)) {
    cluster = "hotels.search";
    hotelStars = /5|خمس|كشخة|فخم/.test(q) ? 5 : 4;
    isVip = hotelStars === 5;
  } else if (/طيران|تذكرة|طيارة|flight|pnr/.test(q)) {
    cluster = "flights.search";
  } else if (/سيارة|توصيل|شوفير|transfer|فيتو|vito/.test(q)) {
    cluster = "transfers.private";
    vehicleType = /فيتو|vito/.test(q) ? "mercedes_vito" : "sedan";
  }

  return {
    status: "ok",
    query,
    intent: {
      primary_cluster: cluster,
      confidence: 0.88,
      entities: {
        destinations,
        vehicle_type: vehicleType,
        hotel_stars: hotelStars,
        flight_class: "economy",
        dialect,
        is_vip: isVip,
      },
      dialect,
      reasoning: `Dialect: ${dialect}. Detected cluster ${cluster} via sovereign fallback router.`,
    },
    candidate_nodes: [
      { id: "screen.23", kind: "screen", labels: { ar: "العقل المدبر السيادي", en: "Mind Graph Cockpit" } },
      { id: "hub.flights.bookings", kind: "hub", labels: { ar: "مركز الحجوزات", en: "Bookings Hub" } },
    ],
    target_platform_nodes: ["screen.23", "hub.flights.bookings"],
    action_steps: [
      {
        step: 1,
        action: "route_to_target",
        target_nodes: ["screen.23"],
        params: { cluster, dialect },
      },
    ],
    traveler_briefing: `تم استيعاب طلبك (${query}) وتوجيهه إلى المسارات التشغيلية في المنصة.`,
    safety_status: "APPROVED",
    risk_notes: [],
    execution_ms: 1.2,
    timestamp: Date.now() / 1000,
  };
}

// ---------------------------------------------------------------------------
// Core Client Functions
// ---------------------------------------------------------------------------

export async function checkPythonBrainHealth(): Promise<BrainHealthResponse | null> {
  try {
    const res = await fetch(`${PYTHON_BRAIN_URL}/v1/brain/health`, {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return null;
    circuitBreaker.recordSuccess();
    return (await res.json()) as BrainHealthResponse;
  } catch {
    circuitBreaker.recordFailure();
    return null;
  }
}

export async function deliberateWithPythonBrain(
  query: string,
  options?: {
    userId?: string;
    conversationId?: string;
    includeMemories?: boolean;
    includeRules?: boolean;
    context?: Record<string, unknown>;
  }
): Promise<DeliberateResponse> {
  if (circuitBreaker.isOpen()) {
    return {
      ok: true,
      fallback: true,
      deliberation: generateLocalFallbackDeliberation(query),
    };
  }

  try {
    const res = await fetch(`${PYTHON_BRAIN_URL}/v1/brain/deliberate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        user_id: options?.userId || "admin_supervisor",
        conversation_id: options?.conversationId,
        context: options?.context,
        include_memories: options?.includeMemories ?? true,
        include_rules: options?.includeRules ?? true,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) {
      circuitBreaker.recordFailure();
      return {
        ok: true,
        fallback: true,
        deliberation: generateLocalFallbackDeliberation(query),
      };
    }

    const data = await res.json();
    circuitBreaker.recordSuccess();
    return {
      ok: true,
      fallback: false,
      deliberation: data.deliberation,
      memories_recalled: data.memories_recalled,
      procedural_rules_applied: data.procedural_rules_applied,
    };
  } catch (err: unknown) {
    circuitBreaker.recordFailure();
    return {
      ok: true,
      fallback: true,
      deliberation: generateLocalFallbackDeliberation(query),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function addBrainMemory(
  userId: string,
  content: string,
  memoryType: "episodic" | "semantic" | "procedural" = "episodic",
  metadata?: Record<string, unknown>
): Promise<{ ok: boolean; memory?: Record<string, unknown> }> {
  try {
    const res = await fetch(`${PYTHON_BRAIN_URL}/v1/brain/memory/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        content,
        memory_type: memoryType,
        metadata: metadata || {},
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return { ok: true, memory: data.memory };
  } catch {
    return { ok: false };
  }
}

export async function searchBrainMemory(
  query: string,
  userId?: string,
  limit = 5
): Promise<{ ok: boolean; results: Array<Record<string, unknown>> }> {
  try {
    const res = await fetch(`${PYTHON_BRAIN_URL}/v1/brain/memory/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, user_id: userId, limit }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false, results: [] };
    const data = await res.json();
    return { ok: true, results: data.results || [] };
  } catch {
    return { ok: false, results: [] };
  }
}

export async function callBrainMcpTool(
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<{ ok: boolean; result?: Record<string, unknown>; error?: string }> {
  try {
    const res = await fetch(`${PYTHON_BRAIN_URL}/v1/brain/tools/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool_name: toolName, arguments: args }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { ok: true, result: data.result };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function optimizeBrain(
  query: string,
  plan: Record<string, unknown>,
  correction: string,
  approved = true
): Promise<{ ok: boolean; optimization?: Record<string, unknown> }> {
  try {
    const res = await fetch(`${PYTHON_BRAIN_URL}/v1/brain/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, plan, correction, approved }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return { ok: true, optimization: data.optimization };
  } catch {
    return { ok: false };
  }
}
