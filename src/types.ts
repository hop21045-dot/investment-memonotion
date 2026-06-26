export interface Quote {
  text: string;
  author: string;
}

export interface CustomTable {
  headers: string[];
  rows: string[][];
}

export interface Callout {
  type: 'warning' | 'positive' | 'risk';
  text: string;
}

export interface Section {
  id: string;
  title: string;
  content: string;
  quote?: Quote;
  table?: CustomTable;
  callout?: Callout;
}

export interface MentionedAsset {
  asset: string;
  relation: string;
  context: string;
}

export interface InvestmentView {
  mentionedAssets: MentionedAsset[];
  bullArguments: string[];
  caveats: string[];
  neutralEvaluation: string;
}

export interface StructuredReport {
  id: string;
  title: string;
  date: string;
  category: 'youtube' | 'telegram' | 'report' | 'webpage';
  sourceUrl?: string;
  sourceUrls?: string[];
  summary: string;
  keyPoints: string[];
  sections: Section[];
  investmentView: InvestmentView;
  rawText?: string;
  attachedPdfName?: string;
  attachedPdfSize?: string;
  sectors?: string[];
  importance?: number; // 1 to 5 rating scale based on investment significance
  verified?: "O" | "X";
  status?: "요약완료" | "정독필요" | "검증중" | "검증완료" | "Wiki반영";
  action?: "1차 요약 필요" | "원문 정독" | "원문 검증 필요" | "ChatGPT 검증 대기" | "Wiki 반영 후보" | "Wiki 반영 필요" | "트래커 업데이트 필요" | "보류" | "폐기" | "";
}
