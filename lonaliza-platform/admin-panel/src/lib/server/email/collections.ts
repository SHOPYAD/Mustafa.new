import { promises as fs } from "fs";
import path from "path";
import type PocketBase from "pocketbase";
import { randomBytes } from "crypto";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { getServerEnv, saveServerEnv } from "@/lib/server/env-store";
import { seedBuiltinTemplates } from "@/lib/server/email/templates";
import { EMAIL_CAMPAIGN_AUDIENCES, EMAIL_TEMPLATE_KINDS } from "@/lib/server/email/types";

const CRON_SECRET_FILE = path.join(process.cwd(), ".data", "email-cron-secret");

const TEXT_FIELD = (name: string, required = false, extra: Record<string, unknown> = {}) => ({
  name,
  type: "text",
  required,
  ...extra,
});

const SELECT_FIELD = (
  name: string,
  values: string[],
  required = true
) => ({
  name,
  type: "select",
  required,
  maxSelect: 1,
  values,
});

async function collectionExists(pb: PocketBase, name: string): Promise<boolean> {
  try {
    await pb.collections.getOne(name);
    return true;
  } catch {
    return false;
  }
}

function collectionFields(col: { fields?: unknown; schema?: unknown }): Record<string, unknown>[] {
  const raw = (col.fields || col.schema || []) as Record<string, unknown>[];
  return Array.isArray(raw) ? raw : [];
}

async function patchCollectionFields(
  pb: PocketBase,
  col: { id: string; fields?: unknown; schema?: unknown },
  fields: Record<string, unknown>[]
): Promise<void> {
  await pb.collections.update(col.id, { fields, schema: fields });
}

async function ensureSelectValues(
  pb: PocketBase,
  collectionName: string,
  fieldName: string,
  values: readonly string[]
): Promise<void> {
  const col = await pb.collections.getOne(collectionName);
  const fields = collectionFields(col);
  const field = fields.find((f) => f.name === fieldName);
  if (!field || field.type !== "select") return;
  const current = Array.isArray(field.values) ? field.values.map(String) : [];
  const merged = [...new Set([...current, ...values])];
  if (merged.length === current.length && merged.every((v) => current.includes(v))) return;
  await patchCollectionFields(
    pb,
    col,
    fields.map((f) => (f.name === fieldName ? { ...f, values: merged } : f))
  );
}

async function ensureHtmlFields(
  pb: PocketBase,
  collectionName: string,
  fieldNames: string[]
): Promise<void> {
  const col = await pb.collections.getOne(collectionName);
  const fields = collectionFields(col);
  let changed = false;
  const next = fields.map((f) => {
    if (!fieldNames.includes(String(f.name)) || f.type === "editor") return f;
    changed = true;
    return { ...f, type: "editor", maxSize: 2_000_000 };
  });
  if (changed) await patchCollectionFields(pb, col, next);
}

async function createBaseCollection(
  pb: PocketBase,
  name: string,
  fields: Record<string, unknown>[],
  indexes: string[] = []
): Promise<void> {
  if (await collectionExists(pb, name)) return;
  await pb.collections.create({
    name,
    type: "base",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields,
    indexes,
  });
}

async function ensureTextFields(
  pb: PocketBase,
  collectionName: string,
  fieldNames: string[]
): Promise<void> {
  const col = await pb.collections.getOne(collectionName);
  const fields = collectionFields(col);
  const names = new Set(fields.map((f) => String(f.name || "")));
  let changed = false;
  for (const fieldName of fieldNames) {
    if (names.has(fieldName)) continue;
    fields.push(TEXT_FIELD(fieldName));
    changed = true;
  }
  if (!changed) return;
  await patchCollectionFields(pb, col, fields);
}

async function ensureJsonFields(
  pb: PocketBase,
  collectionName: string,
  fieldNames: string[]
): Promise<void> {
  const col = await pb.collections.getOne(collectionName);
  const fields = collectionFields(col);
  const names = new Set(fields.map((f) => String(f.name || "")));
  let changed = false;
  for (const fieldName of fieldNames) {
    if (names.has(fieldName)) continue;
    fields.push({ name: fieldName, type: "json" });
    changed = true;
  }
  if (!changed) return;
  await patchCollectionFields(pb, col, fields);
}

