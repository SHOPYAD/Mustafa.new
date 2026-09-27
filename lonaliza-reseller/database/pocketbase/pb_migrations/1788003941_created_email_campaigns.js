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
        "cascadeDelete": false,
        "collectionId": "pbc_242159415",
        "hidden": false,
        "id": "relation2539659139",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "template",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "select4258108440",
        "maxSelect": 1,
        "name": "audience",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "customers",
          "csv"
        ]
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
          "draft",
          "scheduled",
          "queued",
          "sending",
          "paused",
          "completed",
          "cancelled"
        ]
      },
      {
        "hidden": false,
        "id": "date164390390",
        "max": "",
        "min": "",
        "name": "scheduled_at",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "number1738854037",
        "max": null,
        "min": null,
        "name": "batch_size",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "number2338708970",
        "max": null,
        "min": null,
        "name": "sent_count",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "number3818181633",
        "max": null,
        "min": null,
        "name": "failed_count",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "number2860216807",
        "max": null,
        "min": null,
        "name": "remaining_count",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "number1185665616",
        "max": null,
        "min": null,
        "name": "total_count",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1066830442",
        "max": 0,
        "min": 0,
        "name": "last_error",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "date1586585992",
        "max": "",
        "min": "",
        "name": "last_batch_at",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text4271482203",
        "max": 0,
        "min": 0,
        "name": "csv_name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      }
    ],
    "id": "pbc_2184447689",
    "indexes": [],
    "listRule": null,
    "name": "email_campaigns",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2184447689");

  return app.delete(collection);
})
