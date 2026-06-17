import { memo, useState, useCallback, useEffect, Fragment } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

export type MindmapNodeData = {
  label: string;
  color?: string;
  onLabelChange?: (id: string, label: string) => void;
};

const SIDES = [
  { id: 'top', position: Position.Top, className: 'mindmap-connect-top' },
  { id: 'right', position: Position.Right, className: 'mindmap-connect-right' },
  { id: 'bottom', position: Position.Bottom, className: 'mindmap-connect-bottom' },
  { id: 'left', position: Position.Left, className: 'mindmap-connect-left' },
] as const;

function EditableNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as MindmapNodeData;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(nodeData.label);

  useEffect(() => {
    setText(nodeData.label);
  }, [nodeData.label]);

  const commit = useCallback(() => {
    setEditing(false);
    nodeData.onLabelChange?.(id, text);
  }, [id, text, nodeData]);

  return (
    <div className={`mindmap-node group ${selected ? 'mindmap-node--connectors' : ''}`}>
      <div
        className={`mindmap-node__body min-w-[120px] max-w-[220px] px-3 py-2 rounded-lg border-2 shadow-md transition-shadow ${
          selected ? 'ring-2 ring-primary/40 shadow-lg' : ''
        }`}
        style={{
          backgroundColor: nodeData.color ? `${nodeData.color}18` : undefined,
          borderColor: nodeData.color || 'var(--border)',
        }}
        onDoubleClick={() => setEditing(true)}
      >
        {SIDES.map(({ id: handleId, position, className }) => (
          <Fragment key={handleId}>
            <Handle
              id={handleId}
              type="source"
              position={position}
              className={`mindmap-connect ${className}`}
              isConnectable
            />
            <Handle
              id={`${handleId}-target`}
              type="target"
              position={position}
              className="mindmap-connect-target"
              isConnectable
            />
          </Fragment>
        ))}

        {editing ? (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') { setText(nodeData.label); setEditing(false); }
            }}
            className="w-full bg-transparent text-sm text-center focus:outline-none nodrag"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="text-sm text-center font-medium break-words leading-snug text-foreground">{nodeData.label}</div>
        )}
      </div>
    </div>
  );
}

export const EditableNode = memo(EditableNodeComponent);

export const mindmapNodeTypes = { editable: EditableNode };
