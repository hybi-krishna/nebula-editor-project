# Task List — Nebula Editor

## Phase 0 — TypeScript Strict
- [x] tsconfig.app.json — add strict + noUncheckedIndexedAccess

## Phase 1 — Bug Fixes + New Features
- [x] src/types/history.ts — new
- [x] src/store/historyStore.ts — rewrite with tree
- [x] src/store/persistence.ts — persist history tree
- [x] src/store/historyActions.ts — rewrite
- [x] src/store/actions.ts — toggleTaskCompleted, updateNodeTitle (managed in nodeActions)
- [x] src/store/nodeActions.ts — fix deleteSelected, add duplicateSelected
- [x] src/store/selectionActions.ts — noUncheckedIndexedAccess guards
- [x] src/store/useStore.ts — selector support
- [x] src/hooks/usePan.ts — middle mouse + comment
- [x] src/hooks/useZoom.ts — comment
- [x] src/hooks/useKeyboard.ts — Cmd+D + comment
- [x] src/hooks/useNodeDrag.ts — comment + guards
- [x] src/hooks/useNodeResize.ts — zoom fix + comment
- [x] src/components/Nodes/TaskNode.tsx — checkbox, title edit, aria
- [x] src/components/Nodes/DecisionNode.tsx — title edit, aria
- [x] src/components/Nodes/NoteNode.tsx — aria

## Phase 2 — Orthogonal Edges
- [x] src/utils/routeEdge.ts — new
- [x] src/components/Edges/EdgeLayer.tsx — orthogonal + React.memo
- [x] src/components/Edges/ConnectionPreview.tsx — orthogonal

## Phase 3 — Undo Tree UI
- [x] src/components/History/HistoryPanel.tsx — new
- [x] src/components/History/HistoryPanel.css — new

## Phase 4 — Performance + Seed
- [x] src/utils/viewportCull.ts — new
- [x] src/utils/seedGraph.ts — new

## Phase 5 — Collaboration
- [x] src/store/presenceStore.ts — new BroadcastChannel
- [x] src/components/Collaboration/RemoteCursors.tsx — new
- [x] src/components/Collaboration/RemoteCursors.css — new

## Phase 6 — Accessibility
- [x] src/components/Canvas/Canvas.tsx — role, aria, keyboard marquee
- [x] src/components/Canvas/Marquee.tsx — aria

## Phase 7 — Visual Polish
- [x] src/components/Canvas/Canvas.css — dark dot grid
- [x] src/components/Nodes/Node.css — premium dark design
- [x] src/components/Toolbar/Toolbar.tsx — undo/redo + history toggle
- [x] src/components/Toolbar/Toolbar.css — glassmorphism

## Phase 8 — Wire Up + NOTES.md
- [x] src/App.tsx — culling, seed, collaboration, history panel
- [x] NOTES.md — ≤1200 words, Parts II–IV inline
