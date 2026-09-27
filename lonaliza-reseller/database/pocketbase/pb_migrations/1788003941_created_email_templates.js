/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text2560465762",
        "max": 0,
        "min": 0,
        "name": "slug",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select1002749145",
        "maxSelect": 1,
        "name": "kind",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "offers_reminder",
          "flight_reminder",
          "hotel_reminder",
          "booking_success",
          "invoice",
          "custom"
        ]
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1579384326",
        "max": 0,
        "min": 0,
        "name": "name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1043588062",
        "max": 0,
        "min": 0,
        "name": "subject_ar",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1314814613",
        "max": 0,
        "min": 0,
        "name": "subject_en",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text14240279",
        "max": 0,
        "min": 0,
        "name": "html_ar",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1890898780",
        "max": 0,
        "min": 0,
        "name": "html_en",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1434454545",
        "max": 0,
        "min": 0,
        "name": "text_ar",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text636326746",
        "max": 0,
        "min": 0,
        "name": "text_en",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "bool1686739378",
        "name": "is_builtin",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "select1602912115",
        "maxSelect": 1,
        "name": "source",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "builtin",
          "manual",
          "gemini"
        ]
      },
      {
        "hidden": false,
        "id": "json2295037201",
        "maxSize": 0,
        "name": "variables",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_242159415",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_email_templates_slug` ON `email_templates` (`slug`)"
    ],
    "listRule": null,
    "name": "email_templates",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_242159415");

  return app.delete(collection);
})
