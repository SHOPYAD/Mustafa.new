import { getSocialCredentialsStatus } from "./env";
import { refreshMetaAccount } from "./platforms/meta";
import { refreshTikTokAccount } from "./platforms/tiktok";
import { refreshXAccount } from "./platforms/x";
import { refreshYoutubeAccount } from "./platforms/youtube";
import {
  getStoredAccount,
  listPublicAccounts,
  removeStoredAccount,
  toPublicAccount,
} from "./token-store";
import type { PublicSocialAccount, SocialCredentialsStatus } from "./types";

export async function listSocialDashboard(req?: Request): Promise<{
  accounts: PublicSocialAccount[];
  credentials: SocialCredentialsStatus[];
}> {
  const [accounts, credentials] = await Promise.all([
    listPublicAccounts(),
    getSocialCredentialsStatus(req),
  ]);
  return { accounts, credentials };
}

export async function disconnectSocialAccount(id: string): Promise<boolean> {
  return removeStoredAccount(id);
}

export async function refreshSocialAccount(
  id: string
): Promise<PublicSocialAccount> {
  const account = await getStoredAccount(id);
  if (!account) {
    throw new Error("الحساب غير موجود");
  }
  switch (account.platform) {
    case "facebook":
    case "instagram": {
      const next = await refreshMetaAccount(account);
      return toPublicAccount(next);
    }
    case "youtube": {
      const next = await refreshYoutubeAccount(account);
      return toPublicAccount(next);
    }
    case "tiktok": {
      const next = await refreshTikTokAccount(account);
      return toPublicAccount(next);
    }
    case "x": {
      const next = await refreshXAccount(account);
      return toPublicAccount(next);
    }
    default: {
      const _never: never = account.platform;
      throw new Error(`منصة غير معروفة: ${_never}`);
    }
  }
}
