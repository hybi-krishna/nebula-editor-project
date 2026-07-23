import "./RemoteCursors.css";
import { useSyncExternalStore } from "react";
import { presenceStore } from "../../store/presenceStore";

export default function RemoteCursors() {
    const peers = useSyncExternalStore(
        presenceStore.subscribe,
        presenceStore.getPeers,
        presenceStore.getPeers
    );

    return (
        <>
            {Object.values(peers).map((peer) => {
                if (!peer.cursor) return null;

                return (
                    <div
                        key={peer.id}
                        className="remote-cursor"
                        style={{
                            transform: `translate(${peer.cursor.x}px, ${peer.cursor.y}px)`,
                        }}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill={peer.color}
                            stroke="white"
                            strokeWidth="2"
                            className="cursor-icon"
                        >
                            <path d="M4.5 3V17L9 12.5H16.5L4.5 3Z" />
                        </svg>
                        <div
                            className="remote-cursor-label"
                            style={{ backgroundColor: peer.color }}
                        >
                            {peer.name}
                        </div>
                    </div>
                );
            })}
        </>
    );
}
