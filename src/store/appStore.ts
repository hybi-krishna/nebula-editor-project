import type { AppState } from "../types/store";
import { loadState, saveState } from "./persistence";

type Listener = () => void;

const listeners = new Set<Listener>();

const initialState: AppState = {
    nodes: {},
    edges: {},
    viewport: {
        x: 0,
        y: 0,
        zoom: 1,
    },
    selection: {
        nodeIds: [],
        edgeIds: [],
    },
    marquee: {
        active: false,
        start: {
            x: 0,
            y: 0,
        },
        end: {
            x: 0,
            y: 0,
        },
    },
    connection: {
        active: false,
        sourceId: null,
        mouse: {
            x: 0,
            y: 0,
        },
    },
};

let state: AppState = loadState() ?? initialState;

export const appStore = {
    getState() {
        return state;
    },

    subscribe(listener: Listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    setState(nextState: AppState) {
        if (state === nextState) return;

        state = nextState;

        saveState(state);

        listeners.forEach((listener) => listener());
    },

    replaceState(nextState: AppState) {
        state = nextState;

        saveState(state);

        listeners.forEach((listener) => listener());
    },
};