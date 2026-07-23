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

export default function DecisionNode({ id }: Props) {
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

    if (!node || node.type !== "decision") return null;
    const decisionNode = node;

    function handleStartEdit(e: React.MouseEvent | React.KeyboardEvent) {
        e.stopPropagation();
        setTitleInput(decisionNode.title);
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
            className={`decision-node ${selected ? "selected" : ""}`}
            tabIndex={0}
            role="group"
            aria-label={`Decision node: ${decisionNode.title}`}
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
                left: decisionNode.position.x,
                top: decisionNode.position.y,
                width: decisionNode.size.width,
                height: decisionNode.size.height,
            }}
        >
            {/* Input Port */}
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

            {/* Yes Output Port */}
            <div
                className="handle output-handle yes-handle"
                role="button"
                aria-label="Yes output connection port"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    connectionActions.start(
                        id,
                        decisionNode.position.x + decisionNode.size.width,
                        decisionNode.position.y + decisionNode.size.height * 0.35,
                        "yes"
                    );
                }}
            />

            {/* No Output Port */}
            <div
                className="handle output-handle no-handle"
                role="button"
                aria-label="No output connection port"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    connectionActions.start(
                        id,
                        decisionNode.position.x + decisionNode.size.width,
                        decisionNode.position.y + decisionNode.size.height * 0.75,
                        "no"
                    );
                }}
            />

            <div className="decision-title">
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
                    <div onDoubleClick={handleStartEdit} className="node-title-text">
                        {decisionNode.title}
                    </div>
                )}
            </div>

            <div className="decision-labels" aria-hidden="true">
                <span>Yes</span>
                <span>No</span>
            </div>

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