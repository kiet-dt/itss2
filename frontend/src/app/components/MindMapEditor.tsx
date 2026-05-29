import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  children: string[];
}

interface MindMapEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export function MindMapEditor({ data, onChange }: MindMapEditorProps) {
  const [nodes, setNodes] = useState<Node[]>(() =>
    data?.nodes || [{
      id: '1',
      text: 'Ý tưởng chính',
      x: 400,
      y: 200,
      children: []
    }]
  );
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChange({ nodes });
  }, [nodes, onChange]);

  const addNode = () => {
    if (!selectedNode) return;

    const parentNode = nodes.find(n => n.id === selectedNode);
    if (!parentNode) return;

    const newNode: Node = {
      id: Date.now().toString(),
      text: 'Ý tưởng mới',
      x: parentNode.x + 150,
      y: parentNode.y + 100,
      children: []
    };

    setNodes([...nodes, newNode]);
    setNodes(prev => prev.map(n =>
      n.id === selectedNode
        ? { ...n, children: [...n.children, newNode.id] }
        : n
    ));
  };

  const deleteNode = (id: string) => {
    if (id === '1') return; // Don't delete root
    setNodes(nodes.filter(n => n.id !== id));
    setNodes(prev => prev.map(n => ({
      ...n,
      children: n.children.filter(c => c !== id)
    })));
  };

  const updateNodeText = (id: string, text: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, text } : n));
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const node = nodes.find(n => n.id === id);
    if (!node) return;

    setDragging({
      id,
      offsetX: e.clientX - node.x,
      offsetY: e.clientY - node.y
    });
    setSelectedNode(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;

    setNodes(nodes.map(n =>
      n.id === dragging.id
        ? { ...n, x: e.clientX - dragging.offsetX, y: e.clientY - dragging.offsetY }
        : n
    ));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Toolbar */}
      <div className="h-14 border-b border-border bg-card flex items-center gap-2 px-4">
        <button
          onClick={addNode}
          disabled={!selectedNode}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm nút con
        </button>
        <div className="text-muted-foreground ml-4">
          {selectedNode ? 'Đã chọn node - nhấn "Thêm nút con" để tạo ý tưởng mới' : 'Chọn một node để thêm ý tưởng con'}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-auto cursor-move"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map(node =>
            node.children.map(childId => {
              const child = nodes.find(n => n.id === childId);
              if (!child) return null;
              return (
                <line
                  key={`${node.id}-${childId}`}
                  x1={node.x + 80}
                  y1={node.y + 20}
                  x2={child.x + 80}
                  y2={child.y + 20}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-border"
                />
              );
            })
          )}
        </svg>

        {nodes.map(node => (
          <div
            key={node.id}
            className={`absolute cursor-move ${selectedNode === node.id ? 'ring-2 ring-primary' : ''}`}
            style={{
              left: node.x,
              top: node.y,
              width: '160px'
            }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
          >
            <div className="bg-card border-2 border-border rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow">
              <input
                type="text"
                value={node.text}
                onChange={(e) => updateNodeText(node.id, e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none text-center"
                onClick={(e) => e.stopPropagation()}
              />
              {node.id !== '1' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.id);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
