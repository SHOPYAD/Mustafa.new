import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

describe("mobile community and extras wrappers", () => {
  it("exposes a public community feed", async () => {
    const { GET } = await import("./feed/route");
    const res = await GET(new NextRequest("http://localhost/api/mobile/v1/community/feed?limit=5"));
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.posts)).toBe(true);
  });

  it("requires fromPlaceId and toPlaceId for transfers", async () => {
    const { GET } = await import("../catalog/transfers/route");
    const res = await GET(new NextRequest("http://localhost/api/mobile/v1/catalog/transfers?from=istanbul-airport"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("fromPlaceId");
  });
});
