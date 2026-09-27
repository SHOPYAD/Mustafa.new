/// <reference path="../pb_data/types.d.ts" />
// Reseller settings — singleton config managed by the super admin
migrate((app) => {
  const collection = new Collection({
    id: "reseller_settings_01",
    name: "reseller_settings",
    type: "base",
    system: false,
    fields: [
      { id: "rs_lifetime_price", name: "lifetimePrice", type: "number", required: true },
      { id: "rs_update_price", name: "updatePrice", type: "number", required: true },
      { id: "rs_currency", name: "currency", type: "text", required: true },
      { id: "rs_contabo_specs", name: "contaboSpecs", type: "text", required: false },
      { id: "rs_delivery_hours", name: "deliveryHours", type: "text", required: false },
      { id: "rs_support_whatsapp", name: "supportWhatsapp", type: "text", required: false },
      { id: "rs_features", name: "features", type: "json", required: false },
      { id: "rs_whatsapp_bank_enabled", name: "whatsappBankEnabled", type: "bool" },
      { id: "rs_active", name: "active", type: "bool" },
    ],
    indexes: [],
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  app.save(collection);

  // Seed default settings
  const record = new Record(collection);
  record.set("lifetimePrice", 1990);
  record.set("updatePrice", 50);
  record.set("currency", "USD");
  record.set("contaboSpecs", "Cloud VPS 6 — 6 vCPU Cores, 12 GB RAM, 200 GB NVMe SSD, Unlimited Traffic, DDoS Protection");
  record.set("deliveryHours", "12–24");
  record.set("supportWhatsapp", "+905015709201");
  record.set("features", JSON.stringify([]));
  record.set("whatsappBankEnabled", true);
  record.set("active", true);
  app.save(record);
}, (app) => {
  const collection = app.findCollectionByNameOrId("reseller_settings");
  app.delete(collection);
});
