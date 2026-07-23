import "./Node.css";
import { useState, useRef, useEffect } from "react";
import { useNodeDrag } from "../../hooks/useNodeDrag";
import { selectionActions } from "../../store/selectionActions";
import { useStore } from "../../store/useStore";
import { connectionActions } from "../../store/connectionActions";
import { nodeActions } from "../../store/nodeActions";
import { usePeerSelection } from "../../hooks/usePeerSelection";

interface Props {
    id: string;
}

export default function TaskNode({ id }: Props) {
    const node = useStore((state) => state.nodes[id]);
    const selected = useStore((state) => state.selection.nodeIds.includes(id));
    const { onMouseDown } = useNodeDrag(id);
    const peer = usePeerSelection(id);

    const [isEditing, setIsEditing] = useState(false);
    const [titleInput, setTitleInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    if (!node || node.type !== "task") return null;
    const taskNode = node;

    function handleStartEdit(e: React.MouseEvent | React.KeyboardEvent) {
        e.stopPropagation();
        setTitleInput(taskNode.title);
        setIsEditing(true);
    }

    function handleSaveEdit() {
        if (titleInput.trim()) {
            nodeActions.updateNodeTitle(id, titleInput.trim());
        }
        setIsEditing(false);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            handleSaveEdit();
        } else if (e.key === "Escape") {
            setIsEditing(false);
        }
    }

    return (
        <div
            className={`task-node ${selected ? "selected" : ""}`}
            tabIndex={0}
            role="group"
            aria-label={`Task node: ${taskNode.title}, ${taskNode.completed ? "completed" : "incomplete"}`}
            aria-selected={selected}
            onMouseDown={(e) => {
                if (e.ctrlKey || e.metaKey || e.shiftKey) {
                    selectionActions.toggle(id);
                } else {
                    selectionActions.selectSingle(id);
                }
                onMouseDown(e);
            }}
            onKeyDown={(e) => {
                if (isEditing) return;
                if (e.key === "Enter") {
                    handleStartEdit(e);
                } else if (e.key === " ") {
                    e.preventDefault();
                    nodeActions.toggleTaskCompleted(id);
                } else if (e.key === "Delete" || e.key === "Backspace") {
                    e.preventDefault();
                    nodeActions.deleteSelected();
                } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    nodeActions.moveNodes([id], -10, 0);
                } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    nodeActions.moveNodes([id], 10, 0);
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    nodeActions.moveNodes([id], 0, -10);
                } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    nodeActions.moveNodes([id], 0, 10);
                }
            }}
            style={{
                left: taskNode.position.x,
                top: taskNode.position.y,
                width: taskNode.size.width,
                height: taskNode.size.height,
            }}
        >
            <div
                className="handle input-handle"
                role="button"
                aria-label="Input connection port"
                onMouseDown={(e) => {
                    e.stopPropagation();
                }}
                onMouseUp={(e) => {
                    e.stopPropagation();
                    connectionActions.stop(id);
                }}
            />
            <div
                className="handle output-handle"
                role="button"
                aria-label="Output connection port"
                onMouseDown={(e) => {
                    e.stopPropagation();

                    const worldX = taskNode.position.x + taskNode.size.width;
                    const worldY = taskNode.position.y + taskNode.size.height / 2;

                    connectionActions.start(
                        id,
                        worldX,
                        worldY
                    );
                }}
            />

            <input
                type="checkbox"
                checked={taskNode.completed}
                onChange={() => nodeActions.toggleTaskCompleted(id)}
                onMouseDown={(e) => e.stopPropagation()}
                tabIndex={-1}
                aria-label="Task completion status"
            />

            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={handleKeyDown}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="title-editor"
                />
            ) : (
                <span onDoubleClick={handleStartEdit} className="node-title-text">
                    {taskNode.title}
                </span>
            )}

            {peer && (
                <div 
                    className="peer-selected-ring" 
                    style={{ "--peer-color": peer.color } as React.CSSProperties}
                >
                    <div className="peer-selected-badge">{peer.name}</div>
                </div>
            )}
        </div>
    );
}