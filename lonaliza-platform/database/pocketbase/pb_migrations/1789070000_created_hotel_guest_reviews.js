/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    try {
      const masters = app.findCollectionByNameOrId("hotel_masters");
      const has = (masters.fields || []).some((f) => f.name === "bookingHotelId");
      if (!has) {
        masters.fields.push({
          id: "hm_booking_id",
          name: "bookingHotelId",
          type: "text",
          max: 40,
        });
        app.save(masters);
      }
    } catch (_) {
      /* hotel_masters may not exist in this environment */
    }

    try {
      app.findCollectionByNameOrId("hotel_guest_reviews");
      return;
    } catch (_) {
      /* create */
    }

    const col = new Collection({
      type: "base",
      system: false,
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      id: "hotel_guest_rev_01",
      name: "hotel_guest_reviews",
      fields: [
        { id: "hgr_rid", name: "reviewId", type: "text", required: true, max: 80 },
        { id: "hgr_master", name: "masterId", type: "text", max: 40 },
        { id: "hgr_bid", name: "bookingHotelId", type: "text", max: 40 },
        { id: "hgr_author", name: "author", type: "text", max: 160 },
        { id: "hgr_score", name: "score", type: "number" },
        { id: "hgr_title", name: "title", type: "text", max: 240 },
        { id: "hgr_text", name: "text", type: "text", max: 8000 },
        { id: "hgr_posted", name: "postedAt", type: "text", max: 40 },
        { id: "hgr_lang", name: "lang", type: "text", max: 8 },
        { id: "hgr_source", name: "source", type: "text", max: 40 },
        { id: "hgr_created", name: "created", type: "autodate", onCreate: true, onUpdate: false },
        { id: "hgr_updated", name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_hotel_guest_reviews_rid ON hotel_guest_reviews (reviewId)",
        "CREATE INDEX idx_hotel_guest_reviews_master ON hotel_guest_reviews (masterId)",
        "CREATE INDEX idx_hotel_guest_reviews_booking ON hotel_guest_reviews (bookingHotelId)",
      ],
    });
    app.save(col);
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId("hotel_guest_reviews"));
    } catch (_) {
      /* ignore */
    }
  }
);
