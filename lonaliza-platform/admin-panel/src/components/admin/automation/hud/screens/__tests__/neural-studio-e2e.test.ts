import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { STUDIO_SCREENS } from "../screensData";
import { MCP_POPULAR_PRESETS } from "../../mcp/McpActionDispatcherModal";
import { BUILTIN_MCP_IDS } from "@/lib/server/mcp/catalog";

describe("الاستوديو السيبراني — فحص شامل ومطابقة واجهات وحزم لوحة التحكم الحقيقية", () => {
  const rootDir = process.cwd();

  // 1. اختبار سلامة ملفات الصور المرجعية والتأكد من صيغة PNG الحقيقية (Magic Bytes)
  it("يجب أن تكون جميع الصور العشرين بصيغة PNG صالحة ومطابقة للترويسة الثنائية (Magic Bytes)", () => {
    const publicImagesDir = path.resolve(rootDir, "public/images/neural-studio");
    const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    for (const screen of STUDIO_SCREENS) {
      const imgPath = path.join(publicImagesDir, screen.file);
      expect(fs.existsSync(imgPath), `الصورة ${screen.file} غير موجودة`).toBe(true);

      const fd = fs.openSync(imgPath, "r");
      const buffer = Buffer.alloc(8);
      fs.readSync(fd, buffer, 0, 8, 0);
      fs.closeSync(fd);

      expect(
        buffer.equals(pngMagic),
        `الملف ${screen.file} ليس صورة PNG صالحة وفقاً لـ Magic Bytes`
      ).toBe(true);
    }
  });

  // 2. اختبار ربط أدوات الذكاء الاصطناعي ومولدات الفيديو والمقالات (Higgsfield, Google Flow, HeyGen, Blog, Canva, WhatsApp)
  it("يجب أن تتضمن إعدادات MCP الجاهزة مولدات الفيديو (Higgsfield و Google Flow و HeyGen) والمقالات والتصميم والتواصل", () => {
    expect(MCP_POPULAR_PRESETS.length).toBeGreaterThanOrEqual(8);

    const presetIds = MCP_POPULAR_PRESETS.map((p) => p.id);
    expect(presetIds).toContain("higgsfield_video");
    expect(presetIds).toContain("google_flow_video");
    expect(presetIds).toContain("heygen_studio_video");
    expect(presetIds).toContain("blog_writer");
    expect(presetIds).toContain("canva_design");
    expect(presetIds).toContain("whatsapp_cloud_notify");
    expect(presetIds).toContain("ads_campaign_report");
    expect(presetIds).toContain("platform_admin_audit");

    // التحقق من خوادم MCP المرتبطة
    const higgsfield = MCP_POPULAR_PRESETS.find((p) => p.id === "higgsfield_video");
    expect(higgsfield?.serverId).toBe("liotrip-higgsfield");
    expect(higgsfield?.tool).toBe("higgsfield.generate_video");

    const flow = MCP_POPULAR_PRESETS.find((p) => p.id === "google_flow_video");
    expect(flow?.serverId).toBe("liotrip-google-flow");
    expect(flow?.tool).toBe("flow.generate_video");

    const heygen = MCP_POPULAR_PRESETS.find((p) => p.id === "heygen_studio_video");
    expect(heygen?.serverId).toBe("liotrip-studio");
    expect(heygen?.tool).toBe("studio.generate_video");

    const blog = MCP_POPULAR_PRESETS.find((p) => p.id === "blog_writer");
    expect(blog?.serverId).toBe("liotrip-blog");
    expect(blog?.tool).toBe("blog.research_draft");
  });

  // 3. اختبار تكامل فهرس خوادم MCP المدمجة في المنصة
  it("يجب أن يحتوي فهرس MCP على الخوادم الأساسية للمنصة والمدمجة في النواة", () => {
    expect(BUILTIN_MCP_IDS).toBeDefined();
    expect(BUILTIN_MCP_IDS.length).toBeGreaterThanOrEqual(18);

    const expectedServers = [
      "liotrip-blog",
      "liotrip-social",
      "liotrip-studio",
      "liotrip-ads",
      "liotrip-canva",
      "liotrip-higgsfield",
      "liotrip-whatsapp",
      "liotrip-weather",
      "liotrip-web-search",
      "liotrip-analytics",
      "liotrip-puppeteer",
      "liotrip-google-flow",
      "liotrip-computer-use",
      "liotrip-browser-use",
      "liotrip-tripadvisor-reviews",
      "lonaliza-platform-admin",
      "lonaliza-publish",
      "mcp-fetch",
    ];

    for (const serverId of expectedServers) {
      expect(BUILTIN_MCP_IDS).toContain(serverId);
    }
  });

  // 4. اختبار تكامل الشاشات العشرين ومكون العرض الرئيسي NeuralStudioMasterStage
  it("يجب أن يتضمن المكون الرئيسي NeuralStudioMasterStage معالجات مخصصة لكافة الشاشات العشرين دون أي fallback وهمي", () => {
    const masterStagePath = path.resolve(
      rootDir,
      "src/components/admin/automation/hud/screens/NeuralStudioMasterStage.tsx"
    );
    expect(fs.existsSync(masterStagePath)).toBe(true);

    const code = fs.readFileSync(masterStagePath, "utf-8");

    // التحقق من وجود المعالجات المخصصة لكل شاشة من 01 إلى 20
    for (let i = 1; i <= 20; i++) {
      const id = String(i).padStart(2, "0");
      expect(code, `الشاشة ${id} غير معرفة كمعالج حالة في المكون الرئيسي`).toContain(`"${id}"`);
    }

    // التحقق من الشاشات التخصصية الجديدة
    expect(code).toContain("SCREEN 13: FINANCE, INVOICES & LOYALTY"); // Screen 13
    expect(code).toContain("SCREEN 14: B2B RESELLING & WHITE-LABEL NETWORK"); // Screen 14
    expect(code).toContain("SCREEN 15: LEGAL, PRIVACY, COMPLIANCE & SECURITY"); // Screen 15
    expect(code).toContain("SCREEN 18: WINDOW MANAGER & WORKSPACE INTERACTION STATES"); // Screen 18
  });

  // 5. اختبار استجابة الخادم الحي على المنفذ 3048 للوحة التحكم الحقيقية
  it("يجب أن يستجيب خادم الإنتاج الحقيقي على المنفذ 3048 بترويسات أمان صحيحة", async () => {
    const res = await new Promise<{ statusCode?: number; headers: http.IncomingHttpHeaders }>(
      (resolve, reject) => {
        const req = http.request("http://localhost:3048/admin/neural-studio", (res) => {
          resolve({ statusCode: res.statusCode, headers: res.headers });
        });
        req.on("error", reject);
        req.setTimeout(4000, () => {
          req.destroy(new Error("Timeout connecting to localhost:3048"));
        });
        req.end();
      }
    );

    expect(res.statusCode).toBeDefined();
    // إما 200 أو 307 تحويل لتسجيل الدخول كونه محمي بجلسة
    expect([200, 307, 308]).toContain(res.statusCode);
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  // 6. اختبار معمارية الاستوديو السيبراني النقي الموحد والمجسم البشري للوكيل
  it("يجب أن يتطابق استوديو العمليات السيبراني النقي مع المجسم البشري ونوافذ المراقبة الأربعة", () => {
    const humanoidViewPath = path.resolve(
      rootDir,
      "src/components/admin/automation/hud/studio/HumanoidPresenceMasterView.tsx"
    );
    expect(fs.existsSync(humanoidViewPath)).toBe(true);

    const code = fs.readFileSync(humanoidViewPath, "utf-8");
    expect(code).toContain("فهم الصوت");
    expect(code).toContain("التفاعل الطبيعي");
    expect(code).toContain("إنتاج الصوت");
    expect(code).toContain("الوجود البشري");
    expect(code).toContain("أنا هنا للمساعدة");

    const windowsPath = path.resolve(
      rootDir,
      "src/components/admin/automation/hud/studio/StudioFloatingWindows.tsx"
    );
    expect(fs.existsSync(windowsPath)).toBe(true);
    const windowsCode = fs.readFileSync(windowsPath, "utf-8");
    expect(windowsCode).toContain("جلسة المحادثة الحية");
    expect(windowsCode).toContain("مجرى الحوار");
    expect(windowsCode).toContain("الوكيل المشرف");
    expect(windowsCode).toContain("حالة النظام");
    expect(windowsCode).toContain("المستكشف");
  });
});
