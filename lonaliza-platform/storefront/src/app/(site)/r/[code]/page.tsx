import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AFFILIATE_REF_COOKIE } from "@/lib/affiliate/types";
import {
  findAffiliateByCode,
  getAffiliateSettings,
  isValidRefCode,
  normalizeRefCode,
} from "@/lib/affiliate/server";

export const runtime = "nodejs";

export default async function ReferralRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { code: raw } = await params;
  const query = await searchParams;
  const code = normalizeRefCode(raw || "");
  const nextPath =
    query.next && query.next.startsWith("/") && !query.next.startsWith("//")
      ? query.next
      : "/";

  if (isValidRefCode(code)) {
    const profile = await findAffiliateByCode(code);
    if (profile && profile.status === "active") {
      const settings = await getAffiliateSettings();
      const store = await cookies();
      store.set(AFFILIATE_REF_COOKIE, code, {
        path: "/",
        maxAge: settings.cookie_days * 24 * 60 * 60,
        sameSite: "lax",
      });
    }
  }

  redirect(nextPath);
}
