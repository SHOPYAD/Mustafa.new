import { describe, expect, it } from "vitest";
import {
  canonicalMediaKey,
  evaluateTravelContent,
  eventToTravelInput,
  isTravelEligibleContent,
  isVerifiedSyndicationPubkey,
  isWithinDuplicateWindow,
  matchIdempotentPost,
} from "./travel-content-filter";

describe("travel-only ingest", () => {
  it("rejects Little angel / beauty / girl / dance reels", () => {
    expect(
      isTravelEligibleContent({
        title: "Little angel",
        content: "reels #girl #beauty #beautiful#",
        source: "relay",
      }),
    ).toBe(false);
    expect(
      evaluateTravelContent({
        content: "dancing on the beach #dance #model",
        tags: ["reels"],
        source: "local",
      }).reason,
    ).toBe("reject_tag");
    expect(
      isTravelEligibleContent({
        content: "nsfw clip",
        tags: ["travel"],
        source: "local",
      }),
    ).toBe(false);
  });

  it("does not treat #reels or the word view as travel", () => {
    expect(
      isTravelEligibleContent({
        content: "preview this view",
        tags: ["reels", "vlog"],
        source: "relay",
      }),
    ).toBe(false);
  });

  it("allows travel-tagged hotel and flight posts", () => {
    expect(
      isTravelEligibleContent({
        content: "إقامة فندقية في اسطنبول #travel #hotel",
        tags: ["lonaliza_travel", "tourism"],
        category: "hotels",
        destination: "اسطنبول",
        source: "local",
      }),
    ).toBe(true);
    expect(
      isTravelEligibleContent({
        content: "flight to istanbul with lonaliza",
        tags: ["flight"],
        source: "relay",
      }),
    ).toBe(true);
  });

  it("requires a real travel signal for public relay events", () => {
    const ev = eventToTravelInput({
      content: "hello world",
      tags: [
        ["t", "reels"],
        ["d", "random"],
        ["c", "whatever"],
      ],
      pubkey: "abc",
    });
    expect(isTravelEligibleContent(ev)).toBe(false);
  });
});

describe("syndication whitelist", () => {
  it("accepts only listed pubkeys", () => {
    expect(isVerifiedSyndicationPubkey("aa", ["AA", "bb"])).toBe(true);
    expect(isVerifiedSyndicationPubkey("zz", ["aa"])).toBe(false);
    expect(isVerifiedSyndicationPubkey("aa", [])).toBe(false);
  });
});

describe("idempotency window", () => {
  it("matches uuid or media hash within 60s", () => {
    const now = 1_700_000_060;
    const posts = [
      { uploadUuid: "u1", mediaHash: "abc", created_at: 1_700_000_010 },
      { uploadUuid: "u2", mediaHash: "def", created_at: 1_699_999_000 },
    ];
    expect(matchIdempotentPost(posts, { uploadUuid: "u1", nowSec: now })?.uploadUuid).toBe("u1");
    expect(matchIdempotentPost(posts, { mediaHash: "ABC", nowSec: now })?.mediaHash).toBe("abc");
    expect(matchIdempotentPost(posts, { uploadUuid: "u2", nowSec: now })).toBeUndefined();
    expect(isWithinDuplicateWindow(now - 60, now)).toBe(true);
    expect(isWithinDuplicateWindow(now - 61, now)).toBe(false);
  });
});

describe("canonical media key", () => {
  it("collapses blossom hashes across hosts", () => {
    const hash = "40860043d2f16f332379773c950b640ed7be9ec9e9a698d70a362395e4efae3d";
    expect(canonicalMediaKey(`https://blossom.primal.net/${hash}.mp4?x=1`)).toBe(hash);
    expect(canonicalMediaKey(`https://nostr.build/${hash}.mp4`)).toBe(hash);
  });
});
