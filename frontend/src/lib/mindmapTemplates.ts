import type { MindmapFlowData } from '../types/session';

const CENTER_ID = 'center';

export function buildDefaultMindmap(problem: string): MindmapFlowData {
  const label = problem.trim() || 'Vấn đề cần giải quyết';
  return {
    nodes: [
      { id: CENTER_ID, position: { x: 400, y: 200 }, data: { label, color: '#6366f1' } },
      { id: 'input', position: { x: 150, y: 80 }, data: { label: 'Input', color: '#22c55e' } },
      { id: 'output', position: { x: 650, y: 80 }, data: { label: 'Output', color: '#3b82f6' } },
      { id: 'algo', position: { x: 150, y: 320 }, data: { label: 'Thuật toán', color: '#f59e0b' } },
      { id: 'edge', position: { x: 650, y: 320 }, data: { label: 'Edge Cases', color: '#ef4444' } },
    ],
    edges: [
      { id: 'e-c-i', source: CENTER_ID, target: 'input' },
      { id: 'e-c-o', source: CENTER_ID, target: 'output' },
      { id: 'e-c-a', source: CENTER_ID, target: 'algo' },
      { id: 'e-c-e', source: CENTER_ID, target: 'edge' },
    ],
  };
}

export function syncCenterNode(data: MindmapFlowData, problem: string): MindmapFlowData {
  const label = problem.trim() || 'Vấn đề cần giải quyết';
  const hasCenter = data.nodes.some((n) => n.id === CENTER_ID);
  if (!hasCenter) return data;
  return {
    ...data,
    nodes: data.nodes.map((n) =>
      n.id === CENTER_ID ? { ...n, data: { ...n.data, label } } : n
    ),
  };
}

type TemplateBuilder = (problem: string) => MindmapFlowData;

function node(id: string, x: number, y: number, label: string, color: string) {
  return { id, position: { x, y }, data: { label, color } };
}

function edge(id: string, source: string, target: string) {
  return { id, source, target };
}

