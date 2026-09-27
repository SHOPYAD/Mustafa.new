/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    app.findCollectionByNameOrId("email_campaigns");
    return;
  } catch (e) {
    /* create */
  }

  const templates = app.findCollectionByNameOrId("email_templates");
  const collection = new Collection({
    name: "email_campaigns",
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
      { autogeneratePattern: "", hidden: false, id: "emcmp_name", max: 0, min: 0, name: "name", pattern: "", presentable: true, primaryKey: false, required: true, system: false, type: "text" },
      { cascadeDelete: false, collectionId: templates.id, hidden: false, id: "emcmp_tpl", maxSelect: 1, minSelect: 0, name: "template", presentable: false, required: true, system: false, type: "relation" },
      { hidden: false, id: "emcmp_aud", maxSelect: 1, name: "audience", presentable: false, required: true, system: false, type: "select", values: ["customers", "csv", "hotel", "flight", "package", "tour", "transfer", "car", "visa"] },
      { hidden: false, id: "emcmp_st", maxSelect: 1, name: "status", presentable: true, required: true, system: false, type: "select", values: ["draft", "scheduled", "queued", "sending", "paused", "completed", "cancelled"] },
      { hidden: false, id: "emcmp_sched", name: "scheduled_at", presentable: false, required: false, system: false, type: "date" },
      { hidden: false, id: "emcmp_batch", name: "batch_size", presentable: false, required: false, system: false, type: "number" },
      { hidden: false, id: "emcmp_sent", name: "sent_count", presentable: false, required: false, system: false, type: "number" },
      { hidden: false, id: "emcmp_fail", name: "failed_count", presentable: false, required: false, system: false, type: "number" },
      { hidden: false, id: "emcmp_left", name: "remaining_count", presentable: false, required: false, system: false, type: "number" },
      { hidden: false, id: "emcmp_tot", name: "total_count", presentable: false, required: false, system: false, type: "number" },
      { autogeneratePattern: "", hidden: false, id: "emcmp_err", max: 0, min: 0, name: "last_error", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" },
      { hidden: false, id: "emcmp_last", name: "last_batch_at", presentable: false, required: false, system: false, type: "date" },
      { autogeneratePattern: "", hidden: false, id: "emcmp_csv", max: 0, min: 0, name: "csv_name", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" },
    ],
    id: "pbc_5100100102",
    indexes: [],
    system: false,
  });

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_5100100102");
    return app.delete(collection);
  } catch (e) {
    return;
  }
});
