import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini client lazily
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

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: "GEMINI_API_KEY environment variable is not configured yet. Please configure it in your Vercel Project Settings (Settings -> Environment Variables)."
      });
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
If the raw content contains competitor comparisons, valuation metrics (such as PER, PBR, EV/EBITDA, EPS, BPS, target prices) of one or more companies, or financial/market-share data over time, you MUST structure this data as a clear, comprehensive comparison table inside the relevant section(s) using the 'table' schema field. Do not just write comparative data in plain text paragraphs. A structured comparison table is required for high-quality professional financial analysis.`;

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
    return res.status(200).json(memo);

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    return res.status(500).json({ error: error.message || "메모 분석 및 구조화에 실패했습니다." });
  }
}
