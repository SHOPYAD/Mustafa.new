/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_242159415")

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "json3630795382",
    "maxSize": 0,
    "name": "document",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_242159415")

  // remove field
  collection.fields.removeById("json3630795382")

  return app.save(collection)
})
