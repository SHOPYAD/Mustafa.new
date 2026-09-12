/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1704926065")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select2363381545",
    "maxSelect": 1,
    "name": "type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "flight",
      "hotel",
      "package",
      "transfer",
      "visa",
      "tour",
      "callback",
      "contact",
      "general",
      "car"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1704926065")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select2363381545",
    "maxSelect": 1,
    "name": "type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "flight",
      "hotel",
      "package",
      "transfer",
      "visa",
      "tour",
      "callback",
      "contact",
      "general"
    ]
  }))

  return app.save(collection)
})
