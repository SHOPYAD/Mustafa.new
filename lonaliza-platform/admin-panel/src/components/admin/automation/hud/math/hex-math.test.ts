import { describe, it, expect } from "vitest";
import {
  getHexVertices,
  verticesToSvgPath,
  isPointInPolygon,
  generateHoneycombSectors,
} from "./hex-math";

describe("Hex Math & Honeycomb Tiling Engine", () => {
  it("generates exactly 6 vertices for a hexagon", () => {
    const vertices = getHexVertices(100, 100, 50);
    expect(vertices).toHaveLength(6);
    vertices.forEach((v) => {
      expect(typeof v.x).toBe("number");
      expect(typeof v.y).toBe("number");
    });
  });

  it("converts vertices to a valid SVG path", () => {
    const vertices = getHexVertices(200, 200, 60);
    const path = verticesToSvgPath(vertices);
    expect(path.startsWith("M ")).toBe(true);
    expect(path.endsWith(" Z")).toBe(true);
  });

  it("correctly identifies whether a point is inside or outside a hexagon", () => {
    const center = { x: 300, y: 300 };
    const radius = 50;
    const vertices = getHexVertices(center.x, center.y, radius);

    // Center must be inside
    expect(isPointInPolygon(center, vertices)).toBe(true);

    // Point far away must be outside
    expect(isPointInPolygon({ x: 500, y: 500 }, vertices)).toBe(false);

    // Point near boundary but outside
    expect(isPointInPolygon({ x: 300, y: 360 }, vertices)).toBe(false);
  });

  it("generates 6 surrounding sectors plus the core cell", () => {
    const { coreCell, sectors } = generateHoneycombSectors(500, 400, 120, 90, 20);
    expect(coreCell.id).toBe("core");
    expect(sectors).toHaveLength(6);

    const sectorIds = sectors.map((s) => s.id);
    expect(sectorIds).toContain("trabzon");
    expect(sectorIds).toContain("istanbul");
    expect(sectorIds).toContain("flights");
    expect(sectorIds).toContain("b2b");
    expect(sectorIds).toContain("design");
    expect(sectorIds).toContain("security");
  });
});
