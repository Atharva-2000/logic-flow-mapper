import React from 'react';
import { useLogicStore } from '../store/logicStore';
import { buildEdges } from '../utils/graph';

export const GraphStats: React.FC = () => {
  const nodes = useLogicStore((s) => s.nodes);
  const rootIds = useLogicStore((s) => s.rootIds);
  const cycleResult = useLogicStore((s) => s.cycleResult);

  const edges = buildEdges(nodes);
  const linkEdges = edges.filter((e) => e.isLink);
  const nodeCount = Object.keys(nodes).length;

  // Calculate max depth
  function getMaxDepth(id: string, visited = new Set<string>()): number {
    if (visited.has(id)) return 0;
    visited.add(id);
    const node = nodes[id];
    if (!node || node.childIds.length === 0) return 0;
    return 1 + Math.max(...node.childIds.map((cid) => getMaxDepth(cid, new Set(visited))));
  }

  const maxDepth = rootIds.length > 0 ? Math.max(...rootIds.map((id) => getMaxDepth(id))) : 0;

  const stats = [
    { label: 'Nodes', value: nodeCount, color: 'text-accent-cyan' },
    { label: 'Edges', value: edges.length, color: 'text-accent-violet' },
    { label: 'Links', value: linkEdges.length, color: 'text-accent-amber' },
    { label: 'Max Depth', value: maxDepth, color: 'text-accent-green' },
    { label: 'Cycles', value: cycleResult.cyclePaths.length, color: cycleResult.hasCycle ? 'text-accent-red' : 'text-surface-4' },
  ];

  return (
    <div className="bg-surface-2 border border-border-dim rounded-xl p-4">
      <div className="font-display font-semibold text-sm text-white mb-3">Graph Stats</div>
      <div className="space-y-2">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-surface-4">{label}</span>
            <span className={`font-mono text-[13px] font-semibold ${color}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
