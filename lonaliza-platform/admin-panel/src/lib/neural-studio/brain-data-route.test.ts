import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), collection: vi.fn() }));
vi.mock("@/lib/server/admin-auth", () => ({ assertAdminApi: mocks.auth }));
vi.mock("@/lib/swarm/qdrant-vector-store", () => ({
  getQdrantClient: () => ({ getCollection: mocks.collection }),
  SWARM_COLLECTIONS: { DELIBERATIONS: "d", CUSTOMER_CONVERSATIONS: "c", MARKET_CATALOG: "m", DESIGN_PATCHES: "p" },
}));
import { GET } from "@/app/api/admin/automation/second-brain-data/route";
beforeEach(() => { vi.resetAllMocks(); mocks.auth.mockResolvedValue(null); });
it("denies anonymous access", async () => {
  mocks.auth.mockResolvedValue(new Response(null, { status: 401 }));
  expect((await GET(new Request("https://studio.test"))).status).toBe(401);
  expect(mocks.collection).not.toHaveBeenCalled();
});
it("returns observed metadata, not invented customer records", async () => {
  mocks.collection.mockResolvedValue({ points_count: 3 });
  const data = await (await GET(new Request("https://studio.test"))).json();
  expect(data.core.totalPoints).toBe(12);
  expect(data.nodes).toEqual([]);
  expect(data.status).toBe("ready");
  expect(data.core.qdrantEndpoint).toBeUndefined();
});
it("marks partial results and does not substitute fabricated counts", async () => {
  mocks.collection.mockResolvedValue({ points_count: 0 }).mockRejectedValueOnce(new Error("offline"));
  const data = await (await GET(new Request("https://studio.test"))).json();
  expect(data.status).toBe("partial");
  expect(data.sectors).toHaveLength(3);
  expect(data.unavailableCollections).toEqual(["d"]);
});
it("returns unavailable when all sources fail", async () => {
  mocks.collection.mockRejectedValue(new Error("private provider detail"));
  const response = await GET(new Request("https://studio.test"));
  expect(response.status).toBe(503);
  const text = await response.text();
  expect(text).not.toContain("private provider detail");
  expect(JSON.parse(text).success).toBe(false);
});
