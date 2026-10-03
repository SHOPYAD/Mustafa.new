"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type {
  MindClusterDef,
  MindGraphNode,
  LightningShock,
} from "./types";
import { PLATFORM_INDEX_NODES } from "@/lib/studio/index/platform-index.generated";
import { THESAURUS_CLUSTERS } from "@/lib/studio/index/domain-thesaurus";
import { STAGE_W, STAGE_H } from "@/lib/neural-studio/expansion-scene";

export interface MindGraphEngineProps {
  onSelectNode: (node: MindGraphNode) => void;
  selectedNodeId?: string | null;
  filteredDomain?: string | null;
  filteredKind?: string | null;
  highlightedNodeIds?: string[];
  shockTriggerKey?: number;
  targetShockDomain?: string | null;
  depthLevel?: number;
  pan?: { x: number; y: number };
  zoom?: number;
  panEnabled?: boolean;
  cx?: number;
  cy?: number;
  stageWidth?: number;
  stageHeight?: number;
  onSelectCluster?: (clusterId: string) => void;
}

// Stage Center Anchor (matches canonical SupervisorDisc at 824, 458)
export const STAGE_CX = 824;
export const STAGE_CY = 458;

// Domain color schemes aligned with Sovereign Atlas OS
export const DOMAIN_COLOR_MAP: Record<string, { main: string; glow: string; label: string; angleDeg: number }> = {
  flights: { main: "#00f0ff", glow: "rgba(0, 240, 255, 0.65)", label: "طيران و GDS", angleDeg: 28 },
  hotels: { main: "#ffc53d", glow: "rgba(255, 197, 61, 0.65)", label: "فنادق وإقامة", angleDeg: 58 },
  transfers: { main: "#3ff0a1", glow: "rgba(63, 240, 161, 0.65)", label: "نقل وسيارات", angleDeg: 90 },
  tours: { main: "#35e3ff", glow: "rgba(53, 227, 255, 0.65)", label: "جولات وسياحة", angleDeg: 122 },
  community: { main: "#f472b6", glow: "rgba(244, 114, 182, 0.65)", label: "مجتمع المسافرين", angleDeg: 152 },
  finance: { main: "#a78bfa", glow: "rgba(167, 139, 250, 0.65)", label: "مالية وفواتير", angleDeg: 184 },
  crm: { main: "#60a5fa", glow: "rgba(96, 165, 250, 0.65)", label: "عملاء وجوازات", angleDeg: 214 },
  b2b: { main: "#818cf8", glow: "rgba(129, 140, 248, 0.65)", label: "شركات وموزعين B2B", angleDeg: 244 },
  automation: { main: "#2dd4bf", glow: "rgba(45, 212, 191, 0.65)", label: "أتمتة ووكلاء", angleDeg: 274 },
  studio: { main: "#38bdf8", glow: "rgba(56, 189, 248, 0.65)", label: "الاستوديو السيبراني", angleDeg: 304 },
  storefront: { main: "#fb7185", glow: "rgba(251, 113, 133, 0.65)", label: "صفحات المتجر", angleDeg: 334 },
  system: { main: "#fb923c", glow: "rgba(251, 146, 60, 0.65)", label: "موردين و APIs", angleDeg: 4 },
};

export function extractNodeTitle(node: any): string {
  return node.labels?.ar || node.labels?.en || node.title || node.id;
}

export function extractNodeDomain(node: any): string {
  if (node.domain) return node.domain;
  if (node.hubId) {
    const parts = node.hubId.split(".");
    if (parts[0] === "hub" && parts[1]) return parts[1];
    if (parts[0] && parts[0] !== "hub") return parts[0];
  }
  const id = node.id || "";
  if (id.startsWith("page.site.")) {
    if (id.includes("flight")) return "flights";
    if (id.includes("hotel")) return "hotels";
    if (id.includes("transfer")) return "transfers";
    if (id.includes("tour")) return "tours";
    return "storefront";
  }
  if (id.startsWith("supplier.")) return "system";
  if (id.startsWith("api.flights")) return "flights";
  if (id.startsWith("api.hotels")) return "hotels";
  if (id.startsWith("api.transfers")) return "transfers";
  if (id.startsWith("api.b2b")) return "b2b";
  if (id.startsWith("screen.")) {
    const sId = id.replace("screen.", "");
    if (sId === "04") return "flights";
    if (sId === "05") return "hotels";
    if (sId === "06") return "transfers";
    if (sId === "09" || sId === "13") return "finance";
    if (sId === "08" || sId === "10") return "crm";
    if (sId === "14") return "b2b";
    if (sId === "11" || sId === "12" || sId === "20" || sId === "22") return "automation";
  }
  const parts = id.split(".");
  if (parts[0] === "hub" && parts[1]) return parts[1];
  if (parts[0] === "collection") {
    const col = parts[1] || "";
    if (col.includes("hotel")) return "hotels";
    if (col.includes("flight")) return "flights";
    if (col.includes("transfer")) return "transfers";
    if (col.includes("finan") || col.includes("invoice") || col.includes("payment")) return "finance";
    if (col.includes("customer") || col.includes("lead")) return "crm";
    if (col.includes("reseller") || col.includes("company")) return "b2b";
    return "system";
  }
  return parts[0] || "system";
}

