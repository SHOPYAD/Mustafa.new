import { describe, expect, it, vi, afterEach } from "vitest";
import { isHandoffPath } from "@/lib/server/mobile/app-surfaces";
import { goHome, navigate, syncNativeLocale } from "@/lib/mobile/webview-bridge";
import { appNavTitles } from "@/lib/mobile/app-nav-labels";
import en from "@/lib/i18n/dictionaries/en";
import ar from "@/lib/i18n/dictionaries/ar";

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

  it("syncNativeLocale posts locale and short tab titles to Flutter", () => {
    const postMessage = vi.fn();
    vi.stubGlobal("window", { LonalizaNativeBridge: { postMessage } });
    expect(
      syncNativeLocale({
        locale: "en",
        dir: "ltr",
        titles: appNavTitles(en),
      })
    ).toBe(true);
    expect(postMessage).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(postMessage.mock.calls[0][0] as string);
    expect(payload.type).toBe("locale");
    expect(payload.locale).toBe("en");
    expect(payload.titles).toEqual({
      home: "Home",
      wallet: "Wallet",
      reels: "Reels",
      me: "Me",
      more: "More",
    });
  });
});

describe("app nav labels", () => {
  it("keeps five concise Arabic tab titles", () => {
    const titles = appNavTitles(ar);
    expect(Object.keys(titles)).toHaveLength(5);
    expect(titles.home).toBe("الرئيسية");
    expect(titles.reels).toBe("الريلز");
    expect(titles.more).toBe("المزيد");
  });
});
