import React, { useState, useEffect } from "react";
import { StructuredReport, Section, MentionedAsset } from "../types";
import {
  Sparkles,
  Save,
  X,
  Plus,
  Trash2,
  Video,
  MessageSquare,
  FileText,
  AlertCircle,
  HelpCircle,
  Globe,
  Copy,
  Check,
  ExternalLink,
  FileCode
} from "lucide-react";

const EXTERNAL_AI_PROMPT = `당신은 뉴스 기사, 유튜브 자막, 웹페이지 글, 증권사 리포트, 텔레그램 글 등 다양한 원문 콘텐츠를 분석하여 최고의 '노션 스타일 구조화 메모'를 만들어 주는 투자 및 자료 리포팅 전문가입니다.

입력된 원문을 심도 있게 분석하여 아래 JSON 스키마를 만족하는 정확한 JSON 코드를 생성해 주세요.

부연 설명이나 다른 말은 일절 하지 말고, 오직 마크다운 코드 블록(\`\`\`json ... \`\`\`) 안에 담긴 JSON 결과물만 반환하세요.

[작성 원칙]

1. 모든 텍스트는 한국어로 작성합니다.
2. 원문에 없는 내용은 추정하지 않습니다.
3. 추정이 필요한 경우 반드시 "추정" 또는 "확인 필요"라고 표시합니다.
4. 최종 출력 JSON에는 주석을 절대 포함하지 않습니다.
5. 각 섹션은 가능하면 "핵심 내용 → 세부내용 → 강세 논거 → 리스크 요인 → 핵심변수" 순서로 구조화합니다.
6. 원문에 근거가 부족한 항목은 억지로 만들지 말고 빈 배열([]) 또는 빈 문자열("")로 둡니다.
7. 표가 필요한 데이터는 반드시 "table" 필드에 넣고, content나 details 안에 마크다운 표를 직접 작성하지 않습니다.
8. 단순 요약이 아니라 투자 판단에 필요한 인과관계, 핵심 변수, 리스크를 함께 정리합니다.
9. 강세 논거는 단순한 긍정 요인이 아니라 주가, 실적, 밸류에이션, 수급에 긍정적인 영향을 줄 수 있는 구체적 근거로 작성합니다.
10. 리스크 요인은 투자 아이디어가 틀릴 수 있는 조건, 반대 시나리오, 과도한 기대가 꺾일 수 있는 요인을 중심으로 작성합니다.
11. 핵심변수는 앞으로 추적해야 할 숫자, 이벤트, 지표 중심으로 작성합니다.
12. 중요도 평가는 매우 보수적으로 부여합니다. 단순히 흥미롭거나 읽을 만하다는 이유만으로 4점 이상을 주지 않습니다.

[JSON 스키마]

{
  "title": "노션 스타일의 직관적이고 눈길을 끄는 메모 제목 옆에 괄호로 '(☆: 출처명)'을 추가",
  "category": "youtube | telegram | report | webpage",
  "sectors": [],
  "sourceUrl": "",
  "date": "",
  "sourceName": "",
  "summary": "",
  "keyPoints": [],
  "coreSummary": {
    "thesis": "",
    "details": []
  },
  "sections": [
    {
      "title": "01 | [핵심 주제] 가독성을 높인 대제목",
      "summary": "",
      "details": [],
      "bullArguments": [],
      "riskFactors": [],
      "keyVariables": [],
      "quote": {
        "text": "",
        "author": ""
      },
      "table": {
        "headers": [],
        "rows": []
      },
      "callout": {
        "type": "positive | negative | check point",
        "text": ""
      },
      "source": ""
    }
  ],
  "investmentView": {
    "mentionedAssets": [
      {
        "asset": "",
        "relation": "",
        "context": ""
      }
    ],
    "bullArguments": [],
    "caveats": [],
    "keyTrackingVariables": [],
    "neutralEvaluation": ""
  },
  "checklist": [],
  "oneLineConclusion": "",
  "rating": {
    "importance": 3,
    "read_priority": 3,
    "verification_need": 2,
    "notion_save": "저장 | 보류 | 폐기",
    "recommended_action": "요약만 저장 | 원문 정독 | GPT 검증 | Wiki 반영 후보",
    "action": "구체적인 액션 방안 (예: 원문과 초안을 대조해 증설 계획·수주 규모·실적 전망과 밸류에이션 가정을 검증)",
    "score_rationale": ""
  },
  "status": "요약완료",
  "action": ""
}

[핵심정리 작성 방식]

"coreSummary.thesis"에는 원문의 핵심 결론과 투자적 의미를 2~4문장으로 압축합니다.

"coreSummary.details"에는 원문에서 확인되는 주요 수치, 발언, 산업 변화, 기업별 포인트를 bullet 배열로 정리합니다.

[섹션 작성 방식]

각 section은 다음 구조를 따릅니다.

1. "summary": 해당 섹션의 핵심 내용을 2~4문장으로 정리
2. "details": 원문 기반 세부내용을 bullet 배열로 정리
3. "bullArguments": 강세 논거를 구체적 근거와 함께 작성
4. "riskFactors": 반대 논리와 주의할 리스크를 작성
5. "keyVariables": 앞으로 추적해야 할 핵심 지표와 이벤트 작성

단, 원문에 명확한 근거가 없는 항목은 억지로 만들지 말고 빈 배열([])로 둡니다.

[표 작성 방식]

숫자 데이터, 재무 지표, 경쟁사 비교, 밸류에이션 비교, 체크리스트처럼 행과 열로 정리할 수 있는 자료는 반드시 "table" 필드에 넣습니다.

표로 만들 데이터가 없으면 다음처럼 비워둡니다.

{
  "headers": [],
  "rows": []
}

content나 details 안에 마크다운 표(|---|---|)를 직접 작성하지 않습니다.

[투자 관점 작성 방식]

"investmentView"는 전체 콘텐츠를 종합한 투자 판단입니다.

"mentionedAssets"에는 원문에서 직접 언급된 종목, 기업, 자산, 섹터를 정리합니다.

"bullArguments"에는 콘텐츠 전체 기준의 강세 논거를 작성합니다.

"caveats"에는 콘텐츠 전체 기준의 주의 및 반론을 작성합니다.

"keyTrackingVariables"에는 향후 추적해야 할 핵심 지표를 작성합니다.

"neutralEvaluation"에는 감정적 결론이 아니라, 강세 논리와 리스크를 함께 고려한 중립적 평가를 작성합니다.

[등급 평가 방식]

최종 JSON의 "rating" 객체에는 다음 항목을 반드시 작성합니다.

1. "importance"
- 투자판단에 미치는 중요도입니다.
- 1~5점 정수로 평가합니다.
- 매우 보수적으로 부여합니다.

2. "read_priority"
- 원문을 직접 읽어볼 우선순위입니다.
- 1~5점 정수로 평가합니다.
- 원문에 중요한 수치, 발언, 근거, 산업 변화가 많을수록 높게 평가합니다.

3. "verification_need"
- 숫자, 해석, 주장에 대한 검증 필요성입니다.
- 1~5점 정수로 평가합니다.
- 수치가 많거나, 투자 판단에 영향을 줄 수 있는 해석이 포함되어 있거나, 원문과 요약 간 왜곡 가능성이 높을수록 높게 평가합니다.

4. "notion_save"
- 다음 셋 중 하나로 작성합니다.
- "저장": 노션에 저장할 가치가 있는 자료
- "보류": 링크만 보관하거나 추후 확인할 자료
- "폐기": 저장 가치가 낮은 자료

5. "recommended_action"
- 다음 중 하나로 작성합니다.
- "요약만 저장"
- "원문 정독"
- "GPT 검증"
- "Wiki 반영 후보"

6. "action"
- recommended_action 다음에 수행할 구체적인 실행 행동 방안을 1~2문장으로 작성합니다.
- (예: "원문과 초안을 대조해 증설 계획·수주 규모·실적 전망과 밸류에이션 가정을 검증")

7. "score_rationale"
- 왜 해당 점수를 부여했는지 2~3문장으로 설명합니다.
- 특히 4점 이상을 부여할 경우, 왜 원문 정독 또는 검증이 필요한지 구체적으로 설명합니다.

[importance 평가 기준]

importance는 1~5점으로 평가하되 매우 보수적으로 부여합니다.

5점:
보유종목, 핵심 관심기업, 핵심 섹터의 투자판단을 바꿀 수 있는 자료입니다.
실적 추정, 수주잔고, Capex, 밸류에이션, 산업 구조 변화에 직접 영향을 주며, 즉시 원문 정독과 GPT 검증이 필요한 자료입니다.
전체 자료 중 상위 5% 이내에 해당할 때만 부여합니다.

4점:
노션에 저장하고 핵심 부분을 읽어볼 가치가 있는 자료입니다.
기업 또는 섹터 Wiki에 반영할 만한 근거가 있으나, 투자판단을 즉시 바꿀 정도는 아닌 자료입니다.
전체 자료 중 상위 20% 이내에 해당할 때만 부여합니다.

3점:
요약만 저장하면 충분한 참고자료입니다.
흥미롭지만 기존 투자논리 보강 수준이거나 기존 내용의 반복이 많은 자료입니다.

2점:
링크만 보관하거나 보류할 자료입니다.
투자 아이디어와 연결이 약하고 구체적 숫자나 액션 포인트가 부족한 자료입니다.

1점:
저장하지 않아도 되는 자료입니다.
홍보성, 일반론, 중복 내용이 많거나 투자 판단에 거의 도움이 되지 않는 자료입니다.

[read_priority 평가 기준]

5점:
원문을 반드시 정독해야 합니다. 핵심 수치, 산업 구조 변화, 기업 실적 전망, 경영진 발언, 수주·Capex·밸류에이션 변화가 직접 포함된 자료입니다.

4점:
원문 핵심 부분을 읽어볼 가치가 있습니다. 요약만으로는 맥락 누락 가능성이 있습니다.

3점:
요약 확인만으로도 대부분의 내용을 파악할 수 있습니다.

2점:
제목과 핵심 bullet 정도만 확인해도 충분합니다.

1점:
원문을 읽을 필요가 거의 없습니다.

[verification_need 평가 기준]

5점:
수치, 실적 추정, 밸류에이션, 계약 규모, 시장점유율, Capex, 수주잔고 등 검증이 필수인 자료입니다. 오류 시 투자판단에 큰 영향을 줄 수 있습니다.

4점:
핵심 수치나 해석의 검증 필요성이 높습니다. GPT 검증 또는 원문 대조가 권장됩니다.

3점:
일부 수치나 해석은 확인할 필요가 있지만, 전체 투자판단을 크게 흔일 정도는 아닙니다.

2점:
대체로 정성적 내용이며 검증 필요성이 낮습니다.

1점:
검증할 구체 수치나 투자 판단 요소가 거의 없습니다.

[notion_save 판단 기준]

- importance가 5이면 "저장"
- importance가 4이면 "저장"
- importance가 3이면 대체로 "저장"
- importance가 2이면 대체로 "보류"
- importance가 1이면 대체로 "폐기"

단, importance가 낮더라도 verification_need가 5이면 "보류" 또는 "저장"으로 판단할 수 있습니다.

[recommended_action 판단 기준]

- importance 5: "GPT 검증" 또는 "Wiki 반영 후보"
- importance 4: "원문 정독"
- importance 3: "요약만 저장"
- importance 1~2: "요약만 저장" 또는 "보류"

단, verification_need가 4~5이면 importance가 낮아도 "GPT 검증"을 선택할 수 있습니다.

[중요도 분포 원칙]

- 5점은 전체 자료 중 상위 5% 이내로 제한합니다.
- 4점은 전체 자료 중 상위 20% 이내로 제한합니다.
- 3점은 보통의 괜찮은 자료입니다.
- 1~2점은 저장 가치가 낮은 자료입니다.
- 단순히 “읽을 만하다”, “흥미롭다”, “섹터와 관련 있다”는 이유만으로 4점 이상을 주지 않습니다.
- 4점 이상을 주려면 반드시 원문 정독이 필요한 이유를 "score_rationale"에 구체적으로 제시합니다.

[금지사항]

1. 최종 JSON에 주석을 넣지 마세요.
2. 원문에 없는 수치를 만들어내지 마세요.
3. 강세 논거와 리스크 요인을 단순 키워드로만 쓰지 마세요.
4. 모든 내용을 content 하나에 몰아넣지 마세요.
5. 표 데이터를 content 안에 마크다운 표로 직접 작성하지 마세요.
6. 출처를 알 수 없는 경우에는 빈 문자열로 두세요.
7. 중요도를 후하게 주지 마세요.
8. "흥미롭다", "읽을 만하다", "관련 있다"는 이유만으로 importance 4점 이상을 부여하지 마세요.`;

