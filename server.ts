import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "15mb" })); // Support large transcripts

const PORT = 3000;

// Initialize Gemini client lazily with custom header
let aiInstance: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "DUMMY_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// API Routes FIRST
app.post("/api/generate", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "GEMINI_API_KEY environment variable is not configured yet. Please configure it in Settings." });
    }
    const ai = getAiClient();
    const { text, category } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "정리할 내용을 입력해 주세요." });
    }

    const systemInstruction = `당신은 뉴스 기사, 유튜브 자막, 웹페이지, 증권사 리포트, 텔레그램 글, IR 자료, 컨퍼런스콜 등 다양한 투자 콘텐츠를 분석하여 간결하고 구조적인 '노션 스타일 투자 리서치 메모'를 만드는 투자 리서치 에디터입니다.

[1. 기본 원칙]
1. 모든 텍스트는 한국어로 작성합니다. 고유명사·제품명·기술명은 필요한 경우 원문 표현을 유지합니다.
2. 원문에 없는 사실·숫자·날짜·기업명·계약·고객사·실적 전망을 만들지 않습니다.
3. 원문에서 직접 도출되는 1차 투자자 해석은 허용하되 원문 사실과 구분합니다.
4. 불확실한 내용은 '추정' 또는 '확인 필요'로 표시합니다.
5. 가능성·계획·전망을 확정된 계약·수주·실적·수혜처럼 표현하지 않습니다.
6. 근거 없는 '독점 수혜', '유일한 수혜주', '구조적 성장 확정', '실적 급증 확정', '압도적 경쟁우위', '수주 확정' 등의 표현을 사용하지 않습니다.
7. 원문 근거가 부족한 필드는 빈 배열 [] 또는 빈 문자열 ""로 둡니다.
8. 투자 판단에 필요한 핵심 수치·표·기업 전략·제품·기술 차이·수급·가격·실적·수주·Capex·밸류에이션·리스크는 보존합니다.

[2. 최소 충분성 원칙]
- "이 항목을 삭제하면 핵심 투자 논리 또는 중요한 근거를 이해하기 어려워지는가?" 질문하여 그렇지 않다면 삭제 또는 통합합니다.
- summary는 자료 전체의 결론과 방향을 담당하며, 개별 논점의 핵심 인사이트는 각 section.summary에서 작성합니다.
- keyPoints는 반드시 기억할 원문 사실과 핵심 수치(실적, 수주, 가격, Capex, 고객 변화 등)만 선별합니다.

[3. sections 작성 원칙]
- 각 section은 '핵심 쟁점·주장 → 이를 뒷받침하는 사실·수치 → 필요한 비교·반론·인과관계 → 해당 논점의 핵심 인사이트' 흐름으로 구성합니다.
- title: 무엇에 대한 논점인지 직관적인 제목 (예: "01 | 핵심 쟁점")
- summary: 단순 내용 요약이 아니라 해당 section에서 반드시 기억해야 할 핵심 주장·쟁점·인사이트를 1~2문장으로 작성
- details: summary를 뒷받침하는 최소한의 사실·수치·비교·반론·인과관계를 문자열 배열로 정리
- table: 비교 자체가 투자 판단에 의미를 추가할 때만 사용 ({ headers: [], rows: [] })
- source: 원문 페이지 또는 위치

[4. investmentView & 종합 판단]
- investmentView는 sections를 다시 요약하지 않고 자료 전체의 상위 수준 투자적 의미를 종합합니다 (thesis, implications, risks, keyTrackingVariables).
- editorSynthesis는 단일 자료에서는 비워두고({ title: "", summary: "", comparisons: [], portfolioImplication: "" }), 복수 자료 종합 시에만 작성합니다.
- checklist: 향후 실제로 확인할 행동을 배열로 작성합니다.
- oneLineConclusion: 자료 전체의 최종 투자적 의미를 한 문장으로 압축합니다.
- rating: importance(1~5 매우 보수적), read_priority(1~5), verification_need(1~5), notion_save("저장"|"보류"|"폐기"), recommended_action("요약만 저장"|"원문 정독"|"GPT 검증"|"Wiki 반영 후보"), score_rationale
- status: 초안은 항상 "요약완료"
- action: recommended_action에 따른 구체적 실행 방안을 1문장으로 작성`;

    const prompt = `입력된 원문을 심층 분석하여 공식 JSON 스키마에 맞는 노션 요약본 초안을 작성하세요.
${category ? `카테고리: ${category}` : ''}

[원문 내용]
${text}

다음 구조의 순수 JSON으로만 응답하세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "date", "category", "summary", "keyPoints", "rating", "sections", "investmentView"],
          properties: {
            title: { type: Type.STRING },
            date: { type: Type.STRING },
            category: { type: Type.STRING },
            sectors: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            sourceUrl: { type: Type.STRING },
            sourceUrls: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            sourceName: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            oneLineConclusion: { type: Type.STRING },
            checklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            editorSynthesis: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                comparisons: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                portfolioImplication: { type: Type.STRING }
              }
            },
            importance: { type: Type.INTEGER },
            verified: { type: Type.STRING },
            status: { type: Type.STRING },
            action: { type: Type.STRING },
            rating: {
              type: Type.OBJECT,
              required: ["importance", "read_priority", "verification_need", "notion_save", "recommended_action", "score_rationale"],
              properties: {
                importance: { type: Type.INTEGER },
                read_priority: { type: Type.INTEGER },
                verification_need: { type: Type.INTEGER },
                notion_save: { type: Type.STRING },
                recommended_action: { type: Type.STRING },
                action: { type: Type.STRING },
                score_rationale: { type: Type.STRING }
              }
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "summary"],
                properties: {
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  details: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  content: { type: Type.STRING },
                  source: { type: Type.STRING },
                  table: {
                    type: Type.OBJECT,
                    properties: {
                      headers: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      rows: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        }
                      }
                    }
                  }
                }
              }
            },
            investmentView: {
              type: Type.OBJECT,
              properties: {
                thesis: { type: Type.STRING },
                implications: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                risks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                keyTrackingVariables: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gemini로부터 비어있는 응답이 돌아왔습니다.");
    }

    const memo = JSON.parse(resultText);
    res.json(memo);

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ error: error.message || "메모 분석 및 구조화에 실패했습니다." });
  }
});

app.post("/api/re-evaluate", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: "GEMINI_API_KEY environment variable is not configured yet. Please configure it in Settings." });
    }
    const ai = getAiClient();
    const { report } = req.body;
    if (!report) {
      return res.status(400).json({ error: "평가할 리포트 데이터가 필요합니다." });
    }

    const systemInstruction = `You are a professional financial investment analyst.
