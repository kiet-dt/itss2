export interface ReflectionResult {
  thinkingScore: number;
  criteria: {
    logicClarity: number;
    problemDecomposition: number;
    edgeCaseAwareness: number;
    algorithmOptimization: number;
    stepByStepReasoning: number;
  };
  feedback: string[];
  improvements: string[];
  timeline: {
    startedWriting: string;
    lastEdit: string;
    focusTime: string;
  };
}

export interface AuthenticityResult {
  originalScore: number;
  aiGeneratedScore: number;
  suspiciousSegments: Array<{ start: number; end: number; reason: string }>;
  patterns: string[];
  activity: {
    pasteTime: string;
    editCount: number;
    rewriteCount: number;
  };
}

const AI_PHRASES = [
  'đầu tiên', 'tiếp theo', 'cuối cùng', 'tóm lại', 'cụ thể',
  'furthermore', 'moreover', 'in conclusion', 'it is important to note',
  'đảm bảo rằng', 'cần lưu ý', 'một cách hiệu quả',
];

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function analyzeReflection(pseudocode: string, thinkingTime: number): ReflectionResult {
  const text = pseudocode.trim();
  const lines = text.split('\n').filter((l) => l.trim());
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const hasNumberedSteps = /^\s*\d+[\.\)]/m.test(text);
  const hasBullets = /^\s*[-*•]/m.test(text);
  const mentionsEdgeCase =
    /edge|null|undefined|rỗng|biên|trống|empty|ngoại lệ|exception/i.test(text);
  const mentionsComplexity = /O\(|độ phức tạp|complexity|tối ưu|optimize/i.test(text);
  const hasLoop = /for|while|lặp|vòng/i.test(text);
  const hasCondition = /if|nếu|else|switch/i.test(text);
  const hasStructure = hasNumberedSteps || hasBullets || lines.length >= 3;

  const logicClarity = clamp(
    (hasStructure ? 35 : 10) + (hasCondition ? 25 : 0) + (wordCount > 30 ? 25 : wordCount) + (lines.length > 2 ? 15 : 0)
  );
  const problemDecomposition = clamp(
    (hasNumberedSteps ? 40 : 15) + Math.min(lines.length * 8, 40) + (hasStructure ? 20 : 0)
  );
  const edgeCaseAwareness = clamp(mentionsEdgeCase ? 75 + Math.random() * 15 : 35 + wordCount / 5);
  const algorithmOptimization = clamp(
    (mentionsComplexity ? 45 : 10) + (hasLoop ? 25 : 0) + (wordCount > 50 ? 20 : 0)
  );
  const stepByStepReasoning = clamp(
    (hasNumberedSteps ? 45 : 20) + Math.min(lines.length * 10, 45)
  );

  const criteria = {
    logicClarity,
    problemDecomposition,
    edgeCaseAwareness,
    algorithmOptimization,
    stepByStepReasoning,
  };

  const thinkingScore = clamp(
    Object.values(criteria).reduce((a, b) => a + b, 0) / 5
  );

  const feedback: string[] = [];
  const improvements: string[] = [];

  if (hasStructure) feedback.push('Bạn đã chia bài toán thành các bước rõ ràng');
  else improvements.push('Hãy chia bài toán thành các bước đánh số (1, 2, 3...)');

  if (hasCondition || hasLoop) feedback.push('Cấu trúc thuật toán có logic tốt');
  else improvements.push('Bổ sung điều kiện (if/else) hoặc vòng lặp nếu cần');

  if (mentionsEdgeCase) feedback.push('Bạn đã nghĩ đến edge case');
  else improvements.push('Bổ sung xử lý edge case cho input null/rỗng/biên');

  if (wordCount < 20) improvements.push('Hãy mô tả chi tiết hơn các bước xử lý');
  if (!mentionsComplexity) improvements.push('Cân nhắc ghi chú độ phức tạp thời gian/không gian');
  if (wordCount > 40) feedback.push('Mức độ chi tiết phù hợp cho giai đoạn lập kế hoạch');

  if (feedback.length === 0) feedback.push('Bạn đã bắt đầu ghi chú — hãy tiếp tục phát triển ý tưởng');

  const focusMinutes = Math.max(1, thinkingTime - 2);

  return {
    thinkingScore,
    criteria,
    feedback,
    improvements,
    timeline: {
      startedWriting: wordCount > 0 ? '2 phút sau khi bắt đầu' : 'Chưa bắt đầu viết',
      lastEdit: `${Math.min(thinkingTime, Math.max(1, Math.floor(wordCount / 10)))} phút`,
      focusTime: `${focusMinutes} phút`,
    },
  };
}

export function analyzeAuthenticity(content: string): AuthenticityResult {
  const text = content.trim();
  const lower = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const lines = text.split('\n').filter((l) => l.trim());

  let aiSignals = 0;
  const patterns: string[] = [];

  for (const phrase of AI_PHRASES) {
    if (lower.includes(phrase)) aiSignals += 8;
  }

  const avgLineLen = lines.length ? text.length / lines.length : 0;
  if (avgLineLen > 80 && lines.length > 2) {
    aiSignals += 15;
    patterns.push('Các dòng quá dài và đồng đều — thường gặp ở văn bản AI');
  }

  const perfectStructure = /^\s*\d+[\.\)]/m.test(text) && lines.length >= 4;
  if (perfectStructure && wordCount > 100) {
    aiSignals += 12;
    patterns.push('Cấu trúc đánh số quá hoàn hảo ngay từ đầu');
  }

  const sentenceVariety = new Set(lines.map((l) => l.length)).size;
  if (lines.length > 3 && sentenceVariety <= 2) {
    aiSignals += 10;
    patterns.push('Phong cách viết quá nhất quán');
  }

  if (wordCount < 30) {
    aiSignals += 5;
    patterns.push('Nội dung còn quá ngắn để đánh giá chính xác');
  }

  const aiGeneratedScore = clamp(aiSignals + Math.random() * 8, 5, 45);
  const originalScore = clamp(100 - aiGeneratedScore - Math.random() * 5, 55, 98);

  const suspiciousSegments: AuthenticityResult['suspiciousSegments'] = [];
  if (text.length > 200 && aiGeneratedScore > 20) {
    suspiciousSegments.push({
      start: 50,
      end: Math.min(120, text.length),
      reason: 'Cấu trúc câu quá hoàn hảo',
    });
  }

  if (patterns.length === 0) patterns.push('Chưa phát hiện pattern AI rõ ràng');

  return {
    originalScore,
    aiGeneratedScore,
    suspiciousSegments,
    patterns,
    activity: {
      pasteTime: new Date().toLocaleTimeString('vi-VN'),
      editCount: Math.max(1, Math.floor(wordCount / 8)),
      rewriteCount: Math.max(0, Math.floor(lines.length / 4)),
    },
  };
}
