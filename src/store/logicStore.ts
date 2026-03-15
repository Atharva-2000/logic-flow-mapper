import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type { LogicStore, LogicNode, NodeColor } from '../types';
import { NODE_COLORS } from '../types';
import { detectCycles, simulateLogic, getAllDescendants } from '../utils/graph';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeNode(overrides: Partial<LogicNode> = {}): LogicNode {
  return {
    id: nanoid(8),
    condition: '',
    childIds: [],
    linkedToId: null,
    createdAt: Date.now(),
    color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
    ...overrides,
  };
}

function recomputeCycles(
  nodes: Record<string, LogicNode>
): ReturnType<typeof detectCycles> {
  return detectCycles(nodes);
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useLogicStore = create<LogicStore>()(
  immer((set, get) => ({
    nodes: {},
    rootIds: [],
    selectedNodeId: null,
    linkingFromId: null,
    simulationResult: null,
    cycleResult: { hasCycle: false, cycleNodeIds: new Set(), cyclePaths: [] },

    // ── Add a top-level root node ──────────────────────────────────────────
    addRootNode() {
      set((state) => {
        const node = makeNode();
        state.nodes[node.id] = node;
        state.rootIds.push(node.id);
        state.cycleResult = recomputeCycles(state.nodes);
        state.simulationResult = null;
      });
    },

    // ── Add a child node under a parent ───────────────────────────────────
    addChildNode(parentId) {
      set((state) => {
        const parent = state.nodes[parentId];
        if (!parent) return;
        const child = makeNode();
        state.nodes[child.id] = child;
        parent.childIds.push(child.id);
        state.cycleResult = recomputeCycles(state.nodes);
        state.simulationResult = null;
      });
    },

    // ── Update condition text ─────────────────────────────────────────────
    updateCondition(id, condition) {
      set((state) => {
        const node = state.nodes[id];
        if (node) node.condition = condition;
      });
    },

    // ── Delete a node and all its descendants ─────────────────────────────
    deleteNode(id) {
      set((state) => {
        const toDelete = new Set([id, ...getAllDescendants(id, state.nodes)]);

        // Remove from rootIds
        state.rootIds = state.rootIds.filter((rid) => !toDelete.has(rid));

        // Remove from all parent childIds & links
        for (const node of Object.values(state.nodes)) {
          if (toDelete.has(node.id)) continue;
          node.childIds = node.childIds.filter((cid) => !toDelete.has(cid));
          if (node.linkedToId && toDelete.has(node.linkedToId)) {
            node.linkedToId = null;
          }
        }

        // Remove the nodes themselves
        for (const did of toDelete) {
          delete state.nodes[did];
        }

        // Clear selection if deleted
        if (state.selectedNodeId && toDelete.has(state.selectedNodeId)) {
          state.selectedNodeId = null;
        }
        if (state.linkingFromId && toDelete.has(state.linkingFromId)) {
          state.linkingFromId = null;
        }

        state.cycleResult = recomputeCycles(state.nodes);
        state.simulationResult = null;
      });
    },

    // ── Start linking mode from a node ────────────────────────────────────
    setLinkingFrom(id) {
      set((state) => {
        state.linkingFromId = id;
      });
    },

    // ── Complete link from linkingFromId → toId ───────────────────────────
    linkNodes(toId) {
      set((state) => {
        const fromId = state.linkingFromId;
        if (!fromId || fromId === toId) {
          state.linkingFromId = null;
          return;
        }
        const node = state.nodes[fromId];
        if (node) {
          node.linkedToId = toId;
        }
        state.linkingFromId = null;
        state.cycleResult = recomputeCycles(state.nodes);
        state.simulationResult = null;
      });
    },

    // ── Remove a link from a node ─────────────────────────────────────────
    unlinkNode(id) {
      set((state) => {
        const node = state.nodes[id];
        if (node) node.linkedToId = null;
        state.cycleResult = recomputeCycles(state.nodes);
        state.simulationResult = null;
      });
    },

    // ── Select a node ─────────────────────────────────────────────────────
    selectNode(id) {
      set((state) => {
        state.selectedNodeId = id;
      });
    },

    // ── Run simulation (DFS traversal) ────────────────────────────────────
    simulateLogic() {
      const { nodes, rootIds, cycleResult } = get();
      if (cycleResult.hasCycle) return;
      const result = simulateLogic(nodes, rootIds, cycleResult.cycleNodeIds);
      set((state) => {
        state.simulationResult = result;
      });
    },

    // ── Clear simulation output ────────────────────────────────────────────
    clearSimulation() {
      set((state) => {
        state.simulationResult = null;
      });
    },

    // ── Change node color ─────────────────────────────────────────────────
    changeNodeColor(id, color: NodeColor) {
      set((state) => {
        const node = state.nodes[id];
        if (node) node.color = color;
      });
    },
  }))
);
