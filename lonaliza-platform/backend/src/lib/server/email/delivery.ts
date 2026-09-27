import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { Resolver } from "node:dns/promises";
import { readPocketBaseMailSettings } from "@/lib/server/email/smtp";
import type {
  DnsAuthCheck,
  DnsAuthReport,
  DnsCheckStatus,
  DnsSetupTip,
  LastMailDelivery,
  MailDeliveryStatus,
} from "@/lib/server/email/types";

const STORE_FILE = path.join(process.cwd(), ".data", "email-delivery.json");
const POSTFIX_LOG =
  "/www/dk_project/dk_app/billionmail/billionmail/data/logs/postfix/mail.log";
const DKIM_BASE =
  "/www/dk_project/dk_app/billionmail/billionmail/data/rspamd-data/dkim";
const SELECTOR = "default";
const PRIVATE_IPV4 =
  /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/;

export type MailAuthContext = {
  requestHost?: string;
};

export function requestHostHeader(req: {
  headers: { get(name: string): string | null };
}): string {
  const forwarded = req.headers.get("x-forwarded-host") || "";
  return (forwarded.split(",")[0] || req.headers.get("host") || "").trim();
}

export function mailDomainFromHost(raw: string): string {
  const host = String(raw || "")
    .split(",")[0]
    .split(":")[0]
    .trim()
    .toLowerCase()
    .replace(/\.$/, "");
  if (!host) return "";
  if (host === "localhost" || host.endsWith(".localhost")) return "";
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return "";
  return host.replace(/^www\./, "");
}

export type DeliveryProbe = {
  status: MailDeliveryStatus;
  remoteDsn: string;
  remoteReason: string;
  deliveredToRemote: boolean;
};

function emptyDelivery(): LastMailDelivery {
  return {
    at: "",
    to: "",
    from: "",
    localAccepted: false,
    deliveredToInbox: false,
    status: "unknown",
    queueId: "",
    messageId: "",
    smtpResponse: "",
    remoteDsn: "",
    remoteReason: "",
    labelAr: "لا توجد محاولة إرسال مسجّلة",
    labelEn: "No send attempt recorded",
  };
}

function labelsFor(row: Omit<LastMailDelivery, "labelAr" | "labelEn">): {
  labelAr: string;
  labelEn: string;
} {
  switch (row.status) {
    case "local_accepted":
      return {
        labelAr: "قُبلت محلياً من SMTP — هذا ليس وصولاً إلى جيميل",
        labelEn: "Accepted by local SMTP — not proof it reached Gmail",
      };
    case "delivered":
      return {
        labelAr:
          "الخادم البعيد قبل الرسالة (قبول MX ≠ ضمان صندوق الوارد أو تجنب السبام)",
        labelEn:
          "Remote MX accepted the message (not a guarantee of inbox or spam placement)",
      };
    case "bounced":
      return {
        labelAr: `رفضها الخادم البعيد${row.remoteDsn ? ` (${row.remoteDsn})` : ""}`,
        labelEn: `Remote server rejected the message${row.remoteDsn ? ` (${row.remoteDsn})` : ""}`,
      };
    case "deferred":
      return {
        labelAr: "مؤجّلة في الطابور (deferred) — لم تُسلَّم بعد",
        labelEn: "Deferred in the queue — not delivered yet",
      };
    case "unknown":
      return {
        labelAr: row.localAccepted
          ? "قُبلت محلياً — لا تأكيد من جيميل بعد"
          : "لا توجد حالة تسليم",
        labelEn: row.localAccepted
          ? "Accepted locally — no remote confirmation yet"
          : "No delivery status",
      };
    default: {
      const _exhaustive: never = row.status;
      return { labelAr: String(_exhaustive), labelEn: String(_exhaustive) };
    }
  }
}

function withLabels(row: Omit<LastMailDelivery, "labelAr" | "labelEn">): LastMailDelivery {
  return { ...row, ...labelsFor(row) };
}

export function parseQueueId(smtpResponse: string): string {
  const match = String(smtpResponse || "").match(/queued as\s+([A-F0-9]+)/i);
  return match?.[1] || "";
}

function extractBounceReason(line: string): string {
  const said = line.match(/said:\s*(.+)$/i);
  const raw = said?.[1] || line;
  return raw
    .replace(/\s*550-\d+\.\d+\.\d+\s*/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ffacd0b85a97d-\S+/g, "")
    .trim()
    .slice(0, 420);
}

