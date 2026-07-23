import { appStore } from "./appStore";
import { historyActions } from "./historyActions";

export const nodeActions = {
    moveNode(id: string, x: number, y: number) {
        const state = appStore.getState();

        const node = state.nodes[id];
        if (!node) return;

        appStore.setState({
            ...state,
            nodes: {
                ...state.nodes,
                [id]: {
                    ...node,
                    position: {
                        x,
                        y,
                    },
                },
            },
        });
    },

    moveNodes(ids: string[], dx: number, dy: number) {
        const state = appStore.getState();

        const updatedNodes = { ...state.nodes };

        ids.forEach((id) => {
            const node = updatedNodes[id];
            if (!node) return;

            updatedNodes[id] = {
                ...node,
                position: {
                    x: node.position.x + dx,
                    y: node.position.y + dy,
                },
            };
        });

        appStore.setState({
            ...state,
            nodes: updatedNodes,
        });
    },

    deleteSelected() {
        historyActions.begin();

        const state = appStore.getState();
        const deletedIds = state.selection.nodeIds;
        if (deletedIds.length === 0) {
            historyActions.end();
            return;
        }

        const updatedNodes = { ...state.nodes };
        deletedIds.forEach((id) => {
            delete updatedNodes[id];
        });

        // Clean up connected edges!
        const updatedEdges = { ...state.edges };
        Object.keys(updatedEdges).forEach((edgeId) => {
            const edge = updatedEdges[edgeId];
            if (edge && (deletedIds.includes(edge.source) || deletedIds.includes(edge.target))) {
                delete updatedEdges[edgeId];
            }
        });

        appStore.setState({
            ...state,
            nodes: updatedNodes,
            edges: updatedEdges,
            selection: {
                nodeIds: [],
                edgeIds: [],
            },
        });

        historyActions.end("Delete Nodes");
    },

    duplicateSelected() {
        historyActions.begin();

        const state = appStore.getState();
        const selectedIds = state.selection.nodeIds;
        if (selectedIds.length === 0) {
            historyActions.end();
            return;
        }

        const newNodes = { ...state.nodes };
        const newSelectedIds: string[] = [];
        const idMap = new Map<string, string>();

        selectedIds.forEach((id) => {
            const original = state.nodes[id];
            if (!original) return;

            const newId = crypto.randomUUID();
            idMap.set(id, newId);

            // Clone with offset 30,30
            const cloned = {
                ...structuredClone(original),
                id: newId,
                position: {
                    x: original.position.x + 30,
                    y: original.position.y + 30,
                },
            };

            newNodes[newId] = cloned;
            newSelectedIds.push(newId);
        });

        // Replicate edges between duplicated nodes
        const newEdges = { ...state.edges };
        Object.values(state.edges).forEach((edge) => {
            if (selectedIds.includes(edge.source) && selectedIds.includes(edge.target)) {
                const newSource = idMap.get(edge.source);
                const newTarget = idMap.get(edge.target);
                if (newSource && newTarget) {
                    const newEdgeId = crypto.randomUUID();
                    newEdges[newEdgeId] = {
                        id: newEdgeId,
                        source: newSource,
                        target: newTarget,
                    };
                }
            }
        });

        appStore.setState({
            ...state,
            nodes: newNodes,
            edges: newEdges,
            selection: {
                nodeIds: newSelectedIds,
                edgeIds: [],
            },
        });

        historyActions.end("Duplicate Selected");
    },

    toggleTaskCompleted(id: string) {
        historyActions.begin();

        const state = appStore.getState();
        const node = state.nodes[id];
        if (!node || node.type !== "task") {
            historyActions.end();
            return;
        }

        appStore.setState({
            ...state,
            nodes: {
                ...state.nodes,
                [id]: {
                    ...node,
                    completed: !node.completed,
                },
            },
        });

        historyActions.end("Toggle Task Completed");
    },

    updateNodeTitle(id: string, title: string) {
        historyActions.begin();

        const state = appStore.getState();
        const node = state.nodes[id];
        if (!node || (node.type !== "task" && node.type !== "decision")) {
            historyActions.end();
            return;
        }

        appStore.setState({
            ...state,
            nodes: {
                ...state.nodes,
                [id]: {
                    ...node,
                    title,
                } as any,
            },
        });

        historyActions.end("Update Title");
    }
};