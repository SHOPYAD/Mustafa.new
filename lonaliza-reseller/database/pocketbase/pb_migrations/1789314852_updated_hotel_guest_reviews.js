/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("hotel_guest_rev_01")

  // add field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3181857858",
    "max": 0,
    "min": 0,
    "name": "originalTitle",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2736193677",
    "max": 0,
    "min": 0,
    "name": "originalText",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2845123368",
    "max": 0,
    "min": 0,
    "name": "originalLang",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("hotel_guest_rev_01")

  // remove field
  collection.fields.removeById("text3181857858")

  // remove field
  collection.fields.removeById("text2736193677")

  // remove field
  collection.fields.removeById("text2845123368")

  return app.save(collection)
})
