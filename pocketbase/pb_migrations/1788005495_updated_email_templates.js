/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_242159415")

  // update field
  collection.fields.addAt(2, new Field({
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
      "custom",
      "package_reminder",
      "tour_reminder",
      "transfer_reminder",
      "car_reminder",
      "visa_reminder",
      "hotel_success",
      "flight_success",
      "package_success",
      "tour_success",
      "transfer_success",
      "car_success",
      "visa_success"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_242159415")

  // update field
  collection.fields.addAt(2, new Field({
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
  }))

  return app.save(collection)
})
