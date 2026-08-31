"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Facebook,
  Instagram,
  Link2,
  Loader2,
  Music2,
  RefreshCw,
  Share2,
  Unplug,
  Youtube,
} from "lucide-react";
import {
  AdminPage,
  AdminPageHeader,
} from "@/components/admin/layout";
import type {
  PublicSocialAccount,
  SocialCredentialsStatus,
} from "@/lib/social/types";
import { SOCIAL_COPY } from "./copy";

type DashboardResponse = {
  ok: boolean;
  accounts?: PublicSocialAccount[];
  credentials?: SocialCredentialsStatus[];
  error?: string;
};

const statusClass: Record<PublicSocialAccount["status"], string> = {
  connected: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  disconnected: "bg-white/5 text-white/50 border-white/10",
  needs_reauth: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

function PlatformIcon({ platform }: { platform: PublicSocialAccount["platform"] }) {
  switch (platform) {
    case "facebook":
      return <Facebook className="size-4" />;
    case "instagram":
      return <Instagram className="size-4" />;
    case "youtube":
      return <Youtube className="size-4" />;
    case "tiktok":
      return <Music2 className="size-4" />;
    case "x":
      return <Share2 className="size-4" />;
    default: {
      const _never: never = platform;
      return <Share2 className="size-4" aria-label={String(_never)} />;
    }
  }
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function SocialAccountsPanel() {
  const search = useSearchParams();
  const [accounts, setAccounts] = useState<PublicSocialAccount[]>([]);
  const [credentials, setCredentials] = useState<SocialCredentialsStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>("");
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/social/accounts", { cache: "no-store" });
      const data = (await res.json()) as DashboardResponse;
      if (!data.ok) {
        setError(data.error || "تعذر تحميل الحسابات");
        return;
      }
      setAccounts(data.accounts || []);
      setCredentials(data.credentials || []);
      setError("");
    } catch {
      setError("تعذر تحميل الحسابات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const err = search.get("error");
    const connected = search.get("connected");
    const detail = search.get("detail");
    if (err) {
      setError(
        [SOCIAL_COPY.errors[err] || err, detail].filter(Boolean).join(" — ")
      );
    }
    if (connected) {
      setNotice(SOCIAL_COPY.connected[connected] || `تم الربط: ${connected}`);
    }
  }, [search]);

  const banner = useMemo(() => notice || error, [notice, error]);

  async function disconnect(id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/social/accounts/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: id }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error || "فشل قطع الاتصال");
        return;
      }
      setNotice("تم قطع الاتصال");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function refresh(id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/social/accounts/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: id }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error || "فشل تحديث الرمز");
        return;
      }
      setNotice("تم تحديث الرمز");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title={SOCIAL_COPY.title}
        description={SOCIAL_COPY.description}
        icon={<Share2 className="size-5" />}
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            <RefreshCw className="size-4" />
            تحديث القائمة
          </button>
        }
      />

      {banner ? (
        <div
          className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {banner}
        </div>
      ) : null}

      <p className="mb-6 text-sm text-white/50">{SOCIAL_COPY.approvalHint}</p>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {credentials.map((cred) => (
          <section
            key={cred.provider}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-white">
                {cred.provider === "meta"
                  ? "ميتا"
                  : cred.provider === "youtube"
                    ? "يوتيوب"
                    : "تيك توك"}
              </h2>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs ${
                  cred.configured
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                }`}
              >
                {cred.configured ? SOCIAL_COPY.configured : SOCIAL_COPY.notConfigured}
              </span>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-white/50">{cred.noteAr}</p>
            {!cred.configured && cred.missing.length > 0 ? (
              <p className="mb-3 text-xs text-amber-300/90">
                {SOCIAL_COPY.missingEnv}: {cred.missing.join(" · ")}
              </p>
            ) : null}
            <p className="mb-3 break-all text-[11px] text-white/35">
              {SOCIAL_COPY.redirectUri}: {cred.redirectUri}
            </p>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {cred.scopes.map((scope) => (
                <span
                  key={scope}
                  className="rounded-md border border-white/10 bg-black/20 px-1.5 py-0.5 text-[10px] text-white/55"
                >
                  {scope}
                </span>
              ))}
            </div>
            {cred.provider === "meta" ? (
              <a
                href="/api/oauth/meta"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
              >
                <Link2 className="size-4" />
                {SOCIAL_COPY.connectMeta}
              </a>
            ) : null}
            {cred.provider === "youtube" ? (
              <a
                href="/api/oauth/youtube"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-red-500"
              >
                <Youtube className="size-4" />
                {SOCIAL_COPY.connectYoutube}
              </a>
            ) : null}
            {cred.provider === "tiktok" ? (
              cred.configured ? (
                <a
                  href="/api/oauth/tiktok"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-black hover:bg-white/90"
                >
                  <Music2 className="size-4" />
                  {SOCIAL_COPY.connectTiktok}
                </a>
              ) : (
                <span className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 px-3 py-2.5 text-sm text-white/40">
                  {SOCIAL_COPY.errors.tiktok_app_required}
                </span>
              )
            ) : null}
            {cred.provider === "x" ? (
              cred.configured ? (
                <a
                  href="/api/oauth/x"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-sky-500"
                >
                  <Share2 className="size-4" />
                  {SOCIAL_COPY.connectX}
                </a>
              ) : (
                <span className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 px-3 py-2.5 text-sm text-white/40">
                  أنشئوا تطبيقاً في developer.x.com ثم الصقوا X_CLIENT_ID و X_CLIENT_SECRET
                </span>
              )
            ) : null}
          </section>
        ))}
      </div>

      <p className="mb-4 text-xs text-white/40">{SOCIAL_COPY.envHint}</p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Loader2 className="size-4 animate-spin" />
          {SOCIAL_COPY.loading}
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-5 py-10 text-center text-sm text-white/45">
          {SOCIAL_COPY.empty}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {accounts.map((account) => {
            const busy = busyId === account.id;
            return (
              <li
                key={account.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white">
                      <PlatformIcon platform={account.platform} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {account.displayName}
                      </p>
                      <p className="truncate text-xs text-white/45">
                        {account.username ? `@${account.username}` : account.externalId}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs ${statusClass[account.status]}`}
                  >
                    {account.statusLabel}
                  </span>
                </div>

                <dl className="mb-3 grid grid-cols-2 gap-2 text-[11px] text-white/45">
                  <div>
                    <dt>{SOCIAL_COPY.connectedAt}</dt>
                    <dd className="text-white/70">{formatDate(account.connectedAt)}</dd>
                  </div>
                  <div>
                    <dt>{SOCIAL_COPY.lastRefresh}</dt>
                    <dd className="text-white/70">
                      {formatDate(account.lastRefreshedAt)}
                    </dd>
                  </div>
                  <div>
                    <dt>{SOCIAL_COPY.expires}</dt>
                    <dd className="text-white/70">{formatDate(account.tokenExpiresAt)}</dd>
                  </div>
                  <div>
                    <dt>ID</dt>
                    <dd className="truncate text-white/70">{account.externalId}</dd>
                  </div>
                </dl>

                {account.lastError ? (
                  <p className="mb-3 text-xs text-amber-300">{account.lastError}</p>
                ) : null}

                <div className="mb-4">
                  <p className="mb-1.5 text-[11px] uppercase tracking-wider text-white/35">
                    {SOCIAL_COPY.scopes}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {account.scopes.length === 0 ? (
                      <span className="text-xs text-white/35">—</span>
                    ) : (
                      account.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="rounded-md border border-white/10 bg-black/20 px-1.5 py-0.5 text-[10px] text-white/60"
                        >
                          {scope}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void refresh(account.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4 text-emerald-400" />
                    )}
                    {busy ? SOCIAL_COPY.refreshing : SOCIAL_COPY.refresh}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void disconnect(account.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/20 disabled:opacity-50"
                  >
                    <Unplug className="size-4" />
                    {busy ? SOCIAL_COPY.disconnecting : SOCIAL_COPY.disconnect}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminPage>
  );
}
