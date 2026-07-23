import type { DiagramNode } from "../types/node";
import type { Edge } from "../types/edge";

export function generateSeedGraph(count: number): {
    nodes: Record<string, DiagramNode>;
    edges: Record<string, Edge>;
} {
    const nodes: Record<string, DiagramNode> = {};
    const edges: Record<string, Edge> = {};

    const nodeTypes = ["task", "note", "decision"] as const;

    const cols = Math.ceil(Math.sqrt(count));
    const colSpacing = 350;
    const rowSpacing = 250;

    const list: DiagramNode[] = [];

    for (let i = 0; i < count; i++) {
        const id = `seeded-node-${i}`;
        const type = nodeTypes[i % nodeTypes.length]!;
        
        const col = i % cols;
        const row = Math.floor(i / cols);

        const x = col * colSpacing;
        const y = row * rowSpacing;

        let node: DiagramNode;

        if (type === "task") {
            node = {
                id,
                type: "task",
                title: `Task #${i + 1}`,
                completed: i % 2 === 0,
                position: { x, y },
                size: { width: 180, height: 80 },
            };
        } else if (type === "note") {
            node = {
                id,
                type: "note",
                text: `Note #${i + 1}\nDouble-click to edit.\nScroll to zoom.`,
                position: { x, y },
                size: { width: 220, height: 140 },
            };
        } else {
            node = {
                id,
                type: "decision",
                title: `Decision #${i + 1}`,
                position: { x, y },
                size: { width: 180, height: 120 },
            };
        }

        nodes[id] = node;
        list.push(node);
    }

    const edgeCount = Math.floor(count * 1.5);
    let edgeIndex = 0;

    for (let i = 0; i < count && edgeIndex < edgeCount; i++) {
        const source = list[i];
        if (!source) continue;

        // Connect to next column
        if (i + 1 < count && (i % cols) < cols - 1 && edgeIndex < edgeCount) {
            const target = list[i + 1];
            if (target) {
                const edgeId = `seeded-edge-${edgeIndex}`;
                edges[edgeId] = {
                    id: edgeId,
                    source: source.id,
                    target: target.id,
                    sourcePort: source.type === "decision" ? "yes" : undefined,
                };
                edgeIndex++;
            }
        }

        // Connect to next row
        if (i + cols < count && edgeIndex < edgeCount) {
            const target = list[i + cols];
            if (target) {
                const edgeId = `seeded-edge-${edgeIndex}`;
                edges[edgeId] = {
                    id: edgeId,
                    source: source.id,
                    target: target.id,
                    sourcePort: source.type === "decision" ? "no" : undefined,
                };
                edgeIndex++;
            }
        }
    }

    return { nodes, edges };
}
