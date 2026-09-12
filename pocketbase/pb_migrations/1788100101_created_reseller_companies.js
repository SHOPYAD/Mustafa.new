/// <reference path="../pb_data/types.d.ts" />
// Reseller companies — partner tourism companies that purchase a license
migrate((app) => {
  const collection = new Collection({
    id: "reseller_companies_01",
    name: "reseller_companies",
    type: "base",
    system: false,
    fields: [
      { id: "rc_google_id", name: "googleId", type: "text", required: false },
      { id: "rc_email", name: "email", type: "email", required: true },
      { id: "rc_company_name", name: "companyName", type: "text", required: true },
      { id: "rc_company_name_ar", name: "companyNameAr", type: "text", required: false },
      { id: "rc_logo", name: "logo", type: "file", required: false, maxSelect: 1, maxSize: 2097152, mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"] },
      { id: "rc_requested_domain", name: "requestedDomain", type: "text", required: false },
      { id: "rc_phone", name: "phone", type: "text", required: false },
      { id: "rc_status", name: "status", type: "select", required: true, values: ["registered", "paid", "provisioning", "active", "suspended"] },
      { id: "rc_notes", name: "notes", type: "text", required: false },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_reseller_companies_email ON reseller_companies (email)",
    ],
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("reseller_companies");
  app.delete(collection);
});
