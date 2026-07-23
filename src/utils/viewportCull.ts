import type { DiagramNode } from "../types/node";
import type { Viewport } from "../types/viewport";

export function cullNodes(
    nodes: Record<string, DiagramNode>,
    viewport: Viewport,
    width = window.innerWidth,
    height = window.innerHeight
): string[] {
    const visibleIds: string[] = [];
    
    // Translate screen coords to world coords
    const left = -viewport.x / viewport.zoom;
    const top = -viewport.y / viewport.zoom;
    const right = (width - viewport.x) / viewport.zoom;
    const bottom = (height - viewport.y) / viewport.zoom;

    // Overscan buffer (in world pixels) to prevent sudden pop-ins during fast panning
    const buffer = 150;

    const bufferedLeft = left - buffer;
    const bufferedRight = right + buffer;
    const bufferedTop = top - buffer;
    const bufferedBottom = bottom + buffer;

    const keys = Object.keys(nodes);
    for (let i = 0; i < keys.length; i++) {
        const id = keys[i];
        if (!id) continue;
        const node = nodes[id];
        if (!node) continue;

        const nodeLeft = node.position.x;
        const nodeRight = node.position.x + node.size.width;
        const nodeTop = node.position.y;
        const nodeBottom = node.position.y + node.size.height;

        const isVisible =
            nodeRight >= bufferedLeft &&
            nodeLeft <= bufferedRight &&
            nodeBottom >= bufferedTop &&
            nodeTop <= bufferedBottom;

        if (isVisible) {
            visibleIds.push(node.id);
        }
    }

    return visibleIds;
}
