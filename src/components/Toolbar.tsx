import React from 'react';
import clsx from 'clsx';
import { useLogicStore } from '../store/logicStore';

export const Toolbar: React.FC = () => {
  const addRootNode = useLogicStore((s) => s.addRootNode);
  const hasCycle = useLogicStore((s) => s.cycleResult.hasCycle);
  const simulateLogic = useLogicStore((s) => s.simulateLogic);
  const clearSimulation = useLogicStore((s) => s.clearSimulation);
  const simulationResult = useLogicStore((s) => s.simulationResult);
  const nodeCount = useLogicStore((s) => Object.keys(s.nodes).length);
  const linkingFromId = useLogicStore((s) => s.linkingFromId);
  const setLinkingFrom = useLogicStore((s) => s.setLinkingFrom);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-7 h-7 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-accent-cyan">
            <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="19" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="19" r="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 5H17M5 7L12 17M19 7L12 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div className="font-display font-semibold text-white text-sm leading-none">
            Logic Flow Mapper
          </div>
          <div className="font-mono text-[10px] text-surface-4 mt-0.5">
            {nodeCount} node{nodeCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="h-6 w-px bg-border-dim" />

      {/* Add root node */}
      <button
        onClick={addRootNode}
        className={clsx(
          'flex items-center gap-1.5 text-[12px] font-mono',
          'bg-accent-cyan/10 hover:bg-accent-cyan/20',
          'border border-accent-cyan/30 hover:border-accent-cyan/50',
          'text-accent-cyan px-3 py-1.5 rounded-lg transition-all duration-150'
        )}
      >
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
          <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Add Root Node
      </button>

      {/* Cancel link mode */}
      {linkingFromId && (
        <button
          onClick={() => setLinkingFrom(null)}
          className={clsx(
            'flex items-center gap-1.5 text-[12px] font-mono',
            'bg-accent-amber/20 border border-accent-amber/50 text-accent-amber',
            'px-3 py-1.5 rounded-lg transition-all duration-150 animate-pulse-slow'
          )}
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Cancel Link (click a target node)
        </button>
      )}

      <div className="ml-auto flex items-center gap-2">
        {/* Cycle indicator */}
        {hasCycle && (
          <div className="flex items-center gap-1.5 bg-accent-red/10 border border-accent-red/30 text-accent-red px-3 py-1.5 rounded-lg font-mono text-[11px] animate-pulse-slow">
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <path
                d="M8 2L14 8L8 14M2 8H14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Logic Loop Detected
          </div>
        )}

        {/* Simulate button */}
        {simulationResult ? (
          <button
            onClick={clearSimulation}
            className="flex items-center gap-1.5 text-[12px] font-mono bg-surface-3 hover:bg-surface-4 border border-border-dim text-white px-3 py-1.5 rounded-lg transition-all"
          >
            Clear Simulation
          </button>
        ) : (
          <button
            onClick={simulateLogic}
            disabled={hasCycle || nodeCount === 0}
            className={clsx(
              'flex items-center gap-1.5 text-[12px] font-mono px-3 py-1.5 rounded-lg transition-all duration-150',
              hasCycle || nodeCount === 0
                ? 'bg-surface-3 border border-border-dim text-surface-4 cursor-not-allowed opacity-50'
                : 'bg-accent-green/10 hover:bg-accent-green/20 border border-accent-green/30 hover:border-accent-green/50 text-accent-green'
            )}
            title={hasCycle ? 'Fix all logic loops before simulating' : ''}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <path
                d="M4 3L13 8L4 13V3Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill={hasCycle || nodeCount === 0 ? 'none' : 'currentColor'}
                fillOpacity="0.3"
              />
            </svg>
            Simulate Logic
          </button>
        )}
      </div>
    </div>
  );
};
