import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

const ROOT = path.join(process.cwd());
const PB_DIR = path.join(ROOT, "pocketbase");
const PB_BIN = path.join(PB_DIR, "pocketbase");
const ENV_FILE = path.join(ROOT, ".data", "server-env.json");
const URL = "http://127.0.0.1:8090";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function readEnvStore() {
  try {
    const raw = await fs.readFile(ENV_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed.values && typeof parsed.values === "object" ? parsed.values : {};
  } catch {
    return {};
  }
}

async function writeEnvStore(values) {
  await fs.mkdir(path.dirname(ENV_FILE), { recursive: true });
  let current = {};
  try {
    current = JSON.parse(await fs.readFile(ENV_FILE, "utf8"));
  } catch {
    current = { values: {} };
  }
  const next = {
    values: { ...(current.values || {}), ...values },
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(ENV_FILE, JSON.stringify(next, null, 2), { mode: 0o600 });
}

async function upsertSuperuser(email, password) {
  await new Promise((resolve, reject) => {
    const child = spawn(PB_BIN, ["superuser", "upsert", email, password], {
      cwd: PB_DIR,
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`superuser upsert failed (${code})`));
    });
  });
}

async function waitHealthy(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${URL}/api/health`);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await sleep(400);
  }
  throw new Error("PocketBase did not become healthy");
}

async function adminToken(email, password) {
  const res = await fetch(`${URL}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: email, password }),
  });
  if (!res.ok) {
    throw new Error(`admin auth failed: ${await res.text()}`);
  }
  const data = await res.json();
  return data.token;
}

async function listCollections(token) {
  const res = await fetch(`${URL}/api/collections`, {
    headers: { Authorization: token },
  });
  const data = await res.json();
  return data.items || [];
}

async function upsertCollection(token, payload) {
  const existing = await listCollections(token);
  const found = existing.find((c) => c.name === payload.name);
  if (found) {
    const res = await fetch(`${URL}/api/collections/${found.id}`, {
      method: "PATCH",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`patch ${payload.name}: ${await res.text()}`);
    return;
  }
  const res = await fetch(`${URL}/api/collections`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`create ${payload.name}: ${await res.text()}`);
}

function textField(name, required = false) {
  return { name, type: "text", required };
}

function numberField(name, required = false) {
  return { name, type: "number", required };
}

function dateField(name, required = false) {
  return { name, type: "date", required };
}

function jsonField(name) {
  return { name, type: "json" };
}

function emailField(name) {
  return { name, type: "email" };
}

function selectField(name, values, required = false) {
  return { name, type: "select", required, maxSelect: 1, values };
}

function relationField(name, collectionId, required = false) {
  return {
    name,
    type: "relation",
    collectionId,
    maxSelect: 1,
    required,
    cascadeDelete: false,
  };
}

function boolField(name) {
  return { name, type: "bool" };
}

async function ensureField(token, collectionName, field) {
  const collections = await listCollections(token);
  const found = collections.find((c) => c.name === collectionName);
  if (!found) return;
  const has = (found.fields || []).some((f) => f.name === field.name);
  if (has) return;
  const res = await fetch(`${URL}/api/collections/${found.id}`, {
    method: "PATCH",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: [...(found.fields || []), field],
    }),
  });
  if (!res.ok) throw new Error(`ensureField ${collectionName}.${field.name}: ${await res.text()}`);
}

async function seedAffiliateSettings(token) {
  const res = await fetch(`${URL}/api/collections/affiliate_settings/records?perPage=1`, {
    headers: { Authorization: token },
  });
  if (!res.ok) return;
  const data = await res.json();
  if (data.items?.length) return;
  const create = await fetch(`${URL}/api/collections/affiliate_settings/records`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      enabled: true,
      cookie_days: 30,
      min_withdraw: 100,
      commissions: {
        flight: { type: "percent", value: 3 },
        hotel: { type: "percent", value: 5 },
        car: { type: "percent", value: 4 },
        transfer: { type: "percent", value: 4 },
        package: { type: "percent", value: 8 },
        other: { type: "percent", value: 3 },
      },
    }),
  });
  if (!create.ok) {
    throw new Error(`seed affiliate_settings: ${await create.text()}`);
  }
}

