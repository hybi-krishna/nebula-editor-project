import "./Canvas.css";
import { useState } from "react";
import { useStore } from "../../store/useStore";
import { selectionActions } from "../../store/selectionActions";
import { Marquee } from "./Marquee";
import { marqueeActions } from "../../store/marqueeActions";
import { appStore } from "../../store/appStore";
import { inputState } from "../../store/inputState";
import EdgeLayer from "../Edges/EdgeLayer";
import { connectionActions } from "../../store/connectionActions";
import { presenceStore } from "../../store/presenceStore";

interface Props {
    children: React.ReactNode;
}

export default function Canvas({ children }: Props) {
    const viewport = useStore((state) => state.viewport);

    // Keyboard-accessible marquee state
    const [kbMarquee, setKbMarquee] = useState({
        active: false,
        x: 100,
        y: 100,
        w: 200,
        h: 150,
    });

    function handleCanvasKeyDown(e: React.KeyboardEvent) {
        // Prevent key actions if typing in an editor
        const target = e.target as HTMLElement;
        if (
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target.isContentEditable
        ) {
            return;
        }

        // Toggle Keyboard Selection Box with M
        if (e.key.toLowerCase() === "m") {
            e.preventDefault();
            const state = appStore.getState();
            // Put it near the middle of current view
            const startX = -state.viewport.x / state.viewport.zoom + 200;
            const startY = -state.viewport.y / state.viewport.zoom + 200;
            setKbMarquee({
                active: !kbMarquee.active,
                x: startX,
                y: startY,
                w: 200,
                h: 150,
            });
            return;
        }

        if (!kbMarquee.active) return;

        const step = e.shiftKey ? 50 : 20;

        if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (e.shiftKey) {
                setKbMarquee((m) => ({ ...m, w: Math.max(20, m.w - step) }));
            } else {
                setKbMarquee((m) => ({ ...m, x: m.x - step }));
            }
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            if (e.shiftKey) {
                setKbMarquee((m) => ({ ...m, w: m.w + step }));
            } else {
                setKbMarquee((m) => ({ ...m, x: m.x + step }));
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (e.shiftKey) {
                setKbMarquee((m) => ({ ...m, h: Math.max(20, m.h - step) }));
            } else {
                setKbMarquee((m) => ({ ...m, y: m.y - step }));
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (e.shiftKey) {
                setKbMarquee((m) => ({ ...m, h: m.h + step }));
            } else {
                setKbMarquee((m) => ({ ...m, y: m.y + step }));
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
            // Perform selection inside bounds
            const state = appStore.getState();
            const left = kbMarquee.x;
            const right = kbMarquee.x + kbMarquee.w;
            const top = kbMarquee.y;
            const bottom = kbMarquee.y + kbMarquee.h;

            const selectedIds = Object.values(state.nodes)
                .filter((node) => {
                    return (
                        node.position.x >= left &&
                        node.position.x + node.size.width <= right &&
                        node.position.y >= top &&
                        node.position.y + node.size.height <= bottom
                    );
                })
                .map((node) => node.id);

            selectionActions.selectMultiple(selectedIds);
            setKbMarquee((m) => ({ ...m, active: false }));
        } else if (e.key === "Escape") {
            e.preventDefault();
            setKbMarquee((m) => ({ ...m, active: false }));
        }
    }

    return (
        <div
            className="canvas"
            tabIndex={0}
            role="application"
            aria-label="Nebula diagram editor canvas. Press Space+Drag or use middle mouse to pan. Use mouse wheel to zoom. Press M to toggle keyboard selection box."
            onKeyDown={handleCanvasKeyDown}
            onMouseDown={(e) => {
                if (inputState.spacePressed || e.button === 1) {
                    return;
                }
                
                // Clicking canvas background, world container, or edge-layer SVG should trigger selection
                const targetEl = e.target as HTMLElement;
                const isBg =
                    e.target === e.currentTarget ||
                    targetEl.classList.contains("world") ||
                    targetEl.classList.contains("edge-layer") ||
                    targetEl.tagName === "svg" ||
                    targetEl.tagName === "line" ||
                    targetEl.tagName === "path";

                // If clicking an edge line/path itself, let that bubble or be handled individually
                if (targetEl.tagName === "path" && targetEl.getAttribute("pointer-events") === "stroke") {
                    return;
                }

                if (!isBg) return;

                selectionActions.clear();

                const { viewport: vp } = appStore.getState();

                const startX = (e.clientX - vp.x) / vp.zoom;
                const startY = (e.clientY - vp.y) / vp.zoom;

                marqueeActions.start(startX, startY);

                function onMove(ev: MouseEvent) {
                    const { viewport: latestVp } = appStore.getState();

                    const x = (ev.clientX - latestVp.x) / latestVp.zoom;
                    const y = (ev.clientY - latestVp.y) / latestVp.zoom;

                    marqueeActions.update(x, y);
                }

                function onUp() {
                    marqueeActions.stop();

                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);

                    const state = appStore.getState();

                    const { start, end } = state.marquee;

                    const left = Math.min(start.x, end.x);
                    const right = Math.max(start.x, end.x);
                    const top = Math.min(start.y, end.y);
                    const bottom = Math.max(start.y, end.y);

                    const selectedIds = Object.values(state.nodes)
                        .filter((node) => {
                            return (
                                node.position.x >= left &&
                                node.position.x + node.size.width <= right &&
                                node.position.y >= top &&
                                node.position.y + node.size.height <= bottom
                            );
                        })
                        .map((node) => node.id);

                    selectionActions.selectMultiple(selectedIds);
                }

                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
            }}
            onMouseMove={(e) => {
                const { viewport: vp } = appStore.getState();

                const worldX = (e.clientX - vp.x) / vp.zoom;
                const worldY = (e.clientY - vp.y) / vp.zoom;

                connectionActions.updateMouse(worldX, worldY);
                
                // Broadcast mouse cursor to teammates
                presenceStore.broadcastPresence({ x: worldX, y: worldY });
            }}
            onMouseLeave={() => {
                // Hide our cursor for teammates when leaving canvas
                presenceStore.broadcastPresence(null);
            }}
            onMouseUp={() => {
                connectionActions.stop();
            }}
            style={{
                backgroundPosition: `${viewport.x}px ${viewport.y}px`,
                backgroundSize: `${28 * viewport.zoom}px ${28 * viewport.zoom}px`
            }}
        >
            <EdgeLayer />

            <div
                className="world"
                style={{
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                    transformOrigin: "0 0",
                }}
            >
                {children}

                <Marquee />

                {/* Render Keyboard Marquee Selection Box */}
                {kbMarquee.active && (
                    <div
                        className="keyboard-marquee"
                        style={{
                            position: "absolute",
                            left: kbMarquee.x,
                            top: kbMarquee.y,
                            width: kbMarquee.w,
                            height: kbMarquee.h,
                            border: "2px dashed #dc2626",
                            background: "rgba(220,38,38,0.15)",
                            pointerEvents: "none",
                            zIndex: 10000,
                        }}
                        role="region"
                        aria-label="Keyboard selection marquee box. Use arrow keys to reposition, Shift+Arrows to resize, Enter to select nodes inside, Escape to close."
                    />
                )}
            </div>

            {/* Keyboard Help Overlay */}
            {kbMarquee.active && (
                <div className="keyboard-marquee-tip">
                    🎯 Keyboard Selection: <strong>Arrows</strong> to Move, <strong>Shift + Arrows</strong> to Resize, <strong>Enter</strong> to Select, <strong>Esc</strong> to Cancel
                </div>
            )}
        </div>
    );
}