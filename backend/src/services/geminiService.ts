import { GoogleGenerativeAI } from '@google/generative-ai';

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

export interface AnalysisInput {
  problemStatement: string;
  pseudocode: string;
  mindmapData: unknown;
  thinkingMinutes: number;
  editCount: number;
  rewriteCount: number;
}

export class GeminiAnalysisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiAnalysisError';
  }
}

const FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash'];

function getApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
}

function getModelCandidates(): string[] {
  const preferred = process.env.GEMINI_MODEL?.trim();
  const ordered = preferred ? [preferred, ...FALLBACK_MODELS] : FALLBACK_MODELS;
  return [...new Set(ordered)];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /429|quota|rate limit|resource exhausted|too many requests/i.test(msg);
}

function truncateMindmap(data: unknown, maxLen = 4000): string {
  const json = JSON.stringify(data ?? {});
  return json.length <= maxLen ? json : `${json.slice(0, maxLen)}...(truncated)`;
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeResult(raw: AIAnalysisResult): AIAnalysisResult {
  return {
    thinkingScore: clamp(raw.thinkingScore),
    authenticityScore: clamp(raw.authenticityScore),
    problemUnderstanding: clamp(raw.problemUnderstanding),
    relevanceToProblem: clamp(raw.relevanceToProblem),
    logicClarity: clamp(raw.logicClarity),
    problemDecomposition: clamp(raw.problemDecomposition),
    edgeCaseAwareness: clamp(raw.edgeCaseAwareness),
    algorithmOptimization: clamp(raw.algorithmOptimization),
    aiPatternPercent: clamp(raw.aiPatternPercent),
    feedback: Array.isArray(raw.feedback) ? raw.feedback.map(String) : [],
    suggestions: Array.isArray(raw.suggestions) ? raw.suggestions.map(String) : [],
  };
}

function parseJsonResponse(text: string): AIAnalysisResult | null {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned) as AIAnalysisResult;
    if (typeof parsed.thinkingScore !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function analyzeWithGemini(input: AnalysisInput): Promise<AIAnalysisResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new GeminiAnalysisError(
      'Dịch vụ phân tích chưa được cấu hình. Vui lòng thử lại sau.'
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = getModelCandidates();

  const prompt = `Bạn là AI phản biện tư duy, KHÔNG được giải bài toán hay đưa lời giải hoàn chỉnh.

Đánh giá mức độ tư duy độc lập của người học dựa trên dữ liệu sau:
- Vấn đề: ${input.problemStatement || '(chưa mô tả)'}
- Mã giả: ${input.pseudocode || '(trống)'}
- Sơ đồ tư duy (JSON): ${truncateMindmap(input.mindmapData)}
- Thời gian suy nghĩ: ${input.thinkingMinutes} phút
- Số lần chỉnh sửa: ${input.editCount}
- Số lần viết lại: ${input.rewriteCount}

Chỉ đánh giá:
- Người dùng hiểu bài toán đến đâu
- Có chia nhỏ vấn đề không
- Có tư duy logic không
- Có nghĩ edge case không
- Có tối ưu hóa không
- Có dấu hiệu phụ thuộc AI không
- Mã giả có bám sát bài toán không
- Sơ đồ có bao phủ đủ khía cạnh không

Trả về JSON thuần (không markdown), đúng schema:
{
  "thinkingScore": 0-100,
  "authenticityScore": 0-100,
  "problemUnderstanding": 0-100,
  "relevanceToProblem": 0-100,
  "logicClarity": 0-100,
  "problemDecomposition": 0-100,
  "edgeCaseAwareness": 0-100,
  "algorithmOptimization": 0-100,
  "aiPatternPercent": 0-100,
  "feedback": ["điểm mạnh/yếu..."],
  "suggestions": ["gợi ý cải thiện..."]
}`;

  let lastError: unknown;

  for (const modelName of models) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 1024,
      },
    });

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = parseJsonResponse(text);
        if (!parsed) {
          throw new GeminiAnalysisError('Phản hồi không hợp lệ. Vui lòng thử lại sau.');
        }
        return normalizeResult(parsed);
      } catch (err) {
        lastError = err;
        if (err instanceof GeminiAnalysisError) throw err;
        if (isQuotaError(err) && attempt === 0) {
          await sleep(2500);
          continue;
        }
        if (isQuotaError(err)) break;
        throw new GeminiAnalysisError('Không thể hoàn tất phân tích. Vui lòng thử lại sau.');
      }
    }
  }

  if (isQuotaError(lastError)) {
    throw new GeminiAnalysisError(
      'Đã hết lượt phân tích hôm nay. Vui lòng thử lại sau vài phút.'
    );
  }

  throw new GeminiAnalysisError('Không thể hoàn tất phân tích. Vui lòng thử lại sau.');
}
