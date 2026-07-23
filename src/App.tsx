import React, { useEffect } from "react";
import Canvas from "./components/Canvas/Canvas";
import Toolbar from "./components/Toolbar/Toolbar";
import TaskNode from "./components/Nodes/TaskNode";
import NoteNode from "./components/Nodes/NoteNode";
import DecisionNode from "./components/Nodes/DecisionNode";
import HistoryPanel from "./components/History/HistoryPanel";
import RemoteCursors from "./components/Collaboration/RemoteCursors";
import { usePan } from "./hooks/usePan";
import { useZoom } from "./hooks/useZoom";
import { useKeyboard } from "./hooks/useKeyboard";
import { useStore } from "./store/useStore";
import { cullNodes } from "./utils/viewportCull";
import { generateSeedGraph } from "./utils/seedGraph";
import { appStore } from "./store/appStore";
import { historyActions } from "./store/historyActions";
import { presenceStore } from "./store/presenceStore";

const NodeRenderer = React.memo(({ id }: { id: string }) => {
  const type = useStore((state) => state.nodes[id]?.type);
  if (!type) return null;

  switch (type) {
    case "task":
      return <TaskNode id={id} />;
    case "note":
      return <NoteNode id={id} />;
    case "decision":
      return <DecisionNode id={id} />;
    default:
      return null;
  }
});

NodeRenderer.displayName = "NodeRenderer";

function App() {
  usePan();
  useZoom();
  useKeyboard();

  // Selective subscription: only subscribe to the list of culled (visible) node IDs
  const culledNodeIds = useStore((state) => {
    return cullNodes(state.nodes, state.viewport);
  });

  // useEffect is required to handle application boot side effects: URL query seeding, database loading, and collaboration sync setup.
  useEffect(() => {
    // Parse URL query parameter: ?count=2000
    const params = new URLSearchParams(window.location.search);
    const countStr = params.get("count");
    if (countStr) {
      const count = parseInt(countStr, 10);
      if (!isNaN(count) && count > 0) {
        const { nodes, edges } = generateSeedGraph(count);
        appStore.replaceState({
          ...appStore.getState(),
          nodes,
          edges,
        });
        // Root the history tree with this seeded state
        historyActions.end("Seed Graph");
      }
    }

    // Initialize presence BroadcastChannel
    presenceStore.init();

    // Trigger initial state broadcast
    presenceStore.broadcastState();
  }, []);

  return (
    <>
      <Toolbar />
      <HistoryPanel />

      <Canvas>
        {culledNodeIds.map((id) => (
          <NodeRenderer key={id} id={id} />
        ))}
        <RemoteCursors />
      </Canvas>
    </>
  );
}

export default App;