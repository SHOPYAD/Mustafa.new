import { expect, test } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.route("**/api/admin/automation/studio-snapshot?*", route => route.fulfill({
    json: { ok: true, status: "not_connected", observations: [] },
  }));
  await page.goto("/");
  await expect(page.getByTestId("neural-studio")).toBeVisible();
});
test("RTL explorer closes and reopens without losing navigation", async ({ page }) => {
  const explorer = page.getByRole("complementary", { name: "مستكشف المنصة" });
  const box = await explorer.boundingBox();
  expect(box!.x).toBeGreaterThan(1200);
  await page.getByRole("button", { name: "إغلاق المستكشف" }).click();
  await expect(explorer).not.toBeVisible();
  await page.getByRole("button", { name: "فتح المستكشف" }).click();
  await expect(explorer).toBeVisible();
});
test("expansion retains earlier branches and source-linked leaf inspection", async ({ page }) => {
  await page.getByRole("button", { name: "توسيع الحجوزات والإلغاءات", exact: true }).click();
  await page.getByRole("button", { name: "فتح مجموعة الخدمات", exact: true }).click();
  await page.getByRole("button", { name: "توسيع الطيران والتوزيع", exact: true }).click();
  await expect(page.getByRole("button", { name: "توسيع الحجوزات والإلغاءات", exact: true })).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("complementary").getByRole("button", { name: "إدارة الحجوزات", exact: true }).click();
  await expect(page.getByTestId("window-inspector")).toContainText("/admin/bookings");
  await expect(page.getByRole("link", { name: "فتح واجهة القسم الحالية" })).toHaveAttribute("href", "/admin/bookings");
});
test("windows minimize, restore, close and reopen", async ({ page }) => {
  await page.getByRole("button", { name: "تصغير النافذة", exact: true }).click();
  expect((await page.getByTestId("window-inspector").boundingBox())!.height).toBe(44);
  await page.getByRole("button", { name: "استعادة النافذة", exact: true }).click();
  expect((await page.getByTestId("window-inspector").boundingBox())!.height).toBeGreaterThan(160);
  await page.getByRole("button", { name: "إغلاق معلومات السياق" }).click();
  await expect(page.getByTestId("window-inspector")).not.toBeVisible();
  await page.getByRole("button", { name: "إعادة النوافذ" }).click();
  await expect(page.getByTestId("window-inspector")).toBeVisible();
});
test("keyboard window movement persists across reload", async ({ page }) => {
  const box = await page.getByTestId("window-inspector").boundingBox();
  await page.getByRole("button", { name: "تحريك معلومات السياق" }).focus();
  await page.keyboard.press("ArrowRight");
  expect((await page.getByTestId("window-inspector").boundingBox())!.x).toBe(box!.x + 16);
  await page.reload();
  await expect(page.getByTestId("window-inspector")).toBeVisible();
  await expect.poll(async () => (await page.getByTestId("window-inspector").boundingBox())!.x).toBe(box!.x + 16);
});
test("server failure is not displayed as healthy", async ({ page }) => {
  await page.route("**/api/admin/automation/studio-snapshot?*", route => route.fulfill({ status: 503, json: { ok: false } }));
  await page.reload();
  await expect(page.getByTestId("source-status")).toHaveText("تعذر الاتصال");
  await expect(page.getByRole("alert")).toContainText("تعذر");
});
test("all twenty references are tracked but not auto-approved", async ({ page }) => {
  await page.getByRole("button", { name: "الواجهات العشرون" }).click();
  await expect(page.locator(".ns-reference-list li")).toHaveCount(20);
  await expect(page.locator(".ns-reference-list li").last()).toContainText("20");
});
test("records the actual production component, not an image overlay", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.reload();
  await expect(page.getByTestId("source-status")).toHaveText("غير موصول بعد");
  await page.screenshot({ path: "evidence/01-atlas-actual.png", animations: "disabled" });
  await page.getByRole("button", { name: "إغلاق المستكشف" }).click();
  await page.screenshot({ path: "evidence/18-explorer-closed-actual.png", animations: "disabled" });
  expect(errors).toEqual([]);
  await expect(page.locator(".ns-studio img")).toHaveCount(0);
});
test("mobile explorer and restored window remain reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "إغلاق المستكشف" }).click();
  const box = await page.getByTestId("window-inspector").boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await page.getByRole("button", { name: "إغلاق معلومات السياق" }).click();
  await page.getByRole("button", { name: "فتح المستكشف" }).click();
  await expect(page.getByRole("complementary")).toBeVisible();
});

