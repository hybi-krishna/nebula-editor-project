import { appStore } from "./appStore";
import { historyStore } from "./historyStore";
import { saveHistory, loadHistory } from "./persistence";
import type { HistoryTree, HistoryNode } from "../types/history";
import type { AppState } from "../types/store";

let tempSnapshot: AppState | null = null;

function getOrInitTree(): HistoryTree {
    if (historyStore.tree) {
        return historyStore.tree;
    }
    const saved = loadHistory();
    if (saved) {
        historyStore.tree = saved;
        return saved;
    }
    const initialState = appStore.getState();
    const rootId = crypto.randomUUID();
    const rootNode: HistoryNode = {
        id: rootId,
        snapshot: structuredClone(initialState),
        parentId: null,
        childIds: [],
        label: "Initial State",
        timestamp: Date.now(),
    };
    const tree: HistoryTree = {
        nodes: { [rootId]: rootNode },
        currentId: rootId,
        rootId: rootId,
    };
    historyStore.tree = tree;
    saveHistory(tree);
    return tree;
}

export const historyActions = {
    begin() {
        if (historyStore.recording) return;
        getOrInitTree(); // ensure tree is initialized
        historyStore.recording = true;
        tempSnapshot = structuredClone(appStore.getState());
    },

    end(label: string = "Action") {
        if (!historyStore.recording) return;
        historyStore.recording = false;

        const latestState = appStore.getState();
        if (!tempSnapshot) return;

        // Check if state actually changed
        if (JSON.stringify(tempSnapshot) === JSON.stringify(latestState)) {
            tempSnapshot = null;
            return;
        }

        const tree = getOrInitTree();
        const newId = crypto.randomUUID();
        const newNode: HistoryNode = {
            id: newId,
            snapshot: structuredClone(latestState),
            parentId: tree.currentId,
            childIds: [],
            label,
            timestamp: Date.now(),
        };

        tree.nodes[newId] = newNode;
        
        // Add to parent's children
        const parent = tree.nodes[tree.currentId];
        if (parent) {
            parent.childIds.push(newId);
        }

        tree.currentId = newId;
        saveHistory(tree);
        tempSnapshot = null;

        // Force appState notification so history panel updates
        appStore.replaceState(latestState);
    },

    undo() {
        const tree = getOrInitTree();
        const currentNode = tree.nodes[tree.currentId];
        if (!currentNode || !currentNode.parentId) return;

        tree.currentId = currentNode.parentId;
        const parentNode = tree.nodes[tree.currentId];
        if (parentNode) {
            appStore.replaceState(structuredClone(parentNode.snapshot));
            saveHistory(tree);
        }
    },

    redo() {
        const tree = getOrInitTree();
        const currentNode = tree.nodes[tree.currentId];
        if (!currentNode || currentNode.childIds.length === 0) return;

        // Go to the last child (most recent branch)
        const nextId = currentNode.childIds[currentNode.childIds.length - 1];
        if (!nextId) return;
        const nextNode = tree.nodes[nextId];
        if (nextNode) {
            tree.currentId = nextId;
            appStore.replaceState(structuredClone(nextNode.snapshot));
            saveHistory(tree);
        }
    },

    switchBranch(nodeId: string) {
        const tree = getOrInitTree();
        const targetNode = tree.nodes[nodeId];
        if (targetNode) {
            tree.currentId = nodeId;
            appStore.replaceState(structuredClone(targetNode.snapshot));
            saveHistory(tree);
        }
    },

    getTree(): HistoryTree {
        return getOrInitTree();
    }
};