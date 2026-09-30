/**
 * Lonaliza Cybernetic Graph Layout Engine
 * Supports: Radial (Concentric), DAG (Layered Hierarchy), Hexagonal Clusters, and Avatar Wireframe Layouts
 */

export function computeRadialLayout(nodes, center = { x: 836, y: 468 }, radius = 280) {
  const n = nodes.length;
  return nodes.map((node, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return {
      ...node,
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * (radius * 0.92)
    };
  });
}

export function computeDagLayout(nodes, startX = 320, startY = 240, colGap = 210, rowGap = 200) {
  return nodes.map((node, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    return {
      ...node,
      x: startX + col * colGap,
      y: startY + row * rowGap
    };
  });
}

export function computeHexagonalLayout(nodes, center = { x: 836, y: 468 }, hexRadius = 310) {
  const n = Math.min(6, nodes.length);
  const coreNodes = nodes.slice(0, n).map((node, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return {
      ...node,
      shape: "hexagon",
      x: center.x + Math.cos(angle) * hexRadius,
      y: center.y + Math.sin(angle) * (hexRadius * 0.88)
    };
  });

  const satellites = nodes.slice(n).map((node, i) => {
    const satAngle = -Math.PI / 4 + (i * Math.PI) / 2;
    return {
      ...node,
      shape: "satellite-hex",
      x: center.x + Math.cos(satAngle) * (hexRadius * 1.55),
      y: center.y + Math.sin(satAngle) * (hexRadius * 1.35)
    };
  });

  return [...coreNodes, ...satellites];
}

export function computeAvatarLayout(nodes, center = { x: 836, y: 468 }) {
  // Symmetrical branches along the humanoid torso and head
  return nodes.map((node, i) => {
    const isRight = i % 2 === 0;
    const level = Math.floor(i / 2);
    const x = isRight ? center.x + 320 + (level % 2) * 40 : center.x - 320 - (level % 2) * 40;
    const y = 160 + level * 140;
    return {
      ...node,
      side: isRight ? "right" : "left",
      x,
      y
    };
  });
}

export function computeCumulativeExpansion(parentNode, children, depth = 2) {
  const spread = 0.8;
  const count = children.length;
  const dist = 180 + depth * 20;

  return children.map((child, j) => {
    const baseAngle = Math.atan2(parentNode.y - 468, parentNode.x - 836);
    const angle = baseAngle - spread / 2 + (j / Math.max(1, count - 1)) * spread;
    return {
      ...child,
      level: depth,
      parent: parentNode.id,
      x: parentNode.x + Math.cos(angle) * dist,
      y: parentNode.y + Math.sin(angle) * dist
    };
  });
}