export async function probePostfixDelivery(queueId: string): Promise<DeliveryProbe> {
  const id = String(queueId || "").trim();
  if (!id) {
    return {
      status: "unknown",
      remoteDsn: "",
      remoteReason: "",
      deliveredToRemote: false,
    };
  }
  try {
    const text = await fs.readFile(POSTFIX_LOG, "utf8");
    const lines = text.split("\n").filter((line) => line.includes(`${id}:`));
    let status: MailDeliveryStatus = "unknown";
    let remoteDsn = "";
    let remoteReason = "";
    for (const line of lines) {
      const dsn = line.match(/dsn=([0-9.]+)/i);
      if (dsn) remoteDsn = dsn[1];
      if (/status=sent\b/i.test(line) && /relay=/i.test(line) && !/relay=local/i.test(line)) {
        status = "delivered";
        remoteReason = "Remote MX accepted (250). Inbox/spam placement is not guaranteed.";
      } else if (/status=bounced\b/i.test(line)) {
        status = "bounced";
        remoteReason = extractBounceReason(line);
      } else if (/status=deferred\b/i.test(line)) {
        status = "deferred";
        remoteReason = extractBounceReason(line);
      }
    }
    return {
      status,
      remoteDsn,
      remoteReason,
      deliveredToRemote: status === "delivered",
    };
  } catch {
    return {
      status: "unknown",
      remoteDsn: "",
      remoteReason: "تعذّر قراءة سجل Postfix",
      deliveredToRemote: false,
    };
  }
}

export async function waitAndProbeDelivery(
  queueId: string,
  attempts = 4,
  delayMs = 800
): Promise<DeliveryProbe> {
  let last = await probePostfixDelivery(queueId);
  for (let i = 0; i < attempts; i += 1) {
    if (last.status === "delivered" || last.status === "bounced") return last;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    last = await probePostfixDelivery(queueId);
  }
  return last;
}

export async function readLastDelivery(): Promise<LastMailDelivery> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<LastMailDelivery>;
    if (!parsed || typeof parsed !== "object") return emptyDelivery();
    return withLabels({
      at: String(parsed.at || ""),
      to: String(parsed.to || ""),
      from: String(parsed.from || ""),
      localAccepted: Boolean(parsed.localAccepted),
      deliveredToInbox: false,
      status: (parsed.status as MailDeliveryStatus) || "unknown",
      queueId: String(parsed.queueId || ""),
      messageId: String(parsed.messageId || ""),
      smtpResponse: String(parsed.smtpResponse || ""),
      remoteDsn: String(parsed.remoteDsn || ""),
      remoteReason: String(parsed.remoteReason || ""),
    });
  } catch {
    return emptyDelivery();
  }
}

export async function saveLastDelivery(
  input: Omit<LastMailDelivery, "labelAr" | "labelEn" | "deliveredToInbox">
): Promise<LastMailDelivery> {
  const row = withLabels({
    ...input,
    deliveredToInbox: false,
  });
  await fs.mkdir(path.dirname(STORE_FILE), { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(row, null, 2), { mode: 0o600 });
  return row;
}

const LIVE_RESOLVERS = ["1.1.1.1", "8.8.8.8"] as const;

function liveResolver(server: string): Resolver {
  const resolver = new Resolver();
  resolver.setServers([server]);
  return resolver;
}

async function txtFromServer(name: string, server: string): Promise<string[]> {
  try {
    const chunks = await liveResolver(server).resolveTxt(name);
    return chunks.map((parts) => parts.join("")).filter(Boolean);
  } catch {
    return [];
  }
}

async function txtRecordsLive(name: string): Promise<string[]> {
  const batches = await Promise.all(LIVE_RESOLVERS.map((server) => txtFromServer(name, server)));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of batches) {
    for (const value of list) {
      if (seen.has(value)) continue;
      seen.add(value);
      out.push(value);
    }
  }
  return out;
}

async function mxRecordsLive(name: string): Promise<{ exchange: string; priority: number }[]> {
  for (const server of LIVE_RESOLVERS) {
    try {
      const rows = await liveResolver(server).resolveMx(name);
      if (rows.length) return rows;
    } catch {
      /* try next resolver */
    }
  }
  return [];
}

async function ptrRecordsLive(ip: string): Promise<string[]> {
  for (const server of LIVE_RESOLVERS) {
    try {
      const rows = await liveResolver(server).reverse(ip);
      if (rows.length) return rows;
    } catch {
      /* try next resolver */
    }
  }
  return [];
}

