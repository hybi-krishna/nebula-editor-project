import { appStore } from "./appStore";

export interface Peer {
    id: string;
    name: string;
    color: string;
    cursor: { x: number; y: number } | null;
    selectedNodeIds: string[];
    isMock?: boolean;
}

type Listener = () => void;

let peers: Record<string, Peer> = {};
const listeners = new Set<Listener>();

// Unique info for this tab session
const sessionTabId = sessionStorage.getItem("nebula-tab-id") || crypto.randomUUID();
sessionStorage.setItem("nebula-tab-id", sessionTabId);

const names = ["Astro", "Nova", "Pixel", "Cosmo", "Vector", "Lumen"];
const colors = ["#e11d48", "#2563eb", "#059669", "#7c3aed", "#d97706", "#0891b2"];

const myName = sessionStorage.getItem("nebula-tab-name") || names[Math.floor(Math.random() * names.length)] + " " + Math.floor(Math.random() * 100);
sessionStorage.setItem("nebula-tab-name", myName);

const myColor = sessionStorage.getItem("nebula-tab-color") || colors[Math.floor(Math.random() * colors.length)]!;
sessionStorage.setItem("nebula-tab-color", myColor);

// Flag to prevent loop echoing when replacing states
let isSyncingRemoteState = false;

const channel = typeof window !== "undefined" ? new BroadcastChannel("nebula-collab-v1") : null;

export const presenceStore = {
    getPeers() {
        return peers;
    },

    subscribe(listener: Listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    notify() {
        listeners.forEach((l) => l());
    },

    broadcastPresence(cursor: { x: number; y: number } | null) {
        if (!channel) return;
        const selectedNodeIds = appStore.getState().selection.nodeIds;
        channel.postMessage({
            type: "presence",
            tabId: sessionTabId,
            name: myName,
            color: myColor,
            cursor,
            selectedNodeIds,
        });
    },

    broadcastState() {
        if (isSyncingRemoteState || !channel) return;
        const state = appStore.getState();
        channel.postMessage({
            type: "state-sync",
            tabId: sessionTabId,
            state,
        });
    },

    init() {
        if (!channel) return;

        channel.onmessage = (event) => {
            const data = event.data;
            if (!data || data.tabId === sessionTabId) return;

            if (data.type === "presence") {
                peers = {
                    ...peers,
                    [data.tabId]: {
                        id: data.tabId,
                        name: data.name,
                        color: data.color,
                        cursor: data.cursor,
                        selectedNodeIds: data.selectedNodeIds,
                    },
                };
                this.notify();
            } else if (data.type === "state-sync") {
                isSyncingRemoteState = true;
                appStore.replaceState(data.state);
                isSyncingRemoteState = false;
            }
        };

        // Broadcast presence initially
        this.broadcastPresence(null);

        // Setup Simulated Peers (Alice and Bob) to guarantee presence display even in single-tab mode
        setTimeout(() => {
            // Join Alice and Bob
            peers = {
                ...peers,
                "mock-alice": {
                    id: "mock-alice",
                    name: "Alice (AI Teammate)",
                    color: "#16a34a",
                    cursor: { x: 300, y: 150 },
                    selectedNodeIds: [],
                    isMock: true,
                },
                "mock-bob": {
                    id: "mock-bob",
                    name: "Bob (AI Teammate)",
                    color: "#ea580c",
                    cursor: { x: 100, y: 300 },
                    selectedNodeIds: [],
                    isMock: true,
                },
            };
            this.notify();

            // Simulate Alice and Bob activity
            setInterval(() => {
                const state = appStore.getState();
                const nodeIds = Object.keys(state.nodes);

                const aliceNodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
                const aliceNode = aliceNodeId ? state.nodes[aliceNodeId] : null;
                const aliceX = (aliceNode ? aliceNode.position.x : 400) + (Math.random() * 100 - 50);
                const aliceY = (aliceNode ? aliceNode.position.y : 200) + (Math.random() * 100 - 50);

                const bobNodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
                const bobNode = bobNodeId ? state.nodes[bobNodeId] : null;
                const bobX = (bobNode ? bobNode.position.x : 600) + (Math.random() * 100 - 50);
                const bobY = (bobNode ? bobNode.position.y : 400) + (Math.random() * 100 - 50);

                // Create a brand new peers object so useSyncExternalStore detects
                // a reference change and triggers a re-render for cursor movement.
                peers = {
                    ...peers,
                    "mock-alice": {
                        ...peers["mock-alice"]!,
                        cursor: { x: aliceX, y: aliceY },
                        selectedNodeIds: aliceNode && Math.random() > 0.4 ? [aliceNode.id] : [],
                    },
                    "mock-bob": {
                        ...peers["mock-bob"]!,
                        cursor: { x: bobX, y: bobY },
                        selectedNodeIds: bobNode && Math.random() > 0.4 ? [bobNode.id] : [],
                    },
                };

                this.notify();
            }, 2000);

        }, 1000);
    },
};

// Export active ID and color helper for node rendering overlays
export function getMyPresenceInfo() {
    return { name: myName, color: myColor };
}