export function getDomainVisuals(domain: string) {
  return DOMAIN_COLOR_MAP[domain] || { main: "#35e3ff", glow: "rgba(53, 227, 255, 0.65)", label: domain, angleDeg: 0 };
}

// Generate jagged lightning line points using recursive midpoint displacement
function generateLightningPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  displace: number,
  minSegmentLength = 10
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [{ x: x1, y: y1 }];

  function subdivide(ax: number, ay: number, bx: number, by: number, disp: number) {
    const dx = bx - ax;
    const dy = by - ay;
    const dist = Math.hypot(dx, dy);

    if (dist < minSegmentLength) {
      points.push({ x: bx, y: by });
      return;
    }

    const midX = (ax + bx) / 2 + (Math.random() - 0.5) * disp;
    const midY = (ay + by) / 2 + (Math.random() - 0.5) * disp;

    subdivide(ax, ay, midX, midY, disp * 0.55);
    subdivide(midX, midY, bx, by, disp * 0.55);
  }

  subdivide(x1, y1, x2, y2, displace);
  return points;
}

export function MindGraphEngine({
  onSelectNode,
  selectedNodeId,
  filteredDomain,
  filteredKind,
  highlightedNodeIds = [],
  shockTriggerKey,
  targetShockDomain,
  depthLevel = 1,
  pan = { x: 0, y: 0 },
  zoom = 1,
  panEnabled = false,
  cx,
  cy,
  stageWidth,
  stageHeight,
  onSelectCluster,
}: MindGraphEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const centerCX = cx ?? STAGE_CX;
  const centerCY = cy ?? STAGE_CY;
  const actualW = stageWidth ?? STAGE_W;
  const actualH = stageHeight ?? STAGE_H;
  const orbitRadius = Math.max(280, Math.min(actualW, actualH) * 0.32);

  const mouseRef = useRef({
    screenX: 0,
    screenY: 0,
    worldX: 0,
    worldY: 0,
    hoveredNode: null as MindGraphNode | null,
    hoveredCluster: null as MindClusterDef | null,
  });

  const lightningShocksRef = useRef<LightningShock[]>([]);

  // 12 Sovereign Domain Master Hubs positioned gracefully in radial orbit around (centerCX, centerCY)
  const domainHubs = useMemo(() => {
    const keys = Object.keys(DOMAIN_COLOR_MAP);
    return keys.map((key) => {
      const def = DOMAIN_COLOR_MAP[key];
      const rad = (def.angleDeg * Math.PI) / 180;
      const x = centerCX + Math.cos(rad) * orbitRadius;
      const y = centerCY + Math.sin(rad) * orbitRadius;
      return {
        id: `hub.${key}`,
        domain: key,
        label: def.label,
        color: def.main,
        glowColor: def.glow,
        x,
        y,
        radius: 20,
      };
    });
  }, [centerCX, centerCY, orbitRadius]);

  // Initialize Clusters and Nodes
  const { clusters, nodes } = useMemo(() => {
    // Thesaurus clusters anchored around their respective domain hubs
    const hubsByDomain = new Map<string, { x: number; y: number; color: string; glow: string }>();
    for (const h of domainHubs) {
      hubsByDomain.set(h.domain, { x: h.x, y: h.y, color: h.color, glow: h.glowColor });
    }

    const clustersPerDomain = new Map<string, number>();

    const clusterList: MindClusterDef[] = THESAURUS_CLUSTERS.map((tc) => {
      const hub = hubsByDomain.get(tc.domain) || { x: centerCX, y: centerCY, color: "#35e3ff", glow: "rgba(53,227,255,0.6)" };
      const count = clustersPerDomain.get(tc.domain) || 0;
      clustersPerDomain.set(tc.domain, count + 1);

      // Distribute clusters around their domain hub
      const clusterAngle = ((count * 130 + 30) * Math.PI) / 180;
      const clusterDist = 65 + (count % 3) * 22;
      const x = hub.x + Math.cos(clusterAngle) * clusterDist;
      const y = hub.y + Math.sin(clusterAngle) * clusterDist;

      return {
        id: tc.id,
        domain: tc.domain,
        nameAr: tc.primaryAr,
        nameEn: tc.primaryEn,
        color: hub.color,
        glowColor: hub.glow,
        x,
        y,
        z: 0,
        radius: 26 + Math.min(18, tc.termsCount / 14),
        nodeCount: tc.termsCount,
        nodeIds: tc.sampleTerms,
      };
    });

    const clusterByDomain = new Map<string, MindClusterDef[]>();
    for (const c of clusterList) {
      if (!clusterByDomain.has(c.domain)) clusterByDomain.set(c.domain, []);
      clusterByDomain.get(c.domain)?.push(c);
    }

    // Map all 1,208 platform nodes around their respective clusters
    const nodeList: MindGraphNode[] = PLATFORM_INDEX_NODES.map((rawNode, i) => {
      const nodeDomain = extractNodeDomain(rawNode);
      const nodeTitle = extractNodeTitle(rawNode);
      const candidates = clusterByDomain.get(nodeDomain) || clusterList;
      const cluster = candidates[i % candidates.length] || { x: STAGE_CX, y: STAGE_CY, z: 0, id: "core" };
      const visuals = getDomainVisuals(nodeDomain);

      // Local cluster dispersion using golden ratio
      const subAngle = (i * 137.5 * Math.PI) / 180;
      const subDist = 28 + Math.sqrt(i % 60) * 16;
      const x = cluster.x + Math.cos(subAngle) * subDist;
      const y = cluster.y + Math.sin(subAngle) * subDist;

      return {
        id: rawNode.id,
        clusterId: cluster.id,
        title: nodeTitle,
        kind: rawNode.kind,
        domain: nodeDomain,
        x,
        y,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        baseRadius: rawNode.kind === "screen" ? 5 : rawNode.kind === "hub" ? 4.5 : rawNode.kind === "external_supplier" ? 4 : 3,
        color: visuals.main,
        glowColor: visuals.glow,
        screenId: rawNode.screenId,
        hubId: rawNode.hubId,
        scope: rawNode.scope,
        supplierId: rawNode.supplierId,
        keywords: rawNode.keywords,
        raw: rawNode,
      };
    });

    return { clusters: clusterList, nodes: nodeList };
  }, [domainHubs]);

  // Trigger electric lightning shocks
  const spawnLightning = useCallback(
    (x1: number, y1: number, x2: number, y2: number, color = "#00f0ff", intensity = 1) => {
      const points = generateLightningPoints(x1, y1, x2, y2, 40 * intensity);
      lightningShocksRef.current.push({
        id: Math.random().toString(),
        fromX: x1,
        fromY: y1,
        toX: x2,
        toY: y2,
        color,
        intensity,
        points,
        life: 1.0,
        decay: 0.045 + Math.random() * 0.025,
      });
    },
    []
  );

  // Trigger network shocks when shockTriggerKey changes
  useEffect(() => {
    if (!domainHubs.length || !shockTriggerKey) return;
    if (targetShockDomain) {
      const hub = domainHubs.find((h) => h.domain === targetShockDomain);
      if (hub) {
        spawnLightning(centerCX, centerCY, hub.x, hub.y, hub.color, 1.8);
        clusters.filter((c) => c.domain === targetShockDomain).forEach((c) => {
          spawnLightning(hub.x, hub.y, c.x, c.y, c.color, 1.2);
        });
      }
    } else {
      // Fire radial electric lightning from central supervisor to domain hubs
      for (let i = 0; i < domainHubs.length; i++) {
        const hub = domainHubs[i];
        spawnLightning(centerCX, centerCY, hub.x, hub.y, hub.color, 1.1);
      }
    }
  }, [shockTriggerKey, targetShockDomain, domainHubs, clusters, spawnLightning, centerCX, centerCY]);

  // When highlightedNodeIds change (e.g. from search), shock to those nodes
  useEffect(() => {
    if (!highlightedNodeIds || highlightedNodeIds.length === 0) return;
    const targetNodes = nodes.filter((n) => highlightedNodeIds.includes(n.id));
    targetNodes.slice(0, 4).forEach((target) => {
      spawnLightning(centerCX, centerCY, target.x, target.y, "#38bdf8", 1.4);
    });
  }, [highlightedNodeIds, nodes, spawnLightning, centerCX, centerCY]);

  // Pointer Interaction
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = actualW / rect.width;
    const scaleY = actualH / rect.height;

    // Stage coordinates
    const sx = (e.clientX - rect.left) * scaleX;
    const sy = (e.clientY - rect.top) * scaleY;

    // Apply pan & zoom offset to get world coordinates
    const wx = (sx - centerCX - pan.x) / zoom + centerCX;
    const wy = (sy - centerCY - pan.y) / zoom + centerCY;

    mouseRef.current.screenX = sx;
    mouseRef.current.screenY = sy;
    mouseRef.current.worldX = wx;
    mouseRef.current.worldY = wy;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (panEnabled) return;
    const hovered = mouseRef.current.hoveredNode;
    if (hovered) {
      onSelectNode(hovered);
      spawnLightning(centerCX, centerCY, hovered.x, hovered.y, hovered.color, 1.2);
    }
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number;
    let time = 0;

    canvas.width = actualW;
    canvas.height = actualH;

    const render = () => {
      time += 0.018;

      // 1. Clear with deep cosmic space background
      ctx.fillStyle = "#010611";
      ctx.fillRect(0, 0, actualW, actualH);

      // Apply pan & zoom
      ctx.save();
      ctx.translate(centerCX + pan.x, centerCY + pan.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-centerCX, -centerCY);

      // 2. Cosmic Background Coordinate Grid & Radar Concentrics
      ctx.save();
      ctx.strokeStyle = "rgba(64, 214, 245, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 140;
      for (let x = -gridSize * 4; x <= actualW + gridSize * 4; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, -300);
        ctx.lineTo(x, actualH + 300);
        ctx.stroke();
      }
      for (let y = -gridSize * 4; y <= actualH + gridSize * 4; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-300, y);
        ctx.lineTo(actualW + 300, y);
        ctx.stroke();
      }

      // Orbital boundary rings centered at (centerCX, centerCY)
      for (const r of [160, 240, orbitRadius, orbitRadius * 1.35, orbitRadius * 1.75]) {
        ctx.beginPath();
        ctx.arc(centerCX, centerCY, r, 0, Math.PI * 2);
        ctx.strokeStyle = r === orbitRadius ? "rgba(64, 214, 245, 0.18)" : "rgba(64, 214, 245, 0.07)";
        ctx.lineWidth = r === orbitRadius ? 1.4 : 1;
        ctx.setLineDash(r === orbitRadius ? [6, 8] : [4, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();

      // 3. Central Supervisor Aura (under the SupervisorDisc)
      ctx.save();
      const auraPulse = Math.sin(time * 2.5) * 8;
      const auraGrad = ctx.createRadialGradient(centerCX, centerCY, 20, centerCX, centerCY, 130 + auraPulse);
      auraGrad.addColorStop(0, "rgba(64, 214, 245, 0.32)");
      auraGrad.addColorStop(0.5, "rgba(14, 165, 233, 0.14)");
      auraGrad.addColorStop(1, "rgba(1, 6, 17, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(centerCX, centerCY, 130 + auraPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Draw Synaptic Axon Conduits from Central Supervisor to 12 Domain Hubs
      for (const hub of domainHubs) {
        const isDomainMatch = !filteredDomain || hub.domain === filteredDomain;
        const alpha = isDomainMatch ? 0.38 : 0.08;

        ctx.save();
        ctx.strokeStyle = hub.glowColor.replace(/[\d.]+\)$/, `${alpha})`);
        ctx.lineWidth = isDomainMatch ? 1.8 : 0.8;
        ctx.beginPath();
        ctx.moveTo(centerCX, centerCY);

        // Subtle organic curvature
        const cpx = (centerCX + hub.x) * 0.5 + Math.sin(time + hub.x * 0.01) * 14;
        const cpy = (centerCY + hub.y) * 0.5 + Math.cos(time + hub.y * 0.01) * 14;
        ctx.quadraticCurveTo(cpx, cpy, hub.x, hub.y);
        ctx.stroke();

        // Traveling synaptic energy packets
        const packetProgress = (time * 0.75 + (hub.x % 100) / 100) % 1;
        const t1 = 1 - packetProgress;
        const px = t1 * t1 * centerCX + 2 * t1 * packetProgress * cpx + packetProgress * packetProgress * hub.x;
        const py = t1 * t1 * centerCY + 2 * t1 * packetProgress * cpy + packetProgress * packetProgress * hub.y;

        ctx.fillStyle = hub.color;
        ctx.shadowColor = hub.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, isDomainMatch ? 3.2 : 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. Draw 12 Primary Domain Hubs
      for (const hub of domainHubs) {
        const isDomainMatch = !filteredDomain || hub.domain === filteredDomain;
        const alpha = isDomainMatch ? 0.9 : 0.25;

        ctx.save();
        // Hub outer halo
        const haloGrad = ctx.createRadialGradient(hub.x, hub.y, 4, hub.x, hub.y, hub.radius * 2.2);
        haloGrad.addColorStop(0, hub.glowColor.replace(/[\d.]+\)$/, `${alpha})`));
        haloGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, hub.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Hub outer ring
        ctx.strokeStyle = hub.color;
        ctx.lineWidth = isDomainMatch ? 2.2 : 1.2;
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, hub.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Hub center core
        ctx.fillStyle = isDomainMatch ? hub.color : "#475569";
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Hub Arabic Label
        if (isDomainMatch) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 13px 'Noto Sans Arabic', Tahoma, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          // Position label slightly outward from hub center
          const angle = Math.atan2(hub.y - centerCY, hub.x - centerCX);
          const lx = hub.x + Math.cos(angle) * 36;
          const ly = hub.y + Math.sin(angle) * 36;
          ctx.fillText(hub.label, lx, ly);
        }
        ctx.restore();
      }

      // 6. Draw Thesaurus Clusters & Floating Terms (revealed at depthLevel >= 1)
      if (depthLevel >= 1) {
        for (const cluster of clusters) {
          const isDomainMatch = !filteredDomain || cluster.domain === filteredDomain;
          const alpha = isDomainMatch ? 0.8 : 0.18;

          ctx.save();
          // Connect to parent domain hub
          const parentHub = domainHubs.find((h) => h.domain === cluster.domain);
          if (parentHub) {
            ctx.strokeStyle = cluster.glowColor.replace(/[\d.]+\)$/, `${alpha * 0.45})`);
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(parentHub.x, parentHub.y);
            ctx.lineTo(cluster.x, cluster.y);
            ctx.stroke();
          }

          // Cluster halo
          const halo = ctx.createRadialGradient(cluster.x, cluster.y, 2, cluster.x, cluster.y, cluster.radius);
          halo.addColorStop(0, cluster.glowColor.replace(/[\d.]+\)$/, `${alpha * 0.75})`));
          halo.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(cluster.x, cluster.y, cluster.radius, 0, Math.PI * 2);
          ctx.fill();

          // Cluster boundary
          ctx.strokeStyle = cluster.color;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(cluster.x, cluster.y, 9, 0, Math.PI * 2);
          ctx.stroke();

          // Cluster label at depthLevel >= 2
          if (depthLevel >= 2 && isDomainMatch) {
            ctx.fillStyle = "#e2e8f0";
            ctx.font = "10px 'Noto Sans Arabic', Tahoma, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(cluster.nameAr, cluster.x, cluster.y + 18);
          }

          // Floating Tourism Terms around each cluster at Depth L1 & L2
          if (isDomainMatch && cluster.nodeIds && cluster.nodeIds.length > 0) {
            const termsToShow = cluster.nodeIds.slice(0, 2);
            termsToShow.forEach((term, ti) => {
              const tAngle = time * 0.45 + ti * Math.PI + (cluster.x % 7);
              const tDist = cluster.radius + 18;
              const tx = cluster.x + Math.cos(tAngle) * tDist;
              const ty = cluster.y + Math.sin(tAngle) * tDist;

              ctx.save();
              ctx.font = "9px 'Noto Sans Arabic', Tahoma, sans-serif";
              const tw = ctx.measureText(term).width + 8;
              ctx.fillStyle = "rgba(3, 16, 32, 0.85)";
              ctx.strokeStyle = cluster.color;
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.roundRect(tx - tw / 2, ty - 8, tw, 16, 4);
              ctx.fill();
              ctx.stroke();

              ctx.fillStyle = "#e0f2fe";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(term, tx, ty);
              ctx.restore();
            });
          }

          ctx.restore();
        }
      }

      // 7. Draw Platform Nodes (revealed at depthLevel >= 2)
      if (depthLevel >= 2) {
        const highlightedSet = new Set(highlightedNodeIds);
        const mouseW = mouseRef.current.worldX;
        const mouseH = mouseRef.current.worldY;

        let closestHoverNode: MindGraphNode | null = null;
        let closestDist = 20;

        // At L2: sample key nodes (screens/hubs). At L3: render all 1,208 nodes!
        const maxNodes = depthLevel >= 3 ? nodes.length : Math.min(300, nodes.length);

        for (let i = 0; i < maxNodes; i++) {
          const node = nodes[i];
          const isDomainMatch = !filteredDomain || node.domain === filteredDomain;
          const isKindMatch = !filteredKind || node.kind === filteredKind;
          const isHighlighted = highlightedSet.has(node.id);
          const isSelected = selectedNodeId === node.id;

          if (!isDomainMatch || !isKindMatch) {
            if (depthLevel >= 3) {
              ctx.fillStyle = "rgba(100, 116, 139, 0.12)";
              ctx.beginPath();
              ctx.arc(node.x, node.y, 1.2, 0, Math.PI * 2);
              ctx.fill();
            }
            continue;
          }

          // Distance check for interactive hover
          const dx = node.x - mouseW;
          const dy = node.y - mouseH;
          const d = Math.hypot(dx, dy);
          if (d < closestDist) {
            closestDist = d;
            closestHoverNode = node;
          }

          const isHovered = mouseRef.current.hoveredNode?.id === node.id;
          const radius = isSelected ? 8 : isHighlighted ? 6.5 : isHovered ? 5.5 : node.baseRadius;

          ctx.save();
          if (isSelected || isHighlighted || isHovered) {
            ctx.shadowColor = node.color;
            ctx.shadowBlur = 12;
          }

          ctx.fillStyle = isSelected ? "#ffffff" : isHighlighted ? "#38bdf8" : node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
          ctx.fill();

          if (isSelected) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
        }

        mouseRef.current.hoveredNode = closestHoverNode;
      }

      // 8. Draw Active Lightning Shocks
      const activeShocks = lightningShocksRef.current;
      for (let i = activeShocks.length - 1; i >= 0; i--) {
        const shock = activeShocks[i];
        shock.life -= shock.decay;

        if (shock.life <= 0) {
          activeShocks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = shock.color;
        ctx.shadowColor = shock.color;
        ctx.shadowBlur = 14 * shock.life;
        ctx.lineWidth = (1.6 + shock.intensity) * shock.life;
        ctx.globalAlpha = shock.life;

        ctx.beginPath();
        for (let p = 0; p < shock.points.length; p++) {
          const pt = shock.points[p];
          if (p === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 9. Draw Hover Tooltip if hovering a node
      const hNode = mouseRef.current.hoveredNode;
      if (hNode && !panEnabled) {
        ctx.save();
        ctx.font = "bold 12px 'Noto Sans Arabic', Tahoma, sans-serif";
        const textWidth = ctx.measureText(hNode.title).width;
        const boxW = Math.max(120, textWidth + 24);
        const boxH = 46;
        const bx = hNode.x - boxW / 2;
        const by = hNode.y - boxH - 12;

        ctx.fillStyle = "rgba(4, 18, 30, 0.92)";
        ctx.strokeStyle = "rgba(64, 214, 245, 0.75)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hNode.title, hNode.x, by + 16);

        ctx.font = "10px monospace";
        ctx.fillStyle = hNode.color;
        ctx.fillText(`${hNode.domain} · ${hNode.kind}`, hNode.x, by + 32);
        ctx.restore();
      }

      ctx.restore(); // Restore pan & zoom transform

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [clusters, depthLevel, domainHubs, filteredDomain, filteredKind, highlightedNodeIds, nodes, pan.x, pan.y, panEnabled, selectedNodeId, zoom]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: STAGE_W,
        height: STAGE_H,
        overflow: "hidden",
        cursor: panEnabled ? "grab" : "default",
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        style={{
          width: STAGE_W,
          height: STAGE_H,
          display: "block",
        }}
      />
    </div>
  );
}
