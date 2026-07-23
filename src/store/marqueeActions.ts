import { appStore } from "./appStore";

export const marqueeActions = {
    start(x: number, y: number) {
        const state = appStore.getState();

        appStore.setState({
            ...state,
            marquee: {
                active: true,
                start: { x, y },
                end: { x, y },
            },
        });
    },

    update(x: number, y: number) {
        const state = appStore.getState();

        appStore.setState({
            ...state,
            marquee: {
                ...state.marquee,
                end: { x, y },
            },
        });
    },

    stop() {
        const state = appStore.getState();

        appStore.setState({
            ...state,
            marquee: {
                ...state.marquee,
                active: false,
            },
        });
    },
};