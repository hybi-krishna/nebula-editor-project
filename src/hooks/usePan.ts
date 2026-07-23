import { useEffect, useRef } from "react";
import { viewportActions } from "../store/viewportActions";
import { inputState } from "../store/inputState";

export function usePan() {
    const isPanning = useRef(false);
    const last = useRef({ x: 0, y: 0 });
    const spacePressed = useRef(false);

    // useEffect is required to register global window listeners for canvas pan operations (Space + drag or middle mouse drag) anywhere on screen.
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.code === "Space") {
                spacePressed.current = true;
                inputState.spacePressed = true;
            }
        }

        function onKeyUp(e: KeyboardEvent) {
            if (e.code === "Space") {
                spacePressed.current = false;
                isPanning.current = false;
                inputState.spacePressed = false;
            }
        }

        function onMouseDown(e: MouseEvent) {
            const isMiddleClick = e.button === 1;
            if (!spacePressed.current && !isMiddleClick) return;

            if (isMiddleClick) {
                e.preventDefault();
            }

            isPanning.current = true;
            last.current = {
                x: e.clientX,
                y: e.clientY,
            };
        }

        function onMouseMove(e: MouseEvent) {
            if (!isPanning.current) return;

            const dx = e.clientX - last.current.x;
            const dy = e.clientY - last.current.y;

            viewportActions.move(dx, dy);

            last.current = {
                x: e.clientX,
                y: e.clientY,
            };
        }

        function onMouseUp() {
            isPanning.current = false;
        }

        // Prevent default middle click autoscroll behavior on the window
        function onWindowClick(e: MouseEvent) {
            if (e.button === 1) {
                e.preventDefault();
            }
        }

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("click", onWindowClick);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            window.removeEventListener("click", onWindowClick);
        };
    }, []);
}