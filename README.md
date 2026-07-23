# Nebula Workflow Editor

A node-based workflow editor built with React, TypeScript, and Vite for the Nebula Frontend Assessment.

## Implemented Features

### Canvas
- Infinite canvas
- Pan (Space + Drag)
- Mouse wheel zoom
- Background grid

### Nodes
- Task node
- Note node
- Decision node
- Node dragging
- Note editing
- Note resizing

### Connections
- Create connections between nodes
- Connection preview
- Edge selection
- Edge deletion

### Selection
- Single selection
- Multi-selection
- Marquee selection

### History
- Undo
- Redo
- History panel

### Persistence
- Automatic localStorage persistence
- Restore diagram on refresh

### Collaboration
- Presence indicator
- Remote cursor visualization

## Technical Highlights

- Custom state management built with `useSyncExternalStore`
- Modular architecture using components, hooks, stores, and utility modules
- Type-safe implementation with TypeScript
- Local persistence using browser localStorage

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl + A | Select all nodes |
| Ctrl + Z | Undo |
| Ctrl + Shift + Z | Redo |
| Ctrl + Y | Redo |
| Delete | Delete selected node/edge |
| Space + Drag | Pan canvas |
| Mouse Wheel | Zoom |