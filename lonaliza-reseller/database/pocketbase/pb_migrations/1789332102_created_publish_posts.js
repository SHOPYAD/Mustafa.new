/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
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
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "pubpo_state",
        "maxSelect": 1,
        "name": "state",
        "presentable": true,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "draft",
          "queue",
          "published",
          "error"
        ]
      },
      {
        "hidden": false,
        "id": "pubpo_publishdate",
        "max": "",
        "min": "",
        "name": "publishDate",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "date"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_pubchannels01",
        "hidden": false,
        "id": "pubpo_channel",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "channel",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "pubpo_content",
        "max": 0,
        "min": 0,
        "name": "content",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "pubpo_delay",
        "max": null,
        "min": null,
        "name": "delay",
        "onlyInt": true,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "pubpo_group",
        "max": 0,
        "min": 0,
        "name": "group",
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
        "id": "pubpo_title",
        "max": 0,
        "min": 0,
        "name": "title",
        "pattern": "",
        "presentable": true,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "pubpo_settings",
        "maxSize": 0,
        "name": "settings",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "pubpo_tags",
        "maxSize": 0,
        "name": "tags",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "pubpo_releaseid",
        "max": 0,
        "min": 0,
        "name": "releaseId",
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
        "id": "pubpo_releaseurl",
        "max": 0,
        "min": 0,
        "name": "releaseURL",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "pubpo_interval",
        "max": null,
        "min": null,
        "name": "intervalInDays",
        "onlyInt": true,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "pubpo_error",
        "max": 0,
        "min": 0,
        "name": "error",
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
        "id": "pubpo_parent",
        "max": 0,
        "min": 0,
        "name": "parentPostId",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "pubpo_method",
        "maxSelect": 1,
        "name": "creationMethod",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "unknown",
          "web",
          "mcp",
          "api",
          "autopost",
          "cli",
          "agent"
        ]
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "pubpo_description",
        "max": 0,
        "min": 0,
        "name": "description",
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
        "id": "pubpo_image",
        "max": 0,
        "min": 0,
        "name": "image",
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
        "id": "pubpo_actor",
        "max": 0,
        "min": 0,
        "name": "actorId",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      }
    ],
    "id": "pbc_publishposts01",
    "indexes": [
      "CREATE INDEX `idx_publish_posts_publish_date` ON `publish_posts` (`publishDate`)",
      "CREATE INDEX `idx_publish_posts_state` ON `publish_posts` (`state`)",
      "CREATE INDEX `idx_publish_posts_channel` ON `publish_posts` (`channel`)",
      "CREATE INDEX `idx_publish_posts_group` ON `publish_posts` (`group`)",
      "CREATE INDEX `idx_publish_posts_parent` ON `publish_posts` (`parentPostId`)"
    ],
    "listRule": null,
    "name": "publish_posts",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_publishposts01");

  return app.delete(collection);
})
