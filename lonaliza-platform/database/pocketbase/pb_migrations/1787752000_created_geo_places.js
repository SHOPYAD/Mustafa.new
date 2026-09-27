/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const existing = app.findCollectionByNameOrId("geo_places");
    if (existing) return;
  } catch {
    /* create below */
  }
  const collection = new Collection({
    createRule: null,
    deleteRule: null,
    updateRule: null,
    listRule: null,
    viewRule: null,
    name: "geo_places",
    type: "base",
    system: false,
    id: "pbc_geo_places01",
    indexes: [
      "CREATE UNIQUE INDEX `idx_geo_places_key` ON `geo_places` (`place_key`)",
      "CREATE INDEX `idx_geo_places_tokens` ON `geo_places` (`search_tokens`)",
      "CREATE INDEX `idx_geo_places_country` ON `geo_places` (`country_code`)",
      "CREATE INDEX `idx_geo_places_geo` ON `geo_places` (`tripadvisor_geo_id`)",
    ],
    fields: [
      {
        autogeneratePattern: "[a-z0-9]{15}",
        hidden: false,
        id: "text3208210256",
        max: 15,
        min: 15,
        name: "id",
        pattern: "^[a-z0-9]+$",
        presentable: false,
        primaryKey: true,
        required: true,
        system: true,
        type: "text",
      },
      {
        autogeneratePattern: "",
        hidden: false,
        id: "text_geo_place_key",
        max: 120,
        min: 0,
        name: "place_key",
        pattern: "",
        presentable: false,
        primaryKey: false,
        required: true,
        system: false,
        type: "text",
      },
      {
        autogeneratePattern: "",
        hidden: false,
        id: "text_geo_cc",
        max: 8,
        min: 0,
        name: "country_code",
        pattern: "",
        presentable: false,
        primaryKey: false,
        required: true,
        system: false,
        type: "text",
      },
      {
        autogeneratePattern: "",
        hidden: false,
        id: "text_geo_c_en",
        name: "country_name_en",
        type: "text",
        required: false,
      },
      {
        autogeneratePattern: "",
        hidden: false,
        id: "text_geo_c_ar",
        name: "country_name_ar",
        type: "text",
        required: false,
      },
      {
        autogeneratePattern: "",
        hidden: false,
        id: "text_geo_c_tr",
        name: "country_name_tr",
        type: "text",
        required: false,
      },
      {
        autogeneratePattern: "",
        hidden: false,
        id: "text_geo_city_en",
        name: "city_name_en",
        type: "text",
        required: true,
      },
      {
        autogeneratePattern: "",
        hidden: false,
        id: "text_geo_city_ar",
        name: "city_name_ar",
        type: "text",
        required: false,
      },
      {
        autogeneratePattern: "",
        hidden: false,
        id: "text_geo_city_tr",
        name: "city_name_tr",
        type: "text",
        required: false,
      },
      {
        autogeneratePattern: "",
        hidden: false,
        id: "text_geo_admin1",
        name: "admin1",
        type: "text",
        required: false,
      },
      {
        hidden: false,
        id: "num_geo_lat",
        name: "lat",
        type: "number",
        required: false,
      },
      {
        hidden: false,
        id: "num_geo_lng",
        name: "lng",
        type: "number",
        required: false,
      },
      {
        hidden: false,
        id: "num_geo_pop",
        name: "population",
        onlyInt: true,
        type: "number",
        required: false,
      },
      {
        autogeneratePattern: "",
        hidden: false,
        id: "text_geo_ta",
        name: "tripadvisor_geo_id",
        type: "text",
        required: false,
      },
      {
        autogeneratePattern: "",
        hidden: false,
        id: "text_geo_tokens",
        name: "search_tokens",
        type: "text",
        required: false,
      },
    ],
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_geo_places01");
  return app.delete(collection);
});
