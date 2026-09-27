/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. crm_leads collection
  const crmLeads = new Collection({
    "name": "crm_leads",
    "type": "base",
    "system": false,
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "@request.auth.collectionName = '_superusers'",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text_crm_id",
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
        "id": "autodate_crm_c",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate_crm_u",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "name": "name",
        "type": "text",
        "required": true,
        "presentable": true
      },
      {
        "name": "email",
        "type": "text",
        "required": false
      },
      {
        "name": "phone",
        "type": "text",
        "required": false
      },
      {
        "name": "service_type",
        "type": "text",
        "required": false
      },
      {
        "name": "destination",
        "type": "text",
        "required": false
      },
      {
        "name": "estimated_budget",
        "type": "number",
        "required": false
      },
      {
        "name": "currency",
        "type": "text",
        "required": false
      },
      {
        "name": "stage",
        "type": "text",
        "required": true
      },
      {
        "name": "priority",
        "type": "text",
        "required": false
      },
      {
        "name": "assigned_agent",
        "type": "text",
        "required": false
      },
      {
        "name": "probability",
        "type": "number",
        "required": false
      },
      {
        "name": "source",
        "type": "text",
        "required": false
      },
      {
        "name": "notes",
        "type": "text",
        "required": false
      },
      {
        "name": "due_date",
        "type": "text",
        "required": false
      }
    ]
  });
  app.save(crmLeads);

  // 2. site_traffic_logs collection
  const trafficLogs = new Collection({
    "name": "site_traffic_logs",
    "type": "base",
    "system": false,
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "@request.auth.collectionName = '_superusers'",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text_trf_id",
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
        "id": "autodate_trf_c",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate_trf_u",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "name": "path",
        "type": "text",
        "required": true,
        "presentable": true
      },
      {
        "name": "source",
        "type": "text",
        "required": false
      },
      {
        "name": "referrer",
        "type": "text",
        "required": false
      },
      {
        "name": "device",
        "type": "text",
        "required": false
      },
      {
        "name": "browser",
        "type": "text",
        "required": false
      },
      {
        "name": "country",
        "type": "text",
        "required": false
      },
      {
        "name": "duration_seconds",
        "type": "number",
        "required": false
      },
      {
        "name": "session_id",
        "type": "text",
        "required": false
      }
    ]
  });
  app.save(trafficLogs);

  // 3. financial_transactions collection
  const finTx = new Collection({
    "name": "financial_transactions",
    "type": "base",
    "system": false,
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "@request.auth.collectionName = '_superusers'",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text_fin_id",
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
        "id": "autodate_fin_c",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate_fin_u",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "name": "reference",
        "type": "text",
        "required": true,
        "presentable": true
      },
      {
        "name": "type",
        "type": "text",
        "required": true
      },
      {
        "name": "category",
        "type": "text",
        "required": false
      },
      {
        "name": "amount",
        "type": "number",
        "required": true
      },
      {
        "name": "currency",
        "type": "text",
        "required": true
      },
      {
        "name": "gateway",
        "type": "text",
        "required": false
      },
      {
        "name": "status",
        "type": "text",
        "required": true
      },
      {
        "name": "counterparty",
        "type": "text",
        "required": false
      },
      {
        "name": "description",
        "type": "text",
        "required": false
      }
    ]
  });
  return app.save(finTx);
}, (app) => {
  try {
    const c1 = app.findCollectionByNameOrId("crm_leads");
    if (c1) app.delete(c1);
  } catch {}
  try {
    const c2 = app.findCollectionByNameOrId("site_traffic_logs");
    if (c2) app.delete(c2);
  } catch {}
  try {
    const c3 = app.findCollectionByNameOrId("financial_transactions");
    if (c3) app.delete(c3);
  } catch {}
});
