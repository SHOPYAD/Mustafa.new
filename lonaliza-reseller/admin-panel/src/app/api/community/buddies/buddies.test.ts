import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

describe("travel companions API", () => {
  it("lists companions without dumping raw objects", async () => {
    const { GET } = await import("./route");
    const res = await GET(new NextRequest("http://localhost/api/community/buddies?city=Istanbul"));
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.matches)).toBe(true);
    expect(Array.isArray(body.buddies)).toBe(true);
    for (const row of body.matches) {
      expect(typeof row).toBe("object");
      expect(row).toHaveProperty("userId");
      expect(JSON.stringify(row).startsWith("{")).toBe(true);
    }
  });

  it("requires login to publish a companion profile", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      new NextRequest("http://localhost/api/community/buddies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ city: "Istanbul" }),
      }),
    );
    expect(res.status).toBe(401);
  });
});
