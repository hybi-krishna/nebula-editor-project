import "./Toolbar.css";
import { actions } from "../../store/actions";
import { useStore } from "../../store/useStore";
import { historyActions } from "../../store/historyActions";
import { presenceStore } from "../../store/presenceStore";

export default function Toolbar() {
    const state = useStore();
    
    // Subscribe to history to enable/disable undo/redo buttons
    const tree = useStore(() => historyActions.getTree());
    const currentNode = tree.nodes[tree.currentId];
    const canUndo = !!(currentNode && currentNode.parentId);
    const canRedo = !!(currentNode && currentNode.childIds.length > 0);

    // Subscribe to presence to show multiplayer count
    const peers = useStore(() => presenceStore.getPeers());
    const activePeersCount = Object.keys(peers).length;

    function addTask() {
        historyActions.begin();

        const count = Object.keys(state.nodes).length;

        const newNode = {
            id: crypto.randomUUID(),
            type: "task" as const,
            title: `Task ${count + 1}`,
            completed: false,
            position: {
                x: count * 50 + 100,
                y: count * 50 + 100,
            },
            size: {
                width: 180,
                height: 80,
            },
        };

        actions.addNode(newNode);

        historyActions.end("Add Task Node");
    }

    function addNote() {
        historyActions.begin();

        const count = Object.keys(state.nodes).length;

        const newNode = {
            id: crypto.randomUUID(),
            type: "note" as const,
            text: "Double-click to write...",
            position: {
                x: count * 50 + 100,
                y: count * 50 + 100,
            },
            size: {
                width: 220,
                height: 140,
            },
        };

        actions.addNode(newNode);

        historyActions.end("Add Note Node");
    }

    function addDecision() {
        historyActions.begin();

        const count = Object.keys(state.nodes).length;

        const newNode = {
            id: crypto.randomUUID(),
            type: "decision" as const,
            title: `Decision ${count + 1}`,
            position: {
                x: count * 50 + 100,
                y: count * 50 + 100,
            },
            size: {
                width: 180,
                height: 120,
            },
        };

        actions.addNode(newNode);

        historyActions.end("Add Decision Node");
    }

    return (
        <div className="toolbar" role="toolbar" aria-label="Editor node creation toolbar">
            <div className="toolbar-section">
                <button onClick={addTask} aria-label="Add new Task Node">＋ Task</button>
                <button onClick={addNote} aria-label="Add new Note Node">＋ Note</button>
                <button onClick={addDecision} aria-label="Add new Decision Node">＋ Decision</button>
            </div>
            
            <div className="toolbar-divider" />
            
            <div className="toolbar-section">
                <button 
                    onClick={() => historyActions.undo()} 
                    disabled={!canUndo}
                    aria-label="Undo last action"
                    title="Undo (Ctrl+Z)"
                >
                    ↩ Undo
                </button>
                <button 
                    onClick={() => historyActions.redo()} 
                    disabled={!canRedo}
                    aria-label="Redo last action"
                    title="Redo (Ctrl+Shift+Z)"
                >
                    ↪ Redo
                </button>
            </div>

            {activePeersCount > 0 && (
                <>
                    <div className="toolbar-divider" />
                    <div className="toolbar-presence-badge" aria-label="Number of active users in room">
                        👥 {activePeersCount + 1} online
                    </div>
                </>
            )}
        </div>
    );
}