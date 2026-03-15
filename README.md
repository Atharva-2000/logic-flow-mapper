# Logic Flow Mapper

A real-time Logic Flow Mapper built with React + Vite + TypeScript + Tailwind CSS. Users can create nested "If-Then" condition trees, link nodes arbitrarily to form graphs, and instantly detect logic loops (cycles) using a Depth-First Search algorithm.

![Logic Flow Mapper](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss) ![Zustand](https://img.shields.io/badge/Zustand-4-orange) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)

---

## Features

- **Recursive Node Building** — Infinitely nestable If-Then condition nodes
- **Cross-Node Linking** — Link any node to any other node to create graph edges
- **Real-Time Cycle Detection** — DFS-based loop detection triggers on every state change
- **Visual Cycle Flagging** — Offending nodes glow red, cycle paths displayed with arrows
- **Simulation Disabled on Cycle** — "Simulate Logic" button is locked until all loops are resolved
- **DFS Logic Simulation** — Traverses the full graph in DFS order, showing each step
- **Node Management** — Add, delete (with cascade), recolor, select nodes
- **Graph Stats Panel** — Live count of nodes, edges, links, max depth, and cycles

---

## Tech Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | React 18 + Vite | Fast HMR, modern JSX transform |
| Language | TypeScript (strict) | Full type safety for graph data structures |
| State Management | Zustand + Immer | Simple, performant, supports deep immutable updates |
| Styling | Tailwind CSS v3 | Utility-first, zero runtime CSS |
| ID Generation | nanoid | Collision-free short IDs |

---

## Data Structure Decision: Normalised (Flat Map)

### Why Normalised over Nested?

The node tree is stored as a **flat `Record<string, LogicNode>` map** (normalised), not as a recursive nested object tree.

```ts
// NORMALISED (chosen approach)
type NodeMap = Record<string, LogicNode>;

interface LogicNode {
  id: string;
  condition: string;
  childIds: string[];      // references by ID
  linkedToId: string | null; // arbitrary link by ID
  color: NodeColor;
  createdAt: number;
}

// NESTED (rejected)
interface NestedNode {
  id: string;
  condition: string;
  children: NestedNode[]; // embedded recursion
}
```

**Advantages of the normalised approach:**

1. **O(1) node lookups** — any node is accessed as `nodes[id]` without traversal
2. **Cycle representation is natural** — a `linkedToId` field can point to *any* existing node, including ancestors, which would be impossible to represent without reference cycles in a nested tree (which JSON cannot serialise)
3. **Efficient updates with Immer** — updating a deeply nested node in a nested tree requires path reconstruction; with a flat map, any node is updated in O(1) via `state.nodes[id].condition = value`
4. **Cascade deletes are clean** — `getAllDescendants(id, nodes)` does a BFS over `childIds` refs to collect the full subtree, then a single `delete` loop removes them all
5. **Separation of concerns** — rendering is recursive (the `LogicNodeCard` component), but state is flat; this means React reconciliation is efficient and graph algorithms work on a simple adjacency structure

---

## Cycle Detection Algorithm

### Algorithm: Three-Colour Iterative DFS

Located in `src/utils/graph.ts → detectCycles()`.

The algorithm is based on the classic **three-colour DFS** used in topological sort:

```
WHITE (0) = unvisited
GRAY  (1) = currently on the recursion stack (being explored)
BLACK (2) = fully processed (all descendants visited)
```

A **back edge** — an edge from a GRAY node to another GRAY node — indicates a cycle.

```ts
function detectCycles(nodes: NodeMap): CycleDetectionResult {
  // Build adjacency list combining childIds + linkedToId
  const adj = buildAdjacency(nodes);

  for (const id of allNodeIds) {
    if (color[id] === WHITE) {
      dfs(id); // iterative DFS from each unvisited root
    }
  }
}
```

**Why iterative (not recursive)?**  
JavaScript has a limited call stack (~10,000 frames). Since the spec requires "infinite nesting", a recursive DFS would overflow on deep trees. The iterative implementation uses an explicit stack with `{ id, neighborIdx }` frames, faithfully simulating the call stack without hitting JS limits.

**Cycle path extraction:**  
When a back edge `u → v` is found (v is GRAY), the cycle path is extracted by slicing the current DFS stack from the first occurrence of `v` to the current position, then appending `v` again to close the loop.

```
Example: A → B → C → A
Stack at back-edge detection: [A, B, C]
Back edge target: A
Extracted path: [A, B, C, A]  ← closed cycle
```

**Complexity:** O(V + E) where V = number of nodes, E = number of edges (childIds + links combined).

**Re-runs on every state mutation** — `recomputeCycles(state.nodes)` is called inside every Zustand action that modifies the graph topology.

---

## Edge Case Handling

| Scenario | Behaviour |
|---|---|
| Delete a node with children | Cascades: all descendants are deleted; all parent `childIds` and `linkedToId` refs are cleaned up |
| Delete a node that others link to | Those `linkedToId` fields are set to `null` before deletion |
| Self-link (node links to itself) | Prevented — `linkNodes` checks `fromId === toId` |
| Link to non-existent node | Guard: `if (node.linkedToId && nodes[node.linkedToId])` skips stale refs |
| Multiple cycles simultaneously | All are detected; each path is reported separately in the CycleAlert |
| Simulate with empty tree | Button is disabled when `nodeCount === 0` |
| Simulate with cycle | Button is disabled when `hasCycle === true` |
| Deeply nested tree (DFS stack overflow) | Uses iterative DFS, no recursion limit |

---

## Project Structure

```
src/
├── types/
│   └── index.ts          # LogicNode, NodeMap, Edge, CycleDetectionResult, SimulationResult
├── utils/
│   └── graph.ts          # buildEdges, buildAdjacency, detectCycles, simulateLogic, getAllDescendants
├── store/
│   └── logicStore.ts     # Zustand store with Immer — all actions and state
├── components/
│   ├── LogicNodeCard.tsx  # Recursive node renderer (handles all depths)
│   ├── Toolbar.tsx        # Top bar: Add Root, Link mode indicator, Simulate button
│   ├── CycleAlert.tsx     # Expandable alert showing all cycle paths
│   ├── SimulationPanel.tsx # Fixed panel showing DFS traversal trace
│   ├── GraphStats.tsx     # Sidebar: node/edge/depth stats
│   ├── NodeList.tsx       # Sidebar: flat list of all nodes (also acts as link target picker)
│   └── EmptyState.tsx     # Welcome screen when no nodes exist
├── App.tsx                # Root layout: toolbar + canvas + sidebar
├── main.tsx               # React entry point
└── index.css              # Tailwind base + custom scrollbar
```

---

## Installation & Running Locally

### Prerequisites
- Node.js 18+
- npm 9+ (or pnpm / yarn)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/logic-flow-mapper.git
cd logic-flow-mapper

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
# App runs at http://localhost:5173

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

---

## Usage Guide

1. **Add Root Node** — Click "Add Root Node" in the toolbar to create your first node
2. **Enter a Condition** — Type your If-condition in the text field (e.g. `x > 10`, `user.isAdmin === true`)
3. **Add Children** — Click a node to select it → "Add Child" to nest deeper
4. **Link Nodes** — Select a node → "Link To…" → click any other node in the tree or sidebar to create an edge
5. **Detect Cycles** — Links that form loops are instantly flagged. Nodes in the cycle glow red; the cycle path is shown in the alert banner
6. **Resolve Cycles** — Click the ✕ next to the link badge on any offending node to remove the link
7. **Simulate** — Once all cycles are cleared, click "Simulate Logic" to run a DFS traversal and see the step-by-step execution trace

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect the GitHub repository to Vercel for automatic deployments on push.

---

## License

MIT
