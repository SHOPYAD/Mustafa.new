/// <reference path="../pb_data/types.d.ts" />
// Reseller domain events — DNS test results and domain binding events
migrate((app) => {
  const collection = new Collection({
    id: "reseller_domain_events_01",
    name: "reseller_domain_events",
    type: "base",
    system: false,
    fields: [
      { id: "rde_company", name: "company", type: "relation", required: true, collectionId: "reseller_companies_01", cascadeDelete: true, maxSelect: 1 },
      { id: "rde_domain", name: "domain", type: "text", required: true },
      { id: "rde_event_type", name: "eventType", type: "select", required: true, values: ["dns_check", "bind_success", "bind_fail", "ssl_ok", "ssl_fail"] },
      { id: "rde_success", name: "success", type: "bool" },
      { id: "rde_details", name: "details", type: "json", required: false },
      { id: "rde_resolved_ip", name: "resolvedIp", type: "text", required: false },
      { id: "rde_expected_ip", name: "expectedIp", type: "text", required: false },
      { id: "rde_error_code", name: "errorCode", type: "text", required: false },
      { id: "rde_error_message", name: "errorMessage", type: "text", required: false },
    ],
    indexes: [
      "CREATE INDEX idx_reseller_domain_events_company ON reseller_domain_events (company)",
      "CREATE INDEX idx_reseller_domain_events_type ON reseller_domain_events (eventType)",
    ],
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("reseller_domain_events");
  app.delete(collection);
});
