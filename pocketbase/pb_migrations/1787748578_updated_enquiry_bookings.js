/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1704926065")

  // remove field
  collection.fields.removeById("text1617326367")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1704926065")

  // add field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1617326367",
    "max": 0,
    "min": 0,
    "name": "ref_code",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
