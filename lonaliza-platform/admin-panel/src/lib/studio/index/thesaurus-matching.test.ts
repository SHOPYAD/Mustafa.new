import { describe, expect, it } from "vitest";
import { bestPlatformNode, matchPlatformNodes } from "./platform-index";
import { getThesaurusStats, THESAURUS_CLUSTERS } from "./domain-thesaurus";

describe("Sovereign Domain Thesaurus & Semantic Matching", () => {
  it("has rich thesaurus clusters and over 5,000 unique terms", () => {
    const stats = getThesaurusStats();
    expect(stats.totalClusters).toBeGreaterThanOrEqual(25);
    expect(stats.totalTerms).toBeGreaterThanOrEqual(5000);
    expect(THESAURUS_CLUSTERS.length).toBeGreaterThanOrEqual(25);
  });

  it("accurately matches Saudi/Gulf dialect travel queries", () => {
    const m1 = bestPlatformNode("ابغى احجز طيران مباشر");
    expect(m1).toBeDefined();
    expect(m1?.node.id).toMatch(/flights|screen\.04/);

    const m2 = bestPlatformNode("شوف لي فندق كشخة");
    expect(m2).toBeDefined();
    expect(m2?.node.id).toMatch(/hotels|screen\.05/);

    const m3 = bestPlatformNode("سيارة مرسيدس فيتو توصلنا من المطار");
    expect(m3).toBeDefined();
    expect(m3?.node.id).toMatch(/transfers|screen\.06/);
  });

  it("accurately matches Egyptian dialect travel queries", () => {
    const m1 = bestPlatformNode("عاوز احجز طيارة لاسطنبول");
    expect(m1).toBeDefined();
    expect(m1?.node.id).toMatch(/flights|screen\.04/);

    const m2 = bestPlatformNode("عايز فندق كويس في تقسيم");
    expect(m2).toBeDefined();
    expect(m2?.node.id).toMatch(/hotels|screen\.05/);
  });

  it("accurately matches Levantine dialect travel queries", () => {
    const m1 = bestPlatformNode("بدي الغي التذكرة واسترجع الفلوس");
    expect(m1).toBeDefined();
    expect(m1?.node.id).toMatch(/cancellation|flights|refund/);

    const m2 = bestPlatformNode("بدنا سيارة مع شوفير لبورصة");
    expect(m2).toBeDefined();
    expect(m2?.node.id).toMatch(/transfers|screen\.06/);
  });

  it("accurately matches financial and accounting requests", () => {
    const m1 = bestPlatformNode("طلع لي فاتورة ضريبية");
    expect(m1).toBeDefined();
    expect(m1?.node.id).toMatch(/finance|financial|invoices|screen\.09/);

    const m2 = bestPlatformNode("بوابة الدفع ايزيكو iyzico");
    expect(m2).toBeDefined();
    expect(m2?.node.id).toMatch(/finance|financial|iyzico|payments|webhook/);
  });

  it("accurately matches B2B reseller and external supplier queries", () => {
    const m1 = bestPlatformNode("اسعار الجملة لشركات السياحة b2b");
    expect(m1).toBeDefined();
    expect(m1?.node.id).toMatch(/b2b|reseller|screen\.13/);

    const m2 = bestPlatformNode("مفاتيح ربط بي كي فير pkfare");
    expect(m2).toBeDefined();
    expect(m2?.node.id).toMatch(/pkfare|supplier/);
  });
});
