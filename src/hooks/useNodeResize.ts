import { useRef } from "react";
import { appStore } from "../store/appStore";
import { historyActions } from "../store/historyActions";
import { actions } from "../store/actions";

export function useNodeResize(id: string) {
    const resizing = useRef(false);

    const startMouse = useRef({
        x: 0,
        y: 0,
    });

    const startSize = useRef({
        width: 0,
        height: 0,
    });

    function onMouseDown(e: React.MouseEvent) {
        e.stopPropagation();
        e.preventDefault();

        const state = appStore.getState();
        const node = state.nodes[id];

        if (!node) return;

        historyActions.begin();

        resizing.current = true;

        startMouse.current = {
            x: e.clientX,
            y: e.clientY,
        };

        startSize.current = {
            width: node.size.width,
            height: node.size.height,
        };

        function onMove(ev: MouseEvent) {
            if (!resizing.current) return;

            const latestState = appStore.getState();
            const zoom = latestState.viewport.zoom;

            const dx = (ev.clientX - startMouse.current.x) / zoom;
            const dy = (ev.clientY - startMouse.current.y) / zoom;

            const width = Math.max(150, startSize.current.width + dx);
            const height = Math.max(100, startSize.current.height + dy);

            actions.updateNodeSize(id, width, height);
        }

        function onUp() {
            resizing.current = false;

            historyActions.end("Resize Node");

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