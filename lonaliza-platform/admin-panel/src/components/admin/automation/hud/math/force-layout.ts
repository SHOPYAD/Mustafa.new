import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
  Simulation,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from "d3-force";

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  name: string;
  type: "core" | "agent" | "sector" | "memory";
  color: string;
  radius: number;
  sectorId?: string;
  payload?: Record<string, unknown>;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  strength?: number;
}

export interface ForceLayoutConfig {
  chargeStrength?: number;
  linkDistance?: number;
  center?: { x: number; y: number };
  collisionRadiusMultiplier?: number;
}

/**
 * Initializes a D3 Force simulation for graph layout.
 */
export function createForceGraphSimulation(
  nodes: GraphNode[],
  links: GraphLink[],
  config: ForceLayoutConfig = {}
): Simulation<GraphNode, GraphLink> {
  const {
    chargeStrength = -350,
    linkDistance = 120,
    center = { x: 500, y: 400 },
    collisionRadiusMultiplier = 1.2,
  } = config;

  const sim = forceSimulation<GraphNode>(nodes)
    .force("charge", forceManyBody().strength(chargeStrength))
    .force(
      "link",
      forceLink<GraphNode, GraphLink>(links)
        .id((d) => d.id)
        .distance(linkDistance)
    )
    .force("center", forceCenter(center.x, center.y))
    .force(
      "collision",
      forceCollide<GraphNode>((d) => (d.radius || 15) * collisionRadiusMultiplier)
    )
    .alphaDecay(0.025);

  return sim;
}
