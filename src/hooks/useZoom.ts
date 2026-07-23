import { useEffect } from "react";
import { viewportActions } from "../store/viewportActions";

export function useZoom() {
    // useEffect is required to bind non-passive wheel listener to window to cancel default browser zoom gestures.
    useEffect(() => {
        function onWheel(e: WheelEvent) {
            e.preventDefault();

            viewportActions.zoomAt(
                e.clientX,
                e.clientY,
                e.deltaY
            );
        }

        window.addEventListener("wheel", onWheel, {
            passive: false,
        });

        return () => {
            window.removeEventListener("wheel", onWheel);
        };
    }, []);
}