function systemFields() {
  return [
    {
      name: "id",
      type: "text",
      required: true,
      primaryKey: true,
      autogeneratePattern: "[a-z0-9]{15}",
    },
    { name: "created", type: "autodate", onCreate: true, onUpdate: false },
    { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
  ];
}

async function main() {
  const store = await readEnvStore();
  const email = store.POCKETBASE_ADMIN_EMAIL || "admin@lonaliza.com";
  const password =
    store.POCKETBASE_ADMIN_PASSWORD || randomBytes(18).toString("hex");

  await writeEnvStore({
    POCKETBASE_URL: URL,
    POCKETBASE_ADMIN_EMAIL: email,
    POCKETBASE_ADMIN_PASSWORD: password,
  });

  await upsertSuperuser(email, password);

  let startedHere = false;
  try {
    await waitHealthy(1500);
  } catch {
    startedHere = true;
    spawn(PB_BIN, ["serve", "--http=127.0.0.1:8090"], {
      cwd: PB_DIR,
      detached: true,
      stdio: "ignore",
    }).unref();
    await waitHealthy();
  }

  const token = await adminToken(email, password);
  const collections = await listCollections(token);
  const users = collections.find((c) => c.name === "users");
  if (!users) throw new Error("users collection missing");

  await upsertCollection(token, {
    name: "customers",
    type: "base",
    fields: [
      ...systemFields(),
      relationField("user", users.id),
      textField("name", true),
      emailField("email"),
      textField("phone"),
      textField("notes"),
    ],
  });

  await upsertCollection(token, {
    name: "hotel_bookings",
    type: "base",
    fields: [
      ...systemFields(),
      relationField("user", users.id),
      textField("hotel_id", true),
      textField("hotel_name", true),
      textField("hotel_slug"),
      textField("room_id"),
      textField("room_name"),
      dateField("check_in"),
      dateField("check_out"),
      numberField("adults"),
      numberField("children"),
      jsonField("guest_names"),
      textField("customer_name", true),
      emailField("customer_email"),
      textField("customer_phone"),
      textField("notes"),
      numberField("price"),
      textField("currency"),
      textField("provider"),
      selectField("status", ["pending_payment", "paid", "cancelled"], true),
      jsonField("offer_snapshot"),
    ],
  });

  await upsertCollection(token, {
    name: "enquiry_bookings",
    type: "base",
    fields: [
      ...systemFields(),
      relationField("user", users.id),
      selectField(
        "type",
        [
          "flight",
          "hotel",
          "package",
          "transfer",
          "visa",
          "tour",
          "callback",
          "contact",
          "general",
        ],
        true
      ),
      selectField("status", ["new", "in-progress", "resolved"], true),
      textField("service_name"),
      textField("destination"),
      textField("customer_name", true),
      emailField("customer_email"),
      textField("customer_phone"),
      textField("message"),
      jsonField("metadata"),
    ],
  });

  await ensureField(token, "hotel_bookings", textField("ref_code"));
  await ensureField(token, "hotel_bookings", textField("iyzico_payment_id"));
  await ensureField(token, "hotel_bookings", textField("iyzico_token"));
  await ensureField(token, "hotel_bookings", textField("payment_status"));
  await ensureField(token, "hotel_bookings", numberField("charged_amount"));
  await ensureField(token, "hotel_bookings", textField("charged_currency"));
  await ensureField(token, "hotel_bookings", numberField("display_amount"));
  await ensureField(token, "hotel_bookings", textField("display_currency"));
  await ensureField(token, "hotel_bookings", numberField("fx_rate"));
  await ensureField(token, "hotel_bookings", textField("fx_source"));
  await ensureField(token, "hotel_bookings", textField("fx_at"));
  await ensureField(token, "enquiry_bookings", textField("ref_code"));

  await upsertCollection(token, {
    name: "admin_notifications",
    type: "base",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    indexes: [
      "CREATE INDEX `idx_admin_notifications_created` ON `admin_notifications` (`created`)",
      "CREATE INDEX `idx_admin_notifications_read` ON `admin_notifications` (`read`)",
    ],
    fields: [
      ...systemFields(),
      selectField("type", ["visit", "register", "booking"], true),
      textField("title_ar", true),
      textField("body_ar"),
      textField("href"),
      jsonField("meta"),
      boolField("read"),
    ],
  });

  await upsertCollection(token, {
    name: "affiliate_profiles",
    type: "base",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    indexes: [
      "CREATE UNIQUE INDEX `idx_affiliate_profiles_code` ON `affiliate_profiles` (`code`)",
    ],
    fields: [
      ...systemFields(),
      relationField("user", users.id),
      textField("code", true),
      selectField("status", ["active", "paused", "banned"], true),
    ],
  });

  await upsertCollection(token, {
    name: "affiliate_visits",
    type: "base",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      ...systemFields(),
      textField("code", true),
      textField("path", true),
      selectField(
        "service",
        ["flight", "hotel", "car", "transfer", "package", "other"],
        true
      ),
      textField("ip_hash"),
      textField("ua"),
    ],
  });

  await upsertCollection(token, {
    name: "affiliate_conversions",
    type: "base",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      ...systemFields(),
      relationField("user", users.id),
      textField("code", true),
      selectField(
        "service",
        ["flight", "hotel", "car", "transfer", "package", "other"],
        true
      ),
      selectField("status", ["pending", "approved", "rejected"], true),
      numberField("booking_amount"),
      numberField("commission"),
      textField("notes"),
      textField("tp_ref"),
      textField("booking_id"),
      textField("path"),
    ],
  });

  await upsertCollection(token, {
    name: "affiliate_withdrawals",
    type: "base",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      ...systemFields(),
      relationField("user", users.id),
      numberField("amount", true),
      textField("binance_id", true),
      selectField("status", ["pending", "paid", "rejected"], true),
      textField("note"),
    ],
  });

  await upsertCollection(token, {
    name: "affiliate_settings",
    type: "base",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      ...systemFields(),
      boolField("enabled"),
      numberField("cookie_days"),
      numberField("min_withdraw"),
      jsonField("commissions"),
    ],
  });

  await upsertCollection(token, {
    name: "ai_conversations",
    type: "base",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      ...systemFields(),
      relationField("user", users.id),
      textField("title"),
      jsonField("messages"),
    ],
  });

  await upsertCollection(token, {
    name: "ai_programs",
    type: "base",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      ...systemFields(),
      relationField("user", users.id),
      textField("title"),
      textField("title_ar"),
      textField("title_en"),
      textField("destination"),
      numberField("nights"),
      numberField("people"),
      textField("arrival_date"),
      textField("departure_date"),
      numberField("price_from_usd"),
      textField("thumbnail"),
      jsonField("includes_ar"),
      jsonField("includes_en"),
      jsonField("itinerary"),
      jsonField("cards"),
      textField("flight_href"),
      textField("transfer_href"),
      textField("cars_href"),
      textField("file_id"),
    ],
  });

  await upsertCollection(token, {
    name: "geo_places",
    type: "base",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    indexes: [
      "CREATE UNIQUE INDEX `idx_geo_places_key` ON `geo_places` (`place_key`)",
      "CREATE INDEX `idx_geo_places_tokens` ON `geo_places` (`search_tokens`)",
      "CREATE INDEX `idx_geo_places_country` ON `geo_places` (`country_code`)",
    ],
    fields: [
      ...systemFields(),
      textField("place_key", true),
      textField("country_code", true),
      textField("country_name_en"),
      textField("country_name_ar"),
      textField("country_name_tr"),
      textField("city_name_en", true),
      textField("city_name_ar"),
      textField("city_name_tr"),
      textField("admin1"),
      numberField("lat"),
      numberField("lng"),
      numberField("population"),
      textField("tripadvisor_geo_id"),
      textField("search_tokens"),
    ],
  });

  await seedAffiliateSettings(token);

  console.log(
    startedHere
      ? "PocketBase collections ready (temporary serve)."
      : "PocketBase collections ready."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
