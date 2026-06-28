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
  "title": "A beautiful descriptive title in Korean, prefixed with an appropriate emoji, followed by the source in parentheses '(☆: 출처명)' where '☆' is the name of the source, such as the brokerage company name, YouTube channel name/video title, news outlet, etc. (e.g., '🎥 [테크] TV 디스플레이 시장 전망 및 기술 트렌드 (☆: 삼프로TV)' or '📢 [반도체] Rubin Ultra HBM4E 스펙 변화 가능성 (☆: 신한투자증권)')",
  "date": "The date of the report or current date if not found (YYYY-MM-DD format)",
  "category": "One of 'youtube', 'telegram', or 'report'",
  "sourceUrl": "The URL of the source if mentioned, or empty string",
  "summary": "An elegant 2-3 sentence overview summarizing the core event or findings",
  "keyPoints": [
    "Key Takeaway 1",
    "Key Takeaway 2",
    "Key Takeaway 3"
  ],
  "importance": 4, // An integer score from 1 to 5 matching the IMPORTANCE RATING criteria above
  "verified": "X", // Verification status. MUST be default "X" (needs verification / not yet verified).
  "status": "요약완료", // Progress status. MUST be default "요약완료"
  "action": "", // Core next action. Default to empty string "" (blank / no immediate action). Or you can select one of: "1차 요약 필요" | "원문 정독" | "원문 검증 필요" | "ChatGPT 검증 대기" | "Wiki 반영 후보" | "Wiki 반영 필요" | "트래커 업데이트 필요" | "보류" | "폐기" | ""
  "sections": [
    {
      "title": "01 | [Thematic Topic] Section title",
      "content": "Deep section narrative/analysis in Korean describing details and dynamics",
      "quote": {
        "text": "An impactful direct or summarized quote from the speaker/author, if any",
        "author": "The name of the speaker or author of the quote"
      },
      "table": {
        "headers": ["Header 1", "Header 2", "Header 3"],
        "rows": [
          ["Row 1 Col 1", "Row 1 Col 2", "Row 1 Col 3"],
          ["Row 2 Col 1", "Row 2 Col 2", "Row 2 Col 3"]
        ]
      },
      "callout": {
        "type": "warning | positive | risk",
        "text": "Actionable, highlighting sentence (without including the emoji since the UI will render it based on the type)"
      }
    }
  ],
  "investmentView": {
    "mentionedAssets": [
      {
        "asset": "Company or asset name (e.g., 삼성전자 (005930))",
        "relation": "Brief relationship context (e.g., 긍정적 영향, 단기 조정 등)",
        "context": "Analytical context describing the catalyst and potential impact"
      }
    ],
    "bullArguments": [
      "Bullish catalyst or long-term growth factor 1",
      "Bullish catalyst or long-term growth factor 2"
    ],
    "caveats": [
      "Bearish risk or critical warning 1",
      "Bearish risk or critical warning 2"
    ],
    "neutralEvaluation": "A balanced, neutral macro or industry evaluation summary paragraph"
  }
}

Ensure to generate at least 2 or 3 detailed sections to capture the full breadth of the raw content. For sections, include comparison tables and callout boxes where appropriate to match the rich visual format of professional Notion pages. Particularly, if there are competitor comparison details (such as multiples or financial metrics across companies), you MUST output them in a structured table under the 'table' field of that section.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "date", "category", "summary", "keyPoints", "importance", "verified", "status", "action", "sections", "investmentView"],
          properties: {
            title: { type: Type.STRING },
            date: { type: Type.STRING },
            category: { type: Type.STRING },
            sourceUrl: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            importance: { type: Type.INTEGER },
            verified: { type: Type.STRING, enum: ["O", "X"] },
            status: { type: Type.STRING, enum: ["요약완료", "정독필요", "검증중", "검증완료", "Wiki반영"] },
            action: { type: Type.STRING, enum: ["1차 요약 필요", "원문 정독", "원문 검증 필요", "ChatGPT 검증 대기", "Wiki 반영 후보", "Wiki 반영 필요", "트래커 업데이트 필요", "보류", "폐기", ""] },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "content"],
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  quote: {
                    type: Type.OBJECT,
                    required: ["text", "author"],
                    properties: {
                      text: { type: Type.STRING },
                      author: { type: Type.STRING }
                    }
                  },
                  table: {
                    type: Type.OBJECT,
                    required: ["headers", "rows"],
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
                    required: ["type", "text"],
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
              required: ["mentionedAssets", "bullArguments", "caveats", "neutralEvaluation"],
              properties: {
                mentionedAssets: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["asset", "relation", "context"],
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
