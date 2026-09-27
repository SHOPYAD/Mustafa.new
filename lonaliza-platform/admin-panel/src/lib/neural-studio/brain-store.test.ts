import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useSecondBrainStore } from "@/components/admin/automation/hud/brain/store/useSecondBrainStore";
const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  useSecondBrainStore.setState({ executionMode: "live", isExecuting: false, executionHistory: [] });
});
afterEach(() => { vi.unstubAllGlobals(); vi.resetAllMocks(); });
it("does not turn a network failure into success", async () => {
  fetchMock.mockRejectedValue(new Error("offline"));
  const result = await useSecondBrainStore.getState().executeDirective("dir-sync-gds", "sub-flights-core");
  expect(result.success).toBe(false);
  expect(useSecondBrainStore.getState().isExecuting).toBe(false);
});
it("requires both HTTP success and explicit server success", async () => {
  fetchMock.mockResolvedValue({ ok: false, json: async () => ({ ok: true }) });
  expect((await useSecondBrainStore.getState().executeDirective("dir-sync-gds", "sub-flights-core")).success).toBe(false);
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
  expect((await useSecondBrainStore.getState().executeDirective("dir-sync-gds", "sub-flights-core")).success).toBe(false);
});
it("sends dry-run to the server instead of inventing successful validation", async () => {
  useSecondBrainStore.setState({ executionMode: "dry_run" });
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true, summaryAr: "تم فحص التعريف فقط" }) });
  const result = await useSecondBrainStore.getState().executeDirective("dir-sync-gds", "sub-flights-core");
  expect(JSON.parse(fetchMock.mock.calls[0][1].body).executionMode).toBe("dry_run");
  expect(result.executionMode).toBe("dry_run");
  expect(result.summaryAr).not.toContain("100%");
});
it("rejects unknown directives before making a request", async () => {
  expect((await useSecondBrainStore.getState().executeDirective("bad", "missing")).success).toBe(false);
  expect(fetchMock).not.toHaveBeenCalled();
});
