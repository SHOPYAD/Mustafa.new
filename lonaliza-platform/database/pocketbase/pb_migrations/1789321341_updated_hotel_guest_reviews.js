/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("hotel_guest_rev_01")

  // add field
  collection.fields.addAt(16, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3421535164",
    "max": 0,
    "min": 0,
    "name": "hotelName",
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
  collection.fields.removeById("text3421535164")

  return app.save(collection)
})
