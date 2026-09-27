/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_521116624")

  // add field
  collection.fields.addAt(34, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3106406086",
    "max": 0,
    "min": 0,
    "name": "cancel_status",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(35, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4158997050",
    "max": 0,
    "min": 0,
    "name": "cancel_requested_at",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(36, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4187952086",
    "max": 0,
    "min": 0,
    "name": "cancel_reason",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(37, new Field({
    "hidden": false,
    "id": "number1282548191",
    "max": null,
    "min": null,
    "name": "cancel_fee_amount",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(38, new Field({
    "hidden": false,
    "id": "number3889314362",
    "max": null,
    "min": null,
    "name": "refund_amount",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(39, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4171524065",
    "max": 0,
    "min": 0,
    "name": "cancel_admin_note",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(40, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1995767991",
    "max": 0,
    "min": 0,
    "name": "cancel_approved_at",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(41, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3825182751",
    "max": 0,
    "min": 0,
    "name": "iyzico_refund_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(42, new Field({
    "hidden": false,
    "id": "bool2464081098",
    "name": "free_cancellation",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(43, new Field({
    "hidden": false,
    "id": "bool3151133948",
    "name": "non_refundable",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_521116624")

  // remove field
  collection.fields.removeById("text3106406086")

  // remove field
  collection.fields.removeById("text4158997050")

  // remove field
  collection.fields.removeById("text4187952086")

  // remove field
  collection.fields.removeById("number1282548191")

  // remove field
  collection.fields.removeById("number3889314362")

  // remove field
  collection.fields.removeById("text4171524065")

  // remove field
  collection.fields.removeById("text1995767991")

  // remove field
  collection.fields.removeById("text3825182751")

  // remove field
  collection.fields.removeById("bool2464081098")

  // remove field
  collection.fields.removeById("bool3151133948")

  return app.save(collection)
})