async function aRecordsLive(name: string): Promise<string[]> {
  if (!name) return [];
  for (const server of LIVE_RESOLVERS) {
    try {
      const rows = await liveResolver(server).resolve4(name);
      if (rows.length) return rows;
    } catch {
      /* try next resolver */
    }
  }
  return [];
}

function isPublicIpv4(ip: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(ip) && !PRIVATE_IPV4.test(ip);
}

function publicLocalIpv4s(): string[] {
  const out: string[] = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const item of list || []) {
      const isV4 = item.family === "IPv4" || String(item.family) === "4";
      if (!isV4 || item.internal || !isPublicIpv4(item.address)) continue;
      if (!out.includes(item.address)) out.push(item.address);
    }
  }
  return out;
}

async function outboundPublicIpv4(): Promise<string> {
  try {
    const res = await fetch("https://1.1.1.1/cdn-cgi/trace", { cache: "no-store" });
    const text = await res.text();
    const ip = text.match(/^ip=([0-9.]+)$/m)?.[1] || "";
    return isPublicIpv4(ip) ? ip : "";
  } catch {
    return "";
  }
}

async function discoverSendingIpv4(mailHost: string, domain: string): Promise<string> {
  const [locals, mailA, outbound, apexA] = await Promise.all([
    Promise.resolve(publicLocalIpv4s()),
    aRecordsLive(mailHost),
    outboundPublicIpv4(),
    aRecordsLive(domain),
  ]);
  const preferred = locals.find((ip) => mailA.includes(ip));
  if (preferred) return preferred;
  if (locals[0]) return locals[0];
  if (mailA[0]) return mailA[0];
  if (outbound) return outbound;
  return apexA[0] || "";
}

async function resolveMailDomain(requestHost?: string): Promise<string> {
  const fromReq = mailDomainFromHost(requestHost || "");
  if (fromReq) return fromReq;
  try {
    const { smtp, meta } = await readPocketBaseMailSettings();
    const fromLocal = mailDomainFromHost(String(smtp.localName || ""));
    if (fromLocal) return fromLocal;
    const sender = String(meta.senderAddress || "");
    const at = sender.lastIndexOf("@");
    if (at > 0) {
      const fromSender = mailDomainFromHost(sender.slice(at + 1));
      if (fromSender) return fromSender;
    }
    const appUrl = String(meta.appURL || "").trim();
    if (appUrl) {
      const fromApp = mailDomainFromHost(new URL(appUrl).hostname);
      if (fromApp) return fromApp;
    }
  } catch {
    /* keep empty — never fall back to a hardcoded vendor domain */
  }
  return "";
}

function extractDkimP(txt: string): string {
  const match = String(txt || "").replace(/\s+/g, "").match(/p=([A-Za-z0-9+/=]+)/i);
  return match?.[1] || "";
}

function checkOf(
  name: string,
  status: DnsCheckStatus,
  current: string,
  recommended: string,
  noteAr: string,
  noteEn: string
): DnsAuthCheck {
  return {
    name,
    ok: status === "ok",
    status,
    current: current || "(لا يوجد)",
    recommended,
    noteAr,
    noteEn,
  };
}

async function readRecommendedDkim(domain: string): Promise<string> {
  if (!domain) return "";
  try {
    const raw = await fs.readFile(path.join(DKIM_BASE, domain, "default.pub"), "utf8");
    const parts = [...raw.matchAll(/p=([A-Za-z0-9+/=]+)/g)].map((m) => m[1]);
    const pub = parts.join("");
    if (!pub) return "";
    return `v=DKIM1; k=rsa; p=${pub}`;
  } catch {
    return "";
  }
}

function normalizeHostName(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\.$/, "");
}

function ptrMatchesMail(ptrTxt: string, mailHost: string, domain: string): boolean {
  const names = ptrTxt
    .split(",")
    .map((part) => normalizeHostName(part))
    .filter(Boolean);
  const host = normalizeHostName(mailHost);
  const root = normalizeHostName(domain);
  return names.some(
    (name) =>
      (host && name === host) ||
      (root && name === root) ||
      (root && name.endsWith(`.${root}`))
  );
}

