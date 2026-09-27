"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useFlightsConfig } from "@/hooks/useFlightsConfig";

export default function LiveFlightsGate({ children }: { children: ReactNode }) {
  const { config, loading } = useFlightsConfig();
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (loading) return;
    if (config.provider === "travelpayouts") {
      const qs = params.toString();
      router.replace(qs ? `/flights?${qs}` : "/flights");
    }
  }, [config.provider, loading, params, router]);

  if (loading || config.provider === "travelpayouts") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#051741] pt-24">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return children;
}
