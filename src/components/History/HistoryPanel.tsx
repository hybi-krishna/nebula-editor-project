import "./HistoryPanel.css";
import { useState, useRef, useEffect } from "react";
import { historyActions } from "../../store/historyActions";
import { useStore } from "../../store/useStore";

export default function HistoryPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    
    // Subscribe to state changes so the panel re-renders when history tree commits/undos
    const tree = useStore(() => {
        return historyActions.getTree();
    });

    // useEffect is required to register a document-level mousedown listener for click-outside detection.
    // This cannot be an event handler on the panel itself because clicks outside the panel do not bubble
    // to it. It cannot be derived state because detecting an external DOM click is an imperative side effect.
    // The listener is conditionally registered only while the panel is open to avoid unnecessary overhead.
    useEffect(() => {
        if (!isOpen) return;

        function onMouseDown(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", onMouseDown);
        return () => document.removeEventListener("mousedown", onMouseDown);
    }, [isOpen]);

    if (!isOpen) {
        return (
            <button 
                className="history-toggle-btn"
                onClick={() => setIsOpen(true)}
                aria-label="Open History Tree Panel"
            >
                ⏳ History Tree
            </button>
        );
    }

    const { nodes, currentId, rootId } = tree;

    function renderNode(nodeId: string, depth: number): React.ReactNode {
        const node = nodes[nodeId];
        if (!node) return null;

        const isCurrent = nodeId === currentId;

        return (
            <div key={nodeId} className="history-node-wrapper">
                <button
                    className={`history-node-btn ${isCurrent ? "current" : ""}`}
                    onClick={() => historyActions.switchBranch(nodeId)}
                    aria-label={`Jump to history state: ${node.label}`}
                >
                    <span className="history-node-dot" />
                    <span className="history-node-label">{node.label}</span>
                </button>
                {node.childIds.length > 0 && (
                    <div className="history-node-children" style={{ marginLeft: "10px" }}>
                        {node.childIds.map((childId) => renderNode(childId, depth + 1))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div ref={panelRef} className="history-panel" role="complementary" aria-label="Branching history panel">
            <div className="history-panel-header">
                <h3>Undo Tree</h3>
                <button onClick={() => setIsOpen(false)} aria-label="Close History Tree Panel">×</button>
            </div>
            <div className="history-panel-content">
                {renderNode(rootId, 0)}
            </div>
        </div>
    );
}