function buildSetupTips(input: {
  domain: string;
  mailHost: string;
  sendingIpv4: string;
  dkimOk2048: boolean;
}): DnsSetupTip[] {
  const ip = input.sendingIpv4 || "…";
  const host = input.mailHost || (input.domain ? `mail.${input.domain}` : "mail.{domain}");
  const selector = `${SELECTOR}._domainkey`;
  return [
    {
      name: "PTR",
      titleAr: "PTR — Reverse DNS عند مزوّد الـ IP",
      titleEn: "PTR — reverse DNS at the IP provider",
      bodyAr: `PTR يُضبط عند مزوّد الـ IP / الاستضافة (Reverse DNS)، وليس من لوحة DNS للنطاق (Cloudflare وأشباهه). القيمة المقترحة = مضيف البريد الحالي (${host}) للعنوان ${ip} الذي يظهر من هذا الفحص.`,
      bodyEn: `Set PTR at the IP / hosting provider (Reverse DNS), not in the domain DNS panel (Cloudflare and similar). Suggested value: current mail host (${host}) for the checked IP ${ip}.`,
    },
    {
      name: "MX",
      titleAr: "MX — في DNS النطاق",
      titleEn: "MX — in the domain DNS",
      bodyAr: `أضف في DNS النطاق: سجل A لـ ${host} إلى ${ip} (بدون بروكسي) ثم MX أولوية 10 يشير إلى ${host}. الإرسال قد يعمل بدون MX؛ الاستقبال على النطاق يحتاج MX.`,
      bodyEn: `In domain DNS add an A record ${host} → ${ip} (DNS only, not proxied) and MX priority 10 pointing to ${host}. Outbound can work without MX; inbound needs MX.`,
    },
    {
      name: "DKIM",
      titleAr: "DKIM — السلكتور default",
      titleEn: "DKIM — default selector",
      bodyAr: `السلكتور ${selector} يجب أن يطابق المفتاح العام كاملاً حتى IDAQAB.${
        input.dkimOk2048
          ? " فحص الأدمن موافق 2048 — تجاهل تحذير «1024 بت» من محلّل Cloudflare؛ السجل الطويل يُقسَّم غالباً فيُقرأ ناقصاً."
          : " انسخ السجل الكامل (كل أجزاء TXT معاً) حتى النهاية IDAQAB. تحذير «1024 بت» من محلّل Cloudflare غالباً لأن السجل الطويل يُقسَّم — إن أصبح الفحص هنا موافقاً 2048 تجاهل ذلك التحذير."
      } BIMI اختياري وليس شرطاً للتسليم.`,
      bodyEn: `${selector} must match the full public key through IDAQAB.${
        input.dkimOk2048
          ? " This admin check is OK at 2048 — ignore a Cloudflare analyzer “1024-bit” warning; long TXT records are often split and misread."
          : " Publish the complete TXT (all chunks joined) through IDAQAB. A Cloudflare “1024-bit” warning usually means the long record was split — ignore it if this check later reports OK 2048."
      } BIMI is optional and not required for delivery.`,
    },
  ];
}

