/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("email_recipients");
  try {
    if (collection.fields.getByName("company")) return;
  } catch (e) {
    /* add */
  }
  collection.fields.add(new Field({
    autogeneratePattern: "",
    hidden: false,
    id: "emrcp_company",
    max: 0,
    min: 0,
    name: "company",
    pattern: "",
    presentable: false,
    primaryKey: false,
    required: false,
    system: false,
    type: "text",
  }));
  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("email_recipients");
    collection.fields.removeById("emrcp_company");
    return app.save(collection);
  } catch (e) {
    return;
  }
});
