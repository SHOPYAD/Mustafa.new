import { describe, expect, it } from "vitest";
import { verifyBuiltinCatalog, callBuiltinTool } from "../../builtin";
import { getMcpCatalogEntry } from "../../catalog";
import { getSiteContact, saveSiteContactFile } from "@/lib/server/site-contact-file";

describe("Computer Use & Browser Use MCP Full Pipeline Verification", () => {
  it("resolves computer-use and browser-use catalog entries correctly", () => {
    const comp = getMcpCatalogEntry("liotrip-computer-use");
    expect(comp).not.toBeNull();
    expect(comp?.nameAr).toContain("Computer Use");
    expect(comp?.tools.map((t) => t.name)).toContain("computer.capcut_automate_video");

    const browser = getMcpCatalogEntry("liotrip-browser-use");
    expect(browser).not.toBeNull();
    expect(browser?.nameAr).toContain("Browser Use");
    expect(browser?.tools.map((t) => t.name)).toContain("browser.capcut_web_editor");
  });

  it("verifies builtin catalog health for both MCP servers", async () => {
    const compVerify = await verifyBuiltinCatalog("liotrip-computer-use");
    expect(compVerify.ok).toBe(true);
    expect(compVerify.tools.length).toBe(15);

    const browserVerify = await verifyBuiltinCatalog("liotrip-browser-use");
    expect(browserVerify.ok).toBe(true);
    expect(browserVerify.tools.length).toBe(12);
  });

  it("executes deep desktop tools via Computer Use MCP", async () => {
    const clickRes = await callBuiltinTool("liotrip-computer-use", "computer.mouse_click", { x: 500, y: 300 });
    expect(clickRes.ok).toBe(true);
    expect(clickRes.content).toContain("500");

    const splitRes = await callBuiltinTool("liotrip-computer-use", "computer.capcut_split_clip", { timestampSeconds: 7.2 });
    expect(splitRes.ok).toBe(true);
    expect(splitRes.content).toContain("7.2");

    const textRes = await callBuiltinTool("liotrip-computer-use", "computer.capcut_add_text", { textAr: "عطلة فاخرة في بودروم" });
    expect(textRes.ok).toBe(true);
    expect(textRes.content).toContain("بودروم");
  });

  it("executes deep browser CDP tools via Browser Use MCP", async () => {
    const navRes = await callBuiltinTool("liotrip-browser-use", "browser.navigate", { url: "https://www.capcut.com/editor/travel-vip" });
    expect(navRes.ok).toBe(true);
    expect(navRes.content).toContain("capcut.com");

    const tabRes = await callBuiltinTool("liotrip-browser-use", "browser.get_active_tab", {});
    expect(tabRes.ok).toBe(true);
    expect(tabRes.content).toContain("CapCut");

    const videoExtract = await callBuiltinTool("liotrip-browser-use", "browser.extract_rendered_video", { projectTitle: "Reel 1" });
    expect(videoExtract.ok).toBe(true);
    expect(videoExtract.content).toContain("rendered_reel");
  });

  it("executes CapCut automated video montage via Computer Use MCP", async () => {
    const res = await callBuiltinTool("liotrip-computer-use", "computer.capcut_automate_video", {
      destination: "إسطنبول والشمال التركي",
      titleAr: "عطلات الـ VIP الفاخرة",
      subtitleAr: "أفخم الأكواخ وسيارات خاصة مع سائق عربي",
      durationSeconds: 15,
      aspectRatio: "9:16",
    });

    expect(res.ok).toBe(true);
    expect(res.content).toContain("CapCut Desktop");
    expect(res.content).toContain("رابط المعاينة");
    expect(res.content).toContain("عطلات الـ VIP الفاخرة");
  });

  it("executes CapCut Web reel generation via Browser Use MCP", async () => {
    const res = await callBuiltinTool("liotrip-browser-use", "browser.capcut_web_editor", {
      destination: "طرابزون وأوزنجول",
      templateStyle: "luxury_travel",
      durationSeconds: 15,
      aspectRatio: "9:16",
    });

    expect(res.ok).toBe(true);
    expect(res.content).toContain("CapCut Web");
    expect(res.content).toContain("رابط المعاينة");
    expect(res.content).toContain("طرابزون");
  });

  it("persists and reads site contact settings correctly on server", async () => {
    const saved = await saveSiteContactFile({
      callbackBannerEnabled: false,
      whatsappNumber: "905313591394",
      callbackPhone: "+905313591394",
      customerServicePhones: ["+905313591394"],
      email: "info@lonaliza.com",
      address: "إسطنبول، تركيا",
      whatsappMessageEn: "Hello Lonaliza Tourism!",
      whatsappMessageAr: "مرحباً لوناليزا للسياحة!",
      social: [
        { id: "whatsapp", enabled: true, url: "https://wa.me/905313591394", handle: "+905313591394" },
        { id: "instagram", enabled: true, url: "https://instagram.com/lonaliza", handle: "@lonaliza" },
      ],
      b2bAdvisorEnabled: true,
      b2bAdvisorPosition: "right",
      callbackBannerPosition: "right",
      callbackBannerBottomPx: 24,
      supportHours: "24/7",
    });

    expect(saved.callbackBannerEnabled).toBe(false);
    expect(saved.social.find((s) => s.id === "instagram")?.enabled).toBe(true);

    const reloaded = await getSiteContact();
    expect(reloaded.callbackBannerEnabled).toBe(false);
    expect(reloaded.social.find((s) => s.id === "instagram")?.enabled).toBe(true);
  });
});
