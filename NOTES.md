# Nebula Editor – Assessment Notes

---

## Part I – Implementation Notes

### What I Built

This is a node-based diagram editor that meets the core requirements of the assessment. The following are implemented and working:

- Infinite canvas with pan (Space + Drag, Middle Mouse) and zoom (scroll wheel, cursor-anchored, clamped 0.1× to 4×)
- Three node types: Task (with checkbox), Note (with inline text editing and resize handles), Decision (with Yes/No output ports)
- Drag-to-connect edges between nodes with a live preview and orthogonal routing
- Marquee selection by drag, plus a full keyboard marquee alternative (M key)
- Multi-selection with Ctrl/Cmd + Click, select-all with Ctrl/Cmd + A
- Duplicate selected nodes and their interconnecting edges (Ctrl/Cmd + D)
- Delete nodes and edges (Delete/Backspace); deleting nodes cleans up their connected edges
- Branching undo/redo tree with a visual panel for jumping between branches
- localStorage persistence for both diagram state and history tree
- Viewport culling: only visible nodes are mounted in React
- Selector-based store hook: components subscribe to slices of state with shallow equality checks
- BroadcastChannel cross-tab collaboration with real-time cursor and selection sync
- Two simulated teammates (Alice, Bob) to demonstrate presence in single-tab environments
- TypeScript strict mode throughout

### AI Assistance

I used an LLM as a development assistant throughout this project. Specifically it helped with:

- Orthogonal edge routing math (midpoint offsets, loopback path segments)
- The shallow equality check logic in `useStore` for selector subscriptions
- CSS for the dot grid canvas background
- Debugging the SVG coordinate system after moving EdgeLayer outside the collapsed world container
- Fixing scroll event capture so the history panel could scroll without triggering canvas zoom

All architectural decisions, integration work, debugging, and testing were done by me.

### Runtime Dependencies Added

None. The editor was built using only React, TypeScript, and browser APIs. No external state management libraries (no Zustand, Redux, Jotai) and no diagram libraries (no React Flow, Konva, Fabric, Excalidraw).

### What I Would Build With More Time

1. **Copy and paste** – Ctrl/Cmd + C / V to clone selected nodes and their internal edges
2. **Node locking** – prevent accidental moves on individual nodes
3. **Export / Import JSON** – save and restore diagrams as files
4. **Minimap** – overview panel showing the full diagram with a viewport indicator
5. **Snap to grid** – optional alignment aid when dragging nodes

---

## Part II – Bug Fixes

### BUG-01

**Diagnosis:**
The keyboard event handler closes over stale values of `selection` and `onFire` because the effect only lists `key` in its dependency array. After subsequent renders, those captured values are outdated.

**Fix:**
Store the latest `selection` and `onFire` in `useRef` and read from the refs inside the event listener. The listener registration stays stable without re-binding on every render.

**Reproduction:**
1. Select a node
2. Double-click to rename it
3. Press the keyboard shortcut
The handler fires with the empty selection from before the rename.

---

### BUG-02

**Diagnosis:**
Two problems:
1. `getSnapshot()` returns a new object `{ count, at: Date.now() }` on every call, so React always sees a changed snapshot and re-renders infinitely.
2. The mutable module-level `count` variable is read and written directly without going through the `useSyncExternalStore` subscriber notification path.

**Fix:**
Return the raw primitive `count` from `getSnapshot()`. Primitives are compared by value, so React correctly skips re-renders when the value has not changed.

---

### BUG-03

**Diagnosis:**
Two rename requests run concurrently. If request 1 (stale) resolves after request 2 (current), the older response overwrites the newer label.

**Fix without cancellation:**
Assign each rename call an incrementing sequence number. On resolution, only apply the result if the sequence number matches the latest issued request.

**Fix with cancellation:**
Keep the active `AbortController` in a ref. Before starting a new request, call `abort()` on the previous controller. Ignore results from aborted requests.

**Recommendation:**
Sequence numbers. They work regardless of whether the backend supports `AbortSignal` and require no cleanup on the network layer.

---

## Part III – Design Questions

### 3.1 – Virtualized Rendering

The editor uses `viewportCull.ts` to compute which nodes intersect the current viewport bounding box (with a 150px overscan buffer). Only those node IDs are passed to React for rendering, so off-screen nodes are unmounted.

- Culling complexity: O(N)
- Rendering complexity: O(visible nodes only)

Edges are rendered in an SVG layer. If both endpoints are outside the viewport the path is still computed but has no visual cost since it falls outside the clipping region of the SVG.

The worst case is every node visible at once, where culling provides no benefit but adds O(N) overhead. For typical sparse diagrams this is not a problem.

### 3.2 – Undo Tree

History is stored as an adjacency list: `Record<string, HistoryNode>` where each node holds a full state snapshot, a parent ID, and an array of child IDs.

Using full snapshots (not patches) means:
- Undo: O(1) – restore parent snapshot directly
- Redo: O(1) – restore last child snapshot directly
- Branch switch: O(1) – restore any node's snapshot directly

The tradeoff is memory. Saving a snapshot on every pixel of a drag would fill localStorage instantly. The editor avoids this by only committing to history at discrete action boundaries (mouseup for drag, blur for text edits) using `historyActions.begin()` and `historyActions.end()`.

### 3.3 – Server Components Migration

Moving the editor to React Server Components would break:
- All browser event handlers (mouse, keyboard, wheel)
- `BroadcastChannel` (browser-only API)
- `localStorage` (browser-only API)
- Module-level store singleton
- `useSyncExternalStore` (client-only hook)

The right approach: fetch the initial diagram data in a Server Component and pass it as props to a `'use client'` Editor component. The client component initialises the store on hydration, eliminating the loading flash without breaking interactivity.

### 3.4 – Auto-Save

State machine:

```
IDLE → (edit) → DIRTY → (300ms debounce) → SAVING → (success) → IDLE
                                                    → (failure) → DIRTY (retry)
```

For crash recovery, write to `localStorage` synchronously on every state change (already done in `appStore.setState`). Network sync is debounced and async.

On reload with both a local and a remote version: compare timestamps and prompt the user if local is newer than remote.

Useful metrics to monitor in production:
- Save failure rate
- P95 save latency
- Queue depth (how many unsaved changes are pending)

---

## Part IV – Triage

Priority order based on user impact, data safety, and accessibility:

| Priority | Issue | Reason |
|---|---|---|
| P0 | C-04 – Missing nodes | Possible data loss |
| P0 | C-03 – Undo restores old session actions | History correctness, user trust |
| P0 | C-08 – Undo skips operations | Core editing workflow broken |
| P1 | C-05 – Screen reader announces every cursor | Accessibility compliance |
| P1 | C-06 – Safari edge drag selects text | Cross-browser interaction bug |
| P2 | C-01 – Delayed canvas panning | Noticeable lag |
| P2 | C-10 – Blank board during loading | Poor loading UX |
| P3 | C-02 – Similar cursor colours | Minor usability issue |
| P3 | C-09 – Copy/paste loses edge styles | Enhancement, copy/paste not yet implemented |
| Won't do | C-07 – Dark mode | Styling preference, not a correctness issue |