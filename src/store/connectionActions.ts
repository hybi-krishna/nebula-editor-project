import { appStore } from "./appStore";
import { actions } from "./actions";

export const connectionActions = {
    start(sourceId: string, x: number, y: number, sourcePort?: "yes" | "no") {
        const state = appStore.getState();

        appStore.setState({
            ...state,
            connection: {
                active: true,
                sourceId,
                sourcePort,
                mouse: { x, y },
            },
        });
    },

    updateMouse(x: number, y: number) {
        const state = appStore.getState();

        if (!state.connection.active) return;

        appStore.setState({
            ...state,
            connection: {
                ...state.connection,
                mouse: { x, y },
            },
        });
    },

    stop(targetId?: string) {
        const state = appStore.getState();

        if (
            targetId &&
            state.connection.sourceId &&
            targetId !== state.connection.sourceId
        ) {
            const exists = Object.values(state.edges).some(
                (edge) =>
                    edge.source === state.connection.sourceId &&
                    edge.target === targetId &&
                    edge.sourcePort === state.connection.sourcePort
            );

            if (!exists) {
                actions.addEdge({
                    id: crypto.randomUUID(),
                    source: state.connection.sourceId,
                    target: targetId,
                    sourcePort: state.connection.sourcePort,
                });
            }
        }

        const latest = appStore.getState();

        appStore.setState({
            ...latest,
            connection: {
                active: false,
                sourceId: null,
                sourcePort: undefined,
                mouse: { x: 0, y: 0 },
            },
        });
    }
};