test("all twenty surfaces are reachable and render their actual components", async ({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 for(let i=1;i<=20;i++){
  const id=String(i).padStart(2,"0");
  await page.getByRole("combobox",{name:"واجهة الاستوديو"}).selectOption(id);
  await expect(page.getByTestId("neural-studio")).toHaveAttribute("data-screen-id",id);
  if(id!=="01")await expect(page.getByTestId("surface-"+id)).toBeVisible();
  await page.screenshot({path:"evidence/surface-"+id+".png",animations:"disabled"});
 }
 expect(errors).toEqual([]);
});
test("native management window only opens a source catalog route", async ({page})=>{
 await page.route("**/admin/bookings",r=>r.fulfill({contentType:"text/html",body:"<h1>Test boundary: booking manager</h1>"}));
 await page.getByRole("combobox",{name:"واجهة الاستوديو"}).selectOption("03");
 await page.getByRole("group",{name:"شبكة مسارات القسم"}).getByRole("button",{name:"إدارة الحجوزات",exact:true}).click();
 await page.getByRole("button",{name:"فتح أداة الإدارة داخل الاستوديو"}).click();
 await expect(page.locator("iframe[title='أداة الإدارة الأصلية']")).toHaveAttribute("src","/admin/bookings");
});
test("draft preview never writes before explicit confirmation", async ({page})=>{
 const modes:string[]=[];
 await page.route("**/api/admin/automation/studio-action",r=>{
  const b=r.request().postDataJSON();modes.push(b.mode);
  return r.fulfill({json:b.mode==="preview"?{ok:true,token:"test-token",expiresAt:Date.now()+300000,preview:{title:"مسودة",summary:"Test",effects:["لا نشر"]}}:
   {ok:true,result:{status:"draft"}}});
 });
 await page.getByRole("combobox",{name:"واجهة الاستوديو"}).selectOption("07");
 const form=page.getByRole("region",{name:"مسودة مقال"});
 await form.getByLabel("العنوان",{exact:true}).fill("مقال للاختبار");
 await form.getByLabel("نص المسودة",{exact:true}).fill("محتوى للاختبار لا يُكتب على الإنتاج");
 await form.getByRole("button",{name:"معاينة دون كتابة"}).click();
 await expect(form.getByRole("region",{name:"مراجعة قبل الحفظ"})).toBeVisible();expect(modes).toEqual(["preview"]);
 await form.getByRole("button",{name:"أوافق على حفظ المسودة"}).click();
 await expect(form.getByRole("status")).toContainText("حُفظت");expect(modes).toEqual(["preview","confirm"]);
});
test("supervisor requests are contextual and do not execute actions", async ({page})=>{
 await page.route("**/api/admin/automation/studio-supervisor",r=>{
  expect(r.request().postDataJSON().domain).toBe("bookings");
  return r.fulfill({json:{ok:true,reply:"لا توجد بيانات من المصدر.",effects:"read_only",events:[]}});
 });
 await page.getByRole("combobox",{name:"واجهة الاستوديو"}).selectOption("03");
 await page.getByRole("button",{name:"المشرف العام",exact:true}).click();
 await page.getByLabel("رسالة المشرف").fill("ما حالة الحجوزات؟");
 await page.getByRole("button",{name:"إرسال للمشرف"}).click();
 await expect(page.getByRole("log",{name:"محادثة المشرف"})).toContainText("لا توجد بيانات من المصدر.");
});
