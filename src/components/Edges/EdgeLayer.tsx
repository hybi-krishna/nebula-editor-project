import "./EdgeLayer.css";
import React, { useCallback } from "react";
import { useStore } from "../../store/useStore";
import ConnectionPreview from "./ConnectionPreview";
import { selectionActions } from "../../store/selectionActions";
import { routeEdge } from "../../utils/routeEdge";

interface EdgeItemProps {
    id: string;
    sourceId: string;
    targetId: string;
    sourcePort?: "yes" | "no";
    selected: boolean;
    onSelect: (id: string) => void;
}

const EdgeItem = React.memo(({ id, sourceId, targetId, sourcePort, selected, onSelect }: EdgeItemProps) => {
    const source = useStore((state) => state.nodes[sourceId]);
    const target = useStore((state) => state.nodes[targetId]);

    if (!source || !target) return null;

    let x1 = source.position.x + source.size.width;
    let y1 = source.position.y + source.size.height / 2;

    if (source.type === "decision") {
        if (sourcePort === "yes") {
            y1 = source.position.y + source.size.height * 0.35;
        } else if (sourcePort === "no") {
            y1 = source.position.y + source.size.height * 0.75;
        }
    }

    const x2 = target.position.x;
    const y2 = target.position.y + target.size.height / 2;

    const pathD = routeEdge(x1, y1, x2, y2);

    return (
        <g>
            {/* Invisible hit area */}
            <path
                d={pathD}
                fill="none"
                stroke="transparent"
                strokeWidth={12}
                pointerEvents="stroke"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    onSelect(id);
                }}
            />
            {/* Visible orthogonal segment */}
            <path
                d={pathD}
                fill="none"
                stroke={selected ? "#2563eb" : "#555"}
                strokeWidth={selected ? 4 : 2}
                strokeLinecap="round"
                pointerEvents="none"
                markerEnd={selected ? "url(#arrow-selected)" : "url(#arrow)"}
            />
        </g>
    );
});

EdgeItem.displayName = "EdgeItem";

export default function EdgeLayer() {
    const edgeIds = useStore((state) => Object.keys(state.edges));
    const selectionEdgeIds = useStore((state) => state.selection.edgeIds);
    const edges = useStore((state) => state.edges);
    const viewport = useStore((state) => state.viewport);

    const handleSelectEdge = useCallback((id: string) => {
        selectionActions.selectEdge(id);
    }, []);

    return (
        <svg className="edge-layer">
            <defs>
                <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                >
                    <path d="M 0 2 L 10 5 L 0 8 z" fill="#555" />
                </marker>
                <marker
                    id="arrow-selected"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                >
                    <path d="M 0 2 L 10 5 L 0 8 z" fill="#2563eb" />
                </marker>
            </defs>

            {/* Transform SVG coordinate space to match world camera translation and scale */}
            <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
                {edgeIds.map((id) => {
                    const edge = edges[id];
                    if (!edge) return null;
                    return (
                        <EdgeItem
                            key={id}
                            id={id}
                            sourceId={edge.source}
                            targetId={edge.target}
                            sourcePort={edge.sourcePort}
                            selected={selectionEdgeIds.includes(id)}
                            onSelect={handleSelectEdge}
                        />
                    );
                })}

                <ConnectionPreview />
            </g>
        </svg>
    );
}