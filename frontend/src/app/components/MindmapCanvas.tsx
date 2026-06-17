import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  getViewportForBounds,
  ConnectionMode,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../../styles/mindmap.css';
import { toPng } from 'html-to-image';
import { Plus, Copy, Clipboard, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { EditableNode, mindmapNodeTypes } from './mindmap/EditableNode';
import { MindmapToolbar } from './mindmap/MindmapToolbar';
import {
  buildDefaultMindmap,
  syncCenterNode,
  MINDMAP_TEMPLATES,
} from '../../lib/mindmapTemplates';
import { DEFAULT_NODE_COLOR, normalizeHex } from '../../lib/mindmapPalette';
import { applySmartHandlesToEdges, getSmartHandles } from '../../lib/mindmapSmartEdges';
import type { MindmapFlowData } from '../../types/session';
import { useAppDarkMode } from '../../hooks/useAppDarkMode';

type FlowDragEvent = MouseEvent | TouchEvent;
type FlowPointerEvent = MouseEvent | ReactMouseEvent;

interface MindmapCanvasProps {
  problemStatement: string;
  data: MindmapFlowData | null;
  onChange: (data: MindmapFlowData) => void;
  isActive?: boolean;
}

type HistoryState = { nodes: Node[]; edges: Edge[] };

type ClipboardPayload = {
  nodes: Array<{ label: string; color?: string; offset: { x: number; y: number } }>;
  edges: Array<{ source: number; target: number; sourceHandle?: string | null; targetHandle?: string | null }>;
};

type ContextMenuState = {
  x: number;
  y: number;
  nodeId?: string;
  edgeId?: string;
};

const EDGE_COLOR = '#94a3b8';
const EDGE_COLOR_SELECTED = '#2563eb';

const mindmapEdgeDefaults = {
  type: 'smoothstep' as const,
  selectable: true,
  interactionWidth: 24,
  pathOptions: { borderRadius: 12, offset: 20 },
  style: { stroke: EDGE_COLOR, strokeWidth: 2 },
};

function styleMindmapEdge<T extends Edge | Connection>(edge: T): T {
  return {
    ...edge,
    type: 'smoothstep',
    markerEnd: undefined,
    pathOptions: mindmapEdgeDefaults.pathOptions,
    style: mindmapEdgeDefaults.style,
  };
}

function flowToData(nodes: Node[], edges: Edge[]): MindmapFlowData {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: { label: (n.data as { label: string }).label, color: (n.data as { color?: string }).color },
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle ?? null,
      targetHandle: e.targetHandle ?? null,
      type: e.type,
    })),
  };
}

function dataToFlow(
  data: MindmapFlowData | null,
  problem: string,
  onLabelChange: (id: string, label: string) => void
): { nodes: Node[]; edges: Edge[] } {
  const source = data?.nodes?.length
    ? syncCenterNode(data, problem)
    : buildDefaultMindmap(problem);

  const nodes: Node[] = source.nodes.map((n) => ({
    id: n.id,
    type: 'editable',
    position: n.position,
    data: { label: n.data.label, color: n.data.color, onLabelChange },
  }));
  const edges: Edge[] = applySmartHandlesToEdges(
    nodes,
    source.edges.map((e) =>
      styleMindmapEdge({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? undefined,
        targetHandle: e.targetHandle ?? undefined,
        type: e.type ?? 'smoothstep',
        animated: false,
      } as Edge)
    )
  );
  return { nodes, edges };
}

