import { useStore } from "../../store/useStore";
import { routeEdge } from "../../utils/routeEdge";

export default function ConnectionPreview() {
    const connectionActive = useStore((s) => s.connection.active);
    const connectionSourceId = useStore((s) => s.connection.sourceId);
    const connectionSourcePort = useStore((s) => s.connection.sourcePort);
    const mouse = useStore((s) => s.connection.mouse);

    const source = useStore((s) => connectionSourceId ? s.nodes[connectionSourceId] : undefined);

    if (!connectionActive || !connectionSourceId || !source) {
        return null;
    }

    let x1 = source.position.x + source.size.width;
    let y1 = source.position.y + source.size.height / 2;

    if (source.type === "decision") {
        if (connectionSourcePort === "yes") {
            y1 = source.position.y + source.size.height * 0.35;
        } else if (connectionSourcePort === "no") {
            y1 = source.position.y + source.size.height * 0.75;
        }
    }

    const x2 = mouse.x;
    const y2 = mouse.y;

    const pathD = routeEdge(x1, y1, x2, y2);

    return (
        <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="6 4"
        />
    );
}