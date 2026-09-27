/**
 * Hexagonal Geometry & Tiling Mathematics for Cyber Bento Honeycomb
 * Pointy-topped hexagon coordinate systems and polygon clipping.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface HexCellConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  color: string;
  center: Point2D;
  radius: number;
  vertices: Point2D[];
  svgPath: string;
}

/**
 * Calculates the 6 vertices of a pointy-topped hexagon.
 */
export function getHexVertices(cx: number, cy: number, radius: number): Point2D[] {
  const vertices: Point2D[] = [];
  for (let k = 0; k < 6; k++) {
    const angle = (Math.PI / 3) * k + Math.PI / 6;
    vertices.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }
  return vertices;
}

/**
 * Generates an SVG path string from a set of vertices.
 */
export function verticesToSvgPath(vertices: Point2D[]): string {
  if (vertices.length === 0) return "";
  return (
    `M ${vertices[0].x.toFixed(2)} ${vertices[0].y.toFixed(2)} ` +
    vertices
      .slice(1)
      .map((v) => `L ${v.x.toFixed(2)} ${v.y.toFixed(2)}`)
      .join(" ") +
    " Z"
  );
}

/**
 * Ray-casting algorithm to test if a 2D point is inside a polygon.
 */
export function isPointInPolygon(point: Point2D, polygon: Point2D[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Generate 6 surrounding honeycomb sectors around a center point (width/2, height/2).
 */
export function generateHoneycombSectors(
  cx: number,
  cy: number,
  centerRadius: number = 130,
  sectorRadius: number = 105,
  gap: number = 24
): {
  coreCell: HexCellConfig;
  sectors: HexCellConfig[];
} {
  const coreVertices = getHexVertices(cx, cy, centerRadius);
  const coreCell: HexCellConfig = {
    id: "core",
    nameAr: "النواة السيادية",
    nameEn: "Lonaliza Master Core",
    color: "#00e5ff",
    center: { x: cx, y: cy },
    radius: centerRadius,
    vertices: coreVertices,
    svgPath: verticesToSvgPath(coreVertices),
  };

  // 6 Sectors positioned symmetrically around the core
  // Distance from center = centerRadius + sectorRadius + gap
  const dist = centerRadius + sectorRadius + gap;

  const sectorMeta = [
    {
      id: "trabzon",
      nameAr: "قطاع الشمال وطرابزون",
      nameEn: "Trabzon & Black Sea",
      color: "#10b981", // Emerald
      angleOffset: 0,
    },
    {
      id: "istanbul",
      nameAr: "قطاع إسطنبول الفاخرة",
      nameEn: "Istanbul VIP Luxury",
      color: "#f59e0b", // Amber Gold
      angleOffset: 1,
    },
    {
      id: "flights",
      nameAr: "قطاع الطيران والفنادق",
      nameEn: "Global GDS Flights",
      color: "#38bdf8", // Sky Blue
      angleOffset: 2,
    },
    {
      id: "b2b",
      nameAr: "شبكة الموزعين B2B",
      nameEn: "Reseller Wholesales",
      color: "#8b5cf6", // Royal Violet
      angleOffset: 3,
    },
    {
      id: "design",
      nameAr: "المحرر البصري والهوية",
      nameEn: "Visual Editor Experience",
      color: "#ec4899", // Neon Magenta
      angleOffset: 4,
    },
    {
      id: "security",
      nameAr: "الحوكمة والأمان المالي",
      nameEn: "Governance & Security",
      color: "#ef4444", // Ruby Red
      angleOffset: 5,
    },
  ];

  const sectors: HexCellConfig[] = sectorMeta.map((meta) => {
    // 6 angles: 30 deg, 90 deg, 150 deg, 210 deg, 270 deg, 330 deg
    const angle = (Math.PI / 3) * meta.angleOffset + Math.PI / 6;
    const sx = cx + dist * Math.cos(angle);
    const sy = cy + dist * Math.sin(angle);
    const vertices = getHexVertices(sx, sy, sectorRadius);

    return {
      id: meta.id,
      nameAr: meta.nameAr,
      nameEn: meta.nameEn,
      color: meta.color,
      center: { x: sx, y: sy },
      radius: sectorRadius,
      vertices,
      svgPath: verticesToSvgPath(vertices),
    };
  });

  return { coreCell, sectors };
}
