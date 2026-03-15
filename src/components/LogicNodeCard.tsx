import React, { useCallback, useRef } from 'react';
import clsx from 'clsx';
import { useLogicStore } from '../store/logicStore';
import type { LogicNode as LogicNodeType, NodeColor } from '../types';
import { NODE_COLORS } from '../types';

// ─── Color Config ─────────────────────────────────────────────────────────────

const COLOR_STYLES: Record<
  NodeColor,
  { dot: string; border: string; badge: string; connector: string }
> = {
  cyan: {
    dot: 'bg-accent-cyan shadow-[0_0_8px_rgba(0,229,255,0.8)]',
    border: 'border-accent-cyan/40 hover:border-accent-cyan/70',
    badge: 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30',
    connector: 'text-accent-cyan',
  },
  violet: {
    dot: 'bg-accent-violet shadow-[0_0_8px_rgba(124,58,237,0.8)]',
    border: 'border-accent-violet/40 hover:border-accent-violet/70',
    badge: 'bg-accent-violet/10 text-accent-violet border border-accent-violet/30',
    connector: 'text-accent-violet',
  },
  green: {
    dot: 'bg-accent-green shadow-[0_0_8px_rgba(0,255,148,0.8)]',
    border: 'border-accent-green/40 hover:border-accent-green/70',
    badge: 'bg-accent-green/10 text-accent-green border border-accent-green/30',
    connector: 'text-accent-green',
  },
  amber: {
    dot: 'bg-accent-amber shadow-[0_0_8px_rgba(255,179,0,0.8)]',
    border: 'border-accent-amber/40 hover:border-accent-amber/70',
    badge: 'bg-accent-amber/10 text-accent-amber border border-accent-amber/30',
    connector: 'text-accent-amber',
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface LogicNodeProps {
  nodeId: string;
  depth?: number;
  isRoot?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const LogicNodeCard: React.FC<LogicNodeProps> = ({
  nodeId,
  depth = 0,
  isRoot = false,
}) => {
  const node = useLogicStore((s) => s.nodes[nodeId]) as LogicNodeType | undefined;
  const selectedNodeId = useLogicStore((s) => s.selectedNodeId);
  const linkingFromId = useLogicStore((s) => s.linkingFromId);
  const cycleNodeIds = useLogicStore((s) => s.cycleResult.cycleNodeIds);

  const addChildNode = useLogicStore((s) => s.addChildNode);
  const updateCondition = useLogicStore((s) => s.updateCondition);
  const deleteNode = useLogicStore((s) => s.deleteNode);
  const setLinkingFrom = useLogicStore((s) => s.setLinkingFrom);
  const linkNodes = useLogicStore((s) => s.linkNodes);
  const unlinkNode = useLogicStore((s) => s.unlinkNode);
  const selectNode = useLogicStore((s) => s.selectNode);
  const changeNodeColor = useLogicStore((s) => s.changeNodeColor);

  const inputRef = useRef<HTMLInputElement>(null);

  const isSelected = selectedNodeId === nodeId;
  const isLinkingFrom = linkingFromId === nodeId;
  const isLinkTarget = linkingFromId !== null && linkingFromId !== nodeId;
  const isCycle = cycleNodeIds.has(nodeId);
  const linkedNode = useLogicStore(
    (s) => (node?.linkedToId ? s.nodes[node.linkedToId] : undefined)
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isLinkTarget) {
        linkNodes(nodeId);
      } else {
        selectNode(isSelected ? null : nodeId);
      }
    },
    [isLinkTarget, linkNodes, nodeId, selectNode, isSelected]
  );

  if (!node) return null;

  const colorStyle = COLOR_STYLES[node.color];
  const indentWidth = Math.min(depth * 24, 120);

  return (
    <div
      className="animate-slide-in"
      style={{ marginLeft: depth > 0 ? `${indentWidth}px` : 0 }}
    >
      {/* Connector line for children */}
      {depth > 0 && (
        <div className="flex items-stretch mb-1">
          <div className="w-px bg-border-bright ml-3 mr-3 opacity-40" />
        </div>
      )}

      {/* Node Card */}
      <div
        onClick={handleClick}
        className={clsx(
          'relative rounded-xl border transition-all duration-200 cursor-pointer select-none',
          'bg-surface-2 shadow-node mb-3',
          isCycle
            ? 'border-accent-red/60 shadow-node-error animate-pulse-slow'
            : isSelected
            ? `shadow-node-active ${colorStyle.border}`
            : isLinkingFrom
            ? 'border-accent-amber/60 shadow-[0_0_0_2px_rgba(255,179,0,0.3)]'
            : isLinkTarget
            ? `${colorStyle.border} shadow-[0_0_12px_rgba(0,229,255,0.15)] ring-1 ring-accent-cyan/30 cursor-crosshair`
            : colorStyle.border
        )}
      >
        {/* Cycle indicator banner */}
        {isCycle && (
          <div className="absolute -top-px left-0 right-0 h-0.5 bg-accent-red rounded-t-xl" />
        )}

        <div className="p-3">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-2">
            {/* Color dot */}
            <div className={clsx('w-2.5 h-2.5 rounded-full flex-shrink-0', colorStyle.dot)} />

            {/* Node ID badge */}
            <span
              className={clsx(
                'font-mono text-[10px] px-1.5 py-0.5 rounded-md',
                colorStyle.badge
              )}
            >
              #{node.id}
            </span>

            {/* Depth badge */}
            <span className="font-mono text-[10px] text-surface-4 bg-surface-3 px-1.5 py-0.5 rounded-md border border-border-dim">
              d:{depth}
            </span>

            {isCycle && (
              <span className="ml-auto font-mono text-[10px] text-accent-red bg-accent-red/10 border border-accent-red/30 px-1.5 py-0.5 rounded-md animate-pulse">
                ⚠ CYCLE
              </span>
            )}

            {isRoot && !isCycle && (
              <span className="ml-auto font-mono text-[10px] text-surface-4 bg-surface-3 px-1.5 py-0.5 rounded-md border border-border-dim">
                ROOT
              </span>
            )}
          </div>

          {/* Condition input */}
          <input
            ref={inputRef}
            type="text"
            value={node.condition}
            onChange={(e) => {
              e.stopPropagation();
              updateCondition(nodeId, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Enter condition (e.g. x > 10)"
            className={clsx(
              'w-full bg-surface-1 border border-border-dim rounded-lg px-3 py-2',
              'font-mono text-sm text-white placeholder-surface-4',
              'focus:outline-none focus:border-accent-cyan/50 focus:bg-surface-0',
              'transition-colors duration-150'
            )}
          />

          {/* Link badge — shows when this node links to another */}
          {node.linkedToId && (
            <div className="mt-2 flex items-center gap-2">
              <div
                className={clsx(
                  'flex items-center gap-1.5 flex-1 min-w-0',
                  'bg-surface-3 border border-border-dim rounded-lg px-2.5 py-1.5'
                )}
              >
                <span className="text-[10px] text-surface-4 font-mono">LINKS TO</span>
                <svg
                  className={clsx('w-3 h-3 flex-shrink-0', colorStyle.connector)}
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M8 2L14 8L8 14M2 8H14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className={clsx(
                    'font-mono text-[11px] truncate',
                    isCycle ? 'text-accent-red' : colorStyle.connector
                  )}
                >
                  #{node.linkedToId}
                </span>
                {linkedNode && (
                  <span className="font-mono text-[10px] text-surface-4 truncate ml-1">
                    ({linkedNode.condition || 'empty'})
                  </span>
                )}
                {isCycle && (
                  <span className="ml-1 text-accent-red text-[10px]">↩ LOOP</span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  unlinkNode(nodeId);
                }}
                className="flex-shrink-0 text-surface-4 hover:text-accent-red transition-colors p-1 rounded"
                title="Remove link"
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                  <path
                    d="M4 4L12 12M12 4L4 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Action row */}
          {isSelected && (
            <div
              className="mt-3 pt-3 border-t border-border-dim flex flex-wrap gap-1.5 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Add child */}
              <button
                onClick={() => addChildNode(nodeId)}
                className="flex items-center gap-1 text-[11px] font-mono bg-surface-3 hover:bg-surface-4 border border-border-dim text-white px-2 py-1 rounded-lg transition-colors"
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
                  <path
                    d="M8 3V13M3 8H13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Add Child
              </button>

              {/* Link mode */}
              <button
                onClick={() => setLinkingFrom(isLinkingFrom ? null : nodeId)}
                className={clsx(
                  'flex items-center gap-1 text-[11px] font-mono border px-2 py-1 rounded-lg transition-colors',
                  isLinkingFrom
                    ? 'bg-accent-amber/20 border-accent-amber/50 text-accent-amber'
                    : 'bg-surface-3 hover:bg-surface-4 border-border-dim text-white'
                )}
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
                  <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6 8H10" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {isLinkingFrom ? 'Cancel Link' : 'Link To…'}
              </button>

              {/* Color picker */}
              <div className="flex items-center gap-1 ml-auto">
                {NODE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => changeNodeColor(nodeId, c)}
                    className={clsx(
                      'w-4 h-4 rounded-full transition-transform',
                      c === 'cyan' && 'bg-accent-cyan',
                      c === 'violet' && 'bg-accent-violet',
                      c === 'green' && 'bg-accent-green',
                      c === 'amber' && 'bg-accent-amber',
                      node.color === c ? 'scale-125 ring-1 ring-white/40' : 'opacity-50 hover:opacity-80'
                    )}
                    title={`Color: ${c}`}
                  />
                ))}
              </div>

              {/* Delete */}
              <button
                onClick={() => {
                  deleteNode(nodeId);
                }}
                className="flex items-center gap-1 text-[11px] font-mono bg-accent-red/10 hover:bg-accent-red/20 border border-accent-red/30 text-accent-red px-2 py-1 rounded-lg transition-colors"
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
                  <path
                    d="M3 4H13M6 4V2H10V4M5 4V13H11V4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render children recursively */}
      {node.childIds.length > 0 && (
        <div className="relative">
          {/* Vertical connector line */}
          <div
            className="absolute left-[13px] top-0 bottom-3 w-px bg-border-bright opacity-30"
            style={{ marginLeft: `${indentWidth}px` }}
          />
          {node.childIds.map((childId) => (
            <LogicNodeCard key={childId} nodeId={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
