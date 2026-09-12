/**
 * One-shot: copy .data/loyalty.json wallets into PocketBase loyalty_wallets.
 * Usage: node scripts/migrate-loyalty-to-pb.mjs
 */
import { readFile } from "fs/promises";
import path from "path";
import PocketBase from "pocketbase";

const root = path.resolve(import.meta.dirname, "..");
const storeFile = path.join(root, ".data", "loyalty.json");

function env(name) {
  return String(process.env[name] || "").trim();
}

async function main() {
  const url = env("POCKETBASE_URL") || "http://127.0.0.1:8090";
  const email = env("POCKETBASE_ADMIN_EMAIL");
  const password = env("POCKETBASE_ADMIN_PASSWORD");
  if (!email || !password) {
    console.error("Set POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD");
    process.exit(1);
  }
  const raw = JSON.parse(await readFile(storeFile, "utf8"));
  const wallets = Array.isArray(raw.wallets) ? raw.wallets : [];
  const pb = new PocketBase(url);
  await pb.collection("_superusers").authWithPassword(email, password);
  let upserted = 0;
  for (const wallet of wallets) {
    const userId = String(wallet.userId || "").trim();
    if (!userId) continue;
    const payload = {
      user_id: userId,
      points: Number(wallet.points) || 0,
      pending_points: Number(wallet.pendingPoints) || 0,
      vouchers: wallet.vouchers || [],
      ledger: wallet.ledger || [],
    };
    const existing = await pb
      .collection("loyalty_wallets")
      .getFirstListItem(`user_id = "${userId.replace(/"/g, "")}"`)
      .catch(() => null);
    if (existing) await pb.collection("loyalty_wallets").update(existing.id, payload);
    else await pb.collection("loyalty_wallets").create(payload);
    upserted += 1;
  }
  console.log(`Migrated ${upserted} wallets to PocketBase`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
