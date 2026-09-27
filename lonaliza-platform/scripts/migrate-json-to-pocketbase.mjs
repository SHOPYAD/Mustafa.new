import fs from "fs";
import path from "path";
import PocketBase from "pocketbase";

const ROOT = path.resolve(import.meta.dirname, "..");
const DATA_DIR = path.join(ROOT, "database", "data");
const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";
const PB_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || "admin@lonaliza.com";
const PB_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || "LONA#@!li123za";

async function main() {
  console.log("Connecting to PocketBase at", PB_URL, "as", PB_EMAIL);
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  await pb.collection("_superusers").authWithPassword(PB_EMAIL, PB_PASSWORD);
  console.log("Authenticated with PocketBase as superuser.");

  // Check or create `site_settings` collection
  let collection;
  try {
    collection = await pb.collections.getOne("site_settings");
    console.log("Collection 'site_settings' already exists.");
  } catch {
    console.log("Creating 'site_settings' collection in PocketBase...");
    collection = await pb.collections.create({
      name: "site_settings",
      type: "base",
      fields: [
        {
          name: "key",
          type: "text",
          required: true,
          unique: true,
          presentable: true,
        },
        {
          name: "value",
          type: "json",
          required: true,
        },
        {
          name: "category",
          type: "text",
          required: false,
        },
        {
          name: "description",
          type: "text",
          required: false,
        },
      ],
      listRule: "", // public read for site settings
      viewRule: "", // public view
      createRule: "@request.auth.collectionName = '_superusers'",
      updateRule: "@request.auth.collectionName = '_superusers'",
      deleteRule: "@request.auth.collectionName = '_superusers'",
    });
    console.log("Created collection 'site_settings' successfully.");
  }

  // Items to migrate
  const migrations = [
    { file: "branding.json", key: "branding", category: "branding", desc: "Brand identity, logos, colors" },
    { file: "brand-theme.json", key: "brand_theme", category: "branding", desc: "Site theme palette and styling" },
    { file: "site-contact.json", key: "site_contact", category: "contact", desc: "Contact numbers, WhatsApp, addresses" },
    { file: "homepage-template.json", key: "homepage_template", category: "layout", desc: "Homepage sections, slides, and layout" },
    { file: "legal-policies.json", key: "legal_policies", category: "legal", desc: "Terms, privacy, GDPR and policy clauses" },
    { file: "currencies.json", key: "currencies", category: "finance", desc: "Supported currencies and settings" },
    { file: "fx-usd-table.json", key: "fx_usd_table", category: "finance", desc: "Foreign exchange rate table" },
    { file: "search-tabs.json", key: "search_tabs", category: "navigation", desc: "Search tabs visibility and configuration" },
    { file: "ui-icons.json", key: "ui_icons", category: "design", desc: "UI icon sets and customizations" },
    { file: "translations.json", key: "translations", category: "i18n", desc: "Dynamic internationalization dictionary" },
  ];

  let successCount = 0;
  for (const m of migrations) {
    const filePath = path.join(DATA_DIR, m.file);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found, skipping: ${m.file}`);
      continue;
    }

    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw);

      // Check if existing record exists in PocketBase
      let recordId = null;
      try {
        const existing = await pb.collection("site_settings").getFirstListItem(`key = "${m.key}"`);
        recordId = existing.id;
      } catch {
        recordId = null;
      }

      if (recordId) {
        await pb.collection("site_settings").update(recordId, {
          value: parsed,
          category: m.category,
          description: m.desc,
        });
        console.log(`[UPDATED] ${m.key} in PocketBase from ${m.file}`);
      } else {
        await pb.collection("site_settings").create({
          key: m.key,
          value: parsed,
          category: m.category,
          description: m.desc,
        });
        console.log(`[CREATED] ${m.key} in PocketBase from ${m.file}`);
      }
      successCount++;
    } catch (err) {
      console.error(`Failed to migrate ${m.file}:`, err.message);
    }
  }

  console.log(`Migration complete! ${successCount} settings migrated into PocketBase.`);
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
