import { appStore } from "./appStore";
import type { DiagramNode } from "../types/node";
import type { Edge } from "../types/edge";

export const actions = {
    addNode(node: DiagramNode) {
        const state = appStore.getState();

        appStore.setState({
            ...state,
            nodes: {
                ...state.nodes,
                [node.id]: node,
            },
        });
    },

    addEdge(edge: Edge) {
        const state = appStore.getState();

        appStore.setState({
            ...state,
            edges: {
                ...state.edges,
                [edge.id]: edge,
            },
        });
    },

    clearSelection() {
        const state = appStore.getState();

        appStore.setState({
            ...state,
            selection: {
                nodeIds: [],
                edgeIds: [],
            },
        });
    },

    updateNoteText(id: string, text: string) {
        const state = appStore.getState();

        const node = state.nodes[id];

        if (!node || node.type !== "note") return;

        appStore.setState({
            ...state,
            nodes: {
                ...state.nodes,
                [id]: {
                    ...node,
                    text,
                },
            },
        });
    },

    updateNodeSize(id: string, width: number, height: number) {
        const state = appStore.getState();

        const node = state.nodes[id];

        if (!node) return;

        appStore.setState({
            ...state,
            nodes: {
                ...state.nodes,
                [id]: {
                    ...node,
                    size: {
                        width,
                        height,
                    },
                },
            },
        });
    },

    deleteEdge(id: string) {
        const state = appStore.getState();

        const edges = { ...state.edges };
        delete edges[id];

        appStore.setState({
            ...state,
            edges,
            selection: {
                ...state.selection,
                edgeIds: [],
            },
        });
    },
};