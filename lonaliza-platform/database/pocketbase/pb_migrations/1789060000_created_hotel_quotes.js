/// <reference path="../pb_data/types.d.ts" />
// Plan A3 — mandatory supplier re-price ("quote") before payment. One row per quote; the booking
// created from a quote references it (`offer_snapshot.quote_id`) and the supplier reservation is
// executed only after the payment webhook, with the quote id as idempotency key.

migrate(
  (app) => {
    try {
      app.findCollectionByNameOrId("hotel_quotes");
      return;
    } catch (_) {
      /* create */
    }
    const col = new Collection({
      id: "hotel_quotes_01",
      type: "base",
      system: false,
      name: "hotel_quotes",
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { id: "hq_supplier", name: "supplier", type: "select", required: true, maxSelect: 1, values: ["hotelbeds", "ratehawk", "travelport", "seeru"] },
        { id: "hq_hotel_id", name: "hotelId", type: "text", required: true, max: 120 },
        { id: "hq_supplier_hotel_id", name: "supplierHotelId", type: "text", max: 120 },
        { id: "hq_master", name: "masterId", type: "text", max: 80 },
        { id: "hq_session", name: "sessionId", type: "text", max: 60 },
        { id: "hq_user", name: "user", type: "text", max: 40 },
        { id: "hq_hotel_name", name: "hotelName", type: "text", max: 300 },
        { id: "hq_hotel_image", name: "hotelImage", type: "text", max: 1000 },
        { id: "hq_stars", name: "stars", type: "number" },
        { id: "hq_city", name: "city", type: "text", max: 200 },
        { id: "hq_address", name: "address", type: "text", max: 500 },
        { id: "hq_check_in", name: "checkIn", type: "text", required: true, max: 10 },
        { id: "hq_check_out", name: "checkOut", type: "text", required: true, max: 10 },
        { id: "hq_adults", name: "adults", type: "number" },
        { id: "hq_children", name: "childrenAges", type: "json", maxSize: 2000 },
        { id: "hq_rooms", name: "rooms", type: "number" },
        { id: "hq_room_name", name: "roomName", type: "text", max: 300 },
        { id: "hq_room_image", name: "roomImage", type: "text", max: 1000 },
        { id: "hq_board", name: "board", type: "text", max: 10 },
        { id: "hq_board_name", name: "boardName", type: "text", max: 120 },
        { id: "hq_refundable", name: "refundable", type: "bool" },
        { id: "hq_free_until", name: "freeCancellationUntil", type: "text", max: 40 },
        { id: "hq_cancel_policies", name: "cancellationPolicies", type: "json", maxSize: 20000 },
        { id: "hq_payment_type", name: "paymentType", type: "text", max: 20 },
        { id: "hq_rate_type", name: "rateType", type: "text", max: 10 },
        // Private supplier data — never returned to the browser.
        { id: "hq_token", name: "supplierToken", type: "text", max: 4000 },
        { id: "hq_original_token", name: "originalToken", type: "text", max: 4000 },
        { id: "hq_context", name: "supplierContext", type: "json", maxSize: 20000 },
        { id: "hq_net_total", name: "netTotal", type: "number" },
        { id: "hq_selling_total", name: "sellingTotal", type: "number", required: true },
        { id: "hq_per_night", name: "perNight", type: "number" },
        { id: "hq_currency", name: "currency", type: "text", required: true, max: 3 },
        { id: "hq_taxes_included", name: "taxesIncluded", type: "bool" },
        { id: "hq_markup_rule", name: "markupRuleId", type: "text", max: 60 },
        { id: "hq_price_changed", name: "priceChanged", type: "bool" },
        { id: "hq_previous_total", name: "previousTotal", type: "number" },
        { id: "hq_status", name: "status", type: "select", required: true, maxSelect: 1, values: ["quoted", "consumed", "expired", "failed"] },
        { id: "hq_expires_at", name: "expiresAt", type: "text", required: true, max: 40 },
        { id: "hq_booking", name: "bookingId", type: "text", max: 40 },
        { id: "hq_error", name: "error", type: "text", max: 1000 },
        { id: "hq_created", name: "created", type: "autodate", onCreate: true, onUpdate: false },
        { id: "hq_updated", name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE INDEX idx_hotel_quotes_user ON hotel_quotes (user, created)",
        "CREATE INDEX idx_hotel_quotes_booking ON hotel_quotes (bookingId)",
        "CREATE INDEX idx_hotel_quotes_status ON hotel_quotes (status, expiresAt)",
      ],
    });
    app.save(col);
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId("hotel_quotes"));
    } catch (_) {
      /* ignore */
    }
  }
);
