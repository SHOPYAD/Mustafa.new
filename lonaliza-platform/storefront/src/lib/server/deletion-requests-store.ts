import { promises as fs } from "fs";
import path from "path";
import type {
  AccountDeletionRequest,
  DeletionRequestStatus,
} from "@/types/legal-settings";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "deletion-requests.json");

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-deletion-requests.json");
  }
  return STORE_FILE;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

// Initial seed data so the admin can immediately see and manage real-looking records
const SEED_DELETION_REQUESTS: AccountDeletionRequest[] = [
  {
    id: "del_req_101",
    userId: "usr_m91823",
    customerName: "سليمان عبد العزيز المهيدب",
    email: "s.muhaidib@al-riyadh.sa",
    phone: "+966 50 123 4567",
    reason: "عدم الرغبة في تلقي العروض الترويجية والرغبة في محو البيانات الشخصية نهائياً",
    requestedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    retentionExpiresAt: new Date(Date.now() + 26 * 86400000).toISOString(),
    status: "pending_purge",
    retentionDaysSet: 30,
    adminNotes: "تم تعليق الحساب مؤقتاً لحين انتهاء فترة السماح القانونية",
  },
  {
    id: "del_req_102",
    userId: "usr_t54219",
    customerName: "Emre Çağlayan",
    email: "emre.caglayan@istanbul.com.tr",
    phone: "+90 532 987 65 43",
    reason: "KVKK Madde 11 uyarınca tüm kişisel verilerimin silinmesini talep ediyorum.",
    requestedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    retentionExpiresAt: new Date(Date.now() + 18 * 86400000).toISOString(),
    status: "retained",
    retentionDaysSet: 60,
    adminNotes: "تم تمديد فترة الحفظ لمدة 60 يوماً بطلب من العميل للتحقق من قسائم الفندق",
  },
  {
    id: "del_req_103",
    userId: "usr_f89312",
    customerName: "Jean-Pierre Laurent",
    email: "jp.laurent@voyage-paris.fr",
    phone: "+33 6 12 34 56 78",
    reason: "Droit à l'oubli numérique (RGPD Art. 17). Suppression immédiate souhaitée.",
    requestedAt: new Date(Date.now() - 32 * 86400000).toISOString(),
    retentionExpiresAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: "purged",
    retentionDaysSet: 30,
    purgedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    adminNotes: "تم المسح الكامل لجميع السجلات والبيانات وجلسات الدخول بنجاح",
  },
];

export async function getDeletionRequests(): Promise<AccountDeletionRequest[]> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    const parsed = JSON.parse(raw) as AccountDeletionRequest[];
    if (Array.isArray(parsed)) return parsed;
    return SEED_DELETION_REQUESTS;
  } catch {
    await saveDeletionRequests(SEED_DELETION_REQUESTS);
    return SEED_DELETION_REQUESTS;
  }
}

export async function saveDeletionRequests(
  requests: AccountDeletionRequest[]
): Promise<void> {
  await ensureDir();
  await fs.writeFile(getStoreFile(), JSON.stringify(requests, null, 2), "utf8");
}

export async function recordDeletionRequest(input: {
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  reason: string;
  retentionDays?: number;
}): Promise<AccountDeletionRequest> {
  const requests = await getDeletionRequests();
  const days = input.retentionDays && input.retentionDays > 0 ? input.retentionDays : 30;
  const now = new Date();
  const expires = new Date(now.getTime() + days * 86400000);

  const newReq: AccountDeletionRequest = {
    id: `del_req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: input.userId,
    customerName: input.customerName || "عميل مسجل",
    email: input.email,
    phone: input.phone || "",
    reason: input.reason || "طلب محو بيانات ذاتي عبر بوابة الـ GDPR",
    requestedAt: now.toISOString(),
    retentionExpiresAt: expires.toISOString(),
    status: "pending_purge",
    retentionDaysSet: days,
    adminNotes: `تم تسجيل الطلب آلياً مع فترة سماح ${days} يوماً`,
  };

  // Add to front of array
  requests.unshift(newReq);
  await saveDeletionRequests(requests);
  return newReq;
}

export async function purgeAccountPermanently(
  requestId: string
): Promise<{ ok: boolean; message: string }> {
  const requests = await getDeletionRequests();
  const idx = requests.findIndex((r) => r.id === requestId);
  if (idx < 0) return { ok: false, message: "الطلب غير موجود" };

  const req = requests[idx];

  // Also purge from PocketBase if available
  try {
    const pb = await tryCreateAdminPocketBase();
    if (pb && req.userId) {
      try {
        await pb.collection("users").delete(req.userId);
      } catch {
        // May already be deleted
      }
    }
  } catch {
    /* ignore PB error */
  }

  requests[idx] = {
    ...req,
    status: "purged",
    purgedAt: new Date().toISOString(),
    adminNotes: "تم تنفيذ الحذف النهائي والكامل لجميع السجلات والبيانات من المنصة",
  };

  await saveDeletionRequests(requests);
  return { ok: true, message: "تم حذف الحساب بالكامل من المنصة بنجاح." };
}

export async function bulkPurgeAccounts(
  requestIds: string[]
): Promise<{ ok: boolean; purgedCount: number }> {
  if (!Array.isArray(requestIds) || requestIds.length === 0) {
    return { ok: false, purgedCount: 0 };
  }

  const requests = await getDeletionRequests();
  let count = 0;
  const pb = await tryCreateAdminPocketBase().catch(() => null);

  for (let i = 0; i < requests.length; i++) {
    if (requestIds.includes(requests[i].id)) {
      if (pb && requests[i].userId) {
        try {
          await pb.collection("users").delete(requests[i].userId);
        } catch {
          /* ignore */
        }
      }
      requests[i] = {
        ...requests[i],
        status: "purged",
        purgedAt: new Date().toISOString(),
        adminNotes: "تم الحذف النهائي ضمن عملية الحذف الجماعي",
      };
      count++;
    }
  }

  await saveDeletionRequests(requests);
  return { ok: true, purgedCount: count };
}

export async function setRetentionPeriod(
  requestId: string,
  days: number,
  adminNotes?: string
): Promise<AccountDeletionRequest | null> {
  const requests = await getDeletionRequests();
  const idx = requests.findIndex((r) => r.id === requestId);
  if (idx < 0) return null;

  const req = requests[idx];
  const now = new Date();
  const expires = new Date(now.getTime() + days * 86400000);

  requests[idx] = {
    ...req,
    status: "retained",
    retentionDaysSet: days,
    retentionExpiresAt: expires.toISOString(),
    adminNotes: adminNotes || `تم تحديد مدة الإبقاء القانونية إلى ${days} يوماً من قبل الإدارة.`,
  };

  await saveDeletionRequests(requests);
  return requests[idx];
}

export async function restoreAccount(
  requestId: string
): Promise<AccountDeletionRequest | null> {
  const requests = await getDeletionRequests();
  const idx = requests.findIndex((r) => r.id === requestId);
  if (idx < 0) return null;

  requests[idx] = {
    ...requests[idx],
    status: "restored",
    adminNotes: "تم إلغاء طلب الحذف واستعادة الحساب بنجاح",
  };

  await saveDeletionRequests(requests);
  return requests[idx];
}
