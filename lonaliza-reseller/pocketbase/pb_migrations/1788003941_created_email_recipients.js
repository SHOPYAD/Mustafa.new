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
        "cascadeDelete": true,
        "collectionId": "pbc_2184447689",
        "hidden": false,
        "id": "relation521474781",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "campaign",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "exceptDomains": null,
        "hidden": false,
        "id": "email3885137012",
        "name": "email",
        "onlyDomains": null,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "email"
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
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select2063623452",
        "maxSelect": 1,
        "name": "status",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "pending",
          "sent",
          "failed",
          "skipped"
        ]
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1574812785",
        "max": 0,
        "min": 0,
        "name": "error",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "date2531586952",
        "max": "",
        "min": "",
        "name": "sent_at",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      }
    ],
    "id": "pbc_2797239966",
    "indexes": [
      "CREATE INDEX `idx_email_recipients_campaign_status` ON `email_recipients` (`campaign`, `status`)"
    ],
    "listRule": null,
    "name": "email_recipients",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2797239966");

  return app.delete(collection);
})
