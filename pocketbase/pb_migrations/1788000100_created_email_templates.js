/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    app.findCollectionByNameOrId("email_templates");
    return;
  } catch (e) {
    /* create */
  }

  const collection = new Collection({
    name: "email_templates",
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
      { autogeneratePattern: "", hidden: false, id: "emtpl_slug", max: 0, min: 0, name: "slug", pattern: "", presentable: true, primaryKey: false, required: true, system: false, type: "text" },
      { hidden: false, id: "emtpl_kind", maxSelect: 1, name: "kind", presentable: true, required: true, system: false, type: "select", values: ["offers_reminder", "flight_reminder", "hotel_reminder", "package_reminder", "tour_reminder", "transfer_reminder", "car_reminder", "visa_reminder", "booking_success", "hotel_success", "flight_success", "package_success", "tour_success", "transfer_success", "car_success", "visa_success", "invoice", "custom"] },
      { autogeneratePattern: "", hidden: false, id: "emtpl_name", max: 0, min: 0, name: "name", pattern: "", presentable: true, primaryKey: false, required: true, system: false, type: "text" },
      { autogeneratePattern: "", hidden: false, id: "emtpl_subar", max: 0, min: 0, name: "subject_ar", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" },
      { autogeneratePattern: "", hidden: false, id: "emtpl_suben", max: 0, min: 0, name: "subject_en", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" },
      { autogeneratePattern: "", hidden: false, id: "emtpl_htmlar", max: 0, min: 0, name: "html_ar", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" },
      { autogeneratePattern: "", hidden: false, id: "emtpl_htmlen", max: 0, min: 0, name: "html_en", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" },
      { autogeneratePattern: "", hidden: false, id: "emtpl_txtar", max: 0, min: 0, name: "text_ar", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" },
      { autogeneratePattern: "", hidden: false, id: "emtpl_txten", max: 0, min: 0, name: "text_en", pattern: "", presentable: false, primaryKey: false, required: false, system: false, type: "text" },
      { hidden: false, id: "emtpl_builtin", name: "is_builtin", presentable: false, required: false, system: false, type: "bool" },
      { hidden: false, id: "emtpl_source", maxSelect: 1, name: "source", presentable: false, required: false, system: false, type: "select", values: ["builtin", "manual", "gemini"] },
      { hidden: false, id: "emtpl_vars", maxSize: 0, name: "variables", presentable: false, required: false, system: false, type: "json" },
    ],
    id: "pbc_5100100101",
    indexes: ["CREATE UNIQUE INDEX `idx_email_templates_slug` ON `email_templates` (`slug`)"],
    system: false,
  });

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_5100100101");
    return app.delete(collection);
  } catch (e) {
    return;
  }
});
