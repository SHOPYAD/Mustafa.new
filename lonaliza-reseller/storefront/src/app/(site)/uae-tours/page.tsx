"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyDailyToursRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vip-tours");
  }, [router]);

  return (
    <section className="min-h-screen bg-slate-50 pt-28 flex items-center justify-center">
      <p className="text-slate-500">…</p>
    </section>
  );
}
