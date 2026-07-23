export type NodeType = "task" | "note" | "decision";

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface BaseNode {
    id: string;
    type: NodeType;
    position: Position;
    size: Size;
}

export interface TaskNode extends BaseNode {
    type: "task";
    title: string;
    completed: boolean;
}

export interface NoteNode extends BaseNode {
    type: "note";
    text: string;
}

export interface DecisionNode extends BaseNode {
    type: "decision";
    title: string;
}

export type DiagramNode =
    | TaskNode
    | NoteNode
    | DecisionNode;