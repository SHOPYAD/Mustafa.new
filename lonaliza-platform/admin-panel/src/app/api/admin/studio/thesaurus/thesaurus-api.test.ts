import { describe, expect, it, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import { ensureAdminSessionSecret } from "@/lib/server/admin-auth";
import { createAdminSessionToken, ADMIN_AUTH_COOKIE } from "@/lib/admin-session-token";

let adminCookie = "";

beforeAll(async () => {
  const secret = await ensureAdminSessionSecret();
  const token = await createAdminSessionToken(secret, 3600);
  adminCookie = `${ADMIN_AUTH_COOKIE}=${token}`;
});

function createMockRequest(url: string, method = "GET", body?: any): NextRequest {
  const req = new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers: {
      "content-type": "application/json",
      cookie: adminCookie,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return req;
}

describe("Thesaurus Management API & AI Curator Copilot", () => {
  it("GET /api/admin/studio/thesaurus returns 26 enriched clusters and statistics", async () => {
    const req = createMockRequest("http://localhost:3000/api/admin/studio/thesaurus");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.stats).toBeDefined();
    expect(json.stats.totalClusters).toBe(26);
    expect(json.stats.totalBaseTerms).toBeGreaterThanOrEqual(5000);
    expect(json.clusters.length).toBe(26);

    const flightsCluster = json.clusters.find((c: any) => c.id === "flights.search");
    expect(flightsCluster).toBeDefined();
    expect(flightsCluster.domain).toBe("flights");
    expect(flightsCluster.sampleTerms.length).toBeGreaterThan(0);
    expect(flightsCluster.targetNodeIds).toContain("screen.04");
  });

  it("GET with domain filter returns only matching clusters", async () => {
    const req = createMockRequest("http://localhost:3000/api/admin/studio/thesaurus?domain=hotels");
    const res = await GET(req);
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(json.clusters.length).toBeGreaterThanOrEqual(2);
    for (const c of json.clusters) {
      expect(c.domain).toBe("hotels");
    }
  });

  it("POST action=add_term normalizes and persists custom term", async () => {
    const testTerm = "منتجع عائلي فخم على البحر";
    const req = createMockRequest("http://localhost:3000/api/admin/studio/thesaurus", "POST", {
      action: "add_term",
      clusterId: "hotels.search",
      term: testTerm,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.message).toBe("term_added");
    expect(json.clusterId).toBe("hotels.search");
  });

  it("POST action=delete_term removes term from custom list", async () => {
    const testTerm = "منتجع عائلي فخم على البحر";
    const req = createMockRequest("http://localhost:3000/api/admin/studio/thesaurus", "POST", {
      action: "delete_term",
      clusterId: "hotels.search",
      term: testTerm,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.message).toBe("term_deleted");
  });

  it("POST action=curate_ai generates dialect travel synonyms", async () => {
    const req = createMockRequest("http://localhost:3000/api/admin/studio/thesaurus", "POST", {
      action: "curate_ai",
      clusterId: "transfers.airport",
      dialect: "gulf",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.clusterId).toBe("transfers.airport");
    expect(Array.isArray(json.suggestions)).toBe(true);
    expect(json.suggestions.length).toBeGreaterThan(0);
    expect(json.suggestions[0].term).toBeDefined();
  }, 25000);

  it("POST action=approve_curated batch saves terms into cluster", async () => {
    const curatedBatch = ["توصيل vip مطار", "سيارة سبرنتر للعائلة"];
    const req = createMockRequest("http://localhost:3000/api/admin/studio/thesaurus", "POST", {
      action: "approve_curated",
      clusterId: "transfers.airport",
      terms: curatedBatch,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.message).toBe("terms_approved");
    expect(json.addedCount).toBeGreaterThanOrEqual(1);

    // Clean up
    for (const t of curatedBatch) {
      const cleanReq = createMockRequest("http://localhost:3000/api/admin/studio/thesaurus", "POST", {
        action: "delete_term",
        clusterId: "transfers.airport",
        term: t,
      });
      await POST(cleanReq);
    }
  });
});
