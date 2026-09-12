/// <reference path="../pb_data/types.d.ts" />
// Reseller stage templates — delivery pipeline stages managed by super admin
migrate((app) => {
  const collection = new Collection({
    id: "reseller_stages_01",
    name: "reseller_stage_templates",
    type: "base",
    system: false,
    fields: [
      { id: "rst_title_ar", name: "titleAr", type: "text", required: true },
      { id: "rst_title_en", name: "titleEn", type: "text", required: true },
      { id: "rst_title_tr", name: "titleTr", type: "text", required: false },
      { id: "rst_description_ar", name: "descriptionAr", type: "text", required: false },
      { id: "rst_description_en", name: "descriptionEn", type: "text", required: false },
      { id: "rst_order", name: "sortOrder", type: "number", required: true },
      { id: "rst_is_default", name: "isDefault", type: "bool" },
      { id: "rst_icon", name: "icon", type: "text", required: false },
    ],
    indexes: [
      "CREATE INDEX idx_reseller_stages_order ON reseller_stage_templates (sortOrder)",
    ],
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  app.save(collection);

  // Seed default delivery stages
  const stages = [
    { titleAr: "دفع مكتمل", titleEn: "Payment Complete", icon: "CreditCard", order: 1 },
    { titleAr: "تجهيز سيرفر Contabo", titleEn: "Provisioning Contabo Server", icon: "Server", order: 2 },
    { titleAr: "تثبيت aaPanel", titleEn: "Installing aaPanel", icon: "Settings", order: 3 },
    { titleAr: "إصدار شهادة SSL", titleEn: "Issuing SSL Certificate", icon: "Shield", order: 4 },
    { titleAr: "إنشاء ساب دومين قاعدة البيانات", titleEn: "Creating Database Subdomain", icon: "Database", order: 5 },
    { titleAr: "إنشاء ساب دومين البريد", titleEn: "Creating Mail Subdomain", icon: "Mail", order: 6 },
    { titleAr: "نشر النسخة", titleEn: "Deploying Instance", icon: "Upload", order: 7 },
    { titleAr: "بانتظار ربط الدومين", titleEn: "Awaiting Domain Binding", icon: "Link", order: 8 },
    { titleAr: "اختبار الاتصال", titleEn: "Connection Test", icon: "Wifi", order: 9 },
    { titleAr: "إطلاق حي", titleEn: "Live Launch", icon: "Rocket", order: 10 },
  ];

  for (const s of stages) {
    const record = new Record(collection);
    record.set("titleAr", s.titleAr);
    record.set("titleEn", s.titleEn);
    record.set("titleTr", "");
    record.set("descriptionAr", "");
    record.set("descriptionEn", "");
    record.set("sortOrder", s.order);
    record.set("isDefault", true);
    record.set("icon", s.icon);
    app.save(record);
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("reseller_stage_templates");
  app.delete(collection);
});
