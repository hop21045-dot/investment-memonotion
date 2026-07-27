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

    const systemInstruction = `You are a world-class financial and technology research analyst. 
Your task is to analyze the provided raw content (which could be a YouTube transcript, a report, or a Telegram post) and synthesize it into a highly professional, beautifully structured Korean research memo.
Format your response STRICTLY as a single JSON object matching the requested schema. Do not output any markdown wrapper like \`\`\`json, just pure raw JSON.
All text must be in professional formal Korean (e.g., '수급적 원인으로 해석됩니다', '전망이 우세합니다'). Avoid informal speech. Ensure the insights are deeply analytical, informative, and structurally rich, capturing critical numbers, arguments, and quotes.

CRITICAL DESIGN INSTRUCTION FOR TABLES:
If the raw content contains competitor comparisons, valuation metrics (such as PER, PBR, EV/EBITDA, EPS, BPS, target prices) of one or more companies, or financial/market-share data over time, you MUST structure this data as a clear, comprehensive comparison table inside the relevant section(s) using the 'table' schema field. Do NOT write markdown tables (|---|---|) inside the 'content' field of a section. The 'content' field must contain only plain explanatory text with simple markdown. All tabular, comparative, or numerical matrix data MUST be put into the separate 'table' schema field.

CRITICAL INSTRUCTION FOR IMPORTANCE RATING:
Assess the source or news and assign an importance score from 1 to 5 based on these specific rules:
- 5: [투자판단에 직접 영향] 원문 정독 + 검증 (예: 보유종목 직접 관련, 기존 투자 논리 변동 가능, 새로운 산업 프레임 제공, 중요한 숫자/수주/Capex/실적)
- 4: [섹터/기업 Wiki 반영 후보] 핵심 부분 정독 (예: 리포트 반영 가능, 섹터 방향성 영향)
- 3: [참고자료] 요약만 저장 (예: 참고용 뉴스 및 데이터)
- 2: [흥미는 있으나 낮은 우선순위] 링크만 보관 (예: 낮은 우선순위)
- 1: [저장 가치 낮음] 폐기 가능 (예: 중복 자료, 가십성 정보)`;

    const prompt = `Analyze and summarize the following raw text content.
If a category is selected ("${category || 'any'}"), prioritize structuring it appropriately.

RAW CONTENT:
${text}

Provide your response in JSON format matching this schema:
{
  "title": "A beautiful descriptive title in Korean, prefixed with an appropriate emoji, followed by '(☆: 출처명)' where '☆' is the name of the source (e.g. '🎥 [반도체] Citi 글로벌 반도체 전망 (☆: Citi)')",
  "category": "youtube | telegram | report | webpage",
  "sectors": ["Sector 1", "Sector 2"],
  "sourceUrl": "The URL of the source if mentioned, or empty string",
  "date": "YYYY-MM-DD format",
  "sourceName": "The name of the source/brokerage/channel (e.g., 'Citi', '신한투자증권')",
  "summary": "An elegant 2-3 sentence overview summarizing the core event or findings",
  "keyPoints": [
    "Key Takeaway 1",
    "Key Takeaway 2"
  ],
  "oneLineConclusion": "A high-impact 1-sentence bottom-line investment thesis",
  "checklist": [
    "Checklist item / verification condition 1",
    "Checklist item / verification condition 2"
  ],
  "editorSynthesis": {
    "title": "종합 판단 / 에디터 총평 제목",
    "summary": "에디터 종합 요약 문단",
    "comparisons": ["비교/대조포인트 1", "비교/대조포인트 2"],
    "portfolioImplication": "포트폴리오 대응 전략 및 함의"
  },
  "sections": [
    {
      "title": "01 | [주제] 섹터 분석 대제목",
      "summary": "Core summary of this section in 2-3 sentences",
      "details": [
        "Detail point 1",
        "Detail point 2"
      ],
      "table": {
        "headers": ["Header 1", "Header 2"],
        "rows": [
          ["Row 1 Col 1", "Row 1 Col 2"]
        ]
      },
      "source": "출처/페이지"
    }
  ],
  "investmentView": {
    "thesis": "핵심 투자 가설 및 주 논지",
    "implications": [
      "실적/수급/상승요인 함의 1",
      "실적/수급/상승요인 함의 2"
    ],
    "risks": [
      "핵심 리스크 요인 1",
      "핵심 리스크 요인 2"
    ],
    "keyTrackingVariables": [
      "앞으로 추적해야 할 주요 지표/이벤트 1"
    ],
    "mentionedAssets": [
      {
        "asset": "Company or asset name (e.g., 삼성전자 (005930))",
        "relation": "Brief relationship context (e.g., 긍정적 영향, 단기 조정 등)",
        "context": "Analytical context describing the catalyst and potential impact"
      }
    ],
    "bullArguments": [
      "Bullish catalyst 1"
    ],
    "caveats": [
      "Bearish risk 1"
    ],
    "neutralEvaluation": "A balanced, neutral macro or industry evaluation summary paragraph"
  },
  "rating": {
    "importance": 4,
    "read_priority": 3,
    "verification_need": 2,
    "notion_save": "저장",
    "recommended_action": "요약만 저장",
    "score_rationale": "평가 이유"
  },
  "status": "요약완료",
  "action": ""
}

Ensure to generate detailed sections to capture the full breadth of the raw content. For sections, include comparison tables where appropriate to match the rich visual format of professional Notion pages.`;

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
                score_rationale: { type: Type.STRING }
              }
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title"],
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  source: { type: Type.STRING },
                  details: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  bullArguments: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  riskFactors: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  keyVariables: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  quote: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      author: { type: Type.STRING }
                    }
                  },
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
                  },
                  callout: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      text: { type: Type.STRING }
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
                },
                mentionedAssets: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      asset: { type: Type.STRING },
                      relation: { type: Type.STRING },
                      context: { type: Type.STRING }
                    }
                  }
                },
                bullArguments: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                caveats: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                neutralEvaluation: { type: Type.STRING }
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

6. "score_rationale" (평가 근거, 한국어로 작성):
- 왜 해당 점수들을 부여했는지 2~3문장으로 논리적인 설명을 제시하세요.

Response MUST be a single raw JSON object matching the requested schema. No markdown wrappers.`;

    const prompt = `Please evaluate the following structured memo and provide the 6 rating fields:

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
