/// <reference path="../pb_data/types.d.ts" />
// Reseller licenses — one per company, bound to a single domain
migrate((app) => {
  const collection = new Collection({
    id: "reseller_licenses_01",
    name: "reseller_licenses",
    type: "base",
    system: false,
    fields: [
      { id: "rl_company", name: "company", type: "relation", required: true, collectionId: "reseller_companies_01", cascadeDelete: false, maxSelect: 1 },
      { id: "rl_license_key", name: "licenseKey", type: "text", required: true },
      { id: "rl_status", name: "status", type: "select", required: true, values: ["issued", "bound", "revoked", "expired"] },
      { id: "rl_bound_domain", name: "boundDomain", type: "text", required: false },
      { id: "rl_first_activation", name: "firstActivation", type: "date", required: false },
      { id: "rl_last_heartbeat", name: "lastHeartbeat", type: "date", required: false },
      { id: "rl_version", name: "currentVersion", type: "text", required: false },
      { id: "rl_online", name: "online", type: "bool" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_reseller_licenses_key ON reseller_licenses (licenseKey)",
      "CREATE INDEX idx_reseller_licenses_company ON reseller_licenses (company)",
      "CREATE INDEX idx_reseller_licenses_domain ON reseller_licenses (boundDomain)",
    ],
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("reseller_licenses");
  app.delete(collection);
});
