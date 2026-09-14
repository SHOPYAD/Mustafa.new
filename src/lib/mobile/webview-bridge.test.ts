import { describe, expect, it, vi, afterEach } from "vitest";
import { isHandoffPath } from "@/lib/server/mobile/app-surfaces";
import { goHome, navigate } from "@/lib/mobile/webview-bridge";

describe("mobile website surfaces", () => {
  it("allows customer website pages and rejects admin", () => {
    expect(isHandoffPath("/account?tab=social")).toBe(true);
    expect(isHandoffPath("/visa")).toBe(true);
    expect(isHandoffPath("/blog")).toBe(true);
    expect(isHandoffPath("/admin")).toBe(false);
  });
});

describe("webview goHome / navigate bridge", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("goHome prefers the dedicated shell helper", () => {
    const spy = vi.fn();
    vi.stubGlobal("window", { __lonalizaGoHome: spy });
    expect(goHome()).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("navigate calls __lonalizaNavigate with replace for tab switches", () => {
    const spy = vi.fn();
    vi.stubGlobal("window", { __lonalizaNavigate: spy });
    expect(navigate("/community", { replace: true })).toBe(true);
    expect(spy).toHaveBeenCalledWith("/community", { replace: true });
  });
});
