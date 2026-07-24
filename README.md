# Nebula Workflow Editor

A node-based diagram editor built with React, TypeScript, and Vite.

---

## Implemented Features

### Canvas
- Infinite canvas with pan and zoom
- Pan using Space + Drag or Middle Mouse Button
- Mouse wheel zoom (clamped between 0.1× and 4×, anchored to cursor)
- Dot grid background that scales with zoom

### Nodes
- Three node types: Task, Note, Decision
- Drag nodes freely across the canvas
- Resize Note nodes using resize handles
- Edit Note text content inline
- Edit Task and Decision node titles by double-clicking
- Toggle Task node completion via checkbox

### Connections
- Draw edges by dragging from a node output port to another node input port
- Decision nodes have separate Yes and No output ports
- Live connection preview while dragging
- Orthogonal (right-angle) edge routing
- Select and delete individual edges

### Selection
- Click to select a single node
- Ctrl/Cmd + Click to add/remove nodes from the selection
- Marquee (drag) selection to select multiple nodes at once
- Keyboard marquee: press M on the canvas, use Arrow Keys to move, Shift + Arrows to resize, Enter to confirm selection
- Ctrl/Cmd + A to select all nodes

### Editing
- Delete selected nodes (Delete or Backspace)
- Deleting nodes also removes their connected edges
- Delete selected edges (Delete or Backspace)
- Duplicate selected nodes (Ctrl/Cmd + D), edges between duplicated nodes are also duplicated

### History
- Undo (Ctrl/Cmd + Z)
- Redo (Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y)
- Branching undo tree: undoing and making a new edit creates a new branch, the old branch is preserved
- Visual history panel showing the tree, click any node to jump to that state

### Persistence
- Diagram state is automatically saved to localStorage on every change
- Diagram and history tree are restored after page refresh

### Collaboration
- Cross-tab sync via BroadcastChannel: edits in one tab update other open tabs in real time
- Remote cursor display for connected tabs
- Two simulated teammates (Alice and Bob) join automatically to demonstrate presence and cursor movement in single-tab environments

### Performance
- Viewport culling: only nodes visible in the current viewport are rendered
- Selector-based store subscriptions: components only re-render when their specific slice of state changes
- URL parameter `?count=N` seeds N nodes for performance testing (e.g. `?count=2000`)

---

## Tech Stack

- React 19, TypeScript (strict mode), Vite
- Custom external state store built on `useSyncExternalStore`
- Vanilla CSS
- No external state management or diagram libraries

---

## Project Structure

```
src/
├── components/
│   ├── Canvas/         # Viewport, pan, zoom, marquee
│   ├── Collaboration/  # Remote cursors
│   ├── Edges/          # Edge layer, connection preview
│   ├── History/        # History panel
│   ├── Nodes/          # Task, Note, Decision node components
│   └── Toolbar/        # Add node buttons, undo/redo, presence indicator
├── hooks/
│   ├── useKeyboard.ts  # Global keyboard shortcuts
│   ├── useNodeDrag.ts  # Node drag logic
│   ├── useNodeResize.ts # Note node resize logic
│   ├── usePan.ts       # Canvas panning
│   ├── usePeerSelection.ts # Peer selection ring display
│   └── useZoom.ts      # Canvas zooming
├── store/
│   ├── appStore.ts     # Core pub/sub store
│   ├── useStore.ts     # React hook with selector support
│   ├── actions.ts      # Node/edge add, update, delete
│   ├── nodeActions.ts  # Move, delete, duplicate, toggle, rename
│   ├── selectionActions.ts
│   ├── connectionActions.ts
│   ├── viewportActions.ts
│   ├── historyActions.ts
│   ├── historyStore.ts
│   ├── presenceStore.ts
│   └── persistence.ts  # localStorage save/load
├── types/
└── utils/
    ├── routeEdge.ts    # Orthogonal edge path calculation
    ├── viewportCull.ts # Viewport culling
    └── seedGraph.ts    # Performance test graph generator
```

---

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Space + Drag / Middle Mouse | Pan canvas |
| Scroll Wheel | Zoom |
| Ctrl/Cmd + A | Select all nodes |
| Ctrl/Cmd + D | Duplicate selected nodes |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |
| Ctrl/Cmd + Y | Redo |
| Delete / Backspace | Delete selected nodes or edge |
| M (canvas focused) | Toggle keyboard marquee selection box |
| Arrow Keys (marquee) | Move marquee box |
| Shift + Arrow Keys (marquee) | Resize marquee box |
| Enter (marquee) | Confirm selection inside marquee |
| Double Click (Task/Decision) | Edit node title |