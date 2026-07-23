import { appStore } from "./appStore";

export const viewportActions = {
    move(dx: number, dy: number) {
        const state = appStore.getState();

        appStore.setState({
            ...state,
            viewport: {
                ...state.viewport,
                x: state.viewport.x + dx,
                y: state.viewport.y + dy,
            },
        });
    },

    setZoom(zoom: number) {
        const state = appStore.getState();

        appStore.setState({
            ...state,
            viewport: {
                ...state.viewport,
                zoom,
            },
        });
    },

    setPosition(x: number, y: number) {
        const state = appStore.getState();

        appStore.setState({
            ...state,
            viewport: {
                ...state.viewport,
                x,
                y,
            },
        });
    },

    zoomAt(clientX: number, clientY: number, deltaY: number) {
        const state = appStore.getState();
        const { viewport } = state;

        const zoomFactor = deltaY < 0 ? 1.1 : 0.9;

        const nextZoom = Math.min(
            4,
            Math.max(0.1, viewport.zoom * zoomFactor)
        );

        const worldX = (clientX - viewport.x) / viewport.zoom;
        const worldY = (clientY - viewport.y) / viewport.zoom;

        const nextX = clientX - worldX * nextZoom;
        const nextY = clientY - worldY * nextZoom;

        appStore.setState({
            ...state,
            viewport: {
                x: nextX,
                y: nextY,
                zoom: nextZoom,
            },
        });
    }
};