"use client";

import { useState } from "react";
import { plannerCopy } from "@/lib/planner/copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePlanner } from "./PlannerStore";
import AddPlaceSheet from "./AddPlaceSheet";
import ChatTripBoard from "./ChatTripBoard";
import IdeasPane from "./IdeasPane";
import ItineraryPane from "./ItineraryPane";
import PlannerMapHost from "./PlannerMapHost";
import ResizableSplit from "./ResizableSplit";
import { cn } from "@/lib/utils";

export default function TripCanvas({
  variant,
}: {
  variant: "chat" | "planner";
}) {
  const { locale } = useLocale();
  const c = plannerCopy(locale);
  const { trip, centerTab, setCenterTab } = usePlanner();
  const [placeOpen, setPlaceOpen] = useState(false);

  if (variant === "chat") {
    return <ChatTripBoard />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#FBF9FF]">
      {trip ? (
        <div className="flex min-h-0 flex-1">
          <ResizableSplit
            storageKey="lonaliza-trip-split-v3"
            defaultPct={54}
            minPct={35}
            maxPct={72}
            start={
              <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
                <div className="flex shrink-0 gap-2 border-b border-[#E4DFF3] px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setCenterTab("itinerary")}
                    className={cn(
                      "inline-flex h-11 flex-1 items-center justify-center rounded-xl text-[14px] font-bold",
                      centerTab === "itinerary" ? "bg-[#2E1065] text-white" : "bg-white text-slate-800"
                    )}
                  >
                    {c.daysTitle}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCenterTab("ideas")}
                    className={cn(
                      "inline-flex h-11 flex-1 items-center justify-center rounded-xl text-[14px] font-bold",
                      centerTab === "ideas" ? "bg-[#2E1065] text-white" : "bg-white text-slate-800"
                    )}
                  >
                    {c.ideas}
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden">
                  {centerTab === "ideas" ? <IdeasPane /> : <ItineraryPane onAddPlace={() => setPlaceOpen(true)} />}
                </div>
                <AddPlaceSheet open={placeOpen} onClose={() => setPlaceOpen(false)} />
              </div>
            }
            end={
              <div className="relative h-full min-h-0 overflow-hidden">
                <PlannerMapHost />
              </div>
            }
          />
        </div>
      ) : null}
    </div>
  );
}
