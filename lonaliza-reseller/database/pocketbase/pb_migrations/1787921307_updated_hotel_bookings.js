/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_521116624")

  // add field
  collection.fields.addAt(24, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2139746236",
    "max": 0,
    "min": 0,
    "name": "iyzico_payment_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(25, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text498968958",
    "max": 0,
    "min": 0,
    "name": "iyzico_token",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(26, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1580793482",
    "max": 0,
    "min": 0,
    "name": "payment_status",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(27, new Field({
    "hidden": false,
    "id": "number4225641551",
    "max": null,
    "min": null,
    "name": "charged_amount",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(28, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3190136530",
    "max": 0,
    "min": 0,
    "name": "charged_currency",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(29, new Field({
    "hidden": false,
    "id": "number3111656361",
    "max": null,
    "min": null,
    "name": "display_amount",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(30, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text247213329",
    "max": 0,
    "min": 0,
    "name": "display_currency",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(31, new Field({
    "hidden": false,
    "id": "number3599798578",
    "max": null,
    "min": null,
    "name": "fx_rate",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(32, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2366644523",
    "max": 0,
    "min": 0,
    "name": "fx_source",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(33, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text850754509",
    "max": 0,
    "min": 0,
    "name": "fx_at",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_521116624")

  // remove field
  collection.fields.removeById("text2139746236")

  // remove field
  collection.fields.removeById("text498968958")

  // remove field
  collection.fields.removeById("text1580793482")

  // remove field
  collection.fields.removeById("number4225641551")

  // remove field
  collection.fields.removeById("text3190136530")

  // remove field
  collection.fields.removeById("number3111656361")

  // remove field
  collection.fields.removeById("text247213329")

  // remove field
  collection.fields.removeById("number3599798578")

  // remove field
  collection.fields.removeById("text2366644523")

  // remove field
  collection.fields.removeById("text850754509")

  return app.save(collection)
})
