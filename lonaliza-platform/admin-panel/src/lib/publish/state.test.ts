import { describe, expect, it } from "vitest";
import {
  applyTransition,
  assertTransition,
  canTransition,
  isDue,
  isPublishState,
  LEGAL_TRANSITIONS,
  postApproved,
  PublishStateError,
  toDraft,
  toError,
  toPublishNow,
  toPublished,
  toQueued,
} from "./state";
import { NOT_APPROVED_AR } from "./constants";
import type { PublishPost } from "./types";

function draft(patch: Partial<PublishPost> = {}): PublishPost {
  return {
    id: "p1",
    state: "draft",
    publishDate: "2026-09-14T10:00:00.000Z",
    channelId: "c1",
    content: "مرحبا",
    delay: 0,
    group: "",
    settings: {},
    creationMethod: "web",
    ...patch,
  };
}

describe("publish state machine", () => {
  it("allows draft → queue and queue → draft", () => {
    expect(canTransition("draft", "queue")).toBe(true);
    expect(canTransition("queue", "draft")).toBe(true);
    expect(LEGAL_TRANSITIONS.draft).toContain("queue");
  });

  it("allows queue → published | error and error → draft | queue", () => {
    expect(canTransition("queue", "published")).toBe(true);
    expect(canTransition("queue", "error")).toBe(true);
    expect(canTransition("error", "draft")).toBe(true);
    expect(canTransition("error", "queue")).toBe(true);
  });

  it("treats published as terminal", () => {
    expect(canTransition("published", "draft")).toBe(false);
    expect(canTransition("published", "queue")).toBe(false);
    expect(LEGAL_TRANSITIONS.published).toEqual([]);
    expect(() => assertTransition("published", "queue")).toThrow(PublishStateError);
  });

  it("rejects draft → published (must go through queue)", () => {
    expect(canTransition("draft", "published")).toBe(false);
    expect(() => applyTransition(draft(), "published")).toThrow(/لا يمكن تغيير حالة/);
  });

  it("queues a draft and publish-now stamps now", () => {
    const queued = toQueued(draft(), "2026-09-20T08:00:00.000Z");
    expect(queued.state).toBe("queue");
    expect(queued.publishDate).toBe("2026-09-20T08:00:00.000Z");

    const at = new Date("2026-09-14T22:00:00.000Z");
    const now = toPublishNow(draft(), at);
    expect(now.state).toBe("queue");
    expect(now.publishDate).toBe(at.toISOString());
  });

  it("publish-now from error re-queues", () => {
    const failed = toError(toQueued(draft()), "فشل");
    const again = toPublishNow(failed, new Date("2026-09-14T23:00:00.000Z"));
    expect(again.state).toBe("queue");
    expect(again.error).toBeUndefined();
  });

  it("marks published with release ids and error with Arabic message", () => {
    const queued = toQueued(draft());
    const published = toPublished(queued, {
      releaseId: "123",
      releaseURL: "https://facebook.com/123",
    });
    expect(published.state).toBe("published");
    expect(published.releaseId).toBe("123");

    const errored = toError(queued, "انتهت صلاحية الرمز");
    expect(errored.state).toBe("error");
    expect(errored.error).toBe("انتهت صلاحية الرمز");
    expect(toDraft(errored).state).toBe("draft");
  });

  it("isDue only for queue posts at/before now", () => {
    const future = toQueued(draft(), "2099-01-01T00:00:00.000Z");
    const past = toQueued(draft(), "2020-01-01T00:00:00.000Z");
    const now = new Date("2026-09-14T12:00:00.000Z");
    expect(isDue(future, now)).toBe(false);
    expect(isDue(past, now)).toBe(true);
    expect(isDue(draft(), now)).toBe(false);
  });

  it("approval lives on settings.approved (strict true)", () => {
    expect(postApproved(draft())).toBe(false);
    expect(postApproved(draft({ settings: { approved: false } }))).toBe(false);
    expect(postApproved(draft({ settings: { approved: "true" } }))).toBe(false);
    expect(postApproved(draft({ settings: { approved: true } }))).toBe(true);
    expect(NOT_APPROVED_AR).toMatch(/approved=true/);
  });

  it("recognizes publish states", () => {
    expect(isPublishState("draft")).toBe(true);
    expect(isPublishState("queue")).toBe(true);
    expect(isPublishState("scheduled")).toBe(false);
  });
});
