export interface ConnectionState {
    active: boolean;
    sourceId: string | null;
    sourcePort?: "yes" | "no";
    mouse: {
        x: number;
        y: number;
    };
}