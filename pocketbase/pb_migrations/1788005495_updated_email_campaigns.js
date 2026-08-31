/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2184447689")

  // update field
  collection.fields.addAt(3, new Field({
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
      "csv",
      "hotel",
      "flight",
      "package",
      "tour",
      "transfer",
      "car",
      "visa"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2184447689")

  // update field
  collection.fields.addAt(3, new Field({
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
  }))

  return app.save(collection)
})
