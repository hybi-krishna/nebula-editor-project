import { useSyncExternalStore } from "react";
import { presenceStore } from "../store/presenceStore";

export function usePeerSelection(nodeId: string) {
    const peers = useSyncExternalStore(
        presenceStore.subscribe,
        presenceStore.getPeers,
        presenceStore.getPeers
    );
    return Object.values(peers).find((peer) => peer.selectedNodeIds.includes(nodeId));
}
