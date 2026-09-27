/// <reference path="../pb_data/types.d.ts" />
// Reseller orders — iyzico / WhatsApp bank payment orders
migrate((app) => {
  const collection = new Collection({
    id: "reseller_orders_01",
    name: "reseller_orders",
    type: "base",
    system: false,
    fields: [
      { id: "ro_company", name: "company", type: "relation", required: true, collectionId: "reseller_companies_01", cascadeDelete: false, maxSelect: 1 },
      { id: "ro_type", name: "orderType", type: "select", required: true, values: ["lifetime", "update_subscription"] },
      { id: "ro_amount", name: "amount", type: "number", required: true },
      { id: "ro_currency", name: "currency", type: "text", required: true },
      { id: "ro_method", name: "method", type: "select", required: true, values: ["iyzico", "whatsapp_bank"] },
      { id: "ro_iyzico_token", name: "iyzicoToken", type: "text", required: false },
      { id: "ro_iyzico_payment_id", name: "iyzicoPaymentId", type: "text", required: false },
      { id: "ro_status", name: "status", type: "select", required: true, values: ["pending", "paid", "failed", "refunded"] },
      { id: "ro_notes", name: "notes", type: "text", required: false },
    ],
    indexes: [
      "CREATE INDEX idx_reseller_orders_company ON reseller_orders (company)",
      "CREATE INDEX idx_reseller_orders_status ON reseller_orders (status)",
    ],
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("reseller_orders");
  app.delete(collection);
});