export async function ensureEmailCronSecret(): Promise<string> {
  let secret = (await getServerEnv("EMAIL_CRON_SECRET")).trim();
  if (!secret) {
    secret = randomBytes(24).toString("hex");
    await saveServerEnv({ EMAIL_CRON_SECRET: secret });
  }
  try {
    await fs.mkdir(path.dirname(CRON_SECRET_FILE), { recursive: true });
    await fs.writeFile(CRON_SECRET_FILE, `${secret}\n`, { mode: 0o600 });
  } catch {
    /* hook file is optional until PocketBase restarts */
  }
  return secret;
}

export async function ensureEmailCollections(
  pb?: PocketBase | null
): Promise<{ ok: boolean; error?: string }> {
  const client = pb || (await tryCreateAdminPocketBase());
  if (!client) return { ok: false, error: "PocketBase غير متاح" };

  try {
    await createBaseCollection(
      client,
      "email_templates",
      [
        TEXT_FIELD("slug", true),
        SELECT_FIELD("kind", [...EMAIL_TEMPLATE_KINDS]),
        TEXT_FIELD("name", true),
        TEXT_FIELD("subject_ar"),
        TEXT_FIELD("subject_en"),
        TEXT_FIELD("html_ar"),
        TEXT_FIELD("html_en"),
        TEXT_FIELD("text_ar"),
        TEXT_FIELD("text_en"),
        { name: "is_builtin", type: "bool" },
        SELECT_FIELD("source", ["builtin", "manual", "gemini"], false),
        { name: "variables", type: "json" },
        { name: "document", type: "json" },
      ],
      ["CREATE UNIQUE INDEX `idx_email_templates_slug` ON `email_templates` (`slug`)"]
    );

    const templates = await client.collections.getOne("email_templates");

    await createBaseCollection(
      client,
      "email_campaigns",
      [
        TEXT_FIELD("name", true),
        {
          name: "template",
          type: "relation",
          required: true,
          maxSelect: 1,
          collectionId: templates.id,
          cascadeDelete: false,
        },
        SELECT_FIELD("audience", [...EMAIL_CAMPAIGN_AUDIENCES]),
        SELECT_FIELD("status", [
          "draft",
          "scheduled",
          "queued",
          "sending",
          "paused",
          "completed",
          "cancelled",
        ]),
        { name: "scheduled_at", type: "date" },
        { name: "batch_size", type: "number" },
        { name: "sent_count", type: "number" },
        { name: "failed_count", type: "number" },
        { name: "remaining_count", type: "number" },
        { name: "total_count", type: "number" },
        TEXT_FIELD("last_error"),
        { name: "last_batch_at", type: "date" },
        TEXT_FIELD("csv_name"),
      ]
    );

    const campaigns = await client.collections.getOne("email_campaigns");

    await createBaseCollection(
      client,
      "email_recipients",
      [
        {
          name: "campaign",
          type: "relation",
          required: true,
          maxSelect: 1,
          collectionId: campaigns.id,
          cascadeDelete: true,
        },
        { name: "email", type: "email", required: true },
        TEXT_FIELD("name"),
        TEXT_FIELD("company"),
        SELECT_FIELD("status", ["pending", "sent", "failed", "skipped"]),
        TEXT_FIELD("error"),
        { name: "sent_at", type: "date" },
      ],
      [
        "CREATE INDEX `idx_email_recipients_campaign_status` ON `email_recipients` (`campaign`, `status`)",
      ]
    );

    try {
      await ensureHtmlFields(client, "email_templates", ["html_ar", "html_en"]);
    } catch {
      /* editor type is optional */
    }
    await ensureTextFields(client, "email_recipients", ["name", "company", "locale"]);
    try {
      await ensureTextFields(client, "customers", ["locale"]);
    } catch {
      /* customers collection may be missing */
    }
    try {
      await ensureJsonFields(client, "email_templates", ["document"]);
    } catch {
      /* json field is optional until PocketBase is writable */
    }
    await ensureSelectValues(client, "email_templates", "kind", EMAIL_TEMPLATE_KINDS);
    await ensureSelectValues(client, "email_campaigns", "audience", EMAIL_CAMPAIGN_AUDIENCES);
    try {
      await ensureSelectValues(client, "enquiry_bookings", "type", [
        "flight",
        "hotel",
        "package",
        "transfer",
        "visa",
        "tour",
        "car",
        "callback",
        "contact",
        "general",
      ]);
    } catch {
      /* enquiry collection may be missing on fresh installs */
    }
    await ensureEmailCronSecret();
    try {
      await seedBuiltinTemplates(client);
    } catch {
      /* local .data templates remain available */
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "تعذّر إنشاء مجموعات البريد",
    };
  }
}
