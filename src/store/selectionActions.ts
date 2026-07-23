import { appStore } from "./appStore";

export const selectionActions = {
    selectSingle(id: string) {
        const state = appStore.getState();

        appStore.setState({
            ...state,
            selection: {
                nodeIds: [id],
                edgeIds: [],
            },
        });
    },

    toggle(id: string) {
        const state = appStore.getState();

        const selected = state.selection.nodeIds.includes(id);

        appStore.setState({
            ...state,
            selection: {
                nodeIds: selected
                    ? state.selection.nodeIds.filter(n => n !== id)
                    : [...state.selection.nodeIds, id],
                edgeIds: [],
            },
        });
    },

    selectMultiple(ids: string[]) {
        const state = appStore.getState();

        appStore.setState({
            ...state,
            selection: {
                nodeIds: ids,
                edgeIds: [],
            },
        });
    },

    selectEdge(id: string) {
        const state = appStore.getState();

        appStore.setState({
            ...state,
            selection: {
                nodeIds: [],
                edgeIds: [id],
            },
        });
    },

    selectAll() {
        const state = appStore.getState();

        appStore.setState({
            ...state,
            selection: {
                nodeIds: Object.keys(state.nodes),
                edgeIds: [],
            },
        });
    },

    clear() {
        const state = appStore.getState();

        appStore.setState({
            ...state,
            selection: {
                nodeIds: [],
                edgeIds: [],
            },
        });
    },
};