import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { LoyaltyLedgerEntry, LoyaltyWallet } from "@/lib/loyalty/types";

type WalletRecord = {
  id: string;
  user_id: string;
  points?: number;
  pending_points?: number;
  vouchers?: LoyaltyWallet["vouchers"];
  ledger?: LoyaltyLedgerEntry[];
};

function recordToWallet(row: WalletRecord): LoyaltyWallet {
  return {
    userId: row.user_id,
    points: Math.max(0, Number(row.points) || 0),
    pendingPoints: Math.max(0, Number(row.pending_points) || 0),
    vouchers: Array.isArray(row.vouchers) ? row.vouchers : [],
    ledger: Array.isArray(row.ledger) ? row.ledger : [],
  };
}

export async function loadWalletsFromPocketBase(): Promise<LoyaltyWallet[] | null> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return null;
  try {
    const rows = await pb.collection("loyalty_wallets").getFullList<WalletRecord>({
      sort: "-updated",
    });
    return rows.map(recordToWallet);
  } catch {
    return null;
  }
}

export async function saveWalletsToPocketBase(wallets: LoyaltyWallet[]): Promise<boolean> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return false;
  try {
    for (const wallet of wallets) {
      if (!wallet.userId) continue;
      const payload = {
        user_id: wallet.userId,
        points: wallet.points,
        pending_points: wallet.pendingPoints,
        vouchers: wallet.vouchers,
        ledger: wallet.ledger,
      };
      const existing = await pb
        .collection("loyalty_wallets")
        .getFirstListItem<WalletRecord>(`user_id = "${wallet.userId.replace(/"/g, "")}"`)
        .catch(() => null);
      if (existing) {
        await pb.collection("loyalty_wallets").update(existing.id, payload);
      } else {
        await pb.collection("loyalty_wallets").create(payload);
      }
    }
    return true;
  } catch {
    return false;
  }
}
