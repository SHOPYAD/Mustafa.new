import { describe, it, expect } from "vitest";
import { NEXUS_SECTOR_CARDS } from "./HolographicCylinderStage";
import { NEXUS_HUB_CARDS, NEXUS_CARD_COUNT } from "@/lib/studio/nexus/nexus-cards.generated";
import {
  evaluateNexusGesture,
  snapIndexFromRotation,
  NEXUS_DRAG_THRESHOLD_PX,
  NEXUS_PALM_STABLE_FRAMES,
} from "./useNexusDeckController";
import { IntentJudge, globalTranscriptBuffer } from "@/lib/jarvis/index";

describe("NEXUS 3D Cybernetic OS & Multi-Modal Deck Test Suite", () => {
  describe("Generated hub deck", () => {
    it("generates one card per DOMAIN_SCREENS hub", () => {
      expect(NEXUS_CARD_COUNT).toBe(92);
      expect(NEXUS_HUB_CARDS).toHaveLength(92);
      expect(NEXUS_SECTOR_CARDS).toHaveLength(92);
    });

    it("maps every card to a real hub id and screen", () => {
      const hubIds = new Set<string>();
      NEXUS_HUB_CARDS.forEach((card) => {
        expect(card.hubId).toMatch(/^[a-z0-9_.-]+$/i);
        expect(card.screenId).toMatch(/^0[3-9]$|^1[0-6]$/);
        expect(card.href.startsWith("/admin")).toBe(true);
        expect(card.quickActionCommand.length).toBeGreaterThan(10);
        expect(card.features.length).toBeGreaterThan(0);
        hubIds.add(card.hubId);
      });
      expect(hubIds.size).toBe(92);
    });
  });

  describe("useNexusDeckController FSM", () => {
    it("snaps rotation index on cylinder angle", () => {
      const count = 8;
      const step = (2 * Math.PI) / count;
      expect(snapIndexFromRotation(-2 * step, count)).toBe(2);
    });

    it("applies swipe torque without palm open while moving", () => {
      const swipe = evaluateNexusGesture({
        modalOpen: false,
        motionPixels: 120,
        centroidDeltaX: 6,
        palmStableFrames: 0,
        handVelocity: 0.01,
        now: 10_000,
        cooldownUntil: 0,
      });
      expect(swipe.gesture).toBe("SWIPE_RIGHT");
      expect(swipe.openModal).toBeUndefined();
      expect(swipe.swipeTorque).toBeGreaterThan(0);
    });

    it("requires stable palm frames (~400ms) before open", () => {
      const almost = evaluateNexusGesture({
        modalOpen: false,
        motionPixels: 320,
        centroidDeltaX: 0,
        palmStableFrames: 2,
        handVelocity: 0,
        now: 10_000,
        cooldownUntil: 0,
      });
      expect(almost.openModal).toBeUndefined();
      expect(almost.nextPalmStableFrames).toBe(3);

      const opened = evaluateNexusGesture({
        modalOpen: false,
        motionPixels: 320,
        centroidDeltaX: 0,
        palmStableFrames: NEXUS_PALM_STABLE_FRAMES - 1,
        handVelocity: 0,
        now: 10_000,
        cooldownUntil: 0,
      });
      expect(opened.gesture).toBe("PALM_OPEN");
      expect(opened.openModal).toBe(true);
    });

    it("closes modal on fist gesture", () => {
      const fist = evaluateNexusGesture({
        modalOpen: true,
        motionPixels: 120,
        centroidDeltaX: 0,
        palmStableFrames: 0,
        handVelocity: 0,
        now: 10_000,
        cooldownUntil: 0,
      });
      expect(fist.gesture).toBe("FIST_CLOSED");
      expect(fist.closeModal).toBe(true);
    });

    it("documents drag threshold for pointer capture", () => {
      expect(NEXUS_DRAG_THRESHOLD_PX).toBeGreaterThanOrEqual(8);
    });

    it("respects gesture cooldown window", () => {
      const blocked = evaluateNexusGesture({
        modalOpen: false,
        motionPixels: 120,
        centroidDeltaX: 8,
        palmStableFrames: 0,
        handVelocity: 0.01,
        now: 5000,
        cooldownUntil: 6000,
      });
      expect(blocked.gesture).toBeNull();
    });
  });

  describe("Sovereign Voice Intent & Acoustic Guard Logic", () => {
    it("correctly identifies barge-in interrupt stop words across Arabic and English", () => {
      expect(IntentJudge.isBargeIn("توقف يا جارفيس")).toBe(true);
      expect(IntentJudge.isBargeIn("stop talking")).toBe(true);
      expect(IntentJudge.isBargeIn("افتح مسرح نكسس")).toBe(false);
    });

    it("records rolling transcripts in globalTranscriptBuffer", () => {
      globalTranscriptBuffer.clear();
      globalTranscriptBuffer.push("user", "افتح محطة الفنادق", "ar");
      const items = globalTranscriptBuffer.getWindow(120);
      expect(items[0].text).toBe("افتح محطة الفنادق");
    });
  });
});
