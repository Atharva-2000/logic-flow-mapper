import React from 'react';
import clsx from 'clsx';
import { useLogicStore } from '../store/logicStore';
import type { NodeColor } from '../types';

const COLOR_DOT: Record<NodeColor, string> = {
  cyan: 'bg-accent-cyan',
  violet: 'bg-accent-violet',
  green: 'bg-accent-green',
  amber: 'bg-accent-amber',
};

export const NodeList: React.FC = () => {
  const nodes = useLogicStore((s) => s.nodes);
  const selectedNodeId = useLogicStore((s) => s.selectedNodeId);
  const cycleNodeIds = useLogicStore((s) => s.cycleResult.cycleNodeIds);
  const selectNode = useLogicStore((s) => s.selectNode);
  const linkingFromId = useLogicStore((s) => s.linkingFromId);
  const linkNodes = useLogicStore((s) => s.linkNodes);

  const allNodes = Object.values(nodes).sort((a, b) => a.createdAt - b.createdAt);

  if (allNodes.length === 0) {
    return (
      <div className="bg-surface-2 border border-border-dim rounded-xl p-4">
        <div className="font-display font-semibold text-sm text-white mb-1">All Nodes</div>
        <p className="font-mono text-[11px] text-surface-4">No nodes yet. Add a root node to start.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-2 border border-border-dim rounded-xl p-4">
      <div className="font-display font-semibold text-sm text-white mb-3">
        All Nodes
        <span className="ml-2 font-mono text-[10px] text-surface-4 font-normal">
          ({allNodes.length})
        </span>
      </div>
      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {allNodes.map((node) => {
          const isCycle = cycleNodeIds.has(node.id);
          const isSelected = selectedNodeId === node.id;
          const isLinkTarget = linkingFromId !== null && linkingFromId !== node.id;

          return (
            <button
              key={node.id}
              onClick={() => {
                if (isLinkTarget) {
                  linkNodes(node.id);
                } else {
                  selectNode(isSelected ? null : node.id);
                }
              }}
              className={clsx(
                'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all',
                isCycle
                  ? 'bg-accent-red/10 border border-accent-red/30'
                  : isSelected
                  ? 'bg-surface-3 border border-border-bright'
                  : isLinkTarget
                  ? 'bg-accent-cyan/5 border border-accent-cyan/20 hover:bg-accent-cyan/10 cursor-crosshair'
                  : 'bg-surface-1 border border-transparent hover:bg-surface-3 hover:border-border-dim'
              )}
            >
              <div
                className={clsx(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  isCycle ? 'bg-accent-red' : COLOR_DOT[node.color]
                )}
              />
              <span className="font-mono text-[10px] text-surface-4 flex-shrink-0">
                #{node.id}
              </span>
              <span className="font-mono text-[11px] text-white truncate flex-1">
                {node.condition || '(empty)'}
              </span>
              {isCycle && (
                <span className="text-[9px] font-mono text-accent-red flex-shrink-0">⚠</span>
              )}
              {node.linkedToId && (
                <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 text-surface-4 flex-shrink-0">
                  <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6 8H10" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      {linkingFromId && (
        <p className="mt-2 font-mono text-[10px] text-accent-amber text-center animate-pulse-slow">
          Click any node above to link to it
        </p>
      )}
    </div>
  );
};
