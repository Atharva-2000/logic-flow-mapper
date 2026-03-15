import React, { useState } from 'react';
import clsx from 'clsx';
import { useLogicStore } from '../store/logicStore';

export const CycleAlert: React.FC = () => {
  const cycleResult = useLogicStore((s) => s.cycleResult);
  const [expanded, setExpanded] = useState(false);

  if (!cycleResult.hasCycle) return null;

  const { cyclePaths, cycleNodeIds } = cycleResult;

  return (
    <div className="bg-accent-red/5 border border-accent-red/30 rounded-xl p-4 animate-fade-in">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3"
      >
        {/* Icon */}
        <div className="w-8 h-8 rounded-lg bg-accent-red/10 border border-accent-red/30 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-accent-red">
            <path
              d="M12 9V12M12 15H12.01M4.929 19.071A10 10 0 1019.07 4.93 10 10 0 004.93 19.07Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="flex-1 text-left">
          <div className="font-display font-semibold text-accent-red text-sm">
            Invalid Logic Loop Detected
          </div>
          <div className="font-mono text-[11px] text-accent-red/70 mt-0.5">
            {cycleNodeIds.size} node{cycleNodeIds.size !== 1 ? 's' : ''} involved ·{' '}
            {cyclePaths.length} loop{cyclePaths.length !== 1 ? 's' : ''} found · Simulation disabled
          </div>
        </div>

        <svg
          viewBox="0 0 16 16"
          fill="none"
          className={clsx('w-4 h-4 text-accent-red/60 transition-transform', expanded && 'rotate-180')}
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-accent-red/20 space-y-2 animate-fade-in">
          <div className="font-mono text-[11px] text-surface-4 mb-2">Cycle paths detected:</div>
          {cyclePaths.map((path, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 flex-wrap bg-surface-2 border border-accent-red/20 rounded-lg px-3 py-2"
            >
              {path.map((nodeId, j) => (
                <React.Fragment key={`${nodeId}-${j}`}>
                  <span
                    className={clsx(
                      'font-mono text-[11px] px-1.5 py-0.5 rounded',
                      j === path.length - 1
                        ? 'bg-accent-red/20 text-accent-red border border-accent-red/30'
                        : 'bg-surface-3 text-white border border-border-dim'
                    )}
                  >
                    #{nodeId}
                  </span>
                  {j < path.length - 1 && (
                    <svg viewBox="0 0 16 8" fill="none" className="w-4 h-2 text-accent-red/60">
                      <path d="M0 4H12M9 1L12 4L9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </React.Fragment>
              ))}
            </div>
          ))}
          <p className="font-mono text-[10px] text-surface-4 mt-2">
            Remove the link causing the loop to resolve. Nodes highlighted in red are part of a cycle.
          </p>
        </div>
      )}
    </div>
  );
};
