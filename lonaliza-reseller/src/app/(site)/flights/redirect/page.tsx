import { Suspense } from "react";
import FlightsRedirectInterstitial from "@/components/flights/FlightsRedirectInterstitial";

function RedirectFallback() {
  return (
    <div className="fixed inset-0 z-[200] flex min-h-[100dvh] items-center justify-center bg-[#051741]">
      <div
        className="h-12 w-12 rounded-full border-[3px] border-white/15 border-t-amber-400 animate-spin"
        aria-hidden
      />
    </div>
  );
}

export default function FlightsRedirectPage() {
  return (
    <Suspense fallback={<RedirectFallback />}>
      <FlightsRedirectInterstitial />
    </Suspense>
  );
}
