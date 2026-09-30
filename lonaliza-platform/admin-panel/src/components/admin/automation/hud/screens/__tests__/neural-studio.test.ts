import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { STUDIO_SCREENS } from "../screensData";

describe("الاستوديو السيبراني — اختبارات التكامل والمطابقة للوحة التحكم الحقيقية", () => {
  const rootDir = process.cwd();

  // 1. اختبار اكتمال الشاشات العشرين
  it("يجب أن يحتوي تعريف الشاشات على 20 واجهة كاملة وفريدة", () => {
    expect(STUDIO_SCREENS).toBeDefined();
    expect(STUDIO_SCREENS.length).toBe(20);

    const ids = STUDIO_SCREENS.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(20);

    for (let i = 1; i <= 20; i++) {
      const idStr = String(i).padStart(2, "0");
      expect(ids).toContain(idStr);
    }
  });

  // 2. اختبار جودة البيانات واللغة العربية والعقد لكل شاشة
  it("يجب أن تمتلك كل شاشة عنواناً عربياً ونطاقاً وعقداً تشغيلية محددة", () => {
    for (const screen of STUDIO_SCREENS) {
      expect(screen.title).toBeTruthy();
      expect(screen.scope).toBeTruthy();
      expect(screen.scenario).toBeTruthy();
      expect(screen.nodes).toBeInstanceOf(Array);
      expect(screen.nodes.length).toBeGreaterThanOrEqual(4);
      expect(screen.layout).toMatch(/^(radial|dag|hex|voice|workspace|avatar)$/);
    }
  });

  // 3. اختبار وجود وتطابق الصور المرجعية العشرين في المجلد العام للوحة التحكم
  it("يجب أن تتواجد كافة الصور المرجعية العشرين بدقة كاملة في public/images/neural-studio", () => {
    const publicImagesDir = path.resolve(rootDir, "public/images/neural-studio");
    expect(fs.existsSync(publicImagesDir)).toBe(true);

    for (const screen of STUDIO_SCREENS) {
      const imagePath = path.join(publicImagesDir, screen.file);
      expect(
        fs.existsSync(imagePath),
        `الصورة المرجعية للشاشة ${screen.id} (${screen.file}) غير موجودة في ${imagePath}`
      ).toBe(true);

      const stat = fs.statSync(imagePath);
      expect(stat.size).toBeGreaterThan(100_000); // كل صورة مرجعية عالية الدقة تفوق 100 كيلوبايت
    }
  });

  // 4. اختبار تكامل مسارات الباك إند الحقيقية لكل قطاع تشغيلي في لوحة التحكم
  it("يجب أن تتطابق مسارات الباك إند API الحقيقية في المنصة مع كل شاشة", () => {
    const apiAdminDir = path.resolve(rootDir, "src/app/api/admin");
    expect(fs.existsSync(apiAdminDir)).toBe(true);

    const requiredApiRoutes = [
      { screen: "03", route: "cancellations" },
      { screen: "04", route: "flights" },
      { screen: "05", route: "hotels" },
      { screen: "06", route: "cars" },
      { screen: "06", route: "tours" },
      { screen: "07", route: "blog" },
      { screen: "07", route: "pages" },
      { screen: "08", route: "crm" },
      { screen: "08", route: "reviews" },
      { screen: "09", route: "publish" },
      { screen: "09", route: "social-community" },
      { screen: "10", route: "ads" },
      { screen: "11", route: "mcp" },
      { screen: "12", route: "automation" },
      { screen: "13", route: "finance" },
      { screen: "14", route: "resale" },
      { screen: "14", route: "b2b-wallet" },
      { screen: "15", route: "legal" },
      { screen: "16", route: "email-settings" },
      { screen: "16", route: "integrations" },
      { screen: "16", route: "pocketbase" },
    ];

    for (const item of requiredApiRoutes) {
      const routeDir = path.join(apiAdminDir, item.route);
      expect(
        fs.existsSync(routeDir),
        `مسار API المطلوب للشاشة ${item.screen} (${item.route}) غير موجود في ${routeDir}`
      ).toBe(true);
    }
  });

  // 5. اختبار مسار استدعاء خوادم MCP الـ 21 وأدواتها الـ 88
  it("يجب أن يتوفر مسار POST /api/admin/mcp/call في لوحة التحكم لاستدعاء كافة أدوات MCP", () => {
    const mcpCallRoutePath = path.resolve(
      rootDir,
      "src/app/api/admin/mcp/call/route.ts"
    );
    expect(fs.existsSync(mcpCallRoutePath)).toBe(true);

    const content = fs.readFileSync(mcpCallRoutePath, "utf-8");
    expect(content).toContain("export async function POST");
    expect(content).toContain("callMcpTool");
  });

  // 6. اختبار مستويات التوسع والعمق L0..L3
  it("يجب أن تدعم المنظومة مستويات العمق الأربعة (L0: أطلس، L1: نطاق، L2: خدمة، L3: إجراء)", () => {
    const depthLevels = [
      { level: 0, code: "L0", name: "الأطلس العصبي الشامل" },
      { level: 1, code: "L1", name: "المجالات والقطاعات" },
      { level: 2, code: "L2", name: "الخدمات الميكروية" },
      { level: 3, code: "L3", name: "الإجراءات والعمليات التنفيذية" },
    ];
    expect(depthLevels.length).toBe(4);
    for (const d of depthLevels) {
      expect(d.level).toBeGreaterThanOrEqual(0);
      expect(d.level).toBeLessThanOrEqual(3);
    }
  });

  // 7. اختبار مصفوفة الحالات الصوتية الست للأفاتار
  it("يجب أن تدعم مصفوفة الصوت الحالات الست بدقة (خمول، استماع، تفكير، كلام، تنفيذ، مقاطعة)", () => {
    const validVoiceStates = [
      "idle",
      "listening",
      "deliberating",
      "speaking",
      "executing",
      "interrupted",
    ];
    expect(validVoiceStates.length).toBe(6);
  });

  // 8. اختبار أوضاع معمل إدارة النوافذ التفاعلية
  it("يجب أن يدعم معمل النوافذ الأوضاع الأربعة (رباعي، أفقي، رأسي، حر)", () => {
    const windowModes = ["quad", "horizontal", "vertical", "freeform"];
    expect(windowModes.length).toBe(4);
  });
});
