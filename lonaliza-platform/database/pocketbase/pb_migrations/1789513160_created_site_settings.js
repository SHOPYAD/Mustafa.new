/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.collectionName = '_superusers'",
    "deleteRule": "@request.auth.collectionName = '_superusers'",
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
        "id": "text2324736937",
        "max": 0,
        "min": 0,
        "name": "key",
        "pattern": "",
        "presentable": true,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "json494360628",
        "maxSize": 0,
        "name": "value",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "json"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text105650625",
        "max": 0,
        "min": 0,
        "name": "category",
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
        "id": "text1843675174",
        "max": 0,
        "min": 0,
        "name": "description",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      }
    ],
    "id": "pbc_3940974",
    "indexes": [],
    "listRule": "",
    "name": "site_settings",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.collectionName = '_superusers'",
    "viewRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3940974");

  return app.delete(collection);
})
