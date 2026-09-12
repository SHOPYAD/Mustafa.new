/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    app.findCollectionByNameOrId("email_recipients");
    return;
  } catch (e) {
    /* create */
  }

  const campaigns = app.findCollectionByNameOrId("email_campaigns");
  const collection = new Collection({
    name: "email_recipients",
    type: "base",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        autogeneratePattern: "[a-z0-9]{15}",
        hidden: false,
        id: "text3208210256",
        max: 15,
        min: 15,
        name: "id",
        pattern: "^[a-z0-9]+$",
        presentable: false,
        primaryKey: true,
        required: true,
        system: true,
        type: "text",
      },
      { hidden: false, id: "autodate2990389176", name: "created", onCreate: true, onUpdate: false, presentable: false, system: false, type: "autodate" },
      { hidden: false, id: "autodate3332085495", name: "updated", onCreate: true, onUpdate: true, presentable: false, system: false, type: "autodate" },
      { cascadeDelete: true, collectionId: campaigns.id, hidden: false, id: "emrcp_cmp", maxSelect: 1, minSelect: 0, name: "campaign", presentable: false, required: true, system: false, type: "relation" },
      { exceptDomains: null, hidden: false, id: "emrcp_email", name: "email", onlyDomains: null, presentable: true, required: true, system: false, type: "email" },
      { autogeneratePattern: "", hidden: false, id: "emrcp_name", max: 0, min: 0, name: "name", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" },
      { hidden: false, id: "emrcp_st", maxSelect: 1, name: "status", presentable: true, required: true, system: false, type: "select", values: ["pending", "sent", "failed", "skipped"] },
      { autogeneratePattern: "", hidden: false, id: "emrcp_err", max: 0, min: 0, name: "error", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" },
      { hidden: false, id: "emrcp_sent", name: "sent_at", presentable: false, required: false, system: false, type: "date" },
    ],
    id: "pbc_5100100103",
    indexes: [
      "CREATE INDEX `idx_email_recipients_campaign_status` ON `email_recipients` (`campaign`, `status`)",
    ],
    system: false,
  });

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_5100100103");
    return app.delete(collection);
  } catch (e) {
    return;
  }
});
