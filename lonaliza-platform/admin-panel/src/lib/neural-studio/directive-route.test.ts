import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), execute: vi.fn(), agent: vi.fn(), log: vi.fn(), find: vi.fn() }));
vi.mock("@/lib/server/admin-auth", () => ({ assertAdminApi: mocks.auth }));
vi.mock("@/lib/swarm/agent-tools", () => ({ executeSwarmTool: mocks.execute }));
vi.mock("@/lib/swarm/agent-registry", () => ({ getRegisteredAgent: mocks.agent }));
vi.mock("@/lib/automation/agent-collab-store", () => ({ saveSwarmDiscussionMessage: mocks.log }));
vi.mock("@/components/admin/automation/hud/brain/data/sovereignDomainGraph", () => ({ findSovereignSubModule: mocks.find }));
import { POST } from "@/app/api/admin/automation/second-brain-directive/route";
const valid = { directiveId: "dir-refresh-analytics", subModuleId: "dashboard", executionMode: "live" };
const request = (body: unknown, origin?: string) => new Request("https://studio.test/api/directive", {
  method: "POST", headers: { "content-type": "application/json", ...(origin ? { origin } : {}) },
  body: JSON.stringify(body),
});
beforeEach(() => {
  vi.resetAllMocks();
  mocks.auth.mockResolvedValue(null);
  mocks.agent.mockReturnValue({ id: "admin", enabled: true, allowedTools: ["dashboard_bookings"] });
  mocks.find.mockReturnValue({ id: "dashboard", assignedAgent: { id: "admin" }, executableDirectives: [
    { id: "dir-refresh-analytics", toolKey: "dashboard_bookings" },
    { id: "dir-fake-refund", toolKey: "dashboard_bookings" },
  ] });
  mocks.execute.mockResolvedValue({ ok: true, summaryAr: "بيانات فعلية", facts: [] });
});
describe("second-brain directive trust boundary", () => {
  it("requires authentication before parsing or executing", async () => {
    mocks.auth.mockResolvedValue(new Response(null, { status: 401 }));
    expect((await POST(request(valid))).status).toBe(401);
    expect(mocks.find).not.toHaveBeenCalled();
    expect(mocks.execute).not.toHaveBeenCalled();
  });
  it("rejects cross-origin requests", async () => {
    expect((await POST(request(valid, "https://attacker.test"))).status).toBe(403);
    expect(mocks.execute).not.toHaveBeenCalled();
  });
  it("rejects invalid JSON and unknown fields", async () => {
    expect((await POST(new Request("https://studio.test", { method: "POST", body: "{" }))).status).toBe(400);
    expect((await POST(request({ ...valid, bypass: true }))).status).toBe(400);
  });
  it("rejects oversized payloads", async () => {
    expect((await POST(request({ ...valid, payload: { text: "x".repeat(33000) } }))).status).toBe(413);
  });
  it("rejects unknown directives", async () => {
    expect((await POST(request({ ...valid, directiveId: "unknown" }))).status).toBe(404);
  });
  it("does not confuse a read tool with a refund executor", async () => {
    const response = await POST(request({ ...valid, directiveId: "dir-fake-refund" }));
    expect(response.status).toBe(501);
    expect((await response.json()).ok).toBe(false);
    expect(mocks.execute).not.toHaveBeenCalled();
  });
  it("resolves agent and tool server-side, ignoring identity spoofing", async () => {
    expect((await POST(request({ ...valid, toolKey: "launch_meta_ad", assignedAgentId: "evil" }))).status).toBe(200);
    expect(mocks.agent).toHaveBeenCalledWith("admin");
    expect(mocks.execute).toHaveBeenCalledWith("dashboard_bookings", {});
  });
  it("denies disabled agents or missing capabilities", async () => {
    mocks.agent.mockReturnValue({ enabled: false, allowedTools: ["dashboard_bookings"] });
    expect((await POST(request(valid))).status).toBe(403);
    mocks.agent.mockReturnValue({ enabled: true, allowedTools: [] });
    expect((await POST(request(valid))).status).toBe(403);
    expect(mocks.execute).not.toHaveBeenCalled();
  });
  it("validates dry-run without tool calls or success audit entries", async () => {
    const response = await POST(request({ ...valid, executionMode: "dry_run" }));
    expect((await response.json()).status).toBe("validated");
    expect(mocks.execute).not.toHaveBeenCalled();
    expect(mocks.log).not.toHaveBeenCalled();
  });
  it("defaults to dry-run", async () => {
    const { executionMode, ...input } = valid;
    await POST(request(input));
    expect(mocks.execute).not.toHaveBeenCalled();
  });
  it("propagates tool failure and never leaks raw provider errors", async () => {
    mocks.execute.mockResolvedValue({ ok: false, summaryAr: "secret=do-not-send", facts: [] });
    const response = await POST(request(valid));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("do-not-send");
  });
  it("does not report success after an exception", async () => {
    mocks.execute.mockRejectedValue(new Error("secret=do-not-send"));
    const response = await POST(request(valid));
    expect(response.status).toBe(502);
    expect((await response.json()).ok).toBe(false);
  });
});
