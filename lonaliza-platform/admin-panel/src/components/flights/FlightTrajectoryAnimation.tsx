"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type Props = {
  stopCount: number;
  isRtl?: boolean;
  className?: string;
};

export default function FlightTrajectoryAnimation({ stopCount, isRtl = false, className }: Props) {
  const animId = useId().replace(/:/g, "_");

  const isDirect = stopCount === 0;

  // In RTL, Origin is at 100% (right) and Destination is at 0% (left)
  // In LTR, Origin is at 0% (left) and Destination is at 100% (right)

  return (
    <div className={cn("relative my-2.5 h-6 w-full flex items-center justify-center select-none overflow-visible", className)}>
      <style>{`
        @keyframes directFlight_ltr_${animId} {
          0% {
            left: 2%;
            opacity: 0;
            transform: translateY(-50%) scale(0.7);
          }
          15% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          85% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          100% {
            left: 96%;
            opacity: 0;
            transform: translateY(-50%) scale(0.7);
          }
        }

        @keyframes directFlight_rtl_${animId} {
          0% {
            right: 2%;
            opacity: 0;
            transform: translateY(-50%) scale(0.7);
          }
          15% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          85% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          100% {
            right: 96%;
            opacity: 0;
            transform: translateY(-50%) scale(0.7);
          }
        }

        @keyframes stopLeg1_ltr_${animId} {
          0% {
            left: 2%;
            opacity: 0;
            transform: translateY(-50%) scale(0.7);
          }
          10% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          45% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          52% {
            left: 48%;
            opacity: 0;
            transform: translateY(-50%) scale(0.6);
          }
          100% {
            left: 48%;
            opacity: 0;
          }
        }

        @keyframes stopLeg2_ltr_${animId} {
          0%, 50% {
            left: 52%;
            opacity: 0;
            transform: translateY(-50%) scale(0.6);
          }
          58% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          92% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          100% {
            left: 96%;
            opacity: 0;
            transform: translateY(-50%) scale(0.7);
          }
        }

        @keyframes stopLeg1_rtl_${animId} {
          0% {
            right: 2%;
            opacity: 0;
            transform: translateY(-50%) scale(0.7);
          }
          10% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          45% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          52% {
            right: 48%;
            opacity: 0;
            transform: translateY(-50%) scale(0.6);
          }
          100% {
            right: 48%;
            opacity: 0;
          }
        }

        @keyframes stopLeg2_rtl_${animId} {
          0%, 50% {
            right: 52%;
            opacity: 0;
            transform: translateY(-50%) scale(0.6);
          }
          58% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          92% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          100% {
            right: 96%;
            opacity: 0;
            transform: translateY(-50%) scale(0.7);
          }
        }
      `}</style>

      {/* Flight trajectory background line */}
      <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[2px]">
        {/* Track Line */}
        <div className="h-full w-full bg-gradient-to-r from-purple-900/15 via-amber-500/40 to-purple-900/15 border-b border-dashed border-purple-400/40" />
      </div>

      {/* Origin endpoint dot */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-purple-700 ring-2 ring-purple-200 z-10",
          isRtl ? "right-1" : "left-1"
        )}
      />

      {/* Destination endpoint dot */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-amber-200 z-10",
          isRtl ? "left-1" : "right-1"
        )}
      />

      {/* Layover stopover dot (if has stops) */}
      {!isDirect && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-600 ring-4 ring-amber-400/30 animate-pulse" />
        </div>
      )}

      {/* Gliding Airplanes */}
      {isDirect ? (
        /* Direct flight: Single plane gliding smoothly from start to end */
        <div
          className="absolute top-1/2 z-20 pointer-events-none drop-shadow-sm text-amber-600"
          style={{
            animation: `${isRtl ? `directFlight_rtl_${animId}` : `directFlight_ltr_${animId}`} 3s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={cn("w-4 h-4 transition-transform", isRtl ? "-rotate-90" : "rotate-90")}
          >
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
      ) : (
        /* 1+ Stops flight: Plane 1 flies from origin to stop, fades out; Plane 2 flies from stop to destination, fades out */
        <>
          <div
            className="absolute top-1/2 z-20 pointer-events-none drop-shadow-sm text-purple-700"
            style={{
              animation: `${isRtl ? `stopLeg1_rtl_${animId}` : `stopLeg1_ltr_${animId}`} 3.4s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={cn("w-4 h-4 transition-transform", isRtl ? "-rotate-90" : "rotate-90")}
            >
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>

          <div
            className="absolute top-1/2 z-20 pointer-events-none drop-shadow-sm text-amber-600"
            style={{
              animation: `${isRtl ? `stopLeg2_rtl_${animId}` : `stopLeg2_ltr_${animId}`} 3.4s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={cn("w-4 h-4 transition-transform", isRtl ? "-rotate-90" : "rotate-90")}
            >
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}
