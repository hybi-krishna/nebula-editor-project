# NOTES.md

# Nebula Editor – Assessment Notes

This document describes the implementation decisions, AI assistance, additional dependencies, future improvements, and answers to Parts II–IV of the Nebula Editor assessment.

---

# Part I – Implementation Notes

## LLM Assistance

I used an LLM as a development assistant to review implementation ideas, validate approaches, and improve documentation. Specifically:

- Reviewed the orthogonal edge routing logic and refined midpoint calculations for cleaner SVG paths.
- Validated the selector-based external store implementation using `useSyncExternalStore` and shallow equality checks.
- Generated initial CSS ideas for styling the canvas grid.
- Reviewed architectural decisions and suggested performance improvements.

All implementation, integration, debugging, and testing were completed manually.

---

## Runtime Dependencies

No additional runtime dependencies were added.

The editor was built using React, TypeScript, and browser APIs without relying on external state management or whiteboard libraries.

Custom implementations include:

- External state store
- Undo/Redo history tree
- Orthogonal edge routing
- Viewport culling
- Local persistence
- BroadcastChannel-based collaboration

This keeps the application lightweight while satisfying the assessment constraints.

---

## Assumptions

The following design decisions were made during implementation:

- `localStorage` is used for persistence.
- Collaboration uses `BroadcastChannel` with mock users for local multi-tab presence.
- Full CRDT/Operational Transform synchronization was intentionally left out of scope.
- History stores complete application snapshots to simplify undo, redo, and branch switching.

---

## What I Would Build With Another 8 Hours

### 1. Copy & Paste Support

Implement keyboard shortcuts (Ctrl/Cmd + C and Ctrl/Cmd + V) to duplicate selected nodes while preserving their properties and recreating valid edge connections between copied nodes.

### 2. Node Locking

Allow users to lock individual nodes to prevent accidental movement, resizing, or editing. Locked nodes would remain selectable but would ignore drag and edit operations until unlocked.

### 3. Export & Import JSON

Add the ability to export diagrams as JSON files and import them later. This would allow users to share, back up, and restore diagrams while making integration with backend storage straightforward.

---

# Part II – Bug Fixes

## BUG-01

### Diagnosis

The keyboard event handler captures stale values because the effect only depends on `key`. The `selection` and `onFire` references become outdated after later renders.

### Fix

Store the latest callback and selection inside `useRef` and read from those refs inside the event listener. This keeps the listener stable without rebinding during every render.

### Reproduction

1. Select a node.
2. Rename it.
3. Press the keyboard shortcut.

The handler executes using the previous selection instead of the current one.

---

## BUG-02

### Diagnosis

Two issues exist:

1. `getSnapshot()` returns a newly created object on every call, breaking snapshot stability.
2. This causes unnecessary renders and inconsistent snapshots.

### Fix

Return the primitive value (`count`) directly from `getSnapshot()` so unchanged state returns the same snapshot between updates.

---

## BUG-03

### Diagnosis

Two rename requests can complete out of order. An older response may overwrite the result of a newer rename.

### Fix (without cancellation)

Assign each request a sequence number and ignore responses that are no longer current.

### Fix (with cancellation)

Cancel the previous request using `AbortController` before sending a new rename request.

### Recommendation

Sequence numbers are preferred because they work regardless of backend support for request cancellation.

---

# Part III – Design Questions

## 3.1 Virtualized Rendering

The editor performs viewport culling by checking whether each node intersects the current viewport.

Only visible node IDs are rendered, reducing the number of mounted React components.

Edges are rendered only when required. If both endpoints lie outside the viewport, the edge is skipped.

Current complexity:

- Viewport culling: O(N)
- Rendering: O(Visible Nodes)

Worst case occurs when every node is visible simultaneously. In that case, culling provides little benefit while still performing O(N) checks. However, typical diagrams are sparse, making this a practical trade-off.

---

## 3.2 Undo Tree

History is represented as a branching tree using an adjacency-list structure.

Each history node stores:

- Snapshot
- Parent ID
- Child IDs
- Action label

I chose full snapshots instead of patches because:

- Undo is O(1)
- Redo is O(1)
- Branch switching is O(1)
- No replay of intermediate actions is required

Old branches can be pruned to limit memory usage.

The approach becomes inefficient if every small drag movement creates a new snapshot instead of grouping related edits.

---

## 3.3 Server Components Migration

Moving the entire editor to Server Components would break:

- Browser event handlers
- BroadcastChannel
- localStorage
- Module-level stores
- Interactive canvas state

A better approach is to load the initial diagram on the server and pass it to a Client Component that initializes the editor and external store.

---

## 3.4 Auto-save

State machine:

```
IDLE
  ↓
DIRTY
  ↓
(DEBOUNCE)
  ↓
SAVING
  ↓
SUCCESS → IDLE
```

Recent edits are written immediately to localStorage for crash recovery.

Network synchronization is debounced and performed asynchronously.

If both local and remote versions exist after reopening, timestamps can be compared before resolving conflicts.

Useful production metrics include:

- Save failure rate
- Average save latency
- Save queue length

---

# Part IV – Triage

## Priority Order

### P0

1. **C-04 – Missing nodes**
   - Possible data loss affecting user work.

2. **C-03 – Undo restores old actions**
   - Breaks history correctness and user trust.

3. **C-08 – Undo skips operations**
   - Core editing workflow becomes unreliable.

### P1

4. **C-05 – Screen reader announces every cursor**
   - Accessibility issue affecting usability.

5. **C-06 – Safari edge drag selects page text**
   - Browser-specific interaction bug.

### P2

6. **C-01 – Delayed canvas panning**
   - Noticeable interaction lag.

7. **C-10 – Blank board during loading**
   - Poor loading experience but no data loss.

### P3

8. **C-02 – Similar cursor colours**
   - Minor usability improvement.

9. **C-09 – Copy/paste loses edge styles**
   - Lower priority enhancement.

### Won't Do

10. **C-07 – Dark Mode**

Given limited development time, correctness, reliability, accessibility, and performance are higher priorities than visual customization.