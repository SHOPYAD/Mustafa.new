/// <reference path="../pb_data/types.d.ts" />
// Reseller heartbeats — license heartbeat log from client instances
migrate((app) => {
  const collection = new Collection({
    id: "reseller_heartbeats_01",
    name: "reseller_heartbeats",
    type: "base",
    system: false,
    fields: [
      { id: "rhb_license", name: "license", type: "relation", required: true, collectionId: "reseller_licenses_01", cascadeDelete: true, maxSelect: 1 },
      { id: "rhb_domain", name: "domain", type: "text", required: true },
      { id: "rhb_version", name: "version", type: "text", required: false },
      { id: "rhb_ip", name: "sourceIp", type: "text", required: false },
      { id: "rhb_status", name: "status", type: "select", required: true, values: ["ok", "version_mismatch", "domain_mismatch", "revoked"] },
    ],
    indexes: [
      "CREATE INDEX idx_reseller_heartbeats_license ON reseller_heartbeats (license)",
    ],
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("reseller_heartbeats");
  app.delete(collection);
});
