// ─── Node & Graph Types ──────────────────────────────────────────────────────

/** A single logic node in the tree */
export interface LogicNode {
  id: string;
  condition: string;
  /** IDs of direct children (branching children, not link targets) */
  childIds: string[];
  /** If set, this node "links" to an existing node (creates an edge, potentially a cycle) */
  linkedToId: string | null;
  /** Metadata */
  createdAt: number;
  color: NodeColor;
}

export type NodeColor = 'cyan' | 'violet' | 'green' | 'amber';

export const NODE_COLORS: NodeColor[] = ['cyan', 'violet', 'green', 'amber'];

/** Normalised flat map of all nodes — keyed by id */
export type NodeMap = Record<string, LogicNode>;

/** An edge between two nodes (for cycle detection) */
export interface Edge {
  from: string;
  to: string;
  isLink: boolean; // true = manually linked, false = parent→child
}

// ─── Graph Analysis ──────────────────────────────────────────────────────────

export interface CycleDetectionResult {
  hasCycle: boolean;
  /** All node IDs that are part of a cycle */
  cycleNodeIds: Set<string>;
  /** Ordered cycle path e.g. ["A","B","C","A"] */
  cyclePaths: string[][];
}

// ─── Store Types ─────────────────────────────────────────────────────────────

export interface LogicStore {
  nodes: NodeMap;
  rootIds: string[];
  selectedNodeId: string | null;
  linkingFromId: string | null;
  simulationResult: SimulationResult | null;
  cycleResult: CycleDetectionResult;

  // Actions
  addRootNode: () => void;
  addChildNode: (parentId: string) => void;
  updateCondition: (id: string, condition: string) => void;
  deleteNode: (id: string) => void;
  setLinkingFrom: (id: string | null) => void;
  linkNodes: (toId: string) => void;
  unlinkNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  simulateLogic: () => void;
  clearSimulation: () => void;
  changeNodeColor: (id: string, color: NodeColor) => void;
}

// ─── Simulation ──────────────────────────────────────────────────────────────

export interface SimulationStep {
  nodeId: string;
  condition: string;
  depth: number;
}

export interface SimulationResult {
  steps: SimulationStep[];
  terminatedAt: string | null;
  success: boolean;
}
