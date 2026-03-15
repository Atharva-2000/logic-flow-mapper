import type {
  NodeMap,
  Edge,
  CycleDetectionResult,
  SimulationResult,
  SimulationStep,
} from '../types';

// ─── Build Edge List ─────────────────────────────────────────────────────────

/** Collect all edges (parent→child and link edges) from the flat node map */
export function buildEdges(nodes: NodeMap): Edge[] {
  const edges: Edge[] = [];

  for (const node of Object.values(nodes)) {
    // Parent → child edges
    for (const childId of node.childIds) {
      edges.push({ from: node.id, to: childId, isLink: false });
    }
    // Link edges
    if (node.linkedToId) {
      edges.push({ from: node.id, to: node.linkedToId, isLink: true });
    }
  }

  return edges;
}

// ─── Adjacency List ──────────────────────────────────────────────────────────

function buildAdjacency(nodes: NodeMap): Map<string, string[]> {
  const adj = new Map<string, string[]>();

  for (const id of Object.keys(nodes)) {
    adj.set(id, []);
  }

  for (const node of Object.values(nodes)) {
    const neighbors = adj.get(node.id) ?? [];
    for (const childId of node.childIds) {
      neighbors.push(childId);
    }
    if (node.linkedToId && nodes[node.linkedToId]) {
      neighbors.push(node.linkedToId);
    }
    adj.set(node.id, neighbors);
  }

  return adj;
}

// ─── DFS Cycle Detection ─────────────────────────────────────────────────────

/**
 * Detect cycles using iterative DFS with three-colour marking.
 *
 * WHITE (0) = unvisited
 * GRAY  (1) = currently in recursion stack
 * BLACK (2) = fully processed
 */
export function detectCycles(nodes: NodeMap): CycleDetectionResult {
  const adj = buildAdjacency(nodes);
  const ids = Object.keys(nodes);

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color: Record<string, number> = {};
  const parent: Record<string, string | null> = {};

  for (const id of ids) {
    color[id] = WHITE;
    parent[id] = null;
  }

  const cycleNodeIds = new Set<string>();
  const cyclePaths: string[][] = [];

  function dfs(start: string): void {
    // Iterative DFS using an explicit stack of [nodeId, neighborIndex]
    type Frame = { id: string; neighborIdx: number };
    const stack: Frame[] = [{ id: start, neighborIdx: 0 }];
    color[start] = GRAY;

    while (stack.length > 0) {
      const frame = stack[stack.length - 1];
      const { id } = frame;
      const neighbors = adj.get(id) ?? [];

      if (frame.neighborIdx < neighbors.length) {
        const neighbor = neighbors[frame.neighborIdx];
        frame.neighborIdx++;

        if (color[neighbor] === GRAY) {
          // Found a back edge → cycle detected
          const path = extractCyclePath(stack.map((f) => f.id), neighbor);
          cyclePaths.push(path);
          for (const nid of path) cycleNodeIds.add(nid);
        } else if (color[neighbor] === WHITE) {
          parent[neighbor] = id;
          color[neighbor] = GRAY;
          stack.push({ id: neighbor, neighborIdx: 0 });
        }
      } else {
        // All neighbors processed
        color[id] = BLACK;
        stack.pop();
      }
    }
  }

  for (const id of ids) {
    if (color[id] === WHITE) {
      dfs(id);
    }
  }

  return {
    hasCycle: cycleNodeIds.size > 0,
    cycleNodeIds,
    cyclePaths,
  };
}

function extractCyclePath(stackIds: string[], cycleStart: string): string[] {
  const idx = stackIds.lastIndexOf(cycleStart);
  if (idx === -1) return [cycleStart];
  const cycle = stackIds.slice(idx);
  cycle.push(cycleStart); // close the cycle
  return cycle;
}

// ─── Simulation (DFS traversal without cycles) ──────────────────────────────

export function simulateLogic(
  nodes: NodeMap,
  rootIds: string[],
  cycleNodeIds: Set<string>
): SimulationResult {
  const steps: SimulationStep[] = [];
  const visited = new Set<string>();

  function traverse(id: string, depth: number): void {
    if (visited.has(id)) return;
    visited.add(id);

    const node = nodes[id];
    if (!node) return;

    steps.push({ nodeId: id, condition: node.condition || '(empty)', depth });

    // Traverse children
    for (const childId of node.childIds) {
      if (!cycleNodeIds.has(childId)) {
        traverse(childId, depth + 1);
      }
    }

    // Traverse links (but not if they cause cycles)
    if (node.linkedToId && !cycleNodeIds.has(node.linkedToId)) {
      traverse(node.linkedToId, depth + 1);
    }
  }

  for (const rootId of rootIds) {
    traverse(rootId, 0);
  }

  return {
    steps,
    terminatedAt: steps[steps.length - 1]?.nodeId ?? null,
    success: true,
  };
}

// ─── Get All Descendant IDs (for delete cascade) ─────────────────────────────

export function getAllDescendants(nodeId: string, nodes: NodeMap): Set<string> {
  const result = new Set<string>();
  const queue = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const node = nodes[current];
    if (!node) continue;

    for (const childId of node.childIds) {
      if (!result.has(childId)) {
        result.add(childId);
        queue.push(childId);
      }
    }
  }

  return result;
}

// ─── Collect all node IDs reachable from roots ───────────────────────────────

export function getReachableIds(rootIds: string[], nodes: NodeMap): Set<string> {
  const visited = new Set<string>();
  const queue = [...rootIds];

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const node = nodes[id];
    if (!node) continue;
    for (const childId of node.childIds) queue.push(childId);
    if (node.linkedToId) queue.push(node.linkedToId);
  }

  return visited;
}
