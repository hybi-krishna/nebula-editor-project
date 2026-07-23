import { useSyncExternalStore, useRef, useCallback } from "react";
import { appStore } from "./appStore";
import type { AppState } from "../types/store";

function isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a && b && typeof a === "object") {
        if (Array.isArray(a)) {
            if (!Array.isArray(b) || a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) return false;
            }
            return true;
        }
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        for (const key of keysA) {
            if (a[key] !== b[key]) return false;
        }
        return true;
    }
    return false;
}

export function useStore(): AppState;
export function useStore<T>(selector: (state: AppState) => T): T;
export function useStore<T>(selector?: (state: AppState) => T): T | AppState {
    const lastSelector = useRef<((state: AppState) => any) | null>(null);
    const lastSelectedState = useRef<any>(null);

    const activeSelector = selector ?? ((s: AppState) => s);
    lastSelector.current = activeSelector;

    const getSelection = useCallback(() => {
        const state = appStore.getState();
        const nextSelection = lastSelector.current ? lastSelector.current(state) : state;
        
        if (lastSelectedState.current !== null && isEqual(lastSelectedState.current, nextSelection)) {
            return lastSelectedState.current;
        }
        lastSelectedState.current = nextSelection;
        return nextSelection;
    }, []);

    return useSyncExternalStore(
        appStore.subscribe,
        getSelection,
        getSelection
    );
}