export const MINDMAP_TEMPLATES: Record<string, TemplateBuilder> = {
  'Mindmap phân tích bài toán': (p) => buildDefaultMindmap(p),

  'Flowchart giải thuật': (p) => {
    const t = p.trim() || 'Bài toán';
    return {
      nodes: [
        node('start', 400, 40, 'Bắt đầu', '#22c55e'),
        node('read', 400, 120, `Đọc input: ${t}`, '#6366f1'),
        node('process', 400, 220, 'Xử lý logic chính', '#f59e0b'),
        node('check', 400, 320, 'Kiểm tra điều kiện?', '#3b82f6'),
        node('output', 400, 420, 'Xuất kết quả', '#8b5cf6'),
        node('end', 400, 520, 'Kết thúc', '#ef4444'),
      ],
      edges: [
        edge('e1', 'start', 'read'),
        edge('e2', 'read', 'process'),
        edge('e3', 'process', 'check'),
        edge('e4', 'check', 'output'),
        edge('e5', 'output', 'end'),
      ],
    };
  },

  'Use Case đơn giản': (p) => {
    const t = p.trim() || 'Hệ thống';
    return {
      nodes: [
        node('actor', 100, 200, 'Người dùng', '#22c55e'),
        node('system', 400, 200, t, '#6366f1'),
        node('uc1', 400, 80, 'Use case 1', '#3b82f6'),
        node('uc2', 400, 320, 'Use case 2', '#f59e0b'),
      ],
      edges: [edge('e1', 'actor', 'uc1'), edge('e2', 'actor', 'uc2'), edge('e3', 'uc1', 'system'), edge('e4', 'uc2', 'system')],
    };
  },

  'Sequence Diagram đơn giản': (p) => {
    const t = p.trim() || 'Hệ thống';
    return {
      nodes: [
        node('user', 100, 100, 'User', '#22c55e'),
        node('ui', 300, 100, 'UI', '#3b82f6'),
        node('api', 500, 100, 'API', '#f59e0b'),
        node('db', 700, 100, 'DB', '#8b5cf6'),
        node('msg1', 200, 250, `Yêu cầu: ${t}`, '#6366f1'),
        node('msg2', 400, 350, 'Xử lý', '#6366f1'),
        node('msg3', 600, 450, 'Lưu trữ', '#6366f1'),
      ],
      edges: [edge('e1', 'user', 'msg1'), edge('e2', 'msg1', 'ui'), edge('e3', 'ui', 'msg2'), edge('e4', 'msg2', 'api'), edge('e5', 'api', 'msg3'), edge('e6', 'msg3', 'db')],
    };
  },

  'Functional Decomposition': (p) => {
    const t = p.trim() || 'Chức năng chính';
    return {
      nodes: [
        node('root', 400, 60, t, '#6366f1'),
        node('f1', 150, 200, 'Chức năng A', '#22c55e'),
        node('f2', 400, 200, 'Chức năng B', '#3b82f6'),
        node('f3', 650, 200, 'Chức năng C', '#f59e0b'),
        node('f1a', 80, 350, 'Chi tiết A.1', '#86efac'),
        node('f1b', 220, 350, 'Chi tiết A.2', '#86efac'),
      ],
      edges: [edge('e1', 'root', 'f1'), edge('e2', 'root', 'f2'), edge('e3', 'root', 'f3'), edge('e4', 'f1', 'f1a'), edge('e5', 'f1', 'f1b')],
    };
  },

  'Decision Tree': (p) => {
    const t = p.trim() || 'Quyết định';
    return {
      nodes: [
        node('root', 400, 60, t, '#6366f1'),
        node('d1', 250, 180, 'Điều kiện 1?', '#f59e0b'),
        node('d2', 550, 180, 'Điều kiện 2?', '#f59e0b'),
        node('r1', 150, 320, 'Nhánh A', '#22c55e'),
        node('r2', 350, 320, 'Nhánh B', '#3b82f6'),
        node('r3', 550, 320, 'Nhánh C', '#8b5cf6'),
      ],
      edges: [edge('e1', 'root', 'd1'), edge('e2', 'root', 'd2'), edge('e3', 'd1', 'r1'), edge('e4', 'd1', 'r2'), edge('e5', 'd2', 'r3')],
    };
  },

  Brainstorming: (p) => {
    const t = p.trim() || 'Chủ đề';
    return {
      nodes: [
        node('center', 400, 200, t, '#6366f1'),
        node('i1', 150, 80, 'Ý tưởng 1', '#22c55e'),
        node('i2', 650, 80, 'Ý tưởng 2', '#3b82f6'),
        node('i3', 150, 320, 'Ý tưởng 3', '#f59e0b'),
        node('i4', 650, 320, 'Ý tưởng 4', '#8b5cf6'),
        node('i5', 400, 400, 'Ý tưởng 5', '#ec4899'),
      ],
      edges: [
        edge('e1', 'center', 'i1'),
        edge('e2', 'center', 'i2'),
        edge('e3', 'center', 'i3'),
        edge('e4', 'center', 'i4'),
        edge('e5', 'center', 'i5'),
      ],
    };
  },

  'Root Cause Analysis': (p) => {
    const t = p.trim() || 'Vấn đề gốc';
    return {
      nodes: [
        node('problem', 400, 80, t, '#ef4444'),
        node('why1', 400, 180, 'Tại sao? (1)', '#f59e0b'),
        node('why2', 400, 280, 'Tại sao? (2)', '#f59e0b'),
        node('why3', 400, 380, 'Tại sao? (3)', '#f59e0b'),
        node('root', 400, 480, 'Nguyên nhân gốc', '#6366f1'),
        node('cause1', 150, 180, 'Nguyên nhân phụ A', '#22c55e'),
        node('cause2', 650, 180, 'Nguyên nhân phụ B', '#3b82f6'),
      ],
      edges: [
        edge('e1', 'problem', 'why1'),
        edge('e2', 'why1', 'why2'),
        edge('e3', 'why2', 'why3'),
        edge('e4', 'why3', 'root'),
        edge('e5', 'problem', 'cause1'),
        edge('e6', 'problem', 'cause2'),
      ],
    };
  },
};

export const TEMPLATE_NAMES = Object.keys(MINDMAP_TEMPLATES);

export const NODE_COLORS = ['#6366f1', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
