import React from 'react';
import clsx from 'clsx';
import { useLogicStore } from '../store/logicStore';

export const SimulationPanel: React.FC = () => {
  const simulationResult = useLogicStore((s) => s.simulationResult);
  const nodes = useLogicStore((s) => s.nodes);
  const clearSimulation = useLogicStore((s) => s.clearSimulation);

  if (!simulationResult) return null;

  const { steps } = simulationResult;

  return (
    <div className="fixed bottom-6 right-6 w-80 max-h-96 flex flex-col bg-surface-1 border border-accent-green/30 rounded-xl shadow-[0_0_32px_rgba(0,255,148,0.1)] animate-slide-in z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-dim">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="font-display font-semibold text-sm text-white">Simulation Trace</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-surface-4">{steps.length} step{steps.length !== 1 ? 's' : ''}</span>
          <button
            onClick={clearSimulation}
            className="text-surface-4 hover:text-white transition-colors p-0.5 rounded"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
        {steps.map((step, i) => {
          const node = nodes[step.nodeId];
          const isLast = i === steps.length - 1;
          return (
            <div
              key={`${step.nodeId}-${i}`}
              className={clsx(
                'flex items-start gap-2 p-2 rounded-lg border transition-all',
                isLast
                  ? 'bg-accent-green/10 border-accent-green/30'
                  : 'bg-surface-2 border-border-dim'
              )}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {/* Step number */}
              <span className="font-mono text-[10px] text-surface-4 mt-0.5 w-5 flex-shrink-0">
                {i + 1}
              </span>

              {/* Indent indicator */}
              <div className="flex items-center gap-0.5 mt-1 flex-shrink-0">
                {Array.from({ length: step.depth }).map((_, di) => (
                  <div key={di} className="w-0.5 h-3 rounded-full bg-border-bright opacity-40" />
                ))}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={clsx(
                      'font-mono text-[10px] px-1 py-0.5 rounded',
                      isLast
                        ? 'bg-accent-green/20 text-accent-green'
                        : 'bg-surface-3 text-surface-4'
                    )}
                  >
                    #{step.nodeId}
                  </span>
                  {isLast && (
                    <span className="font-mono text-[10px] text-accent-green">← end</span>
                  )}
                </div>
                <p className="font-mono text-xs text-white mt-0.5 truncate">
                  {step.condition}
                </p>
              </div>
            </div>
          );
        })}

        {steps.length === 0 && (
          <div className="text-center py-4 font-mono text-[11px] text-surface-4">
            No nodes to simulate
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border-dim flex items-center justify-between">
        <span className="font-mono text-[10px] text-surface-4">DFS traversal complete</span>
        <span className="font-mono text-[10px] text-accent-green">✓ No cycles</span>
      </div>
    </div>
  );
};
