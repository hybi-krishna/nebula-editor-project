export interface Edge {
    id: string;
    source: string;
    target: string;
    sourcePort?: "yes" | "no";
}