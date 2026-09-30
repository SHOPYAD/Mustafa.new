"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Nexus deck gesture tuning (optical-flow proxy, not MediaPipe landmarks):
 * - Drag threshold suppresses accidental hub clicks after pointer/touch drags.
 * - Swipe velocity ε separates inertial cylinder spin from palm-open (pinch/rotate ignored).
 * - Palm needs N stable frames @ ~80ms tick ≈ 400ms before modal open.
 * - Cooldown blocks double-firing palm/fist after a swipe burst.
 */
export const NEXUS_DRAG_THRESHOLD_PX = 10;
export const NEXUS_GESTURE_COOLDOWN_MS = 1400;
export const NEXUS_PALM_STABLE_FRAMES = 6;
export const NEXUS_SWIPE_VELOCITY_EPS = 0.0025;
export const NEXUS_HAND_ROI_MIN_ROW = 22;
export const NEXUS_MOTION_DIFF_THRESHOLD = 28;
export const NEXUS_SWIPE_MOTION_MIN = 90;
export const NEXUS_SWIPE_MOTION_MAX = 340;
export const NEXUS_PALM_MOTION_MIN = 260;
export const NEXUS_PALM_MOTION_MAX = 620;
export const NEXUS_CENTROID_SMOOTH = 0.35;

export type NexusDeckGesture = "SWIPE_LEFT" | "SWIPE_RIGHT" | "PALM_OPEN" | "FIST_CLOSED" | null;

export interface NexusGestureFsmInput {
  modalOpen: boolean;
  motionPixels: number;
  centroidDeltaX: number;
  palmStableFrames: number;
  handVelocity: number;
  now: number;
  cooldownUntil: number;
}

export interface NexusGestureFsmResult {
  gesture: NexusDeckGesture;
  nextPalmStableFrames: number;
  nextCooldownUntil: number;
  openModal?: boolean;
  closeModal?: boolean;
  swipeTorque?: number;
}

/** Separates swipe scrolling from palm/fist — no open while |velocity| > ε. */
export function evaluateNexusGesture(input: NexusGestureFsmInput): NexusGestureFsmResult {
  const idle: NexusGestureFsmResult = {
    gesture: null,
    nextPalmStableFrames: input.palmStableFrames,
    nextCooldownUntil: input.cooldownUntil,
  };

  if (input.now < input.cooldownUntil) return idle;

  const swiping =
    Math.abs(input.handVelocity) > NEXUS_SWIPE_VELOCITY_EPS || Math.abs(input.centroidDeltaX) > 3;

  if (input.modalOpen) {
    if (input.motionPixels > 50 && input.motionPixels < 200) {
      return {
        gesture: "FIST_CLOSED",
        nextPalmStableFrames: 0,
        nextCooldownUntil: input.now + NEXUS_GESTURE_COOLDOWN_MS,
        closeModal: true,
      };
    }
    return idle;
  }

  if (swiping && input.motionPixels > NEXUS_SWIPE_MOTION_MIN && input.motionPixels < NEXUS_SWIPE_MOTION_MAX) {
    return {
      gesture: input.centroidDeltaX > 0 ? "SWIPE_RIGHT" : "SWIPE_LEFT",
      nextPalmStableFrames: 0,
      nextCooldownUntil: input.cooldownUntil,
      swipeTorque: input.centroidDeltaX * 0.0035,
    };
  }

  if (!swiping && input.motionPixels > NEXUS_PALM_MOTION_MIN && input.motionPixels < NEXUS_PALM_MOTION_MAX) {
    const nextFrames = input.palmStableFrames + 1;
    if (nextFrames >= NEXUS_PALM_STABLE_FRAMES) {
      return {
        gesture: "PALM_OPEN",
        nextPalmStableFrames: 0,
        nextCooldownUntil: input.now + NEXUS_GESTURE_COOLDOWN_MS,
        openModal: true,
      };
    }
    return { ...idle, nextPalmStableFrames: nextFrames };
  }

  return { ...idle, nextPalmStableFrames: 0 };
}

export function snapIndexFromRotation(rotationY: number, cardCount: number): number {
  const angleStep = (2 * Math.PI) / cardCount;
  const normalizedRot = -rotationY;
  const nearestIndex = Math.round(normalizedRot / angleStep);
  return ((nearestIndex % cardCount) + cardCount) % cardCount;
}

export function useNexusDeckController(cardCount: number) {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const activeCardIndexRef = useRef(0);
  const suppressClickRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const cylinderVelocityRef = useRef(0);
  const palmStableFramesRef = useRef(0);
  const gestureCooldownRef = useRef(0);

  const rotateTo = useCallback(
    (index: number) => {
      const nextIdx = ((index % cardCount) + cardCount) % cardCount;
      setActiveCardIndex(nextIdx);
      activeCardIndexRef.current = nextIdx;
    },
    [cardCount]
  );

  const rotateByDelta = useCallback(
    (delta: number) => {
      rotateTo(activeCardIndexRef.current + delta);
    },
    [rotateTo]
  );

  const selectIndex = rotateTo;

  const beginPointerDrag = useCallback(() => {
    dragDistanceRef.current = 0;
    suppressClickRef.current = false;
  }, []);

  const recordPointerDelta = useCallback((dx: number) => {
    dragDistanceRef.current += Math.abs(dx);
    if (dragDistanceRef.current >= NEXUS_DRAG_THRESHOLD_PX) suppressClickRef.current = true;
  }, []);

  const endPointerDrag = useCallback(() => {
    const wasDrag = suppressClickRef.current;
    dragDistanceRef.current = 0;
    return wasDrag;
  }, []);

  const shouldSuppressClick = useCallback(() => suppressClickRef.current, []);

  return {
    activeCardIndex,
    activeCardIndexRef,
    rotateTo,
    rotateByDelta,
    selectIndex,
    cylinderVelocityRef,
    palmStableFramesRef,
    gestureCooldownRef,
    beginPointerDrag,
    recordPointerDelta,
    endPointerDrag,
    shouldSuppressClick,
  };
}