// Helper to extract table from text content if AI mistakenly embeds it as markdown table in text
function extractTableFromContent(content: string): { cleanedContent: string; table: { headers: string[]; rows: string[][] } | null } {
  if (!content) return { cleanedContent: content, table: null };

  const lines = content.split('\n');
  let bestBlock: { start: number; end: number; lines: string[] } | null = null;
  let currentBlock: { start: number; end: number; lines: string[] } | null = null;

  const isTableLine = (line: string) => {
    const trimmed = line.trim();
    return trimmed.startsWith('|') || (trimmed.includes('|') && trimmed.split('|').length > 2);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isTableLine(line)) {
      if (!currentBlock) {
        currentBlock = { start: i, end: i, lines: [line] };
      } else {
        currentBlock.end = i;
        currentBlock.lines.push(line);
      }
    } else {
      if (currentBlock) {
        const hasSeparator = currentBlock.lines.some(l => {
          const clean = l.replace(/[|:\-\s]/g, '');
          return clean === '' && l.includes('-');
        });
        if (hasSeparator && currentBlock.lines.length >= 2) {
          if (!bestBlock || currentBlock.lines.length > bestBlock.lines.length) {
            bestBlock = currentBlock;
          }
        }
        currentBlock = null;
      }
    }
  }
  if (currentBlock) {
    const hasSeparator = currentBlock.lines.some(l => {
      const clean = l.replace(/[|:\-\s]/g, '');
      return clean === '' && l.includes('-');
    });
    if (hasSeparator && currentBlock.lines.length >= 2) {
      if (!bestBlock || currentBlock.lines.length > bestBlock.lines.length) {
        bestBlock = currentBlock;
      }
    }
  }

  if (!bestBlock) {
    currentBlock = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('|') && line.split('|').length > 2) {
        if (!currentBlock) {
          currentBlock = { start: i, end: i, lines: [line] };
        } else {
          currentBlock.end = i;
          currentBlock.lines.push(line);
        }
      } else {
        if (currentBlock) {
          if (currentBlock.lines.length >= 2) {
            if (!bestBlock || currentBlock.lines.length > bestBlock.lines.length) {
              bestBlock = currentBlock;
            }
          }
          currentBlock = null;
        }
      }
    }
    if (currentBlock && currentBlock.lines.length >= 2) {
      if (!bestBlock || currentBlock.lines.length > bestBlock.lines.length) {
        bestBlock = currentBlock;
      }
    }
  }

  if (bestBlock) {
    const rawLines = bestBlock.lines;
    const parseRow = (l: string) => {
      let trimmed = l.trim();
      if (trimmed.startsWith('|')) trimmed = trimmed.substring(1);
      if (trimmed.endsWith('|')) trimmed = trimmed.substring(0, trimmed.length - 1);
      return trimmed.split('|').map(cell => cell.trim());
    };

    const filteredLines = rawLines.filter(l => {
      const clean = l.replace(/[|:\-\s]/g, '');
      return clean.length > 0;
    });

    if (filteredLines.length > 0) {
      const headers = parseRow(filteredLines[0]);
      const rows: string[][] = [];

      for (let j = 1; j < filteredLines.length; j++) {
        const rowData = parseRow(filteredLines[j]);
        while (rowData.length < headers.length) {
          rowData.push("");
        }
        rows.push(rowData.slice(0, headers.length));
      }

      const beforeTable = lines.slice(0, bestBlock.start).join('\n');
      const afterTable = lines.slice(bestBlock.end + 1).join('\n');
      const cleanedContent = [beforeTable.trim(), afterTable.trim()].filter(Boolean).join('\n\n');

      return {
        cleanedContent,
        table: { headers, rows }
      };
    }
  }

  return { cleanedContent: content, table: null };
}

const ratingExplanations = {
  importance: {
    title: "투자 중요도 (Importance)",
    icon: "⭐️",
    descriptions: {
      5: {
        title: "투자판단 직접 영향 (행동: 원문 정독 + 검증)",
        text: "보유종목과 밀접한 연관이 있고 기존 투자 아이디어나 논리를 완전히 강화 또는 폐기할 수 있는 최고 순위의 자료입니다. 원문을 꼼꼼히 완독하고 수치 및 팩트를 철저히 검증해야 합니다."
      },
      4: {
        title: "섹터/기업 Wiki 반영 후보 (행동: 핵심 부분 정독)",
        text: "향후 산업 생태계나 기업의 Wiki 및 영구 지식 베이스에 추가할 만큼 중요한 정보나 수주, Capex 등이 포함된 핵심 리포트입니다. 중요 부분을 집중적으로 정독합니다."
      },
      3: {
        title: "참고 자료 (행동: 요약만 저장)",
        text: "매일 전개되는 일반적인 뉴스 브리핑, 단순 특징주 소식 등 단기 참고 및 백업용 정보로, 가볍게 요약본만 보관하여 필요 시 검색하는 용도입니다."
      },
      2: {
        title: "낮은 우선순위 (행동: 링크만 보관)",
        text: "새롭거나 흥미로운 주장을 담고 있으나 현재로서는 비즈니스 우선순위가 떨어지는 교육용 개념 리포트 혹은 설명문으로, 링크 위주로 가볍게 저장합니다."
      },
      1: {
        title: "저장 가치 낮음 (행동: 폐기 가능)",
        text: "정보 가치가 낮거나 중복 축적된 단순 요약본, 신뢰성이 떨어지는 단발성 루머 정보로, 보관 필요성이 낮아 즉시 폐기 가능한 자료입니다."
      }
    }
  },
  read_priority: {
    title: "정독 우선순위 (Read Priority)",
    icon: "📖",
    descriptions: {
      5: {
        title: "즉각 원문 완독 필수 (원문 100% 정독)",
        text: "요약본만으로는 누락되는 행간의 의미나 기술적 세부사항이 매우 중요하므로, 즉시 시간을 할애하여 원문 전체를 깊게 정독해야 하는 최고 순위 자료입니다."
      },
      4: {
        title: "핵심 챕터 정독 (원문 50% 부분독)",
        text: "서론/결론과 핵심적인 장표, 수치 테이블이 포함된 핵심 문단 위주로 완독하는 것이 효율적입니다. 나머지 부분은 요약본으로 대체 가능합니다."
      },
      3: {
        title: "요약본 정독으로 충분 (요약본 100% 정독)",
        text: "원문에 장황한 수식어나 배경 설명이 많아 굳이 원문까지 갈 필요 없이, 제공된 상세 AI 요약본만 집중해서 읽어도 핵심 파악에 무리가 없습니다."
      },
      2: {
        title: "가벼운 스캔 및 인덱싱 (요약본 20% 스캔)",
        text: "정독할 가치는 낮으며, 어떤 내용인지 주요 키워드와 결론만 가볍게 훑어보고 인덱싱 처리하여 검색 가능하게 보관합니다."
      },
      1: {
        title: "제목/결론만 확인 (요약본 10% 확인)",
        text: "원문이나 요약본을 읽을 필요가 전혀 없으며, 제목과 업종 키워드만 파악하여 보관함에 집어넣는 용도입니다."
      }
    }
  },
  verification_need: {
    title: "검증 필요성 (Verification Need)",
    icon: "🛡️",
    descriptions: {
      5: {
        title: "교차 검증 및 사실 확인 극도 요망",
        text: "리포트의 주장이나 추정 수치(Capex, 가동률, 단가 등)가 공격적이거나 자극적입니다. 공시 보고서나 IR 자료, 실제 재무제표를 바탕으로 원자료를 직접 찾아 검증하고 더블 체크해야 합니다."
      },
      4: {
        title: "작성자 편향 및 추정 가정 검토 필요",
        text: "애널리스트나 유튜버의 주관적 정성 평가가 가득 차 있어 편향의 여지가 큽니다. 다른 경쟁 리포트나 상반된 의견의 글들과 교차 대조가 필요합니다."
      },
      3: {
        title: "일반적 컨센서스 수준 (수치 확인 필요)",
        text: "일반적으로 널리 받아들여지는 컨센서스 데이터이므로 특별한 의구심은 필요 없으나, 실적 예측 모델에 입력할 때 주요 수치들의 일치 여부만 가볍게 확인합니다."
      },
      2: {
        title: "기초 팩트 기반 (검증 불필요)",
        text: "이미 검증이 완료된 산업 통계 수치, 정부 발표 공식 지표, 기업 공시 원문 등을 그대로 발췌한 리포트로 추가적인 진위 검증이 불필요합니다."
      },
      1: {
        title: "순수 이론/개념 자료 (검증 대상 없음)",
        text: "가치판단이나 추정 수치가 들어가지 않은 교육용 원리 설명, 일반 지식 콘텐츠로 검증할 정량 데이터가 전혀 없는 서술적 자료입니다."
      }
    }
  }
};

