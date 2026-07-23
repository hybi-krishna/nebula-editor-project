import { useStore } from "../../store/useStore";

export function Marquee() {
    const marquee = useStore((s) => s.marquee);

    if (!marquee.active) {
        return null;
    }

    const left = Math.min(marquee.start.x, marquee.end.x);
    const top = Math.min(marquee.start.y, marquee.end.y);

    const width = Math.abs(marquee.end.x - marquee.start.x);
    const height = Math.abs(marquee.end.y - marquee.start.y);

    return (
        <div
            style={{
                position: "absolute",
                left,
                top,
                width,
                height,
                border: "1px solid #2563eb",
                background: "rgba(37,99,235,0.15)",
                pointerEvents: "none",
            }}
            role="presentation"
            aria-hidden="true"
        />
    );
}