/// <reference path="../pb_data/types.d.ts" />
// Reseller progress — per-company delivery stage status
migrate((app) => {
  const collection = new Collection({
    id: "reseller_progress_01",
    name: "reseller_progress",
    type: "base",
    system: false,
    fields: [
      { id: "rp_company", name: "company", type: "relation", required: true, collectionId: "reseller_companies_01", cascadeDelete: true, maxSelect: 1 },
      { id: "rp_stage", name: "stage", type: "relation", required: true, collectionId: "reseller_stages_01", cascadeDelete: false, maxSelect: 1 },
      { id: "rp_status", name: "status", type: "select", required: true, values: ["pending", "in_progress", "done", "skipped"] },
      { id: "rp_notes", name: "notes", type: "text", required: false },
      { id: "rp_completed_at", name: "completedAt", type: "date", required: false },
    ],
    indexes: [
      "CREATE INDEX idx_reseller_progress_company ON reseller_progress (company)",
      "CREATE UNIQUE INDEX idx_reseller_progress_cs ON reseller_progress (company, stage)",
    ],
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("reseller_progress");
  app.delete(collection);
});