interface MemoEditorProps {
  report: StructuredReport | null; // null if creating a new one
  onSave: (report: StructuredReport) => void;
  onCancel: () => void;
}

export default function MemoEditor({ report, onSave, onCancel }: MemoEditorProps) {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    const scroller = document.getElementById("editor-scroller");
    if (scroller) {
      scroller.scrollTo({ top: 0, behavior: "smooth" });
    }
    setTimeout(() => setToast(null), 5000);
  };

  // AI Helper states
  const [pasteText, setPasteText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isAiHelperOpen, setIsAiHelperOpen] = useState(true);
  const [aiMode, setAiMode] = useState<"instant" | "paste">("instant"); // Default to instant!
  const [rawTextForAi, setRawTextForAi] = useState("");
  const [isGeneratingInstant, setIsGeneratingInstant] = useState(false);
  const [instantCategory, setInstantCategory] = useState<'youtube' | 'telegram' | 'report' | 'webpage'>('webpage');

  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<'youtube' | 'telegram' | 'report' | 'webpage'>('webpage');
  const [sectors, setSectors] = useState<string[]>([]);
  const [newSector, setNewSector] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceUrls, setSourceUrls] = useState<string[]>([""]);
  const [sourceName, setSourceName] = useState("");
  const [summary, setSummary] = useState("");
  const [importance, setImportance] = useState<number>(3); // Default to 3
  const [verified, setVerified] = useState<"O" | "X">("X");
  const [status, setStatus] = useState<"요약완료" | "정독필요" | "검증중" | "검증완료" | "Wiki반영">("요약완료");
  const [action, setAction] = useState<StructuredReport["action"]>("");
  const [keyPoints, setKeyPoints] = useState<string[]>(["", "", ""]);
  const [sections, setSections] = useState<Section[]>([]);
  const [oneLineConclusion, setOneLineConclusion] = useState("");
  const [checklist, setChecklist] = useState<string[]>([]);
  const [editorSynthesis, setEditorSynthesis] = useState<{
    title: string;
    summary: string;
    comparisons: string[];
    portfolioImplication: string;
  }>({
    title: "",
    summary: "",
    comparisons: [],
    portfolioImplication: ""
  });
  
  // Multi-dimensional rating fields state
  const [readPriority, setReadPriority] = useState<number>(3);
  const [verificationNeed, setVerificationNeed] = useState<number>(2);
  const [activeExplainTab, setActiveExplainTab] = useState<'importance' | 'read_priority' | 'verification_need'>('importance');
  const [notionSave, setNotionSave] = useState<string>("보류");
  const [recommendedAction, setRecommendedAction] = useState<string>("요약만 저장");
  const [scoreRationale, setScoreRationale] = useState<string>("");

  // Investment view states
  const [thesis, setThesis] = useState("");
  const [implications, setImplications] = useState<string[]>([]);
  const [risks, setRisks] = useState<string[]>([]);
  const [keyTrackingVariables, setKeyTrackingVariables] = useState<string[]>([]);
  const [mentionedAssets, setMentionedAssets] = useState<MentionedAsset[]>([]);
  const [bullArguments, setBullArguments] = useState<string[]>([]);
  const [caveats, setCaveats] = useState<string[]>([]);
  const [neutralEvaluation, setNeutralEvaluation] = useState("");

  // Sync form states with report when editing
  useEffect(() => {
    if (report) {
      setTitle(report.title);
      setDate(report.date);
      setCategory(report.category);
      setSectors(report.sectors || []);
      setSourceUrl(report.sourceUrl || "");
      if (report.sourceUrls && Array.isArray(report.sourceUrls)) {
        setSourceUrls(report.sourceUrls.length > 0 ? [...report.sourceUrls] : [""]);
      } else {
        setSourceUrls(report.sourceUrl ? [report.sourceUrl] : [""]);
      }
      setSourceName(report.sourceName || "");
      setSummary(report.summary);
      setImportance(report.importance || 3);
      setVerified(report.verified || "X");
      setStatus((report.status as any) || "요약완료");
      setAction(report.action !== undefined ? report.action : "");
      setKeyPoints(report.keyPoints.length > 0 ? [...report.keyPoints] : ["", "", ""]);
      setSections(report.sections ? JSON.parse(JSON.stringify(report.sections)) : []);
      setOneLineConclusion(report.oneLineConclusion || "");
      setChecklist(report.checklist ? [...report.checklist] : []);
      setEditorSynthesis(report.editorSynthesis ? JSON.parse(JSON.stringify(report.editorSynthesis)) : {
        title: "",
        summary: "",
        comparisons: [],
        portfolioImplication: ""
      });
      
      const inv = report.investmentView || {};
      setThesis(inv.thesis || "");
      setImplications(inv.implications ? [...inv.implications] : []);
      const rList = inv.risks ? [...inv.risks] : [];
      const cList = inv.caveats ? [...inv.caveats] : [];
      setRisks(rList.length > 0 ? rList : cList);
      setCaveats(cList.length > 0 ? cList : rList);
      setKeyTrackingVariables(inv.keyTrackingVariables ? [...inv.keyTrackingVariables] : []);
      setMentionedAssets(inv.mentionedAssets ? JSON.parse(JSON.stringify(inv.mentionedAssets)) : []);
      setBullArguments(inv.bullArguments ? [...inv.bullArguments] : []);
      setNeutralEvaluation(inv.neutralEvaluation || "");

      if (report.rating) {
        setReadPriority(report.rating.read_priority || 3);
        setVerificationNeed(report.rating.verification_need || 2);
        setNotionSave(report.rating.notion_save || "보류");
        setRecommendedAction(report.rating.recommended_action || "요약만 저장");
        if (report.rating.action) setAction(report.rating.action);
        setScoreRationale(report.rating.score_rationale || "");
      } else {
        setReadPriority(3);
        setVerificationNeed(report.verified === "O" ? 4 : 2);
        setNotionSave((report.importance || 3) >= 4 ? "저장" : "보류");
        setRecommendedAction(report.action || "요약만 저장");
        setScoreRationale("");
      }
    } else {
      // Pre-fill clean state for "New Memo"
      setTitle("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategory("webpage");
      setSectors(["AI", "반도체"]);
      setSourceUrl("");
      setSourceUrls([""]);
      setSourceName("");
      setSummary("");
      setImportance(3);
      setVerified("X");
      setStatus("요약완료");
      setAction("");
      setKeyPoints(["", "", ""]);
      setOneLineConclusion("");
      setChecklist([]);
      setEditorSynthesis({
        title: "",
        summary: "",
        comparisons: [],
        portfolioImplication: ""
      });
      setThesis("");
      setImplications([]);
      setRisks([]);
      setKeyTrackingVariables([]);
      setSections([
        {
          id: "sec-init-1",
          title: "01 | [주제 입력] 첫 번째 분석 주제",
          content: "분석 내용을 기록해 주세요.",
          quote: { text: "", author: "" },
          table: { headers: ["구분", "내용"], rows: [["예시 데이터 1", "내용 1"]] },
          callout: { type: "warning", text: "체크해야 할 포인트를 적어주세요." }
        }
      ]);
      setMentionedAssets([{ asset: "예: 삼성전자 (005930)", relation: "수혜 예상", context: "AI 시장 성장에 따른 실적 리레이팅 모멘텀" }]);
      setBullArguments(["시장 지배력의 점진적 향상", "견조한 레거시 수요"]);
      setCaveats(["글로벌 금리 고조 리스크"]);
      setNeutralEvaluation("시장 변동성에 주의하되 성장 섹터에 집중하는 보수적 접근이 필요합니다.");

      setReadPriority(3);
      setVerificationNeed(2);
      setNotionSave("보류");
      setRecommendedAction("요약만 저장");
      setScoreRationale("");
    }
  }, [report]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(EXTERNAL_AI_PROMPT);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      triggerToast("프롬프트 복사에 실패했습니다. 직접 드래그하여 복사해 주세요.", "error");
    }
  };

  const handleInstantGenerate = async () => {
    if (!rawTextForAi.trim()) {
      triggerToast("분석할 원문(텍스트, 유튜브 스크립트 등)을 먼저 입력해 주세요.", "info");
      return;
    }

    setIsGeneratingInstant(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: instantCategory,
          text: rawTextForAi
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "분석 중 오류가 발생했습니다.");
      }

      const data = await res.json();

      // Automatically fill in the form
      if (data.title) setTitle(data.title);
      if (data.category) {
        const cat = data.category.toLowerCase();
        if (['youtube', 'telegram', 'report', 'webpage'].includes(cat)) {
          setCategory(cat as any);
        }
      }
      if (data.sectors && Array.isArray(data.sectors)) {
        setSectors(data.sectors.map((s: any) => String(s)));
      }
      if (data.sourceUrls && Array.isArray(data.sourceUrls)) {
        setSourceUrls(data.sourceUrls.map((u: any) => String(u)));
        setSourceUrl(data.sourceUrls[0] || "");
      } else if (data.sourceUrl !== undefined) {
        setSourceUrl(data.sourceUrl);
        setSourceUrls(data.sourceUrl ? [data.sourceUrl] : [""]);
      }
      
      // Map coreSummary if present, else fallback to standard summary/keyPoints
      if (data.coreSummary) {
        if (data.coreSummary.thesis) {
          setSummary(data.coreSummary.thesis);
        } else if (data.summary) {
          setSummary(data.summary);
        }
        if (data.coreSummary.details && Array.isArray(data.coreSummary.details)) {
          const kp = data.coreSummary.details.map((p: any) => String(p));
          while (kp.length < 3) kp.push("");
          setKeyPoints(kp);
        } else if (data.keyPoints && Array.isArray(data.keyPoints)) {
          const kp = data.keyPoints.map((p: any) => String(p));
          while (kp.length < 3) kp.push("");
          setKeyPoints(kp);
        }
      } else {
        if (data.summary) setSummary(data.summary);
        if (data.keyPoints && Array.isArray(data.keyPoints)) {
          const kp = data.keyPoints.map((p: any) => String(p));
          while (kp.length < 3) kp.push("");
          setKeyPoints(kp);
        }
      }

      if (data.importance !== undefined) setImportance(Number(data.importance));
      const isVerified = data.verified !== undefined ? data.verified : data.verification;
      if (isVerified !== undefined) setVerified(isVerified === "O" ? "O" : "X");
      if (data.status !== undefined) setStatus(data.status);
      if (data.action !== undefined) setAction(data.action);

      if (data.rating) {
        setReadPriority(Number(data.rating.read_priority) || 3);
        setVerificationNeed(Number(data.rating.verification_need) || 2);
        setNotionSave(data.rating.notion_save || "보류");
        setRecommendedAction(data.rating.recommended_action || "요약만 저장");
        if (data.rating.action) setAction(data.rating.action);
        setScoreRationale(data.rating.score_rationale || "");
        if (data.rating.importance !== undefined) setImportance(Number(data.rating.importance));
      } else {
        setReadPriority(3);
        setVerificationNeed(isVerified === "O" ? 4 : 2);
        setNotionSave((data.importance !== undefined ? Number(data.importance) : 3) >= 4 ? "저장" : "보류");
        setRecommendedAction(data.action || "요약만 저장");
        setScoreRationale("AI에 의해 자동으로 추정된 초기 다차원 등급입니다.");
      }
      
      if (data.sections && Array.isArray(data.sections)) {
        const parsedSections = data.sections.map((sec: any, idx: number) => {
          let sectionContent = sec.content || "";
          if (!sectionContent || sec.summary || (sec.details && sec.details.length > 0)) {
            const parts: string[] = [];
            if (sec.summary) {
              parts.push(sec.summary);
            }
            if (sec.details && Array.isArray(sec.details) && sec.details.length > 0) {
              parts.push(sec.details.map((d: any) => `- ${d}`).join('\n'));
            }
            if (sec.bullArguments && Array.isArray(sec.bullArguments) && sec.bullArguments.length > 0) {
              parts.push(`> ✅ 강세 논거\n${sec.bullArguments.map((b: any) => `- ${b}`).join('\n')}`);
            }
            if (sec.keyVariables && Array.isArray(sec.keyVariables) && sec.keyVariables.length > 0) {
              parts.push(`> ⚠️ 핵심 변수\n${sec.keyVariables.map((v: any) => `- ${v}`).join('\n')}`);
            }
            if (sec.riskFactors && Array.isArray(sec.riskFactors) && sec.riskFactors.length > 0) {
              parts.push(`> ❌ 리스크\n${sec.riskFactors.map((r: any) => `- ${r}`).join('\n')}`);
            }
            if (parts.length > 0) {
              sectionContent = parts.join('\n\n');
            }
          }

          let parsedTable = sec.table ? {
            headers: Array.isArray(sec.table.headers) ? sec.table.headers : ["구분", "상세 내용"],
            rows: Array.isArray(sec.table.rows) ? sec.table.rows : [["", ""]]
          } : null;

          // Extract table from content if present
          const extraction = extractTableFromContent(sectionContent);
          if (extraction.table) {
            sectionContent = extraction.cleanedContent;
            parsedTable = extraction.table;
          } else if (!parsedTable) {
            parsedTable = { headers: ["구분", "상세 내용"], rows: [["", ""]] };
          }

          return {
            id: sec.id || `sec-parsed-${idx}-${Date.now()}`,
            title: sec.title || `섹션 ${idx + 1}`,
            content: sectionContent,
            summary: sec.summary || "",
            details: Array.isArray(sec.details) ? sec.details.map((d: any) => String(d)) : [],
            bullArguments: Array.isArray(sec.bullArguments) ? sec.bullArguments.map((b: any) => String(b)) : [],
            riskFactors: Array.isArray(sec.riskFactors) ? sec.riskFactors.map((r: any) => String(r)) : [],
            keyVariables: Array.isArray(sec.keyVariables) ? sec.keyVariables.map((v: any) => String(v)) : [],
            quote: sec.quote ? {
              text: sec.quote.text || "",
              author: sec.quote.author || ""
            } : { text: "", author: "" },
            callout: sec.callout ? {
              type: sec.callout.type === "warning" ? "check point" : sec.callout.type === "risk" ? "negative" : (sec.callout.type || "check point"),
              text: sec.callout.text || ""
            } : { type: "check point", text: "" },
            table: parsedTable,
            source: sec.source || ""
          };
        });
        setSections(parsedSections);
      }
      
      if (data.sourceName) setSourceName(data.sourceName);
      if (data.oneLineConclusion) setOneLineConclusion(data.oneLineConclusion);
      if (data.checklist && Array.isArray(data.checklist)) {
        setChecklist(data.checklist.map((c: any) => String(c)));
      }
      if (data.editorSynthesis) {
        setEditorSynthesis({
          title: data.editorSynthesis.title || "",
          summary: data.editorSynthesis.summary || "",
          comparisons: Array.isArray(data.editorSynthesis.comparisons) ? data.editorSynthesis.comparisons.map((c: any) => String(c)) : [],
          portfolioImplication: data.editorSynthesis.portfolioImplication || ""
        });
      }

      if (data.investmentView) {
        const iv = data.investmentView;
        if (iv.thesis) setThesis(iv.thesis);
        if (iv.implications && Array.isArray(iv.implications)) setImplications(iv.implications.map((i: any) => String(i)));
        if (iv.risks && Array.isArray(iv.risks)) setRisks(iv.risks.map((r: any) => String(r)));
        if (iv.keyTrackingVariables && Array.isArray(iv.keyTrackingVariables)) setKeyTrackingVariables(iv.keyTrackingVariables.map((v: any) => String(v)));

        if (iv.mentionedAssets && Array.isArray(iv.mentionedAssets)) {
          setMentionedAssets(iv.mentionedAssets.map((asset: any) => ({
            asset: asset.asset || asset.name || "",
            relation: asset.relation || "",
            context: asset.context || ""
          })));
        }
        if (iv.bullArguments && Array.isArray(iv.bullArguments)) {
          setBullArguments(iv.bullArguments.map((b: any) => String(b)));
        }
        
        let caveatsList: string[] = [];
        if (iv.caveats && Array.isArray(iv.caveats) && iv.caveats.length > 0) {
          caveatsList = iv.caveats.map((c: any) => String(c));
        } else if (iv.riskFactors && Array.isArray(iv.riskFactors) && iv.riskFactors.length > 0) {
          caveatsList = iv.riskFactors.map((r: any) => String(r));
        } else if (iv.risks && Array.isArray(iv.risks) && iv.risks.length > 0) {
          caveatsList = iv.risks.map((r: any) => String(r));
        }
        setCaveats(caveatsList);

        if (iv.risks && Array.isArray(iv.risks) && iv.risks.length > 0) {
          setRisks(iv.risks.map((r: any) => String(r)));
        } else if (caveatsList.length > 0) {
          setRisks(caveatsList);
        }

        setNeutralEvaluation(iv.neutralEvaluation || "");
      }

      triggerToast("🎉 AI가 원문을 분석하여 노션 스타일 폼을 자동으로 완성했습니다! 아래 입력된 내용을 확인해 보세요.", "success");
      setRawTextForAi(""); // Clear input on success
    } catch (err: any) {
      console.error("Instant Generate Error:", err);
      triggerToast(`분석 실패: ${err.message}`, "error");
    } finally {
      setIsGeneratingInstant(false);
    }
  };

  const handleParseAndFill = () => {
    if (!pasteText.trim()) {
      triggerToast("AI가 출력한 JSON 텍스트를 먼저 입력창에 붙여넣어 주세요.", "info");
      return;
    }

    try {
      let cleanedText = pasteText.trim();
      
      // 1. Extract markdown codeblock if present
      const jsonMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanedText = jsonMatch[1].trim();
      }
      
      // 2. Find start and end braces of JSON object
      const firstBrace = cleanedText.indexOf("{");
      const lastBrace = cleanedText.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      }

      const data = JSON.parse(cleanedText);

      // 3. Fill in basic states
      if (data.title) setTitle(data.title);
      if (data.category) {
        const cat = data.category.toLowerCase();
        if (['youtube', 'telegram', 'report', 'webpage'].includes(cat)) {
          setCategory(cat as any);
        }
      }
      if (data.sectors && Array.isArray(data.sectors)) {
        setSectors(data.sectors.map((s: any) => String(s)));
      }
      if (data.sourceUrls && Array.isArray(data.sourceUrls)) {
        setSourceUrls(data.sourceUrls.map((u: any) => String(u)));
        setSourceUrl(data.sourceUrls[0] || "");
      } else if (data.sourceUrl !== undefined) {
        setSourceUrl(data.sourceUrl);
        setSourceUrls(data.sourceUrl ? [data.sourceUrl] : [""]);
      }
      
      // Map coreSummary if present, else fallback to standard summary/keyPoints
      if (data.coreSummary) {
        if (data.coreSummary.thesis) {
          setSummary(data.coreSummary.thesis);
        } else if (data.summary) {
          setSummary(data.summary);
        }
        if (data.coreSummary.details && Array.isArray(data.coreSummary.details)) {
          const kp = data.coreSummary.details.map((p: any) => String(p));
          while (kp.length < 3) kp.push("");
          setKeyPoints(kp);
        } else if (data.keyPoints && Array.isArray(data.keyPoints)) {
          const kp = data.keyPoints.map((p: any) => String(p));
          while (kp.length < 3) kp.push("");
          setKeyPoints(kp);
        }
      } else {
        if (data.summary) setSummary(data.summary);
        if (data.keyPoints && Array.isArray(data.keyPoints)) {
          const kp = data.keyPoints.map((p: any) => String(p));
          while (kp.length < 3) kp.push("");
          setKeyPoints(kp);
        }
      }

      if (data.importance !== undefined) setImportance(Number(data.importance));
      const isVerified = data.verified !== undefined ? data.verified : data.verification;
      if (isVerified !== undefined) setVerified(isVerified === "O" ? "O" : "X");
      if (data.status !== undefined) setStatus(data.status);
      if (data.action !== undefined) setAction(data.action);

      if (data.rating) {
        setReadPriority(Number(data.rating.read_priority) || 3);
        setVerificationNeed(Number(data.rating.verification_need) || 2);
        setNotionSave(data.rating.notion_save || "보류");
        setRecommendedAction(data.rating.recommended_action || "요약만 저장");
        if (data.rating.action) setAction(data.rating.action);
        setScoreRationale(data.rating.score_rationale || "");
        if (data.rating.importance !== undefined) setImportance(Number(data.rating.importance));
      } else {
        setReadPriority(3);
        setVerificationNeed(isVerified === "O" ? 4 : 2);
        setNotionSave((data.importance !== undefined ? Number(data.importance) : 3) >= 4 ? "저장" : "보류");
        setRecommendedAction(data.action || "요약만 저장");
        setScoreRationale("AI에 의해 자동으로 추정된 초기 다차원 등급입니다.");
      }
      
      // 4. Fill in sections
      if (data.sections && Array.isArray(data.sections)) {
        const parsedSections = data.sections.map((sec: any, idx: number) => {
          let sectionContent = sec.content || "";
          if (!sectionContent || sec.summary || (sec.details && sec.details.length > 0)) {
            const parts: string[] = [];
            if (sec.summary) {
              parts.push(sec.summary);
            }
            if (sec.details && Array.isArray(sec.details) && sec.details.length > 0) {
              parts.push(sec.details.map((d: any) => `- ${d}`).join('\n'));
            }
            if (sec.bullArguments && Array.isArray(sec.bullArguments) && sec.bullArguments.length > 0) {
              parts.push(`> ✅ 강세 논거\n${sec.bullArguments.map((b: any) => `- ${b}`).join('\n')}`);
            }
            if (sec.keyVariables && Array.isArray(sec.keyVariables) && sec.keyVariables.length > 0) {
              parts.push(`> ⚠️ 핵심 변수\n${sec.keyVariables.map((v: any) => `- ${v}`).join('\n')}`);
            }
            if (sec.riskFactors && Array.isArray(sec.riskFactors) && sec.riskFactors.length > 0) {
              parts.push(`> ❌ 리스크\n${sec.riskFactors.map((r: any) => `- ${r}`).join('\n')}`);
            }
            if (parts.length > 0) {
              sectionContent = parts.join('\n\n');
            }
          }

          let parsedTable = sec.table ? {
            headers: Array.isArray(sec.table.headers) ? sec.table.headers : ["구분", "상세 내용"],
            rows: Array.isArray(sec.table.rows) ? sec.table.rows : [["", ""]]
          } : null;

          // Extract table from content if present
          const extraction = extractTableFromContent(sectionContent);
          if (extraction.table) {
            sectionContent = extraction.cleanedContent;
            parsedTable = extraction.table;
          } else if (!parsedTable) {
            parsedTable = { headers: ["구분", "상세 내용"], rows: [["", ""]] };
          }

          return {
            id: sec.id || `sec-parsed-${idx}-${Date.now()}`,
            title: sec.title || `섹션 ${idx + 1}`,
            content: sectionContent,
            summary: sec.summary || "",
            details: Array.isArray(sec.details) ? sec.details.map((d: any) => String(d)) : [],
            bullArguments: Array.isArray(sec.bullArguments) ? sec.bullArguments.map((b: any) => String(b)) : [],
            riskFactors: Array.isArray(sec.riskFactors) ? sec.riskFactors.map((r: any) => String(r)) : [],
            keyVariables: Array.isArray(sec.keyVariables) ? sec.keyVariables.map((v: any) => String(v)) : [],
            quote: sec.quote ? {
              text: sec.quote.text || "",
              author: sec.quote.author || ""
            } : { text: "", author: "" },
            callout: sec.callout ? {
              type: sec.callout.type === "warning" ? "check point" : sec.callout.type === "risk" ? "negative" : (sec.callout.type || "check point"),
              text: sec.callout.text || ""
            } : { type: "check point", text: "" },
            table: parsedTable,
            source: sec.source || ""
          };
        });
        setSections(parsedSections);
      }
      
      if (data.sourceName) setSourceName(data.sourceName);
      if (data.oneLineConclusion) setOneLineConclusion(data.oneLineConclusion);
      if (data.checklist && Array.isArray(data.checklist)) {
        setChecklist(data.checklist.map((c: any) => String(c)));
      }
      if (data.editorSynthesis) {
        setEditorSynthesis({
          title: data.editorSynthesis.title || "",
          summary: data.editorSynthesis.summary || "",
          comparisons: Array.isArray(data.editorSynthesis.comparisons) ? data.editorSynthesis.comparisons.map((c: any) => String(c)) : [],
          portfolioImplication: data.editorSynthesis.portfolioImplication || ""
        });
      }

      // 5. Fill in investment views
      if (data.investmentView) {
        const iv = data.investmentView;
        if (iv.thesis) setThesis(iv.thesis);
        if (iv.implications && Array.isArray(iv.implications)) setImplications(iv.implications.map((i: any) => String(i)));
        if (iv.risks && Array.isArray(iv.risks)) setRisks(iv.risks.map((r: any) => String(r)));
        if (iv.keyTrackingVariables && Array.isArray(iv.keyTrackingVariables)) setKeyTrackingVariables(iv.keyTrackingVariables.map((v: any) => String(v)));

        if (iv.mentionedAssets && Array.isArray(iv.mentionedAssets)) {
          setMentionedAssets(iv.mentionedAssets.map((asset: any) => ({
            asset: asset.asset || asset.name || "",
            relation: asset.relation || "",
            context: asset.context || ""
          })));
        }
        if (iv.bullArguments && Array.isArray(iv.bullArguments)) {
          setBullArguments(iv.bullArguments.map((b: any) => String(b)));
        }
        
        let caveatsList: string[] = [];
        if (iv.caveats && Array.isArray(iv.caveats) && iv.caveats.length > 0) {
          caveatsList = iv.caveats.map((c: any) => String(c));
        } else if (iv.riskFactors && Array.isArray(iv.riskFactors) && iv.riskFactors.length > 0) {
          caveatsList = iv.riskFactors.map((r: any) => String(r));
        } else if (iv.risks && Array.isArray(iv.risks) && iv.risks.length > 0) {
          caveatsList = iv.risks.map((r: any) => String(r));
        }
        setCaveats(caveatsList);

        if (iv.risks && Array.isArray(iv.risks) && iv.risks.length > 0) {
          setRisks(iv.risks.map((r: any) => String(r)));
        } else if (caveatsList.length > 0) {
          setRisks(caveatsList);
        }

        setNeutralEvaluation(iv.neutralEvaluation || "");
      }

      triggerToast("🎉 AI 분석 JSON 데이터가 성공적으로 폼에 자동 입력되었습니다! 아래 폼 필드들을 검토해 보시고 저장해 주세요.", "success");
      setPasteText("");
    } catch (err: any) {
      console.error("JSON parsing error: ", err);
      triggerToast(`파싱 실패: 올바른 JSON 형식이 아닙니다. (오류: ${err.message})`, "error");
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      triggerToast("제목을 입력해 주세요.", "error");
      return;
    }

    const nonEvUrls = sourceUrls.filter(u => u.trim() !== "");
    const savedReport: StructuredReport = {
      id: report?.id || `memo-${Date.now()}`,
      title,
      date,
      category,
      sourceUrl: nonEvUrls[0] || "",
      sourceUrls: nonEvUrls,
      sourceName: sourceName.trim() || undefined,
      summary,
      importance,
      oneLineConclusion: oneLineConclusion.trim() || undefined,
      checklist: checklist.filter(c => c.trim() !== ""),
      editorSynthesis: (editorSynthesis.title || editorSynthesis.summary || editorSynthesis.portfolioImplication || (editorSynthesis.comparisons && editorSynthesis.comparisons.length > 0)) ? {
        title: editorSynthesis.title,
        summary: editorSynthesis.summary,
        comparisons: editorSynthesis.comparisons.filter(c => c.trim() !== ""),
        portfolioImplication: editorSynthesis.portfolioImplication
      } : undefined,
      rating: {
        importance,
        read_priority: readPriority,
        verification_need: verificationNeed,
        notion_save: notionSave,
        recommended_action: recommendedAction,
        action: action,
        score_rationale: scoreRationale
      },
      verified,
      status,
      action,
      keyPoints: keyPoints.filter(p => p.trim() !== ""),
      sections: sections.map((sec, idx) => ({
        ...sec,
        id: sec.id || `sec-${idx}-${Date.now()}`
      })),
      investmentView: {
        thesis: thesis.trim() || undefined,
        implications: implications.filter(i => i.trim() !== ""),
        risks: risks.filter(r => r.trim() !== ""),
        keyTrackingVariables: keyTrackingVariables.filter(v => v.trim() !== ""),
        mentionedAssets: mentionedAssets.filter(a => a.asset.trim() !== ""),
        bullArguments: bullArguments.filter(b => b.trim() !== ""),
        caveats: caveats.filter(c => c.trim() !== ""),
        neutralEvaluation
      },
      rawText: report?.rawText,
      attachedPdfName: report?.attachedPdfName,
      attachedPdfSize: report?.attachedPdfSize,
      sectors: sectors.filter(s => s.trim() !== ""),
      updatedAt: Date.now()
    };

    onSave(savedReport);
  };

  // Section Management helpers
  const addSection = () => {
    const newSec: Section = {
      id: `sec-new-${Date.now()}`,
      title: `${String(sections.length + 1).padStart(2, "0")} | [분석] 새로운 분석 주제`,
      content: "",
      quote: { text: "", author: "" },
      table: { headers: ["구분", "상세 내용"], rows: [["", ""]] },
      callout: { type: "check point", text: "" }
    };
    setSections([...sections, newSec]);
  };

  const removeSection = (idx: number) => {
    setSections(sections.filter((_, sIdx) => sIdx !== idx));
  };

  const updateSectionField = (idx: number, field: keyof Section, value: any) => {
    const updated = [...sections];
    updated[idx] = { ...updated[idx], [field]: value };
    setSections(updated);
  };

  const updateSectionQuote = (idx: number, qField: "text" | "author", value: string) => {
    const updated = [...sections];
    const quote = updated[idx].quote || { text: "", author: "" };
    updated[idx] = {
      ...updated[idx],
      quote: { ...quote, [qField]: value }
    };
    setSections(updated);
  };

  const updateSectionCallout = (idx: number, cField: "type" | "text", value: string) => {
    const updated = [...sections];
    const callout = updated[idx].callout || { type: "check point", text: "" };
    updated[idx] = {
      ...updated[idx],
      callout: { ...callout, [cField]: value }
    };
    setSections(updated);
  };

  // Custom Table helpers inside sections
  const updateSectionTableHeader = (secIdx: number, hIdx: number, value: string) => {
    const updated = [...sections];
    const table = updated[secIdx].table || { headers: [], rows: [] };
    const headers = [...table.headers];
    headers[hIdx] = value;
    updated[secIdx] = { ...updated[secIdx], table: { ...table, headers } };
    setSections(updated);
  };

  const updateSectionTableCell = (secIdx: number, rIdx: number, cIdx: number, value: string) => {
    const updated = [...sections];
    const table = updated[secIdx].table || { headers: [], rows: [] };
    const rows = table.rows.map((row, rI) => {
      if (rI !== rIdx) return row;
      const newRow = [...row];
      newRow[cIdx] = value;
      return newRow;
    });
    updated[secIdx] = { ...updated[secIdx], table: { ...table, rows } };
    setSections(updated);
  };

  const addColumnToSectionTable = (secIdx: number) => {
    const updated = [...sections];
    const table = updated[secIdx].table || { headers: ["구분", "비교"], rows: [["", ""]] };
    const headers = [...table.headers, "새 열"];
    const rows = table.rows.map(row => [...row, ""]);
    updated[secIdx] = { ...updated[secIdx], table: { headers, rows } };
    setSections(updated);
  };

  const addRowToSectionTable = (secIdx: number) => {
    const updated = [...sections];
    const table = updated[secIdx].table || { headers: ["구분"], rows: [[""]] };
    const newRow = Array(table.headers.length).fill("");
    updated[secIdx] = { ...updated[secIdx], table: { ...table, rows: [...table.rows, newRow] } };
    setSections(updated);
  };

  const removeRowFromSectionTable = (secIdx: number, rIdx: number) => {
    const updated = [...sections];
    const table = updated[secIdx].table;
    if (!table) return;
    const rows = table.rows.filter((_, idx) => idx !== rIdx);
    updated[secIdx] = { ...updated[secIdx], table: { ...table, rows } };
    setSections(updated);
  };

  // Mentioned Assets dynamic helpers
  const addMentionedAsset = () => {
    setMentionedAssets([...mentionedAssets, { asset: "", relation: "", context: "" }]);
  };

  return (
    <div className="flex flex-col h-full bg-white" id="memo-editor-container">
      {/* Top sticky action bar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
        <h2 className="text-base font-bold text-[#1A1A1A]">
          {report ? "인사이트 메모 수정" : "새로운 인사이트 메모 작성"}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-black font-bold px-4 py-2 rounded-lg text-xs transition-all"
          >
            <X className="w-3.5 h-3.5" />
            <span>취소</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>저장하기</span>
          </button>
        </div>
      </div>

      {/* Main Form Scroller */}
      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-4xl mx-auto w-full space-y-8" id="editor-scroller">
        {toast && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 animate-fade-in shadow-sm ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : toast.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-blue-50 border-blue-200 text-blue-850"
          }`} id="editor-toast">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span>{toast.type === "success" ? "✨" : toast.type === "error" ? "⚠️" : "💡"}</span>
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5"
            >
              ×
            </button>
          </div>
        )}
        
        {/* AI SMART PASTE ASSISTANT PANEL */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-4" id="ai-smart-paste-assistant">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  AI 스마트 분석 & 스마트 폼 자동완성
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full">노션 스타일</span>
                </h4>
                <p className="text-xs text-gray-500">원문을 앱 안에서 즉시 분석하거나, 외부 AI 분석 결과를 복사/붙여넣기하여 스마트 폼을 자동완성하세요.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAiHelperOpen(!isAiHelperOpen)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50"
            >
              {isAiHelperOpen ? "숨기기" : "사용 가이드 열기"}
            </button>
          </div>

          {isAiHelperOpen && (
            <div className="space-y-4 pt-2 border-t border-indigo-100/60" id="ai-assistant-body">
              {/* Tab Switcher */}
              <div className="flex items-center gap-2 p-1 bg-gray-100/80 rounded-xl max-w-md">
                <button
                  type="button"
                  onClick={() => setAiMode("instant")}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                    aiMode === "instant"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  ⚡ 원클릭 AI 즉시 분석 및 생성 (추천)
                </button>
                <button
                  type="button"
                  onClick={() => setAiMode("paste")}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                    aiMode === "paste"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  📋 외부 AI 결과 붙여넣기
                </button>
              </div>

              {aiMode === "instant" ? (
                /* INSTANT MODE PANEL */
                <div className="bg-white p-5 rounded-xl border border-gray-100 space-y-4 animate-fade-in" id="ai-instant-panel">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-1 space-y-1">
                      <label className="text-xs font-semibold text-gray-500">원문 구분 (카테고리)</label>
                      <select
                        value={instantCategory}
                        onChange={(e) => setInstantCategory(e.target.value as any)}
                        className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      >
                        <option value="report">📢 산업/기업 리포트 (Report)</option>
                        <option value="youtube">🎥 유튜브 동영상 자막 (YouTube)</option>
                        <option value="telegram">💬 텔레그램 뉴스 (Telegram)</option>
                        <option value="webpage">🌐 일반 웹페이지 뉴스/칼럼 (Webpage)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        아래 입력창에 분석할 원문 텍스트(기사 전문, 유튜브 자막, 투자 레포트 텍스트 등)를 붙여넣으신 후 <strong>[⚡ AI 즉시 분석 및 자동완성]</strong> 버튼을 클릭하세요.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 flex justify-between">
                      <span>분석할 원문 텍스트</span>
                      {rawTextForAi.length > 0 && (
                        <span className="text-gray-400 font-mono text-[10px]">{rawTextForAi.length.toLocaleString()}자 입력됨</span>
                      )}
                    </label>
                    <textarea
                      value={rawTextForAi}
                      onChange={(e) => setRawTextForAi(e.target.value)}
                      placeholder="여기에 유튜브 자막 스크립트, 텔레그램 뉴스글, 또는 기업 보고서의 전문을 붙여넣으세요..."
                      className="w-full h-36 text-xs p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleInstantGenerate}
                    disabled={isGeneratingInstant}
                    className={`w-full flex items-center justify-center gap-1.5 font-bold py-3 px-4 rounded-lg text-xs transition-colors shadow-sm ${
                      isGeneratingInstant
                        ? "bg-indigo-400 text-indigo-100 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                    }`}
                  >
                    {isGeneratingInstant ? (
                      <>
                        <span className="animate-spin text-sm">⌛</span>
                        <span>AI 분석 및 비교 표 구조화 진행 중... 약 5~10초 소요됩니다.</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>⚡ 원문 입력하고 즉시 AI 투자 리포트 및 비교 표 자동완성</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* PASTE MODE PANEL (Step 1 and Step 2) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" id="ai-paste-panel">
                  {/* Step 1: Prompt Copier */}
                  <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-black">1</span>
                        최적화 프롬프트 복사하기
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPrompt}
                        className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors border border-indigo-100"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">복사 완료!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>프롬프트 복사</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      아래 버튼을 눌러 특별 제작된 전용 프롬프트를 복사한 후, ChatGPT나 Gemini에 원문(뉴스 기사, 유튜브 스크립트 등)과 함께 던져주세요.
                    </p>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 max-h-36 overflow-y-auto">
                      <pre className="text-[10px] text-gray-600 font-mono whitespace-pre-wrap select-all">
                        {EXTERNAL_AI_PROMPT}
                      </pre>
                    </div>
                  </div>

                  {/* Step 2: Paste Area & Action */}
                  <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-black">2</span>
                        AI 결과 JSON 코드 붙여넣기
                      </span>
                      <p className="text-xs text-gray-500">
                        AI가 출력해 준 <span className="font-mono bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-[11px]">JSON 코드 블록</span>을 아래 창에 그대로 붙여넣어 주세요.
                      </p>
                      <textarea
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        placeholder={`{ "title": "[테크] ...", "summary": "...", "keyPoints": [...], "sections": [...] } 형식의 JSON 코드 전체를 복사해서 붙여넣으세요...`}
                        className="w-full h-24 text-xs font-mono p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleParseAndFill}
                      className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-sm cursor-pointer mt-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>⚡ 1초 만에 폼 입력 자동 완성 적용</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MANUAL FORM START */}
        <div className="space-y-5" id="form-fields">
          <div className="flex items-center gap-1.5 border-b border-gray-200 pb-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">기본 메모 정보</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-gray-500">메모 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 🎥 반도체 업황 전방 산업 리포트 정리"
                className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Category selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">콘텐츠 구분</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['youtube', 'telegram', 'report', 'webpage'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold border rounded-lg transition-all ${
                      category === cat
                        ? "bg-black text-white border-black"
                        : "bg-white border-gray-200 text-gray-650 hover:bg-gray-50"
                    }`}
                  >
                    {cat === "youtube" ? (
                      <Video className="w-3.5 h-3.5" />
                    ) : cat === "telegram" ? (
                      <MessageSquare className="w-3.5 h-3.5" />
                    ) : cat === "webpage" ? (
                      <Globe className="w-3.5 h-3.5" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                    <span className="capitalize">{cat === 'youtube' ? 'YouTube' : cat === 'telegram' ? 'Telegram' : cat === 'webpage' ? 'Webpage' : 'Report'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">⚙️ 상태 (Status)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white font-medium cursor-pointer"
              >
                {["요약완료", "정독필요", "검증중", "검증완료", "Wiki반영"].map((st) => (
                  <option key={st} value={st}>
                    {st === "요약완료" ? "📝 요약완료" :
                     st === "정독필요" ? "🔍 정독필요" :
                     st === "검증중" ? "⚙️ 검증중" :
                     st === "검증완료" ? "✅ 검증완료" :
                     "📚 Wiki반영"}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Name / Institution */}
            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-gray-500">🏛️ 출처 / 기관명 (Source Name)</label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="예: 미래에셋증권, 삼프로TV, 한국은행 등"
                className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                  🔗 출처 링크 목록 (Source URLs)
                  <span className="text-[10px] text-gray-400 font-normal">(여러 컨텐츠의 원본 출처를 각각 추가할 수 있습니다)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setSourceUrls([...sourceUrls, ""])}
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 font-bold" />
                  <span>출처 추가</span>
                </button>
              </div>
              <div className="space-y-2">
                {sourceUrls.map((url, uidx) => (
                  <div key={uidx} className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-gray-400 bg-gray-50 border border-gray-150 rounded px-2 py-1.5 w-14 text-center select-none shrink-0 font-bold">
                      출처 {uidx + 1}
                    </span>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        const nextUrls = [...sourceUrls];
                        nextUrls[uidx] = e.target.value;
                        setSourceUrls(nextUrls);
                      }}
                      placeholder="https://example.com/source-url-here"
                      className="flex-1 text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans"
                    />
                    {sourceUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSourceUrls(sourceUrls.filter((_, i) => i !== uidx))}
                        className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-gray-200/50 hover:border-rose-200 transition-all shrink-0 cursor-pointer"
                        title="이 출처 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-gray-500">투자 섹터 / 태그 (Sectors & Tags)</label>
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[42px] items-center">
                {sectors.length === 0 ? (
                  <span className="text-xs text-slate-400">등록된 섹터 태그가 없습니다. 아래에서 추가하거나 직접 입력해 주세요.</span>
                ) : (
                  sectors.map((sec, sIdx) => (
                    <span key={sIdx} className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                      <span>{sec}</span>
                      <button
                        type="button"
                        onClick={() => setSectors(sectors.filter((_, idx) => idx !== sIdx))}
                        className="hover:bg-indigo-700 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[10px] font-black cursor-pointer leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newSector.trim() && !sectors.includes(newSector.trim())) {
                        setSectors([...sectors, newSector.trim()]);
                        setNewSector("");
                      }
                    }
                  }}
                  placeholder="예: 이차전지, 바이오, 엔터 (입력 후 엔터 또는 추가)"
                  className="flex-1 text-sm p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSector.trim() && !sectors.includes(newSector.trim())) {
                      setSectors([...sectors, newSector.trim()]);
                      setNewSector("");
                    }
                  }}
                  className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer"
                >
                  추가
                </button>
              </div>

              {/* Quick Tags Recommendations */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">추천 투자 섹터 태그:</span>
                <div className="flex flex-wrap gap-1.5">
                  {["AI", "반도체", "이차전지", "바이오", "매크로", "인터넷", "엔터", "소부장", "우주항공", "자율주행"].map((tag) => {
                    const isAdded = sectors.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        disabled={isAdded}
                        onClick={() => setSectors([...sectors, tag])}
                        className={`text-xs px-2.5 py-1 rounded-md border font-semibold transition-all ${
                          isAdded
                            ? "bg-gray-55/40 border-gray-150 text-gray-400 cursor-not-allowed"
                            : "bg-white border-gray-200 text-gray-650 hover:border-black hover:text-black cursor-pointer"
                        }`}
                      >
                        + {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Multi-dimensional Smart Rating Block */}
            <div className="col-span-1 md:col-span-2 space-y-4 border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>스마트 다차원 리포트 등급 평가 (Smart Rating)</span>
                </label>
                <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                  3단계 가중 레이팅 시스템 • 각 영역을 클릭하여 설명 보기
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/40 border border-gray-150 p-5 rounded-2xl">
                {/* Row 1: Importance Star Selection */}
                <div 
                  onClick={() => setActiveExplainTab('importance')}
                  className={`space-y-1.5 bg-white p-3.5 rounded-xl border flex flex-col justify-between shadow-sm cursor-pointer transition-all ${
                    activeExplainTab === 'importance'
                      ? "border-amber-500 ring-2 ring-amber-100/70"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block flex items-center gap-1.5">
                      <span>⭐️</span>
                      <span>투자 중요도 (Importance)</span>
                      {activeExplainTab === 'importance' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                    </label>
                    <p className="text-[10px] text-gray-400 leading-tight mt-0.5 min-h-[28px]">
                      보유 종목 연관성 및 아이디어 변화 영향력
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setImportance(num);
                            setActiveExplainTab('importance');
                          }}
                          className="text-xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        >
                          <span className={num <= importance ? "text-amber-500 font-bold" : "text-gray-200"}>
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                      {importance}점
                    </span>
                  </div>
                </div>

                {/* Row 2: Read Priority Star Selection */}
                <div 
                  onClick={() => setActiveExplainTab('read_priority')}
                  className={`space-y-1.5 bg-white p-3.5 rounded-xl border flex flex-col justify-between shadow-sm cursor-pointer transition-all ${
                    activeExplainTab === 'read_priority'
                      ? "border-indigo-500 ring-2 ring-indigo-100/70"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block flex items-center gap-1.5">
                      <span>📖</span>
                      <span>원문 정독 우선순위 (Read Priority)</span>
                      {activeExplainTab === 'read_priority' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                    </label>
                    <p className="text-[10px] text-gray-400 leading-tight mt-0.5 min-h-[28px]">
                      요약만으로 충분한지, 원문 완독이 필요한지 여부
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setReadPriority(num);
                            setActiveExplainTab('read_priority');
                          }}
                          className="text-xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        >
                          <span className={num <= readPriority ? "text-indigo-600 font-bold" : "text-gray-200"}>
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {readPriority}점
                    </span>
                  </div>
                </div>

                {/* Row 3: Verification Need Star Selection */}
                <div 
                  onClick={() => setActiveExplainTab('verification_need')}
                  className={`space-y-1.5 bg-white p-3.5 rounded-xl border flex flex-col justify-between shadow-sm cursor-pointer transition-all ${
                    activeExplainTab === 'verification_need'
                      ? "border-emerald-500 ring-2 ring-emerald-100/70"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block flex items-center gap-1.5">
                      <span>🛡️</span>
                      <span>팩트 검증 필요성 (Verification Need)</span>
                      {activeExplainTab === 'verification_need' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                    </label>
                    <p className="text-[10px] text-gray-400 leading-tight mt-0.5 min-h-[28px]">
                      실적/Capex 등 치명적인 재무 수치 검증 요구도
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setVerificationNeed(num);
                            setActiveExplainTab('verification_need');
                          }}
                          className="text-xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        >
                          <span className={num <= verificationNeed ? "text-emerald-600 font-bold" : "text-gray-200"}>
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {verificationNeed}점
                    </span>
                  </div>
                </div>

                {/* Dynamic Rating Guidelines explanation block */}
                <div className="col-span-1 md:col-span-3">
                  {(() => {
                    const currentScore = activeExplainTab === 'importance' ? importance : activeExplainTab === 'read_priority' ? readPriority : verificationNeed;
                    const currentExplanation = ratingExplanations[activeExplainTab];
                    const activeDescription = currentExplanation.descriptions[currentScore as 1|2|3|4|5] || currentExplanation.descriptions[3];
                    const themeColor = activeExplainTab === 'importance' ? 'amber' : activeExplainTab === 'read_priority' ? 'indigo' : 'emerald';
                    
                    const themeClasses = {
                      amber: {
                        bg: "bg-amber-50/40 border-amber-100",
                        badge: "bg-amber-100 text-amber-800 border-amber-200/50",
                        text: "text-amber-900"
                      },
                      indigo: {
                        bg: "bg-indigo-50/40 border-indigo-100",
                        badge: "bg-indigo-100 text-indigo-800 border-indigo-200/50",
                        text: "text-indigo-900"
                      },
                      emerald: {
                        bg: "bg-emerald-50/40 border-emerald-100",
                        badge: "bg-emerald-100 text-emerald-800 border-emerald-200/50",
                        text: "text-emerald-900"
                      }
                    }[themeColor];

                    return (
                      <div className={`border p-4 rounded-xl transition-all duration-300 ${themeClasses.bg}`}>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{currentExplanation.icon}</span>
                            <span>{currentExplanation.title} 실시간 가이드 (클릭하여 즉시 점수 부여)</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${themeClasses.badge}`}>
                            선택한 점수: {currentScore}점
                          </span>
                        </div>

                        {/* Explanatory Spectrum Slider/Grid */}
                        <div className="grid grid-cols-5 gap-1.5 mb-3.5">
                          {[5, 4, 3, 2, 1].map((level) => {
                            const isCurrent = level === currentScore;
                            const levelData = currentExplanation.descriptions[level as 1|2|3|4|5];
                            return (
                              <button
                                key={level}
                                type="button"
                                onClick={() => {
                                  if (activeExplainTab === 'importance') setImportance(level);
                                  else if (activeExplainTab === 'read_priority') setReadPriority(level);
                                  else setVerificationNeed(level);
                                }}
                                className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                                  isCurrent 
                                    ? activeExplainTab === 'importance'
                                      ? "bg-amber-500 text-white border-amber-500 font-bold shadow-xs scale-102"
                                      : activeExplainTab === 'read_priority'
                                      ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs scale-102"
                                      : "bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs scale-102"
                                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                                }`}
                                title={levelData.title}
                              >
                                <span className="block text-[11px] font-extrabold">{level}점</span>
                                <span className="block text-[8px] opacity-90 truncate hidden sm:block font-medium">
                                  {levelData.title.split(" (")[0]}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Active Selected Rating Detail text */}
                        <div className="bg-white/95 border border-slate-100 p-3.5 rounded-lg text-[11px] leading-relaxed">
                          <p className="font-extrabold text-slate-800 mb-1 flex items-center gap-1.5">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                              activeExplainTab === 'importance' ? 'bg-amber-500' : activeExplainTab === 'read_priority' ? 'bg-indigo-600' : 'bg-emerald-600'
                            }`}></span>
                            <span>{currentScore}점 - {activeDescription.title}</span>
                          </p>
                          <p className="text-slate-600 font-medium">
                            {activeDescription.text}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Notion Save Radio Block */}
                <div className="col-span-1 md:col-span-1 space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">💾 노션 영구 저장 여부</label>
                  <div className="grid grid-cols-3 gap-1">
                    {["저장", "보류", "폐기"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setNotionSave(opt)}
                        className={`py-2 text-xs font-bold border rounded-lg transition-all cursor-pointer ${
                          notionSave === opt
                            ? opt === "저장"
                              ? "bg-black text-white border-black"
                              : opt === "보류"
                              ? "bg-amber-600 text-white border-amber-600"
                              : "bg-rose-600 text-white border-rose-600"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recommended Action block */}
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">🎯 추천 후속 액션 (Recommended Action)</label>
                  <select
                    value={recommendedAction}
                    onChange={(e) => setRecommendedAction(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white font-semibold cursor-pointer"
                  >
                    {["요약만 저장", "원문 정독", "GPT 검증", "Wiki 반영 후보"].map((act) => (
                      <option key={act} value={act}>
                        {act === "요약만 저장" ? "📌 요약본만 보관 (요약만 저장)" :
                         act === "원문 정독" ? "📖 원문 상세 정독 (원문 정독)" :
                         act === "GPT 검증" ? "🤖 교차 검증 필요 (GPT 검증)" :
                         "🌟 영구 지식고 반영 (Wiki 반영 후보)"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Concrete Action Plan (action) block */}
                <div className="col-span-1 md:col-span-3 space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1.5">
                    <span>⚡️</span>
                    <span>구체적인 액션 방안 (Action)</span>
                  </label>
                  <input
                    type="text"
                    value={action || ""}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="예: 원문과 초안을 대조해 증설 계획·수주 규모·실적 전망과 밸류에이션 가정을 검증"
                    className="w-full text-xs p-2.5 border border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium bg-indigo-50/20 text-slate-900"
                  />
                </div>

                {/* Rationale Textarea Block */}
                <div className="col-span-1 md:col-span-3 space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">💬 평가 및 등급 부여 근거 (Score Rationale)</label>
                  <textarea
                    value={scoreRationale}
                    onChange={(e) => setScoreRationale(e.target.value)}
                    placeholder="레이팅 등급을 부여한 배경 논거와 향후 확인이 필요한 수치 등을 기록해 주세요..."
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-16 font-sans resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY SECTION */}
        <div className="space-y-3" id="form-summary">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block border-b border-gray-200 pb-2">
            요약 (Summary)
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="본 리포트/영상 분석에 대한 전체 요약 단락을 입력해 주세요..."
            rows={3}
            className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        {/* KEY POINTS SECTION */}
        <div className="space-y-3" id="form-keypoints">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block border-b border-gray-200 pb-2">
            핵심 정리 (Key Points)
          </label>
          <div className="space-y-2">
            {keyPoints.map((point, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <span className="font-bold text-gray-400 text-xs w-5 text-right">{idx + 1}.</span>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => {
                    const updated = [...keyPoints];
                    updated[idx] = e.target.value;
                    setKeyPoints(updated);
                  }}
                  placeholder={`핵심 요약 포인트 ${idx + 1}`}
                  className="flex-1 text-sm p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5" id="form-sections">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
              상세 섹션 분석 (Sections Analysis)
            </label>
            <button
              type="button"
              onClick={addSection}
              className="flex items-center gap-1 bg-white hover:bg-gray-50 text-black text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>섹션 추가</span>
            </button>
          </div>

          <div className="space-y-6">
            {sections.map((sec, secIdx) => (
              <div key={sec.id || secIdx} className="border border-gray-200 rounded-lg p-5 bg-white space-y-4 relative">
                {/* Delete Section button */}
                <button
                  type="button"
                  onClick={() => removeSection(secIdx)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-rose-600 transition-colors"
                  title="섹션 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <h4 className="text-xs font-bold text-black uppercase tracking-widest">
                  섹션 {secIdx + 1}
                </h4>

                <div className="space-y-3">
                  {/* Section Title and Source Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-gray-400">섹션 제목</label>
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => updateSectionField(secIdx, "title", e.target.value)}
                        placeholder="예: 01 | [주제] 분석내용 요약"
                        className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400">출처 (간단 표기)</label>
                      <input
                        type="text"
                        value={sec.source || ""}
                        onChange={(e) => updateSectionField(secIdx, "source", e.target.value)}
                        placeholder="예: 유튜브 04:12, 보고서 p.5"
                        className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>

                  {/* Section Content */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400">섹션 본문 내용</label>
                    <textarea
                      value={sec.content}
                      onChange={(e) => updateSectionField(secIdx, "content", e.target.value)}
                      placeholder="구체적인 내용을 자유롭게 기술해 주세요."
                      rows={4}
                      className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>

                  {/* Custom Table inside Section */}
                  <div className="border border-gray-200/60 p-4 rounded-lg space-y-3 bg-gray-50/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        비교/분석 표 (Table - 선택 사항)
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => addColumnToSectionTable(secIdx)}
                          className="bg-white hover:bg-gray-50 border border-gray-200 text-black text-[10px] font-bold px-2.5 py-1 rounded"
                        >
                          열 추가
                        </button>
                        <button
                          type="button"
                          onClick={() => addRowToSectionTable(secIdx)}
                          className="bg-white hover:bg-gray-50 border border-gray-200 text-black text-[10px] font-bold px-2.5 py-1 rounded"
                        >
                          행 추가
                        </button>
                      </div>
                    </div>

                    {sec.table && sec.table.headers && sec.table.headers.length > 0 ? (
                      <div className="overflow-x-auto max-w-full border border-gray-200 rounded-lg bg-white">
                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              {sec.table.headers.map((hdr, hIdx) => (
                                <th key={hIdx} className="p-2 border-r last:border-r-0 border-gray-200">
                                  <input
                                    type="text"
                                    value={hdr}
                                    onChange={(e) => updateSectionTableHeader(secIdx, hIdx, e.target.value)}
                                    className="w-full text-center font-bold text-black bg-transparent border-none outline-none focus:ring-1 focus:ring-black rounded"
                                    placeholder="헤더명"
                                  />
                                </th>
                              ))}
                              <th className="p-2 w-8"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {sec.table.rows.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-1 border-r last:border-r-0 border-gray-200">
                                    <input
                                      type="text"
                                      value={cell}
                                      onChange={(e) => updateSectionTableCell(secIdx, rIdx, cIdx, e.target.value)}
                                      className="w-full text-xs p-1 border-none bg-transparent outline-none focus:ring-1 focus:ring-black rounded"
                                      placeholder="데이터 입력"
                                    />
                                  </td>
                                ))}
                                <td className="p-1 text-center">
                                  <button
                                    type="button"
                                    onClick={() => removeRowFromSectionTable(secIdx, rIdx)}
                                    className="text-gray-400 hover:text-rose-600"
                                  >
                                    <X className="w-3.5 h-3.5 mx-auto" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-450 italic">비교 표가 구성되지 않았습니다.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INVESTMENT VIEW SECTION */}
        <div className="space-y-5 pt-6 border-t border-gray-200" id="form-investment-view">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
              투자 관점 (Investment View)
            </label>
          </div>

          {/* Investment Thesis Input */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              💡 핵심 투자 가설 (Investment Thesis)
            </span>
            <textarea
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="원문의 핵심 결론 및 정량적/정성적 투자 논리를 요약해 주세요."
              rows={2}
              className="w-full text-xs p-3 border border-amber-200 bg-amber-50/10 rounded-lg focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          {/* Implications, Risks, Key Tracking Variables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                📈 실적/모멘텀 시사점 (줄바꿈 구분)
              </span>
              <textarea
                value={implications.join("\n")}
                onChange={(e) => setImplications(e.target.value.split("\n"))}
                placeholder="줄바꿈으로 구분해 주세요."
                rows={3}
                className="w-full text-xs p-2.5 border border-emerald-200 bg-emerald-50/10 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                ⚠️ 리스크 요인 (줄바꿈 구분)
              </span>
              <textarea
                value={risks.join("\n")}
                onChange={(e) => setRisks(e.target.value.split("\n"))}
                placeholder="줄바꿈으로 구분해 주세요."
                rows={3}
                className="w-full text-xs p-2.5 border border-rose-200 bg-rose-50/10 rounded-lg focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                🎯 주요 추적 변수 (줄바꿈 구분)
              </span>
              <textarea
                value={keyTrackingVariables.join("\n")}
                onChange={(e) => setKeyTrackingVariables(e.target.value.split("\n"))}
                placeholder="줄바꿈으로 구분해 주세요."
                rows={3}
                className="w-full text-xs p-2.5 border border-indigo-200 bg-indigo-50/10 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 맨 마지막: 1. 한 줄 결론 -> 2. 투자 검증 체크리스트 -> 3. 에디터 종합 판단 */}
        <div className="space-y-5 pt-6 border-t border-gray-200" id="form-final-conclusions">
          {/* 1. 한 줄 결론 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              💬 한 줄 결론 (One-Line Conclusion)
            </label>
            <input
              type="text"
              value={oneLineConclusion}
              onChange={(e) => setOneLineConclusion(e.target.value)}
              placeholder="예: 2Q26 반도체 레거시 감산 종료 후 모멘텀 본격화 전망"
              className="w-full text-xs p-3 border border-amber-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-bold bg-amber-50/20"
            />
          </div>

          {/* 2. 투자 검증 체크리스트 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              ☑️ 투자 검증 체크리스트 (Checklist - 줄바꿈 구분)
            </label>
            <textarea
              value={checklist.join("\n")}
              onChange={(e) => setChecklist(e.target.value.split("\n"))}
              placeholder="줄바꿈으로 검증이 필요한 항목들을 입력해 주세요."
              rows={3}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* 3. 에디터 종합 판단 */}
          <div className="p-4 bg-indigo-50/30 border border-indigo-200/60 rounded-xl space-y-3">
            <label className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">
              ✍️ 에디터 종합 판단 (Editor Synthesis)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-indigo-700">소제목 / 헤드라인</label>
                <input
                  type="text"
                  value={editorSynthesis.title}
                  onChange={(e) => setEditorSynthesis({ ...editorSynthesis, title: e.target.value })}
                  placeholder="예: 투자 아이디어 종합 판단"
                  className="w-full text-xs p-2 border border-indigo-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-indigo-700">포트폴리오 대응 및 함의</label>
                <input
                  type="text"
                  value={editorSynthesis.portfolioImplication}
                  onChange={(e) => setEditorSynthesis({ ...editorSynthesis, portfolioImplication: e.target.value })}
                  placeholder="예: 비중 확대 보류, 3분기실적 확인 후 대응 권장"
                  className="w-full text-xs p-2 border border-indigo-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-indigo-700">종합 요약 및 에디터 총평</label>
              <textarea
                value={editorSynthesis.summary}
                onChange={(e) => setEditorSynthesis({ ...editorSynthesis, summary: e.target.value })}
                placeholder="원문 핵심 내용과 내 투자관점 간 차이, 핵심 시사점을 자유롭게 기록하세요."
                rows={3}
                className="w-full text-xs p-2.5 border border-indigo-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-indigo-700">주요 비교 및 대조 포인트 (줄바꿈 구분)</label>
              <textarea
                value={(editorSynthesis.comparisons || []).join("\n")}
                onChange={(e) => setEditorSynthesis({ ...editorSynthesis, comparisons: e.target.value.split("\n") })}
                placeholder="줄바꿈으로 기사/리포트 간 비교 포인트를 추가하세요."
                rows={2}
                className="w-full text-xs p-2.5 border border-indigo-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
