import "./Node.css";
import { useState, useRef, useEffect } from "react";
import { useNodeDrag } from "../../hooks/useNodeDrag";
import { selectionActions } from "../../store/selectionActions";
import { useStore } from "../../store/useStore";
import { connectionActions } from "../../store/connectionActions";
import { actions } from "../../store/actions";
import { historyActions } from "../../store/historyActions";
import { useNodeResize } from "../../hooks/useNodeResize";
import { nodeActions } from "../../store/nodeActions";
import { usePeerSelection } from "../../hooks/usePeerSelection";

interface Props {
    id: string;
}

export default function NoteNode({ id }: Props) {
    const node = useStore((state) => state.nodes[id]);
    const selected = useStore((state) => state.selection.nodeIds.includes(id));
    const { onMouseDown } = useNodeDrag(id);
    const resize = useNodeResize(id);
    const peer = usePeerSelection(id);

    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (editing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [editing]);

    if (!node || node.type !== "note") return null;
    const noteNode = node;

    function handleStartEdit(e: React.MouseEvent | React.KeyboardEvent) {
        e.stopPropagation();
        setDraft(noteNode.text);
        setEditing(true);
    }

    function saveNote() {
        if (draft !== noteNode.text) {
            historyActions.begin();
            actions.updateNoteText(id, draft);
            historyActions.end("Edit Note Text");
        }
        setEditing(false);
    }

    return (
        <div
            className={`note-node ${selected ? "selected" : ""}`}
            tabIndex={0}
            role="group"
            aria-label={`Note node: ${noteNode.text}`}
            aria-selected={selected}
            onMouseDown={(e) => {
                if (editing) return;

                if (e.ctrlKey || e.metaKey || e.shiftKey) {
                    selectionActions.toggle(id);
                } else {
                    selectionActions.selectSingle(id);
                }

                onMouseDown(e);
            }}
            onKeyDown={(e) => {
                if (editing) return;
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
                left: noteNode.position.x,
                top: noteNode.position.y,
                width: noteNode.size.width,
                height: noteNode.size.height,
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

            {/* Output Port */}
            <div
                className="handle output-handle"
                role="button"
                aria-label="Output connection port"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    connectionActions.start(
                        id,
                        noteNode.position.x + noteNode.size.width,
                        noteNode.position.y + noteNode.size.height / 2
                    );
                }}
            />

            {editing ? (
                <textarea
                    ref={textareaRef}
                    className="note-editor"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={saveNote}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            setEditing(false);
                        } else if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            saveNote();
                        }
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                />
            ) : (
                <div
                    className="note-text"
                    onDoubleClick={handleStartEdit}
                >
                    {noteNode.text}
                </div>
            )}

            <div
                className="resize-handle"
                role="button"
                aria-label="Resize node"
                onMouseDown={resize.onMouseDown}
            />

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