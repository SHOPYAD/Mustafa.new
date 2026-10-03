import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  THESAURUS_CLUSTERS,
  getThesaurusStats,
  type ThesaurusCluster,
} from "@/lib/studio/index/domain-thesaurus";
import { generateUnifiedAiContent } from "@/lib/server/unified-ai-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);

const CUSTOM_TERMS_PATH = path.resolve(
  process.cwd(),
  "../database/data/studio/custom-thesaurus-terms.json"
);

interface CustomTermsStorage {
  updatedAt: string;
  clusters: Record<string, string[]>;
}

function loadCustomTerms(): Record<string, string[]> {
  try {
    if (!fs.existsSync(CUSTOM_TERMS_PATH)) {
      return {};
    }
    const raw = fs.readFileSync(CUSTOM_TERMS_PATH, "utf8");
    const parsed: CustomTermsStorage = JSON.parse(raw);
    return parsed.clusters || {};
  } catch (err) {
    console.error("Error reading custom-thesaurus-terms.json:", err);
    return {};
  }
}

function saveCustomTerms(clusters: Record<string, string[]>): void {
  try {
    const dir = path.dirname(CUSTOM_TERMS_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const payload: CustomTermsStorage = {
      updatedAt: new Date().toISOString(),
      clusters,
    };
    fs.writeFileSync(CUSTOM_TERMS_PATH, JSON.stringify(payload, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving custom-thesaurus-terms.json:", err);
  }
}

function normalizeTerm(term: string): string {
  return String(term || "")
    .replace(/[\u064B-\u0652]/g, "") // remove tashkeel
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .toLowerCase()
    .trim();
}

/**
 * GET /api/admin/studio/thesaurus
 * Returns clusters with term counts, sample terms, target nodes, and stats.
 */
export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const url = new URL(req.url);
    const clusterId = url.searchParams.get("clusterId");
    const domainFilter = url.searchParams.get("domain");
    const searchQuery = url.searchParams.get("search")?.toLowerCase().trim();

    const custom = loadCustomTerms();
    const stats = getThesaurusStats();

    // Enrich clusters with custom terms
    const enrichedClusters = THESAURUS_CLUSTERS.map((c) => {
      const customList = custom[c.id] || [];
      const totalCount = c.termsCount + customList.length;
      return {
        ...c,
        customTerms: customList,
        totalTermsCount: totalCount,
      };
    });

    if (clusterId) {
      const found = enrichedClusters.find((c) => c.id === clusterId);
      if (!found) {
        return NextResponse.json({ ok: false, error: "cluster_not_found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, cluster: found });
    }

    let filtered = enrichedClusters;
    if (domainFilter) {
      filtered = filtered.filter((c) => c.domain === domainFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.primaryAr.toLowerCase().includes(searchQuery) ||
          c.primaryEn.toLowerCase().includes(searchQuery) ||
          c.id.includes(searchQuery) ||
          c.sampleTerms.some((t) => t.includes(searchQuery))
      );
    }

    let totalCustomTerms = 0;
    for (const terms of Object.values(custom)) {
      totalCustomTerms += terms.length;
    }

    return NextResponse.json({
      ok: true,
      stats: {
        totalClusters: stats.totalClusters,
        totalBaseTerms: stats.totalTerms,
        totalCustomTerms,
        grandTotalTerms: stats.totalTerms + totalCustomTerms,
      },
      clusters: filtered,
    });
  } catch (error) {
    console.error("GET /api/admin/studio/thesaurus error:", error);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/studio/thesaurus
 * Actions: add_term, delete_term, curate_ai, approve_curated, sync_index
 */
export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "").trim();

    if (!action) {
      return NextResponse.json({ ok: false, error: "missing_action" }, { status: 400 });
    }

    const custom = loadCustomTerms();

    // 1. ADD TERM
    if (action === "add_term") {
      const clusterId = String(body.clusterId || "").trim();
      const rawTerm = String(body.term || "").trim();
      const norm = normalizeTerm(rawTerm);

      if (!clusterId || !norm || norm.length < 2) {
        return NextResponse.json({ ok: false, error: "invalid_term_or_cluster" }, { status: 400 });
      }

      if (!custom[clusterId]) custom[clusterId] = [];
      if (!custom[clusterId].includes(norm)) {
        custom[clusterId].push(norm);
        saveCustomTerms(custom);
      }

      return NextResponse.json({
        ok: true,
        message: "term_added",
        clusterId,
        term: norm,
        totalCustomTerms: custom[clusterId].length,
      });
    }

    // 2. DELETE TERM
    if (action === "delete_term") {
      const clusterId = String(body.clusterId || "").trim();
      const rawTerm = String(body.term || "").trim();
      const norm = normalizeTerm(rawTerm);

      if (custom[clusterId]) {
        custom[clusterId] = custom[clusterId].filter((t) => t !== norm);
        saveCustomTerms(custom);
      }

      return NextResponse.json({
        ok: true,
        message: "term_deleted",
        clusterId,
        term: norm,
      });
    }

    // 3. AI CURATOR COPILOT (Generates dialect synonyms for cluster)
    if (action === "curate_ai") {
      const clusterId = String(body.clusterId || "").trim();
      const targetDialect = String(body.dialect || "all").trim(); // "gulf" | "egyptian" | "levantine" | "all"
      const cluster = THESAURUS_CLUSTERS.find((c) => c.id === clusterId);

      if (!cluster) {
        return NextResponse.json({ ok: false, error: "cluster_not_found" }, { status: 404 });
      }

      const dialectGuidance =
        targetDialect === "gulf"
          ? "اللهجة السعودية والخليجية (مثل: ابغى، شوف لي، كشخة، على سنقة عشرة، خويي، روقان)"
          : targetDialect === "egyptian"
          ? "اللهجة المصرية (مثل: عاوز، عايز، طيارة، كويس، رخيص، الفلوس)"
          : targetDialect === "levantine"
          ? "اللهجة الشامية واللبنانية (مثل: بدي، بدنا، شوفير، اوتيل، استرجع، تكسي)"
          : "مزيج متوازن من اللهجات الخليجية والمصرية والشامية والمصطلحات الدارجة الشائعة في السفر والسياحة";

      const prompt = `أنت منسق المعاجم السياحية الذاتي لمنصة لوناليزا للسياحة والسفر.
مهمتك توليد 15 مرادفاً أو تعبيراً عامياً أو طلباً سياحياً واقعياً يبحث به المسافرون في هذا النطاق:
- القطاع: ${cluster.domain}
- العنقود: ${cluster.primaryAr} (${cluster.primaryEn})
- أمثلة حالية في العنقود: ${cluster.sampleTerms.slice(0, 8).join("، ")}
- اللهجة المطلوبة: ${dialectGuidance}

القواعد الإلزامية:
1. العبارات يجب أن تكون واقعية 100% كما يكتبها أو ينطقها الزبون الحقيقي عند البحث أو التحدث مع روبوت السفر.
2. لا تكرر أي مصطلح موجود بالفعل في الأمثلة.
3. التنسيق إلزامي بصيغة JSON Array فقط كما في المثال أدناه:
[
  { "term": "...", "dialect": "سعودي/خليجي أو مصري أو شامي", "context": "سبب الاقتراح" }
]`;

      const aiResponse = await generateUnifiedAiContent<
        Array<{ term: string; dialect: string; context: string }>
      >({
        prompt,
        temperature: 0.6,
        responseMimeType: "application/json",
        agentRole: "supervisor",
      });

      let suggestions = aiResponse.data;
      if (!Array.isArray(suggestions) && typeof aiResponse.text === "string") {
        try {
          const cleaned = aiResponse.text.replace(/```json|```/g, "").trim();
          suggestions = JSON.parse(cleaned);
        } catch {
          suggestions = [];
        }
      }

      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        // Fallback robust mock generator if external provider is offline
        suggestions = [
          { term: `ارخص عروض ${cluster.primaryAr}`, dialect: "عام", context: "بحث اقتصادي" },
          { term: `افضل خيارات ${cluster.primaryAr}`, dialect: "عام", context: "بحث جودة" },
          { term: `شوف لي اسعار ${cluster.primaryAr}`, dialect: "خليجي", context: "طلب استعلام" },
          { term: `بدي احجز ${cluster.primaryAr}`, dialect: "شامي", context: "طلب فوري" },
          { term: `عاوز تفاصيل ${cluster.primaryAr}`, dialect: "مصري", context: "استفسار" },
        ];
      }

      // Filter duplicates
      const existingTerms = new Set([
        ...cluster.sampleTerms.map(normalizeTerm),
        ...(custom[clusterId] || []).map(normalizeTerm),
      ]);

      const filteredSuggestions = suggestions.filter(
        (s) => s.term && s.term.length >= 2 && !existingTerms.has(normalizeTerm(s.term))
      );

      return NextResponse.json({
        ok: true,
        clusterId,
        clusterName: cluster.primaryAr,
        dialect: targetDialect,
        suggestions: filteredSuggestions,
      });
    }

    // 4. APPROVE CURATED TERMS
    if (action === "approve_curated") {
      const clusterId = String(body.clusterId || "").trim();
      const terms: string[] = Array.isArray(body.terms) ? body.terms : [];

      if (!clusterId || terms.length === 0) {
        return NextResponse.json({ ok: false, error: "invalid_terms" }, { status: 400 });
      }

      if (!custom[clusterId]) custom[clusterId] = [];
      let addedCount = 0;
      for (const t of terms) {
        const norm = normalizeTerm(t);
        if (norm && norm.length >= 2 && !custom[clusterId].includes(norm)) {
          custom[clusterId].push(norm);
          addedCount++;
        }
      }

      saveCustomTerms(custom);

      return NextResponse.json({
        ok: true,
        message: "terms_approved",
        clusterId,
        addedCount,
        totalCustomTerms: custom[clusterId].length,
      });
    }

    // 5. SYNC INDEX & INTENT LEXICON
    if (action === "sync_index") {
      try {
        const scriptPath = path.resolve(process.cwd(), "scripts/gen-platform-index.cjs");
        const { stdout } = await execFileAsync("node", [scriptPath], {
          cwd: process.cwd(),
          timeout: 20000,
        });

        return NextResponse.json({
          ok: true,
          message: "index_synced",
          output: stdout.trim(),
        });
      } catch (err) {
        console.error("Index sync error:", err);
        return NextResponse.json(
          { ok: false, error: "index_sync_failed", details: String(err) },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: false, error: "unsupported_action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/admin/studio/thesaurus error:", error);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