export async function getMailAuthDnsReport(
  ctx: MailAuthContext = {}
): Promise<DnsAuthReport> {
  const mailDomain = await resolveMailDomain(ctx.requestHost);
  const mailHost = mailDomain ? `mail.${mailDomain}` : "";
  const sendingIpv4 = await discoverSendingIpv4(mailHost, mailDomain);
  const signingHost = mailDomain ? `${SELECTOR}._domainkey.${mailDomain}` : `${SELECTOR}._domainkey`;
  const ipEscaped = sendingIpv4.replace(/\./g, "\\.");
  const [
    spf,
    dmarc,
    dkimDefault,
    dkimStar,
    mx,
    ptr,
    recommendedDkim,
  ] = await Promise.all([
    mailDomain ? txtRecordsLive(mailDomain) : Promise.resolve([] as string[]),
    mailDomain ? txtRecordsLive(`_dmarc.${mailDomain}`) : Promise.resolve([] as string[]),
    mailDomain ? txtRecordsLive(signingHost) : Promise.resolve([] as string[]),
    mailDomain ? txtRecordsLive(`*._domainkey.${mailDomain}`) : Promise.resolve([] as string[]),
    mailDomain ? mxRecordsLive(mailDomain) : Promise.resolve([] as { exchange: string; priority: number }[]),
    sendingIpv4 ? ptrRecordsLive(sendingIpv4) : Promise.resolve([] as string[]),
    readRecommendedDkim(mailDomain),
  ]);

  const spfTxt = spf.find((v) => /v=spf1/i.test(v)) || "";
  const dmarcTxt = dmarc.find((v) => /v=DMARC1/i.test(v)) || "";
  const dkimTxt = dkimDefault[0] || "";
  const starTxt = dkimStar[0] || "";
  const mxTxt = mx.map((row) => `${row.priority} ${row.exchange}`).join(", ");
  const ptrTxt = ptr.join(", ");
  const localP = extractDkimP(recommendedDkim);
  const publishedP = extractDkimP(dkimTxt);
  const spfAllowsIp = Boolean(sendingIpv4 && new RegExp(`ip4:${ipEscaped}`, "i").test(spfTxt));
  const spfBlocksAll = /v=spf1\s+-all/i.test(spfTxt);
  const dkimComplete = Boolean(localP) && publishedP === localP;
  const dkimTruncated = Boolean(
    publishedP && localP && publishedP !== localP && localP.startsWith(publishedP)
  );
  const looks1024 = publishedP.startsWith("MIGf");
  const endsIdaqab = /IDAQAB=?$/i.test(publishedP);
  const ptrAligned = ptrMatchesMail(ptrTxt, mailHost, mailDomain);

  let dkimStatus: DnsCheckStatus = "missing";
  let dkimNoteAr = `لا يوجد سجل ${SELECTOR}._domainkey. محرك البريد يوقّع بالسلكتور ${SELECTOR} — يجب نشر المفتاح العام كاملاً حتى IDAQAB.`;
  let dkimNoteEn = `No ${SELECTOR}._domainkey record. The mail engine signs with selector ${SELECTOR} — publish the full public key through IDAQAB.`;
  if (dkimComplete) {
    dkimStatus = "ok";
    dkimNoteAr =
      `سجل ${SELECTOR}._domainkey يطابق مفتاح التوقيع 2048 بت${endsIdaqab ? " حتى IDAQAB" : ""}. تحذير «1024 بت» من محلّل Cloudflare غالباً لأن السجل الطويل يُقسَّم — تجاهله ما دام هذا الفحص موافقاً.`;
    dkimNoteEn =
      `${SELECTOR}._domainkey matches the local 2048-bit signing key${endsIdaqab ? " through IDAQAB" : ""}. A Cloudflare “1024-bit” warning usually means the long TXT was split — ignore it while this check is OK.`;
  } else if (dkimTruncated) {
    dkimStatus = "warning";
    dkimNoteAr =
      "المفتاح في DNS مقطوع (أقصر من مفتاح السيرفر). انسخ السجل الكامل إلى default._domainkey حتى IDAQAB، وليس *._domainkey فقط. تحذير Cloudflare 1024 يظهر غالباً من التقسيم أو السجل الناقص.";
    dkimNoteEn =
      "Published DKIM p= is truncated. Publish the full key on default._domainkey through IDAQAB.";
  } else if (publishedP && looks1024) {
    dkimStatus = "warning";
    dkimNoteAr =
      "المفتاح المنشور يبدو 1024 بت. انشر default._domainkey بالمفتاح العام الكامل 2048 حتى IDAQAB. إن طابق الفحص لاحقاً 2048 فتجاهل تحذير محلّل Cloudflare.";
    dkimNoteEn =
      "Published key looks 1024-bit. Replace default._domainkey with the full 2048-bit value through IDAQAB.";
  } else if (publishedP) {
    dkimStatus = "warning";
    dkimNoteAr =
      "يوجد DKIM لكنّه لا يطابق مفتاح التوقيع المحلي (default). *._domainkey لا يكفي إذا كان المحتوى ناقصاً أو لمفتاح آخر.";
    dkimNoteEn = "DKIM exists but does not match the local default signing key.";
  } else if (starTxt) {
    dkimNoteAr = `يوجد *._domainkey فقط. التوقيع s=${SELECTOR} فيتطلب ${signingHost} بالمفتاح الكامل حتى IDAQAB.`;
    dkimNoteEn = `Only *._domainkey exists. Signing selector is ${SELECTOR}.`;
  }

  const spfOk = Boolean(spfTxt) && !spfBlocksAll && (!sendingIpv4 || spfAllowsIp);
  const spfStatus: DnsCheckStatus =
    !spfTxt || spfBlocksAll || (Boolean(sendingIpv4) && !spfAllowsIp) ? "missing" : "ok";
  const dmarcPresent = Boolean(dmarcTxt);
  const dmarcOk = dmarcPresent && (spfOk || dkimComplete);

  const checks: DnsAuthCheck[] = [
    checkOf(
      "SPF",
      spfStatus,
      spfTxt,
      sendingIpv4 ? `v=spf1 ip4:${sendingIpv4} a mx ~all` : "v=spf1 a mx ~all",
      spfBlocksAll
        ? "السجل الحالي v=spf1 -all يرفض كل المرسلين."
        : spfOk
          ? "SPF يسمح بعنوان هذا السيرفر."
          : "أضف ip4 لعنوان هذا السيرفر في SPF.",
      spfOk ? "SPF includes this server IPv4." : "Publish SPF that includes this server IPv4."
    ),
    checkOf(
      "DKIM",
      dkimStatus,
      dkimTxt || starTxt,
      recommendedDkim || `${signingHost} TXT`,
      dkimNoteAr,
      dkimNoteEn
    ),
    checkOf(
      "DMARC",
      dmarcOk ? "ok" : dmarcPresent ? "warning" : "missing",
      dmarcTxt,
      mailDomain
        ? `v=DMARC1; p=quarantine; rua=mailto:noreply@${mailDomain}`
        : "v=DMARC1; p=quarantine",
      dmarcOk
        ? "DMARC منشور. بعد اكتمال DKIM يمكن إبقاؤه quarantine أو تشديده لاحقاً."
        : dmarcPresent
          ? "DMARC موجود لكن SPF/DKIM غير مكتملين — التسليم ما زال ضعيفاً."
          : "أضف سجل DMARC.",
      dmarcOk ? "DMARC is published." : "DMARC needs working SPF or DKIM."
    ),
    checkOf(
      "MX",
      mx.length > 0 ? "ok" : "warning",
      mxTxt,
      mailHost ? `10 ${mailHost}` : "10 mail.{domain}",
      mx.length
        ? "MX موجود."
        : `لا يوجد MX. أضف في DNS النطاق سجل A لـ ${mailHost || "mail.{domain}"} إلى ${sendingIpv4 || "IP السيرفر"} ثم MX أولوية 10. الإرسال قد يعمل بدونه؛ الاستقبال يحتاج MX.`,
      mx.length
        ? "MX is present."
        : `No MX. Add A ${mailHost || "mail.{domain}"} → ${sendingIpv4 || "server IP"} and MX priority 10. Outbound can work without it; inbound needs MX.`
    ),
    checkOf(
      "PTR",
      sendingIpv4 ? (ptrAligned ? "ok" : "warning") : "warning",
      ptrTxt,
      mailHost || "mail.{domain}",
      ptrAligned
        ? `PTR يطابق مضيف البريد (${mailHost || ptrTxt}). يُضبط عند مزوّد الـ IP / الاستضافة (Reverse DNS) وليس من لوحة DNS للنطاق.`
        : `الحالي ${ptrTxt || "فارغ"}. اضبط Reverse DNS عند مزوّد الـ IP / الاستضافة إلى ${mailHost || "mail.{domain}"} للعنوان ${sendingIpv4 || "المكتشف من الفحص"}. ليس من لوحة DNS للنطاق (Cloudflare وأشباهه).`,
      ptrAligned
        ? "PTR matches the mail host. Set it at the IP / hosting provider, not the domain DNS panel."
        : `Current ${ptrTxt || "empty"}. Set reverse DNS at the IP provider to ${mailHost || "mail.{domain}"} for ${sendingIpv4 || "the checked IP"}.`
    ),
  ];

  return {
    sendingIpv4,
    mailDomain,
    mailHost,
    checkedAt: new Date().toISOString(),
    queriedVia: [...LIVE_RESOLVERS],
    signingSelector: SELECTOR,
    signingHost,
    checks,
    setupTips: buildSetupTips({
      domain: mailDomain,
      mailHost,
      sendingIpv4,
      dkimOk2048: dkimComplete,
    }),
    bimiNoteAr:
      "BIMI اختياري ومدفوع غالباً (شهادة VMC/CMC وشعار SVG). ليس شرطاً للتسليم ولا يُحسب ناقصاً حرجاً.",
    bimiNoteEn:
      "BIMI is optional and often paid. It is not required for delivery and is not a critical miss.",
    canGuaranteeAr:
      "أول رسائل لنطاق جديد غالباً تذهب للسبام حتى تُبنى السمعة؛ تعليم «ليست سبام» يساعد التالية. يمكن ضمان محاولة المصادقة (SPF+DKIM+DMARC+PTR+TLS ونطاق مطابق) — لا ضمان للوارد.",
    canGuaranteeEn:
      "First messages from a new domain often land in spam until reputation builds; marking “Not spam” helps later mail. Authentication can be aligned (SPF+DKIM+DMARC+PTR+TLS) — inbox placement cannot be guaranteed.",
  };
}
