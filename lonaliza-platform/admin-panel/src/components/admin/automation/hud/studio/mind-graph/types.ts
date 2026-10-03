import type { PlatformIndexNode, PlatformNodeKind } from "@/lib/studio/index/types";

export interface MindClusterDef {
  id: string;
  domain: string;
  nameAr: string;
  nameEn: string;
  color: string;
  glowColor: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  nodeCount: number;
  nodeIds: string[];
}

export interface MindGraphNode {
  id: string;
  clusterId: string;
  title: string;
  kind: PlatformNodeKind;
  domain: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  screenId?: string;
  hubId?: string;
  scope?: string;
  supplierId?: string;
  keywords: string[];
  raw: PlatformIndexNode;
}

export interface SynapseLink {
  fromNodeId: string;
  toNodeId: string;
  strength: number;
  energy: number; // 0 to 1
  pulseProgress: number; // 0 to 1
  active: boolean;
}

export interface LightningShock {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  intensity: number;
  points: { x: number; y: number }[];
  life: number; // 1 down to 0
  decay: number;
}

export interface SupervisorMetricSnapshot {
  totalNodes: number;
  totalClusters: number;
  totalThesaurusTerms: number;
  activeSynapsesCount: number;
  systemIntegrityPct: number;
  activeDialects: string[];
  unmappedNodesCount: number;
}
