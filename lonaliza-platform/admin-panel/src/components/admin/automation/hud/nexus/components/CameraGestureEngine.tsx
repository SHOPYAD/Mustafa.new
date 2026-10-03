"use client";

import React, { useEffect, useRef, useState, memo } from "react";

export interface CameraGestureEngineProps {
  isActive: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onOpenCard: () => void;
  onCloseCard: () => void;
  onGestureDetected?: (gestureName: string) => void;
  onStatusChange?: (feedback: string) => void;
}

export const CameraGestureEngine = memo(function CameraGestureEngine({
  isActive,
  onSwipeLeft,
  onSwipeRight,
  onOpenCard,
  onCloseCard,
  onGestureDetected,
  onStatusChange,
}: CameraGestureEngineProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const cooldownRef = useRef<number>(0);
  const palmHoldFramesRef = useRef<number>(0);
  const cardIsOpenRef = useRef<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Store latest callbacks in ref to avoid re-triggering effects on parent re-renders
  const callbacksRef = useRef({
    onSwipeLeft,
    onSwipeRight,
    onOpenCard,
    onCloseCard,
    onGestureDetected,
    onStatusChange,
  });
  callbacksRef.current = {
    onSwipeLeft,
    onSwipeRight,
    onOpenCard,
    onCloseCard,
    onGestureDetected,
    onStatusChange,
  };

  // Initialize and tear down webcam stream
  useEffect(() => {
    if (!isActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      prevFrameRef.current = null;
      callbacksRef.current.onStatusChange?.("تتبع الكاميرا متوقف");
      return;
    }

    let isMounted = true;

    async function startCamera() {
      try {
        setErrorMsg(null);
        callbacksRef.current.onStatusChange?.("جاري تهيئة الكاميرا ومستشعر اليد...");
        if (!navigator.mediaDevices?.getUserMedia) {
          setErrorMsg("المتصفح لا يدعم الوصول للكاميرا");
          callbacksRef.current.onStatusChange?.("المتصفح لا يدعم الكاميرا");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = stream;
          video.onloadeddata = () => {
            if (isMounted) {
              callbacksRef.current.onStatusChange?.("الكاميرا نشطة · حرك يدك يميناً/يساراً للتمرير");
            }
          };
          try {
            await video.play();
          } catch (e) {
            // video play error
          }
        }
        callbacksRef.current.onStatusChange?.("الكاميرا نشطة · حرك يدك يميناً/يساراً للتمرير");
      } catch (err: any) {
        console.warn("[CameraGestureEngine] camera access error:", err);
        setErrorMsg("تعذر فتح الكاميرا");
        callbacksRef.current.onStatusChange?.("تعذر فتح الكاميرا - تحقق من إذن المتصفح");
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [isActive]);

  // Robust Optical Flow & Hand Tracking with Head-Exclusion & Coordinate Mirroring
  useEffect(() => {
    if (!isActive || errorMsg) return;

    let intervalId: NodeJS.Timeout;
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 48;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let prevCentroidX = 32;

    intervalId = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const now = Date.now();

      // Mirror horizontally so moving right moves right on screen
      ctx.save();
      ctx.translate(64, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, 64, 48);
      ctx.restore();

      const frame = ctx.getImageData(0, 0, 64, 48);
      const data = frame.data;

      if (!prevFrameRef.current) {
        prevFrameRef.current = new Uint8ClampedArray(data);
        return;
      }

      const prev = prevFrameRef.current;
      let handMotionPixels = 0;
      let sumX = 0;
      let sumY = 0;

      for (let i = 0; i < data.length; i += 4) {
        const pIdx = i / 4;
        const px = pIdx % 64;
        const py = Math.floor(pIdx / 64);

        // HEAD EXCLUSION ZONE: ignore upper-center head area (x: 20-44, y: 0-22)
        if (px >= 20 && px <= 44 && py <= 22) {
          continue;
        }

        const diff =
          (Math.abs(data[i] - prev[i]) +
            Math.abs(data[i + 1] - prev[i + 1]) +
            Math.abs(data[i + 2] - prev[i + 2])) /
          3;

        if (diff > 18) {
          handMotionPixels++;
          sumX += px;
          sumY += py;
        }
      }

      prevFrameRef.current.set(data);

      if (now < cooldownRef.current) return;

      const centroidX = handMotionPixels > 10 ? sumX / handMotionPixels : 32;
      const deltaX = centroidX - prevCentroidX;
      prevCentroidX = centroidX;

      // 1. SWIPE DETECTION (Mirrored Coordinates: moving hand right -> deltaX > 0 -> next card)
      if (handMotionPixels > 22 && Math.abs(deltaX) > 1.8) {
        if (deltaX > 1.8) {
          // Swipe Right -> Next Card
          callbacksRef.current.onSwipeRight();
          callbacksRef.current.onGestureDetected?.("👉 SWIPE RIGHT");
          callbacksRef.current.onStatusChange?.("👉 تمرير لليمين (البطاقة التالية)");
          cooldownRef.current = now + 320;
          palmHoldFramesRef.current = 0;
          return;
        } else if (deltaX < -1.8) {
          // Swipe Left -> Previous Card
          callbacksRef.current.onSwipeLeft();
          callbacksRef.current.onGestureDetected?.("👈 SWIPE LEFT");
          callbacksRef.current.onStatusChange?.("👈 تمرير لليسار (البطاقة السابقة)");
          cooldownRef.current = now + 320;
          palmHoldFramesRef.current = 0;
          return;
        }
      }

      // 2. PALM OPEN (STABLE HAND IN LOWER/MID FRAME)
      if (handMotionPixels > 55 && Math.abs(deltaX) < 1.6) {
        palmHoldFramesRef.current += 1;
        if (palmHoldFramesRef.current >= 3) {
          if (!cardIsOpenRef.current) {
            callbacksRef.current.onOpenCard();
            cardIsOpenRef.current = true;
            callbacksRef.current.onGestureDetected?.("✋ PALM OPEN");
            callbacksRef.current.onStatusChange?.("✋ كف مبسوط: فتح القسم النشط");
            cooldownRef.current = now + 800;
          }
          palmHoldFramesRef.current = 0;
          return;
        }
      } else if (cardIsOpenRef.current && handMotionPixels < 12) {
        // Fist or hand withdrawal -> close card
        callbacksRef.current.onCloseCard();
        cardIsOpenRef.current = false;
        callbacksRef.current.onGestureDetected?.("✊ FIST CLOSE");
        callbacksRef.current.onStatusChange?.("✊ إغلاق النافذة");
        cooldownRef.current = now + 500;
        palmHoldFramesRef.current = 0;
        return;
      } else if (handMotionPixels < 15) {
        palmHoldFramesRef.current = 0;
      }
    }, 75);

    return () => clearInterval(intervalId);
  }, [isActive, errorMsg]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        width: 320,
        height: 240,
        opacity: 0.001,
        pointerEvents: "none",
        zIndex: -100,
      }}
    >
      <video ref={videoRef} playsInline muted autoPlay width={320} height={240} />
    </div>
  );
});

export default CameraGestureEngine;
