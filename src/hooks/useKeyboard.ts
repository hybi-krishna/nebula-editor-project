import { useEffect } from "react";
import { nodeActions } from "../store/nodeActions";
import { historyActions } from "../store/historyActions";
import { appStore } from "../store/appStore";
import { actions } from "../store/actions";
import { selectionActions } from "../store/selectionActions";

export function useKeyboard() {
    // useEffect is required to capture global document keydown events for application-wide shortcuts (undo, delete, select-all, duplicate).
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
                e.preventDefault();
                selectionActions.selectAll();
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
                e.preventDefault();
                nodeActions.duplicateSelected();
                return;
            }

            const target = e.target as HTMLElement;

            if (
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target.isContentEditable
            ) {
                return;
            }

            if (e.key === "Delete" || e.key === "Backspace") {
                const state = appStore.getState();

                if (state.selection.nodeIds.length > 0) {
                    nodeActions.deleteSelected();
                    return;
                }

                if (state.selection.edgeIds.length > 0) {
                    const edgeId = state.selection.edgeIds[0];
                    if (edgeId) {
                        historyActions.begin();
                        actions.deleteEdge(edgeId);
                        historyActions.end("Delete Edge");
                    }
                    return;
                }
            }

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
                e.preventDefault();

                if (e.shiftKey) {
                    historyActions.redo();
                } else {
                    historyActions.undo();
                }

                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
                e.preventDefault();
                historyActions.redo();
            }
        }

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, []);
}