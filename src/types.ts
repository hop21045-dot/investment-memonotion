export interface Quote {
  text: string;
  author: string;
}

export interface CustomTable {
  headers: string[];
  rows: string[][];
}

export interface Callout {
  type: 'positive' | 'negative' | 'check point' | 'warning' | 'risk'; // keep legacy warning and risk for database compatibility
  text: string;
}

export interface Section {
  id: string;
  title: string;
  content?: string;
  summary?: string;
  details?: string[];
  bullArguments?: string[];
  riskFactors?: string[];
  keyVariables?: string[];
  quote?: Quote;
  table?: CustomTable;
  callout?: Callout;
  source?: string;
}

export interface MentionedAsset {
  asset: string;
  relation: string;
  context: string;
}

export interface InvestmentView {
  thesis?: string;
  implications?: string[];
  risks?: string[];
  keyTrackingVariables?: string[];
  mentionedAssets?: MentionedAsset[];
  bullArguments?: string[];
  caveats?: string[];
  neutralEvaluation?: string;
}

export interface EditorSynthesis {
  title?: string;
  summary?: string;
  comparisons?: string[];
  portfolioImplication?: string;
}

export interface Rating {
  importance: number;
  read_priority: number;
  verification_need: number;
  notion_save: '저장' | '보류' | '폐기' | string;
  recommended_action: '요약만 저장' | '원문 정독' | 'GPT 검증' | 'Wiki 반영 후보' | string;
  action?: string;
  score_rationale: string;
}

export interface StructuredReport {
  id: string;
  title: string;
  date: string;
  category: 'youtube' | 'telegram' | 'report' | 'webpage';
  sourceUrl?: string;
  sourceUrls?: string[];
  sourceName?: string;
  summary: string;
  keyPoints: string[];
  sections: Section[];
  investmentView: InvestmentView;
  editorSynthesis?: EditorSynthesis;
  checklist?: string[];
  oneLineConclusion?: string;
  rawText?: string;
  attachedPdfName?: string;
  attachedPdfSize?: string;
  sectors?: string[];
  importance?: number; // 1 to 5 rating scale based on investment significance
  rating?: Rating;
  verified?: "O" | "X";
  status?: "요약완료" | "검증완료" | "부분검증" | "확인필요" | string;
  action?: "1차 요약 필요" | "원문 정독" | "원문 검증 필요" | "ChatGPT 검증 대기" | "Wiki 반영 후보" | "Wiki 반영 필요" | "트래커 업데이트 필요" | "보류" | "폐기" | string;
  updatedAt?: number; // Last-modified timestamp for bidirectional sync
}
