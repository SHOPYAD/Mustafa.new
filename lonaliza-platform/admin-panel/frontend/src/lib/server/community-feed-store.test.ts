import { describe, expect, it } from "vitest";
import { shouldPurgeStoredPost } from "./community-feed-store";
import type { ParsedTravelPost } from "@/lib/nostr/types";

function post(partial: Partial<ParsedTravelPost>): ParsedTravelPost {
  return {
    id: "post_1",
    pubkey: "abc",
    created_at: 1,
    content: "",
    images: [],
    likesCount: 0,
    commentsCount: 0,
    author: { name: "x" },
    ...partial,
  };
}

describe("purge non-travel reels", () => {
  it("removes Little angel / beauty reels and keeps hotel travel videos", () => {
    expect(
      shouldPurgeStoredPost(
        post({
          id: "post_beauty",
          content: "Little angel #girl #beauty",
          isReel: true,
          videos: ["https://cdn.example/clip.mp4"],
          category: "tours",
        }),
      ),
    ).toBe(true);

    expect(
      shouldPurgeStoredPost(
        post({
          id: "post_hotel",
          content: "إقامة فندقية في اسطنبول #travel #hotel",
          isReel: true,
          videos: ["https://cdn.example/hotel.mp4"],
          category: "hotels",
          destination: "اسطنبول",
        }),
      ),
    ).toBe(false);
  });
});