function MindmapCanvasInner({ problemStatement, data, onChange, isActive = true }: MindmapCanvasProps) {
  const isDark = useAppDarkMode();
  const flowWrapperRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const { zoomIn, zoomOut, fitView, screenToFlowPosition, getNodesBounds, getViewport, setViewport, getNodes } = useReactFlow();
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_NODE_COLOR);
  const clipboardRef = useRef<ClipboardPayload | null>(null);
  const [hasClipboard, setHasClipboard] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const historyRef = useRef<HistoryState[]>([]);
  const historyIndexRef = useRef(-1);
  const historyBootstrappedRef = useRef(false);
  const skipHistoryRef = useRef(false);
  const pointerFlowRef = useRef<{ x: number; y: number } | null>(null);

  const trackPointer = useCallback(
    (e: FlowPointerEvent) => {
      pointerFlowRef.current = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    },
    [screenToFlowPosition]
  );

  const getPasteAnchor = useCallback(
    (screenPoint?: { x: number; y: number }) => {
      if (screenPoint) {
        return screenToFlowPosition(screenPoint);
      }
      if (pointerFlowRef.current) {
        return pointerFlowRef.current;
      }
      const wrapper = flowWrapperRef.current;
      if (wrapper) {
        const rect = wrapper.getBoundingClientRect();
        return screenToFlowPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
      return { x: 120, y: 120 };
    },
    [screenToFlowPosition]
  );

  const initial = dataToFlow(data, problemStatement, () => {});
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [activeEdgeId, setActiveEdgeId] = useState<string | null>(null);

  const displayEdges = useMemo(
    () =>
      edges.map((e) => {
        const highlighted = activeEdgeId === e.id;
        return {
          ...e,
          selected: highlighted,
          zIndex: highlighted ? 1000 : 0,
          className: highlighted ? 'mindmap-edge-selected' : undefined,
          style: {
            stroke: highlighted ? EDGE_COLOR_SELECTED : EDGE_COLOR,
            strokeWidth: highlighted ? 4 : 2,
          },
        };
      }),
    [edges, activeEdgeId]
  );

  const onLabelChange = useCallback((id: string, label: string) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n)));
  }, [setNodes]);

  const scheduleFitView = useCallback(() => {
    requestAnimationFrame(() => {
      fitView({ padding: 0.25, duration: 300 });
    });
  }, [fitView]);

  const pushHistory = useCallback((ns: Node[], es: Edge[]) => {
    if (skipHistoryRef.current) return;
    const snap = { nodes: JSON.parse(JSON.stringify(ns)), edges: JSON.parse(JSON.stringify(es)) };
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(snap);
    if (historyRef.current.length > 40) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  useEffect(() => {
    if (historyBootstrappedRef.current) return;
    historyBootstrappedRef.current = true;
    pushHistory(initial.nodes, initial.edges);
  }, [initial.edges, initial.nodes, pushHistory]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, onLabelChange },
      }))
    );
  }, [onLabelChange, setNodes]);

  const selectedNodesRef = useRef(selectedNodes);
  selectedNodesRef.current = selectedNodes;
  const prevSelectionRef = useRef<string[]>([]);
  const colorApplyRafRef = useRef<number | null>(null);
  const pendingNodeColorRef = useRef<string | null>(null);
  const colorDraggingRef = useRef(false);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  useEffect(() => {
    if (colorDraggingRef.current) return;
    const id = window.setTimeout(() => {
      if (colorDraggingRef.current) return;
      onChangeRef.current(flowToData(nodes, edges));
    }, 250);
    return () => clearTimeout(id);
  }, [nodes, edges]);

  useEffect(() => {
    if (!isActive) return;
    scheduleFitView();
  }, [isActive, scheduleFitView]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== 'center') return n;
        return {
          ...n,
          data: {
            ...n.data,
            label: problemStatement.trim() || 'Vấn đề cần giải quyết',
            onLabelChange,
          },
        };
      })
    );
  }, [problemStatement, setNodes, onLabelChange]);

  const syncHandlesFromDrag = useCallback(
    (movedNodes: Node[]) => {
      const movedMap = new Map(movedNodes.map((n) => [n.id, n]));
      const merged = getNodes().map((n) => {
        const moved = movedMap.get(n.id);
        return moved ? { ...n, position: moved.position } : n;
      });
      setEdges((eds) => applySmartHandlesToEdges(merged, eds));
    },
    [getNodes, setEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);
      const handles =
        sourceNode && targetNode ? getSmartHandles(sourceNode, targetNode) : {};

      setEdges((eds) => {
        const next = addEdge(
          styleMindmapEdge({
            ...params,
            ...handles,
          }),
          eds
        );
        pushHistory(nodes, next);
        return next;
      });
      toast.success('Đã nối 2 node');
    },
    [nodes, pushHistory, setEdges]
  );

  const onNodeDrag = useCallback(
    (_: FlowDragEvent, _node: Node, draggedNodes: Node[]) => {
      syncHandlesFromDrag(draggedNodes);
    },
    [syncHandlesFromDrag]
  );

  const onNodeDragStop = useCallback(
    (_: FlowDragEvent, _node: Node, draggedNodes: Node[]) => {
      const movedMap = new Map(draggedNodes.map((n) => [n.id, n]));
      const merged = getNodes().map((n) => {
        const moved = movedMap.get(n.id);
        return moved ? { ...n, position: moved.position } : n;
      });
      setEdges((eds) => {
        const next = applySmartHandlesToEdges(merged, eds);
        pushHistory(merged, next);
        return next;
      });
    },
    [getNodes, pushHistory, setEdges]
  );

  const onSelectionDrag = useCallback(
    (_: ReactMouseEvent, draggedNodes: Node[]) => {
      syncHandlesFromDrag(draggedNodes);
    },
    [syncHandlesFromDrag]
  );

  const onSelectionDragStop = useCallback(
    (_: ReactMouseEvent, draggedNodes: Node[]) => {
      const movedMap = new Map(draggedNodes.map((n) => [n.id, n]));
      const merged = getNodes().map((n) => {
        const moved = movedMap.get(n.id);
        return moved ? { ...n, position: moved.position } : n;
      });
      setEdges((eds) => {
        const next = applySmartHandlesToEdges(merged, eds);
        pushHistory(merged, next);
        return next;
      });
    },
    [getNodes, pushHistory, setEdges]
  );

  const addNode = useCallback(() => {
    const id = `node-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'editable',
      position: { x: 200 + Math.random() * 200, y: 150 + Math.random() * 150 },
      data: { label: 'Node mới', color: selectedColor, onLabelChange },
    };
    setNodes((nds) => {
      const next = [...nds, newNode];
      pushHistory(next, edges);
      return next;
    });
    scheduleFitView();
    toast.success('Đã thêm node');
  }, [edges, onLabelChange, pushHistory, selectedColor, setNodes, scheduleFitView]);

  const deleteSelected = useCallback(() => {
    const nodeIds = selectedNodes.filter((id) => id !== 'center');
    const edgeIds = activeEdgeId ? [activeEdgeId] : [];

    if (!nodeIds.length && !edgeIds.length) {
      toast.info('Chọn node hoặc đường nối để xóa');
      return;
    }

    if (nodeIds.length === 0 && selectedNodes.includes('center') && edgeIds.length === 0) {
      toast.info('Không thể xóa node trung tâm');
      return;
    }

    setNodes((nds) => {
      const nextNodes = nodeIds.length ? nds.filter((n) => !nodeIds.includes(n.id)) : nds;
      setEdges((eds) => {
        const nextEdges = eds.filter(
          (e) =>
            !edgeIds.includes(e.id) &&
            !nodeIds.includes(e.source) &&
            !nodeIds.includes(e.target)
        );
        pushHistory(nextNodes, nextEdges);
        return nextEdges;
      });
      return nextNodes;
    });
    setSelectedNodes([]);
    setActiveEdgeId(null);
    toast.success(edgeIds.length && !nodeIds.length ? 'Đã xóa đường nối' : 'Đã xóa');
  }, [selectedNodes, activeEdgeId, pushHistory, setNodes, setEdges]);

  const copySelection = useCallback(() => {
    const idSet = new Set(selectedNodes.filter((id) => id !== 'center'));
    const selNodes = nodes.filter((n) => idSet.has(n.id));
    if (!selNodes.length) {
      toast.info('Chọn node để copy (Ctrl+C)');
      return;
    }

    const idToIndex = new Map(selNodes.map((n, i) => [n.id, i]));
    const minX = Math.min(...selNodes.map((n) => n.position.x));
    const minY = Math.min(...selNodes.map((n) => n.position.y));
    const selEdges = edges.filter((e) => idToIndex.has(e.source) && idToIndex.has(e.target));

    clipboardRef.current = {
      nodes: selNodes.map((n) => ({
        label: (n.data as { label: string }).label,
        color: (n.data as { color?: string }).color,
        offset: { x: n.position.x - minX, y: n.position.y - minY },
      })),
      edges: selEdges.map((e) => ({
        source: idToIndex.get(e.source)!,
        target: idToIndex.get(e.target)!,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      })),
    };
    setHasClipboard(true);
    toast.success(`Đã copy ${selNodes.length} node${selEdges.length ? `, ${selEdges.length} đường` : ''}`);
  }, [selectedNodes, nodes, edges]);

  const pasteClipboard = useCallback(
    (screenPoint?: { x: number; y: number }) => {
      const clip = clipboardRef.current;
      if (!clip?.nodes.length) {
        toast.info('Chưa có gì để dán (Ctrl+V)');
        return;
      }

      const anchor = getPasteAnchor(screenPoint);
      const ts = Date.now();
      const newNodes: Node[] = clip.nodes.map((n, i) => ({
        id: `node-${ts}-${i}`,
        type: 'editable',
        position: { x: anchor.x + n.offset.x, y: anchor.y + n.offset.y },
        data: { label: n.label, color: n.color, onLabelChange },
      }));
      const newEdges: Edge[] = applySmartHandlesToEdges(
        newNodes,
        clip.edges.map((e, i) =>
          styleMindmapEdge({
            id: `e-${ts}-${i}`,
            source: newNodes[e.source].id,
            target: newNodes[e.target].id,
          } as Edge)
        )
      );

      setNodes((nds) => {
        const nextNodes = [...nds, ...newNodes];
        setEdges((eds) => {
          const nextEdges = applySmartHandlesToEdges(nextNodes, [...eds, ...newEdges]);
          pushHistory(nextNodes, nextEdges);
          return nextEdges;
        });
        return nextNodes;
      });
      toast.success(`Đã dán ${newNodes.length} node`);
    },
    [getPasteAnchor, onLabelChange, pushHistory, setNodes, setEdges]
  );

  const deleteEdgeById = useCallback(
    (edgeId: string) => {
      setEdges((eds) => {
        const next = eds.filter((e) => e.id !== edgeId);
        pushHistory(nodes, next);
        return next;
      });
      setActiveEdgeId((id) => (id === edgeId ? null : id));
      toast.success('Đã xóa đường nối');
    },
    [nodes, pushHistory, setEdges]
  );

  useEffect(() => {
    if (!isActive) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;

      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copySelection();
      }
      if (mod && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteClipboard();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isActive, copySelection, pasteClipboard]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) {
      toast.info('Không có gì để hoàn tác');
      return;
    }
    historyIndexRef.current -= 1;
    const snap = historyRef.current[historyIndexRef.current];
    skipHistoryRef.current = true;
    setNodes(snap.nodes);
    setEdges(applySmartHandlesToEdges(snap.nodes, snap.edges.map((e) => styleMindmapEdge(e as Edge))));
    skipHistoryRef.current = false;
    toast.success('Đã hoàn tác');
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) {
      toast.info('Không có gì để làm lại');
      return;
    }
    historyIndexRef.current += 1;
    const snap = historyRef.current[historyIndexRef.current];
    skipHistoryRef.current = true;
    setNodes(snap.nodes);
    setEdges(applySmartHandlesToEdges(snap.nodes, snap.edges.map((e) => styleMindmapEdge(e as Edge))));
    skipHistoryRef.current = false;
    toast.success('Đã làm lại');
  }, [setNodes, setEdges]);

  const applyTemplate = useCallback(
    (name: string) => {
      const builder = MINDMAP_TEMPLATES[name];
      if (!builder) return;
      const built = builder(problemStatement);
      const flowNodes: Node[] = built.nodes.map((n) => ({
        id: n.id,
        type: 'editable',
        position: n.position,
        data: { label: n.data.label, color: n.data.color, onLabelChange },
      }));
      const flowEdges: Edge[] = applySmartHandlesToEdges(
        flowNodes,
        built.edges.map((e) =>
          styleMindmapEdge({
            id: e.id,
            source: e.source,
            target: e.target,
            animated: false,
          } as Edge)
        )
      );
      setNodes(flowNodes);
      setEdges(flowEdges);
      pushHistory(flowNodes, flowEdges);
      scheduleFitView();
      toast.success(`Đã áp dụng: ${name}`);
    },
    [problemStatement, onLabelChange, setNodes, setEdges, pushHistory, scheduleFitView]
  );

  const applyColorToNodes = useCallback((nds: Node[], color: string, ids: string[]) => {
    if (!ids.length) return nds;
    const idSet = new Set(ids);
    let changed = false;
    const next = nds.map((n) => {
      if (!idSet.has(n.id)) return n;
      const d = n.data as { label: string; color?: string };
      if (d.color === color) return n;
      changed = true;
      return { ...n, data: { ...n.data, color } };
    });
    return changed ? next : nds;
  }, []);

  const previewNodeColor = useCallback(
    (color: string) => {
      colorDraggingRef.current = true;
      const normalized = normalizeHex(color);
      setSelectedColor(normalized);

      if (!selectedNodesRef.current.length) return;

      pendingNodeColorRef.current = normalized;
      if (colorApplyRafRef.current != null) return;

      colorApplyRafRef.current = requestAnimationFrame(() => {
        colorApplyRafRef.current = null;
        const nextColor = pendingNodeColorRef.current;
        if (!nextColor || !selectedNodesRef.current.length) return;

        setNodes((nds) => applyColorToNodes(nds, nextColor, selectedNodesRef.current));
      });
    },
    [applyColorToNodes, setNodes]
  );

  const commitNodeColor = useCallback(
    (color: string) => {
      colorDraggingRef.current = false;
      if (colorApplyRafRef.current != null) {
        cancelAnimationFrame(colorApplyRafRef.current);
        colorApplyRafRef.current = null;
      }

      const normalized = normalizeHex(color);
      setSelectedColor(normalized);
      if (!selectedNodesRef.current.length) return;

      setNodes((nds) => {
        const next = applyColorToNodes(nds, normalized, selectedNodesRef.current);
        if (next !== nds) {
          nodesRef.current = next;
          onChangeRef.current(flowToData(next, edgesRef.current));
        }
        return next;
      });
    },
    [applyColorToNodes, setNodes]
  );

  const duplicateNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node || nodeId === 'center') return;
      const id = `node-${Date.now()}`;
      const copy: Node = {
        ...node,
        id,
        position: { x: node.position.x + 40, y: node.position.y + 40 },
        data: { ...node.data, onLabelChange },
      };
      setNodes((nds) => [...nds, copy]);
      toast.success('Đã nhân đôi node');
    },
    [nodes, onLabelChange, setNodes]
  );

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(flowToData(nodes, edges), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mindmap.json';
    a.click();
    toast.success('Đã xuất JSON');
  }, [nodes, edges]);

  const exportPng = useCallback(async () => {
    const wrapper = flowWrapperRef.current;
    const el = wrapper?.querySelector('.react-flow') as HTMLElement | null;
    if (!wrapper || !el || nodes.length === 0) {
      toast.info('Không có node để xuất');
      return;
    }

    const previousViewport = getViewport();
    const savedSelectedNodeIds = [...selectedNodes];
    const savedActiveEdgeId = activeEdgeId;

    const waitPaint = () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

    try {
      setSelectedNodes([]);
      setActiveEdgeId(null);
      setNodes((nds) => nds.map((n) => (n.selected ? { ...n, selected: false } : n)));
      await waitPaint();

      const bounds = getNodesBounds(nodes);
      const exportWidth = Math.max(800, Math.ceil(bounds.width + 120));
      const exportHeight = Math.max(600, Math.ceil(bounds.height + 120));
      const viewport = getViewportForBounds(bounds, exportWidth, exportHeight, 0.5, 2, 0.12);

      setViewport(viewport);
      await new Promise((resolve) => setTimeout(resolve, 150));

      wrapper.classList.add('mindmap-exporting');
      await waitPaint();

      const dataUrl = await toPng(el, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
        filter: (node) => {
          if (!(node instanceof HTMLElement)) return true;
          const hidden = ['react-flow__controls', 'react-flow__minimap', 'react-flow__panel', 'react-flow__attribution'];
          if (hidden.some((cls) => node.classList.contains(cls))) return false;
          if (node.closest('.react-flow__controls, .react-flow__minimap, .react-flow__panel, .react-flow__attribution')) {
            return false;
          }
          return true;
        },
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'mindmap.png';
      a.click();
      toast.success('Đã xuất PNG');
    } catch {
      toast.error('Xuất PNG thất bại');
    } finally {
      wrapper?.classList.remove('mindmap-exporting');
      setViewport(previousViewport);
      setSelectedNodes(savedSelectedNodeIds);
      setActiveEdgeId(savedActiveEdgeId);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: savedSelectedNodeIds.includes(n.id),
        }))
      );
    }
  }, [nodes, selectedNodes, activeEdgeId, getNodesBounds, getViewport, setViewport, setNodes]);

  const onPaneContextMenu = useCallback((e: FlowPointerEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const onNodeContextMenu = useCallback((e: FlowPointerEvent, node: Node) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
  }, []);

  const onEdgeContextMenu = useCallback((e: FlowPointerEvent, edge: Edge) => {
    e.preventDefault();
    setActiveEdgeId(edge.id);
    setContextMenu({ x: e.clientX, y: e.clientY, edgeId: edge.id });
  }, []);

  const handlePaneClick = useCallback(
    (e: FlowPointerEvent) => {
      setContextMenu(null);
      setActiveEdgeId(null);
      if (e.detail !== 2) return;

      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const id = `node-${Date.now()}`;
      const newNode: Node = {
        id,
        type: 'editable',
        position: pos,
        data: { label: 'Node mới', color: selectedColor, onLabelChange },
      };
      setNodes((nds) => {
        const next = [...nds, newNode];
        pushHistory(next, edges);
        return next;
      });
      toast.success('Đã thêm node');
    },
    [screenToFlowPosition, selectedColor, onLabelChange, setNodes, pushHistory, edges]
  );

  const toolbarColor = useMemo(() => {
    if (selectedNodes.length > 0) {
      const node = nodes.find((n) => n.id === selectedNodes[0]);
      const c = (node?.data as { color?: string })?.color;
      if (c) return normalizeHex(c);
    }
    return selectedColor;
  }, [selectedNodes, nodes, selectedColor]);

  return (
    <div className="mindmap-editor">
      <MindmapToolbar
        selectedColor={toolbarColor}
        onAddNode={addNode}
        onDelete={deleteSelected}
        onUndo={undo}
        onRedo={redo}
        onZoomIn={() => zoomIn()}
        onZoomOut={() => zoomOut()}
        onFitView={() => fitView({ padding: 0.2 })}
        onSelectTemplate={applyTemplate}
        onPreviewColor={previewNodeColor}
        onCommitColor={commitNodeColor}
        onExportPng={exportPng}
        onExportJson={exportJson}
      />

      <div
        ref={flowWrapperRef}
        className={`mindmap-editor__viewport${isConnecting ? ' is-connecting' : ''}`}
      >
        <ReactFlow
          nodes={nodes}
          edges={displayEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={() => setIsConnecting(true)}
          onConnectEnd={() => setIsConnecting(false)}
          connectOnClick={false}
          connectionMode={ConnectionMode.Loose}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onSelectionDrag={onSelectionDrag}
          onSelectionDragStop={onSelectionDragStop}
          onSelectionChange={({ nodes: sel }) => {
            const ids = sel.map((n) => n.id);
            setSelectedNodes(ids);
            const idsChanged = ids.join(',') !== prevSelectionRef.current.join(',');
            prevSelectionRef.current = ids;
            if (colorDraggingRef.current) return;
            if (idsChanged && sel.length > 0) {
              const c = (sel[0].data as { color?: string }).color;
              setSelectedColor(c ? normalizeHex(c) : DEFAULT_NODE_COLOR);
            }
          }}
          onPaneMouseMove={trackPointer}
          onNodeMouseMove={trackPointer}
          onPaneContextMenu={onPaneContextMenu}
          onNodeContextMenu={onNodeContextMenu}
          onNodeClick={() => setActiveEdgeId(null)}
          onEdgeContextMenu={onEdgeContextMenu}
          onEdgeClick={(_, edge) => {
            setActiveEdgeId(edge.id);
            setSelectedNodes([]);
          }}
          onPaneClick={handlePaneClick}
          nodeTypes={mindmapNodeTypes}
          defaultEdgeOptions={mindmapEdgeDefaults}
          elevateEdgesOnSelect
          connectionLineStyle={{ stroke: EDGE_COLOR, strokeWidth: 2 }}
          panOnDrag
          zoomOnScroll
          zoomOnPinch
          zoomOnDoubleClick={false}
          selectionOnDrag={false}
          edgesFocusable
          elementsSelectable
          deleteKeyCode={['Backspace', 'Delete']}
          onEdgesDelete={(deleted) => {
            const ids = new Set(deleted.map((e) => e.id));
            if (activeEdgeId && ids.has(activeEdgeId)) setActiveEdgeId(null);
            setEdges((eds) => {
              const next = eds.filter((e) => !ids.has(e.id));
              pushHistory(nodes, next);
              return next;
            });
          }}
          proOptions={{ hideAttribution: true }}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          colorMode={isDark ? 'dark' : 'light'}
          className="bg-background"
        >
          <Background gap={20} size={1} className="!bg-muted/20" />
          <Controls className="mindmap-controls" />
          <MiniMap
            className="mindmap-minimap hidden sm:block"
            nodeColor={(n) => (n.data as { color?: string }).color || '#6366f1'}
          />
          <Panel
            position="bottom-center"
            className="nodrag nopan nowheel hidden md:block max-w-[min(100%,42rem)] text-xs text-muted-foreground bg-card/90 px-3 py-1.5 rounded-lg border border-border shadow-sm text-center"
          >
            Di chuột vào node, kéo từ điểm nối màu xanh sang node đích để tạo liên kết
          </Panel>
        </ReactFlow>

        {contextMenu && (
          <div
            className="fixed bg-card border border-border rounded-lg shadow-xl py-1 min-w-[140px] z-[9999]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
              onClick={() => { addNode(); setContextMenu(null); }}
            >
              <Plus className="w-3 h-3" /> Thêm node
            </button>
            {contextMenu.edgeId && (
              <button
                type="button"
                className="w-full px-3 py-2 text-sm text-left hover:bg-destructive/10 text-destructive flex items-center gap-2"
                onClick={() => {
                  deleteEdgeById(contextMenu.edgeId!);
                  setContextMenu(null);
                }}
              >
                <Trash2 className="w-3 h-3" /> Xóa đường nối
              </button>
            )}
            {contextMenu.nodeId && contextMenu.nodeId !== 'center' && (
              <>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
                  onClick={() => {
                    setSelectedNodes([contextMenu.nodeId!]);
                    copySelection();
                    setContextMenu(null);
                  }}
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
                  onClick={() => { duplicateNode(contextMenu.nodeId!); setContextMenu(null); }}
                >
                  <Copy className="w-3 h-3" /> Nhân đôi
                </button>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-sm text-left hover:bg-destructive/10 text-destructive flex items-center gap-2"
                  onClick={() => {
                    setSelectedNodes([contextMenu.nodeId!]);
                    deleteSelected();
                    setContextMenu(null);
                  }}
                >
                  <Trash2 className="w-3 h-3" /> Xóa node
                </button>
              </>
            )}
            {hasClipboard && !contextMenu.nodeId && !contextMenu.edgeId && (
              <button
                type="button"
                className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
                onClick={() => {
                  pasteClipboard({ x: contextMenu.x, y: contextMenu.y });
                  setContextMenu(null);
                }}
              >
                <Clipboard className="w-3 h-3" /> Dán (Ctrl+V)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function MindmapCanvas(props: MindmapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MindmapCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
