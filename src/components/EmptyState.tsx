import React from 'react';
import { useLogicStore } from '../store/logicStore';

export const EmptyState: React.FC = () => {
  const addRootNode = useLogicStore((s) => s.addRootNode);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Animated graph icon */}
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full bg-accent-cyan/5 border border-accent-cyan/10 animate-pulse-slow" />
        <div className="absolute inset-3 rounded-full bg-accent-cyan/5 border border-accent-cyan/10 animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-accent-cyan/60">
            <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="38" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="24" cy="38" r="4" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="10" cy="24" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M14 10H34M10 14V21M38 14V35M13 26L21 35"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <h2 className="font-display font-semibold text-white text-xl mb-2">
        No Logic Nodes Yet
      </h2>
      <p className="font-sans text-sm text-surface-4 max-w-xs mb-6 leading-relaxed">
        Build nested If-Then logic trees with cycle detection. Start by adding your first root node.
      </p>

      <button
        onClick={addRootNode}
        className="flex items-center gap-2 font-mono text-sm bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/30 hover:border-accent-cyan/50 text-accent-cyan px-5 py-2.5 rounded-xl transition-all duration-150"
      >
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
          <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Add First Root Node
      </button>

      {/* Feature hints */}
      <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg text-left">
        {[
          {
            icon: '🌿',
            title: 'Infinite Nesting',
            desc: 'Add child nodes to any depth',
          },
          {
            icon: '🔗',
            title: 'Link Nodes',
            desc: 'Connect any two nodes to create edges',
          },
          {
            icon: '⚠️',
            title: 'Cycle Detection',
            desc: 'DFS-powered loop detection in real-time',
          },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="bg-surface-2 border border-border-dim rounded-xl p-3"
          >
            <div className="text-lg mb-1.5">{icon}</div>
            <div className="font-display font-semibold text-xs text-white mb-1">{title}</div>
            <div className="font-sans text-[11px] text-surface-4 leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
