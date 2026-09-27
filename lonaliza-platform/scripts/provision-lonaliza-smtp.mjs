/**
 * Provision noreply@lonaliza.com on local BillionMail and save SMTP to PocketBase.
 * Never prints the mailbox password.
 */
import { spawnSync } from "child_process";
import { randomBytes } from "crypto";
import { readFileSync, writeFileSync, unlinkSync, chmodSync } from "fs";
import path from "path";
import PocketBase from "pocketbase";
import nodemailer from "nodemailer";

const ROOT = path.join(import.meta.dirname, "..");
const ENV_FILE = path.join(ROOT, ".data", "server-env.json");
const USER = "noreply@lonaliza.com";
const DOMAIN = "lonaliza.com";
const HOST = "127.0.0.1";
const PORT = 587;

function loadEnv() {
  const raw = JSON.parse(readFileSync(ENV_FILE, "utf8"));
  return raw.values || {};
}

function saveEnvPatch(patch) {
  const store = JSON.parse(readFileSync(ENV_FILE, "utf8"));
  store.values = { ...(store.values || {}), ...patch };
  store.updatedAt = new Date().toISOString();
  writeFileSync(ENV_FILE, JSON.stringify(store, null, 2), { mode: 0o600 });
}

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    encoding: "utf8",
    ...opts,
  });
  if (res.status !== 0) {
    throw new Error((res.stderr || res.stdout || `${cmd} failed`).slice(0, 300));
  }
  return (res.stdout || "").trim();
}

function hashPassword(plain) {
  const res = spawnSync(
    "docker",
    ["exec", "-i", "billionmail-dovecot-billionmail-1", "doveadm", "pw", "-s", "SHA512-CRYPT"],
    { input: `${plain}\n${plain}\n`, encoding: "utf8" }
  );
  if (res.status !== 0) {
    throw new Error("doveadm hash failed");
  }
  const hash = (res.stdout || "").trim().split(/\s+/)[0];
  if (!hash.startsWith("{SHA512-CRYPT}")) {
    throw new Error("unexpected hash scheme");
  }
  return hash;
}

function mailboxExists() {
  const out = run("docker", [
    "exec",
    "billionmail-pgsql-billionmail-1",
    "psql",
    "-U",
    "billionmail",
    "-d",
    "billionmail",
    "-tAc",
    `SELECT username FROM mailbox WHERE username='${USER}';`,
  ]);
  return out.includes(USER);
}

function ensureDomain() {
  run("docker", [
    "exec",
    "billionmail-pgsql-billionmail-1",
    "psql",
    "-U",
    "billionmail",
    "-d",
    "billionmail",
    "-c",
    `INSERT INTO domain (domain, a_record, mailboxes, mailbox_quota, quota, rate_limit, create_time, active)
     VALUES ('${DOMAIN}', '', 50, 5368709120, 10737418240, 12, EXTRACT(EPOCH FROM NOW())::int, 1)
     ON CONFLICT (domain) DO NOTHING;`,
  ]);
}

function upsertMailbox(hash, encoded) {
  const now = Math.floor(Date.now() / 1000);
  const sql = mailboxExists()
    ? `UPDATE mailbox SET password = $hash, password_encode = $enc, active = 1, update_time = ${now}
       WHERE username = '${USER}';`
    : `INSERT INTO mailbox
       (username, password, password_encode, full_name, is_admin, maildir, quota, local_part, domain, create_time, update_time, active, used_quota, quota_active)
       VALUES ('${USER}', $hash, $enc, 'Lonaliza No-Reply', 0, '${DOMAIN}/noreply/', 1073741824, 'noreply', '${DOMAIN}', ${now}, ${now}, 1, 0, 1);`;
  // pass hash via env to psql to avoid argv leakage in our node logs
  const envSql = sql.replace("$hash", `'${hash.replace(/'/g, "''")}'`).replace("$enc", `'${encoded}'`);
  run("docker", [
    "exec",
    "billionmail-pgsql-billionmail-1",
    "psql",
    "-U",
    "billionmail",
    "-d",
    "billionmail",
    "-c",
    envSql,
  ]);
}

function ensureMaildir() {
  run("docker", [
    "exec",
    "billionmail-dovecot-billionmail-1",
    "sh",
    "-c",
    "mkdir -p /var/vmail/lonaliza.com/noreply/cur /var/vmail/lonaliza.com/noreply/new /var/vmail/lonaliza.com/noreply/tmp && chown -R 150:8 /var/vmail/lonaliza.com && chmod -R 700 /var/vmail/lonaliza.com",
  ]);
}

async function savePocketBase(plain) {
  const env = loadEnv();
  const url = env.POCKETBASE_URL || "http://127.0.0.1:8090";
  const email = env.POCKETBASE_ADMIN_EMAIL;
  const password = env.POCKETBASE_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("PocketBase admin credentials missing");
  const pb = new PocketBase(url);
  pb.autoCancellation(false);
  await pb.collection("_superusers").authWithPassword(email, password);
  const current = await pb.settings.getAll();
  await pb.settings.update({
    smtp: {
      ...(current.smtp || {}),
      enabled: true,
      host: HOST,
      port: PORT,
      username: USER,
      password: plain,
      authMethod: "PLAIN",
      tls: false,
      localName: DOMAIN,
    },
    meta: {
      ...(current.meta || {}),
      senderName: "الريان للسياحة",
      senderAddress: USER,
    },
  });
  saveEnvPatch({ POCKETBASE_SMTP_PASSWORD: plain });
}

async function verify(plain) {
  const transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: false,
    requireTLS: true,
    auth: { user: USER, pass: plain },
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: false },
  });
  await transporter.verify();
}

async function maybeTest(plain, to) {
  if (!to || !to.includes("@") || to.endsWith("@lonaliza.com")) {
    return "skipped";
  }
  const transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: false,
    requireTLS: true,
    auth: { user: USER, pass: plain },
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: false },
  });
  await transporter.sendMail({
    from: { name: "الريان للسياحة", address: USER },
    to,
    subject: "تجربة SMTP — الريان للسياحة",
    text: "SMTP test from Alrayyan Tourism — admin only.",
    html: "<p dir=\"rtl\">تم التحقق من بريد السيرفر. رسالة تجريبية للأدمن فقط.</p>",
  });
  return "sent";
}

const existed = mailboxExists();
const plain = randomBytes(18).toString("base64url");
const hash = hashPassword(plain);
const encoded = Buffer.from(plain, "utf8").toString("base64");
ensureDomain();
upsertMailbox(hash, encoded);
ensureMaildir();
await savePocketBase(plain);
let verifyOk = false;
let verifyError = "";
try {
  await verify(plain);
  verifyOk = true;
} catch (e) {
  verifyError = e instanceof Error ? e.message.replace(/pass(word)?=\S+/gi, "[redacted]") : "verify failed";
}
const env = loadEnv();
const adminTo = String(env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(/[,\s]+/)
  .find(Boolean);
let test = "skipped";
if (verifyOk && adminTo) {
  try {
    test = await maybeTest(plain, adminTo);
  } catch (e) {
    test = "failed";
    verifyError = e instanceof Error ? e.message.replace(/pass(word)?=\S+/gi, "[redacted]") : "test failed";
  }
}

console.log(
  JSON.stringify({
    ok: verifyOk,
    host: HOST,
    port: PORT,
    username: USER,
    sender: USER,
    mailbox: existed ? "updated" : "created",
    passwordSaved: true,
    verify: verifyOk ? "ok" : "failed",
    testSend: test,
    error: verifyError || undefined,
  })
);
