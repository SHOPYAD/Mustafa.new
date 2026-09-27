/// <reference path="../pb_data/types.d.ts" />
// Hotel static-content database (plan A1): masters, supplier refs, images, rooms, facilities,
// POIs, destinations, identity reviews and ingest job log. Populated by the hotel-content worker
// (`scripts/hotel-content-worker.mjs` → POST /api/cron/hotel-content) — never by hand-written data.

migrate(
  (app) => {
    const create = (def) => {
      try {
        app.findCollectionByNameOrId(def.name);
        return; // already exists
      } catch (_) {
        /* not found → create */
      }
      const col = new Collection({
        type: "base",
        system: false,
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
        ...def,
      });
      app.save(col);
    };

    // Destinations known to the supply layer (Hotelbeds destination codes, RateHawk regions, geo).
    create({
      id: "hotel_destinations_01",
      name: "hotel_destinations",
      fields: [
        { id: "hd_key", name: "key", type: "text", required: true, max: 120 },
        { id: "hd_name_en", name: "nameEn", type: "text", max: 200 },
        { id: "hd_name_ar", name: "nameAr", type: "text", max: 200 },
        { id: "hd_country", name: "countryCode", type: "text", max: 2 },
        { id: "hd_lat", name: "lat", type: "number" },
        { id: "hd_lng", name: "lng", type: "number" },
        { id: "hd_iata", name: "iata", type: "text", max: 3 },
        { id: "hd_hb", name: "hotelbedsCode", type: "text", max: 10 },
        { id: "hd_rh", name: "ratehawkRegionId", type: "text", max: 20 },
        { id: "hd_geo", name: "geoPlaceId", type: "text", max: 40 },
        { id: "hd_radius", name: "radiusKm", type: "number" },
        { id: "hd_priority", name: "priority", type: "number" },
        { id: "hd_hotel_count", name: "hotelCount", type: "number" },
        { id: "hd_last_hb", name: "hotelbedsIngestedAt", type: "text", max: 40 },
        { id: "hd_last_rh", name: "ratehawkIngestedAt", type: "text", max: 40 },
        { id: "hd_last_tp", name: "travelportIngestedAt", type: "text", max: 40 },
        { id: "hd_created", name: "created", type: "autodate", onCreate: true, onUpdate: false },
        { id: "hd_updated", name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_hotel_destinations_key ON hotel_destinations (key)",
        "CREATE INDEX idx_hotel_destinations_priority ON hotel_destinations (priority, hotelbedsIngestedAt)",
      ],
    });

    // One row per real-world hotel (merged across suppliers).
    create({
      id: "hotel_masters_01",
      name: "hotel_masters",
      fields: [
        { id: "hm_master", name: "masterId", type: "text", required: true, max: 40 },
        { id: "hm_name", name: "name", type: "text", required: true, max: 300 },
        { id: "hm_name_ar", name: "nameAr", type: "text", max: 300 },
        { id: "hm_city", name: "city", type: "text", max: 200 },
        { id: "hm_country", name: "countryCode", type: "text", max: 2 },
        { id: "hm_address", name: "address", type: "text", max: 500 },
        { id: "hm_lat", name: "lat", type: "number" },
        { id: "hm_lng", name: "lng", type: "number" },
        { id: "hm_stars", name: "stars", type: "number" },
        { id: "hm_giata", name: "giataCode", type: "text", max: 20 },
        { id: "hm_chain", name: "chain", type: "text", max: 120 },
        { id: "hm_desc", name: "description", type: "json", maxSize: 200000 },
        { id: "hm_checkin", name: "checkInTime", type: "text", max: 10 },
        { id: "hm_checkout", name: "checkOutTime", type: "text", max: 10 },
        { id: "hm_policies", name: "policies", type: "json", maxSize: 100000 },
        { id: "hm_review", name: "reviewScore", type: "json", maxSize: 4000 },
        { id: "hm_phone", name: "phone", type: "text", max: 60 },
        { id: "hm_email", name: "email", type: "text", max: 200 },
        { id: "hm_web", name: "website", type: "text", max: 300 },
        { id: "hm_hero", name: "heroImage", type: "text", max: 600 },
        { id: "hm_img_count", name: "imageCount", type: "number" },
        { id: "hm_suppliers", name: "suppliers", type: "json", maxSize: 2000 },
        { id: "hm_status", name: "status", type: "select", maxSelect: 1, values: ["active", "needs_review", "hidden"] },
        { id: "hm_merged_at", name: "lastMergedAt", type: "text", max: 40 },
        { id: "hm_created", name: "created", type: "autodate", onCreate: true, onUpdate: false },
        { id: "hm_updated", name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_hotel_masters_master ON hotel_masters (masterId)",
        "CREATE INDEX idx_hotel_masters_giata ON hotel_masters (giataCode)",
        "CREATE INDEX idx_hotel_masters_geo ON hotel_masters (countryCode, city)",
      ],
    });

    // master ↔ supplier hotel id (hb_code / tp chain:code / rh hid / seeru propertyId).
    create({
      id: "hotel_supplier_refs_01",
      name: "hotel_supplier_refs",
      fields: [
        { id: "hr_master", name: "master", type: "text", max: 40 },
        { id: "hr_supplier", name: "supplier", type: "select", required: true, maxSelect: 1, values: ["hotelbeds", "ratehawk", "travelport", "seeru"] },
        { id: "hr_sid", name: "supplierHotelId", type: "text", required: true, max: 120 },
        { id: "hr_name", name: "supplierName", type: "text", max: 300 },
        { id: "hr_city", name: "city", type: "text", max: 200 },
        { id: "hr_country", name: "countryCode", type: "text", max: 2 },
        { id: "hr_lat", name: "lat", type: "number" },
        { id: "hr_lng", name: "lng", type: "number" },
        { id: "hr_stars", name: "stars", type: "number" },
        { id: "hr_giata", name: "giataCode", type: "text", max: 20 },
        { id: "hr_dest", name: "destinationKey", type: "text", max: 120 },
        { id: "hr_match", name: "matchMethod", type: "select", maxSelect: 1, values: ["single", "giata", "name_geo", "manual"] },
        { id: "hr_conf", name: "confidence", type: "number" },
        { id: "hr_status", name: "status", type: "select", maxSelect: 1, values: ["auto", "confirmed", "rejected", "pending_review"] },
        { id: "hr_lang", name: "language", type: "text", max: 5 },
        { id: "hr_hash", name: "contentHash", type: "text", max: 64 },
        { id: "hr_fetched", name: "contentFetchedAt", type: "text", max: 40 },
        { id: "hr_has_desc", name: "hasDescription", type: "bool" },
        { id: "hr_img_count", name: "imageCount", type: "number" },
        { id: "hr_room_count", name: "roomCount", type: "number" },
        { id: "hr_created", name: "created", type: "autodate", onCreate: true, onUpdate: false },
        { id: "hr_updated", name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_hotel_refs_supplier_id ON hotel_supplier_refs (supplier, supplierHotelId)",
        "CREATE INDEX idx_hotel_refs_master ON hotel_supplier_refs (master)",
        "CREATE INDEX idx_hotel_refs_giata ON hotel_supplier_refs (giataCode)",
        "CREATE INDEX idx_hotel_refs_dest ON hotel_supplier_refs (destinationKey)",
      ],
    });

    create({
      id: "hotel_images_01",
      name: "hotel_images",
      fields: [
        { id: "hi_master", name: "master", type: "text", max: 40 },
        { id: "hi_supplier", name: "supplier", type: "select", required: true, maxSelect: 1, values: ["hotelbeds", "ratehawk", "travelport", "seeru"] },
        { id: "hi_sid", name: "supplierHotelId", type: "text", required: true, max: 120 },
        { id: "hi_url", name: "url", type: "text", required: true, max: 800 },
        { id: "hi_cat", name: "category", type: "text", max: 40 },
        { id: "hi_room", name: "roomCode", type: "text", max: 80 },
        { id: "hi_order", name: "order", type: "number" },
        { id: "hi_caption", name: "caption", type: "text", max: 300 },
      ],
      indexes: [
        "CREATE INDEX idx_hotel_images_ref ON hotel_images (supplier, supplierHotelId)",
        "CREATE INDEX idx_hotel_images_master ON hotel_images (master)",
      ],
    });

    create({
      id: "hotel_rooms_content_01",
      name: "hotel_rooms_content",
      fields: [
        { id: "hrc_master", name: "master", type: "text", max: 40 },
        { id: "hrc_supplier", name: "supplier", type: "select", required: true, maxSelect: 1, values: ["hotelbeds", "ratehawk", "travelport", "seeru"] },
        { id: "hrc_sid", name: "supplierHotelId", type: "text", required: true, max: 120 },
        { id: "hrc_code", name: "roomCode", type: "text", required: true, max: 120 },
        { id: "hrc_name", name: "name", type: "text", max: 300 },
        { id: "hrc_desc", name: "description", type: "text", max: 5000 },
        { id: "hrc_size", name: "sizeSqm", type: "number" },
        { id: "hrc_beds", name: "beds", type: "text", max: 300 },
        { id: "hrc_max_adults", name: "maxAdults", type: "number" },
        { id: "hrc_max_children", name: "maxChildren", type: "number" },
        { id: "hrc_max_pax", name: "maxPax", type: "number" },
        { id: "hrc_facilities", name: "facilities", type: "json", maxSize: 20000 },
        { id: "hrc_images", name: "images", type: "json", maxSize: 40000 },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_hotel_rooms_ref_code ON hotel_rooms_content (supplier, supplierHotelId, roomCode)",
        "CREATE INDEX idx_hotel_rooms_master ON hotel_rooms_content (master)",
      ],
    });

    create({
      id: "hotel_facilities_01",
      name: "hotel_facilities",
      fields: [
        { id: "hf_master", name: "master", type: "text", max: 40 },
        { id: "hf_supplier", name: "supplier", type: "select", required: true, maxSelect: 1, values: ["hotelbeds", "ratehawk", "travelport", "seeru"] },
        { id: "hf_sid", name: "supplierHotelId", type: "text", required: true, max: 120 },
        { id: "hf_group", name: "group", type: "text", max: 120 },
        { id: "hf_name", name: "name", type: "text", required: true, max: 300 },
        { id: "hf_code", name: "code", type: "text", max: 40 },
        { id: "hf_unified", name: "unifiedCode", type: "text", max: 40 },
        { id: "hf_fee", name: "fee", type: "bool" },
      ],
      indexes: [
        "CREATE INDEX idx_hotel_facilities_ref ON hotel_facilities (supplier, supplierHotelId)",
        "CREATE INDEX idx_hotel_facilities_master ON hotel_facilities (master)",
      ],
    });

    create({
      id: "hotel_pois_01",
      name: "hotel_pois",
      fields: [
        { id: "hp_master", name: "master", type: "text", max: 40 },
        { id: "hp_supplier", name: "supplier", type: "select", required: true, maxSelect: 1, values: ["hotelbeds", "ratehawk", "travelport", "seeru"] },
        { id: "hp_sid", name: "supplierHotelId", type: "text", required: true, max: 120 },
        { id: "hp_name", name: "name", type: "text", required: true, max: 300 },
        { id: "hp_type", name: "type", type: "text", max: 60 },
        { id: "hp_distance", name: "distanceM", type: "number" },
      ],
      indexes: [
        "CREATE INDEX idx_hotel_pois_ref ON hotel_pois (supplier, supplierHotelId)",
        "CREATE INDEX idx_hotel_pois_master ON hotel_pois (master)",
      ],
    });

    // Grey-zone identity matches awaiting a human decision in the admin.
    create({
      id: "hotel_identity_reviews_01",
      name: "hotel_identity_reviews",
      fields: [
        { id: "hir_key", name: "pairKey", type: "text", required: true, max: 300 },
        { id: "hir_a", name: "a", type: "json", maxSize: 4000 },
        { id: "hir_b", name: "b", type: "json", maxSize: 4000 },
        { id: "hir_distance", name: "distanceM", type: "number" },
        { id: "hir_sim", name: "nameSimilarity", type: "number" },
        { id: "hir_status", name: "status", type: "select", required: true, maxSelect: 1, values: ["pending", "confirmed", "rejected"] },
        { id: "hir_decided_by", name: "decidedBy", type: "text", max: 120 },
        { id: "hir_decided_at", name: "decidedAt", type: "text", max: 40 },
        { id: "hir_created", name: "created", type: "autodate", onCreate: true, onUpdate: false },
        { id: "hir_updated", name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_hotel_identity_pair ON hotel_identity_reviews (pairKey)",
        "CREATE INDEX idx_hotel_identity_status ON hotel_identity_reviews (status)",
      ],
    });

    // Worker job log (one row per ingest step) for the admin health panel.
    create({
      id: "hotel_content_jobs_01",
      name: "hotel_content_jobs",
      fields: [
        { id: "hcj_kind", name: "kind", type: "text", required: true, max: 60 },
        { id: "hcj_supplier", name: "supplier", type: "text", max: 20 },
        { id: "hcj_dest", name: "destinationKey", type: "text", max: 120 },
        { id: "hcj_status", name: "status", type: "select", required: true, maxSelect: 1, values: ["running", "done", "failed", "skipped"] },
        { id: "hcj_count", name: "count", type: "number" },
        { id: "hcj_requests", name: "requests", type: "number" },
        { id: "hcj_started", name: "startedAt", type: "text", max: 40 },
        { id: "hcj_finished", name: "finishedAt", type: "text", max: 40 },
        { id: "hcj_error", name: "error", type: "text", max: 2000 },
        { id: "hcj_meta", name: "meta", type: "json", maxSize: 10000 },
      ],
      indexes: ["CREATE INDEX idx_hotel_content_jobs_started ON hotel_content_jobs (startedAt)"],
    });

    // The worker writes thousands of rows per destination → enable the batch API.
    try {
      const settings = app.settings();
      settings.batch.enabled = true;
      settings.batch.maxRequests = Math.max(settings.batch.maxRequests || 0, 1000);
      settings.batch.timeout = Math.max(settings.batch.timeout || 0, 30);
      settings.batch.maxBodySize = Math.max(settings.batch.maxBodySize || 0, 128 * 1024 * 1024);
      app.save(settings);
    } catch (_) {
      /* settings save is best-effort; the worker falls back to single requests */
    }
  },
  (app) => {
    for (const name of [
      "hotel_content_jobs",
      "hotel_identity_reviews",
      "hotel_pois",
      "hotel_facilities",
      "hotel_rooms_content",
      "hotel_images",
      "hotel_supplier_refs",
      "hotel_masters",
      "hotel_destinations",
    ]) {
      try {
        app.delete(app.findCollectionByNameOrId(name));
      } catch (_) {
        /* ignore */
      }
    }
  }
);
