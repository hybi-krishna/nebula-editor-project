import type { AppState } from "../types/store";
import type { HistoryTree } from "../types/history";

const STORAGE_KEY = "diagram-editor-state";
const HISTORY_KEY = "diagram-editor-history";

export function saveState(state: AppState) {
    const persistentState: AppState = {
        ...state,
        selection: {
            nodeIds: [],
            edgeIds: [],
        },
        marquee: {
            active: false,
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 },
        },
        connection: {
            active: false,
            sourceId: null,
            mouse: { x: 0, y: 0 },
        },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentState));
}

export function loadState(): AppState | null {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return null;

    try {
        return JSON.parse(saved) as AppState;
    } catch (error) {
        console.error("Failed to load diagram:", error);
        return null;
    }
}

export function saveHistory(tree: HistoryTree) {
    try {
        // Strip down snapshots to only include nodes, edges, viewport, selection, marquee, connection
        // (already clean, but structuredClone makes sure it's valid JSON)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(tree));
    } catch (error) {
        console.error("Failed to save history:", error);
    }
}

export function loadHistory(): HistoryTree | null {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (!saved) return null;
    try {
        return JSON.parse(saved) as HistoryTree;
    } catch (error) {
        console.error("Failed to load history:", error);
        return null;
    }
}