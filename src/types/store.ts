import type { DiagramNode } from "./node";
import type { Edge } from "./edge";
import type { Viewport } from "./viewport";
import type { Selection } from "./selection";
import type { ConnectionState } from "./connection";

export interface AppState {
    nodes: Record<string, DiagramNode>;
    edges: Record<string, Edge>;

    viewport: Viewport;

    selection: Selection;

    marquee: MarqueeSelection;

    connection: ConnectionState;
}

export interface MarqueeSelection {
    active: boolean;
    start: {
        x: number;
        y: number;
    };
    end: {
        x: number;
        y: number;
    };
}