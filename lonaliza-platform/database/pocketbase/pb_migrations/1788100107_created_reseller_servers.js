/// <reference path="../pb_data/types.d.ts" />
// Reseller servers — VPS info per company
migrate((app) => {
  const collection = new Collection({
    id: "reseller_servers_01",
    name: "reseller_servers",
    type: "base",
    system: false,
    fields: [
      { id: "rsrv_company", name: "company", type: "relation", required: true, collectionId: "reseller_companies_01", cascadeDelete: true, maxSelect: 1 },
      { id: "rsrv_ip", name: "ipAddress", type: "text", required: true },
      { id: "rsrv_aapanel_url", name: "aapanelUrl", type: "text", required: false },
      { id: "rsrv_aapanel_notes", name: "aapanelNotes", type: "text", required: false },
      { id: "rsrv_contabo_id", name: "contaboId", type: "text", required: false },
      { id: "rsrv_region", name: "region", type: "text", required: false },
      { id: "rsrv_provisioned_at", name: "provisionedAt", type: "date", required: false },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_reseller_servers_company ON reseller_servers (company)",
    ],
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("reseller_servers");
  app.delete(collection);
});
