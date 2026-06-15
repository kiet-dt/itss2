import type { Edge, Node } from '@xyflow/react';

type Side = 'top' | 'right' | 'bottom' | 'left';

const DEFAULT_NODE_WIDTH = 140;
const DEFAULT_NODE_HEIGHT = 48;

function getNodeSize(node: Node): { width: number; height: number } {
  return {
    width: node.measured?.width ?? node.width ?? DEFAULT_NODE_WIDTH,
    height: node.measured?.height ?? node.height ?? DEFAULT_NODE_HEIGHT,
  };
}

function getNodeCenter(node: Node): { x: number; y: number } {
  const { width, height } = getNodeSize(node);
  return {
    x: node.position.x + width / 2,
    y: node.position.y + height / 2,
  };
}

function targetHandleForSide(side: Side): string {
  return `${side}-target`;
}

/** Chọn cạnh nối theo hướng tương đối giữa hai node (draw.io-style). */
export function getSmartHandles(
  source: Node,
  target: Node
): { sourceHandle: string; targetHandle: string } {
  const sc = getNodeCenter(source);
  const tc = getNodeCenter(target);
  const dx = tc.x - sc.x;
  const dy = tc.y - sc.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx >= 0) {
      return { sourceHandle: 'right', targetHandle: targetHandleForSide('left') };
    }
    return { sourceHandle: 'left', targetHandle: targetHandleForSide('right') };
  }

  if (dy >= 0) {
    return { sourceHandle: 'bottom', targetHandle: targetHandleForSide('top') };
  }
  return { sourceHandle: 'top', targetHandle: targetHandleForSide('bottom') };
}

export function applySmartHandlesToEdges(nodes: Node[], edges: Edge[]): Edge[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  let changed = false;

  const next = edges.map((edge) => {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (!source || !target) return edge;

    const { sourceHandle, targetHandle } = getSmartHandles(source, target);
    if (edge.sourceHandle === sourceHandle && edge.targetHandle === targetHandle) {
      return edge;
    }
    changed = true;
    return { ...edge, sourceHandle, targetHandle };
  });

  return changed ? next : edges;
}