Your task is to review the provided structured research memo and output a multi-dimensional rating object based on these guidelines:

1. "importance" (투자판단 중요도, 1-5점):
- 5점: 보유종목 직접 관련, 기존 투자 아이디어나 논리를 완전히 변화시킬 수준 (상위 5% 이내)
- 4점: Wiki 반영 후보, 핵심 부분을 집중해서 정독해야 함 (상위 20% 이내)
- 3점: 참고용 뉴스/소식으로 요약본만 보관해도 충분함
- 2점: 흥미가 있으나 우선순위가 떨어지는 배경지식
- 1점: 단순 가십, 중복, 폐기 가능한 자료

2. "read_priority" (원문 정독 우선순위, 1-5점):
- 5점: 원문 완독 필수 (수치, Capex, 경영진 발언, 실적 전망 풍부)
- 4점: 핵심 부분 정독 권장 (요약 누락 가능성 있음)
- 3점: 요약만으로도 파악 가능
- 2점: 헤드라인과 핵심 한두 줄만 보면 충분
- 1점: 원문을 읽을 필요 없음

3. "verification_need" (팩트/숫자 검증 필요성, 1-5점):
- 5점: 핵심 계약, 재무지표, 실적추정 등의 숫자가 많아 오기 시 치명적인 경우
- 4점: 중요 숫자나 독자적 해석이 많아 교차검증 권장
- 3점: 일부 수치 확인 필요
- 2점: 정성적 설명 위주이며 검증할 수치 거의 없음
- 1점: 단순 사실 기록 또는 확인 필요 요소 없음

4. "notion_save" (노션 영구 저장 여부):
- "저장" (중요도 3-5점 또는 검증 필요성 4-5점인 경우)
- "보류" (중요도 2점 또는 가볍게 보관할 경우)
- "폐기" (중요도 1점 및 영구 보존 가치가 극히 낮을 경우)
- 이 셋 중 하나를 무조건 선택해야 합니다.

5. "recommended_action" (추천 액션):
- "요약만 저장" | "원문 정독" | "GPT 검증" | "Wiki 반영 후보" 중 선택해서 그대로 출력해야 합니다.

6. "action" (구체적인 액션 방안):
- recommended_action 다음에 수행할 구체적인 실행 행동 방안을 1~2문장으로 작성하세요 (예: "원문과 초안을 대조해 증설 계획·수주 규모·실적 전망과 밸류에이션 가정을 검증").

7. "score_rationale" (평가 근거, 한국어로 작성):
- 왜 해당 점수들을 부여했는지 2~3문장으로 논리적인 설명을 제시하세요.

Response MUST be a single raw JSON object matching the requested schema. No markdown wrappers.`;

    const prompt = `Please evaluate the following structured memo and provide the rating fields:

TITLE: ${report.title}
SUMMARY: ${report.summary}
KEY POINTS:
${report.keyPoints?.map((kp: string) => `- ${kp}`).join("\n")}

SECTIONS:
${report.sections?.map((sec: any) => `### ${sec.title}\n${sec.summary || sec.content}`).join("\n\n")}

INVESTMENT VIEW:
Mentioned Assets: ${JSON.stringify(report.investmentView?.mentionedAssets)}
Bull Arguments: ${report.investmentView?.bullArguments?.join("\n")}
Bear Caveats: ${report.investmentView?.caveats?.join("\n")}
Neutral Assessment: ${report.investmentView?.neutralEvaluation}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["importance", "read_priority", "verification_need", "notion_save", "recommended_action", "score_rationale"],
          properties: {
            importance: { type: Type.INTEGER },
            read_priority: { type: Type.INTEGER },
            verification_need: { type: Type.INTEGER },
            notion_save: { type: Type.STRING },
            recommended_action: { type: Type.STRING },
            action: { type: Type.STRING },
            score_rationale: { type: Type.STRING }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("비어있는 응답입니다.");
    }

    const rating = JSON.parse(response.text.trim());
    res.json({ rating });
  } catch (error: any) {
    console.error("Re-evaluation Error:", error);
    res.status(500).json({ error: error.message || "평가 근거 생성에 실패했습니다." });
  }
});

// Vite Middleware & Static Serving setup
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
