import type { AppState } from "./store";

export interface HistoryNode {
    id: string;
    /** Full state snapshot captured AFTER this action was applied. */
    snapshot: AppState;
    parentId: string | null;
    childIds: string[];
    label: string;
    timestamp: number;
}

export interface HistoryTree {
    nodes: Record<string, HistoryNode>;
    /** ID of the node the user is currently at. */
    currentId: string;
    rootId: string;
}