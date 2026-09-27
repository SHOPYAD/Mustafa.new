/// <reference path="../pb_data/types.d.ts" />
// Reseller subscriptions — optional $50/month update subscription
migrate((app) => {
  const collection = new Collection({
    id: "reseller_subs_01",
    name: "reseller_subscriptions",
    type: "base",
    system: false,
    fields: [
      { id: "rsub_company", name: "company", type: "relation", required: true, collectionId: "reseller_companies_01", cascadeDelete: false, maxSelect: 1 },
      { id: "rsub_type", name: "subscriptionType", type: "select", required: true, values: ["updates"] },
      { id: "rsub_status", name: "status", type: "select", required: true, values: ["active", "paused", "cancelled", "expired"] },
      { id: "rsub_price", name: "price", type: "number", required: true },
      { id: "rsub_currency", name: "currency", type: "text", required: true },
      { id: "rsub_next_billing", name: "nextBilling", type: "date", required: false },
      { id: "rsub_last_payment", name: "lastPayment", type: "date", required: false },
      { id: "rsub_cancelled_at", name: "cancelledAt", type: "date", required: false },
    ],
    indexes: [
      "CREATE INDEX idx_reseller_subs_company ON reseller_subscriptions (company)",
      "CREATE INDEX idx_reseller_subs_status ON reseller_subscriptions (status)",
    ],
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("reseller_subscriptions");
  app.delete(collection);
});
