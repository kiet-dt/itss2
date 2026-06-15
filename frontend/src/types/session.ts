export interface AIAnalysisResult {
  thinkingScore: number;
  authenticityScore: number;
  problemUnderstanding: number;
  relevanceToProblem: number;
  logicClarity: number;
  problemDecomposition: number;
  edgeCaseAwareness: number;
  algorithmOptimization: number;
  aiPatternPercent: number;
  feedback: string[];
  suggestions: string[];
}

export interface SessionData {
  id: string;
  createdAt: string;
  thinkingMinutes: number;
  problemStatement: string;
  pseudocode: string;
  mindmapData: unknown;
  aiAnalysisResult?: AIAnalysisResult;
}

export interface MindmapFlowData {
  nodes: Array<{
    id: string;
    type?: string;
    position: { x: number; y: number };
    data: { label: string; color?: string };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    type?: string;
  }>;
}

export interface NoteData {
  id: string;
  timestamp: Date;
  pseudocode: string;
  mindmap: MindmapFlowData | null;
  problemStatement: string;
  thinkingTime?: number;
}
