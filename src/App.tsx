import { useCallback } from 'react';
import { useLogicStore } from './store/logicStore';
import { LogicNodeCard } from './components/LogicNodeCard';
import { Toolbar } from './components/Toolbar';
import { CycleAlert } from './components/CycleAlert';
import { SimulationPanel } from './components/SimulationPanel';
import { GraphStats } from './components/GraphStats';
import { NodeList } from './components/NodeList';
import { EmptyState } from './components/EmptyState';

function App() {
  const rootIds = useLogicStore((s) => s.rootIds);
  const selectNode = useLogicStore((s) => s.selectNode);
  const linkingFromId = useLogicStore((s) => s.linkingFromId);
  const setLinkingFrom = useLogicStore((s) => s.setLinkingFrom);
  const hasCycle = useLogicStore((s) => s.cycleResult.hasCycle);

  const handleCanvasClick = useCallback(() => {
    selectNode(null);
    if (linkingFromId) setLinkingFrom(null);
  }, [selectNode, linkingFromId, setLinkingFrom]);

  return (
    <div
      className="min-h-screen bg-surface-0 font-sans"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,229,255,0.04) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 60%, rgba(124,58,237,0.04) 0%, transparent 60%)
        `,
      }}
    >
      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative flex flex-col h-screen">
        {/* Toolbar */}
        <header className="flex-shrink-0 border-b border-border-dim bg-surface-1/80 backdrop-blur-sm px-6 py-3">
          <Toolbar />
        </header>

        {/* Main layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas */}
          <main
            className="flex-1 overflow-y-auto p-6"
            onClick={handleCanvasClick}
          >
            {/* Linking mode overlay hint */}
            {linkingFromId && (
              <div className="sticky top-0 z-10 mb-4 bg-accent-amber/10 border border-accent-amber/30 rounded-xl px-4 py-2.5 flex items-center gap-2 animate-fade-in backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-accent-amber animate-pulse" />
                <span className="font-mono text-[12px] text-accent-amber">
                  Linking mode active — click any node below (or in the sidebar) to create a connection
                </span>
              </div>
            )}

            {/* Cycle alert */}
            {hasCycle && (
              <div className="mb-4">
                <CycleAlert />
              </div>
            )}

            {/* Logic tree */}
            {rootIds.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="max-w-2xl">
                {rootIds.map((rootId) => (
                  <LogicNodeCard key={rootId} nodeId={rootId} depth={0} isRoot />
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="flex-shrink-0 w-64 border-l border-border-dim bg-surface-1/60 backdrop-blur-sm p-4 overflow-y-auto space-y-4">
            <GraphStats />
            <NodeList />

            {/* Legend */}
            <div className="bg-surface-2 border border-border-dim rounded-xl p-4">
              <div className="font-display font-semibold text-sm text-white mb-3">Legend</div>
              <div className="space-y-2">
                {[
                  { color: 'bg-accent-cyan', label: 'Normal node' },
                  { color: 'bg-accent-amber', label: 'Linking mode' },
                  { color: 'bg-accent-red', label: 'Cycle / Loop' },
                  { color: 'bg-accent-green', label: 'Simulation end' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="font-mono text-[11px] text-surface-4">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-surface-2 border border-border-dim rounded-xl p-4">
              <div className="font-display font-semibold text-sm text-white mb-3">How to Use</div>
              <ol className="space-y-2">
                {[
                  'Add a Root Node from the toolbar',
                  'Click a node to select it',
                  'Use "Add Child" to nest deeper',
                  'Use "Link To…" to create cross-links',
                  'Cycles are auto-detected and flagged',
                  'Hit Simulate Logic to run DFS trace',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-mono text-[10px] text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="font-mono text-[11px] text-surface-4 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>

      {/* Simulation result panel (fixed bottom-right) */}
      <SimulationPanel />
    </div>
  );
}

export default App;
