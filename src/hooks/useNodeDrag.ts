import { useRef } from "react";
import { nodeActions } from "../store/nodeActions";
import { appStore } from "../store/appStore";
import { historyActions } from "../store/historyActions";

export function useNodeDrag(id: string) {
    const dragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });
    const lastWorld = useRef({ x: 0, y: 0 });

    function onMouseDown(e: React.MouseEvent) {
        e.stopPropagation();

        const state = appStore.getState();

        if (state.connection.active) {
            return;
        }

        const node = state.nodes[id];
        if (!node) return;

        historyActions.begin();

        dragging.current = true;

        const { viewport } = state;

        const worldX = (e.clientX - viewport.x) / viewport.zoom;
        const worldY = (e.clientY - viewport.y) / viewport.zoom;

        lastWorld.current = {
            x: worldX,
            y: worldY,
        };

        offset.current = {
            x: worldX - node.position.x,
            y: worldY - node.position.y,
        };

        function onMove(ev: MouseEvent) {
            if (!dragging.current) return;

            const state = appStore.getState();
            const { viewport } = state;

            const worldX = (ev.clientX - viewport.x) / viewport.zoom;
            const worldY = (ev.clientY - viewport.y) / viewport.zoom;

            const dx = worldX - lastWorld.current.x;
            const dy = worldY - lastWorld.current.y;

            const selectedIds = state.selection.nodeIds;

            if (selectedIds.includes(id) && selectedIds.length > 1) {
                nodeActions.moveNodes(selectedIds, dx, dy);
            } else {
                nodeActions.moveNode(
                    id,
                    worldX - offset.current.x,
                    worldY - offset.current.y
                );
            }

            lastWorld.current = {
                x: worldX,
                y: worldY,
            };
        }

        function onUp() {
            dragging.current = false;

            historyActions.end();

            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        }

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }

    return {
        onMouseDown,
    };
}