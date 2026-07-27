import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { StructuredReport } from "../types";
import {
  Video,
  MessageSquare,
  FileText,
  Copy,
  Check,
  Trash2,
  Edit,
  ExternalLink,
  ShieldAlert,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Globe,
  Download,
  ChevronDown,
  Sparkles
} from "lucide-react";

// Robust parser to convert basic markdown to HTML for the downloadable report
function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";
  let html = markdown;
  
  // Clean special characters to prevent HTML breakages
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  
  // Italics (*text* or _text_)
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");
  
  // Inline code (`code`)
  html = html.replace(/`(.*?)`/g, "<code style='background-color: #f1f5f9; color: #dc2626; font-family: monospace; padding: 2px 4px; border-radius: 4px; font-size: 0.85em;'>$1</code>");
  
  // Links: [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' style='color: #2563eb; text-decoration: underline;'>$1</a>");
  
  // Convert lines
  const lines = html.split("\n");
  let inList = false;
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    
    // Headers
    if (trimmed.startsWith("### ")) {
      return `<h3 style="font-size: 1.1em; font-weight: 700; margin-top: 16px; margin-bottom: 8px; color: #0f172a;">${trimmed.substring(4)}</h3>`;
    }
    if (trimmed.startsWith("## ")) {
      return `<h2 style="font-size: 1.25em; font-weight: 700; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; color: #0f172a;">${trimmed.substring(3)}</h2>`;
    }
    if (trimmed.startsWith("# ")) {
      return `<h1 style="font-size: 1.5em; font-weight: 800; margin-top: 28px; margin-bottom: 16px; color: #0f172a;">${trimmed.substring(2)}</h1>`;
    }
    
    // Unordered Lists
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const content = trimmed.substring(2);
      let listElement = `<li style="margin-bottom: 6px;">${content}</li>`;
      if (!inList) {
        inList = true;
        listElement = `<ul style="list-style-type: disc; padding-left: 20px; margin-top: 8px; margin-bottom: 8px; color: #334155;">` + listElement;
      }
      return listElement;
    } else {
      if (inList) {
        inList = false;
        return `</ul><p style="margin-top: 0; margin-bottom: 12px; color: #334155; line-height: 1.6;">${trimmed}</p>`;
      }
    }
    
    // Empty line
    if (trimmed === "") {
      return "";
    }
    
    return `<p style="margin-top: 0; margin-bottom: 12px; color: #334155; line-height: 1.6;">${trimmed}</p>`;
  });
  
  if (inList) {
    processedLines.push("</ul>");
  }
  
  return processedLines.filter(line => line !== "").join("\n");
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

interface MemoDetailProps {
  report: StructuredReport | null;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onSelectSector?: (sector: string) => void;
  onSave?: (report: StructuredReport) => void;
}

export default function MemoDetail({ report, onEdit, onDelete, onSelectSector, onSave }: MemoDetailProps) {
  const [copied, setCopied] = useState(false);
  const [isReEvaluating, setIsReEvaluating] = useState(false);
  const [reEvaluateError, setReEvaluateError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [activeRatingTab, setActiveRatingTab] = useState<'importance' | 'read_priority' | 'verification_need'>('importance');


  // Reset delete confirmation when active report changes
  useEffect(() => {
    setShowDeleteConfirm(false);
  }, [report?.id]);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowDownloadDropdown(false);
    };
    if (showDownloadDropdown) {
      window.addEventListener("click", handleOutsideClick);
    }
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [showDownloadDropdown]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDownloadDropdown(!showDownloadDropdown);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    if (!report) return;

    // Helper functions can be used to construct the lists and conditional blocks cleanly
    const sourceLinksHtml = (() => {
      const hasUrls = report.sourceUrls && report.sourceUrls.filter(u => u.trim()).length > 0;
      if (!hasUrls && !report.sourceUrl) return '';

      let linksContent = '';
      if (hasUrls) {
        linksContent = report.sourceUrls!
          .filter(u => u.trim())
          .map((url, idx) => {
            const href = url.startsWith('http') ? url : 'https://' + url;
            return `<div style="margin-bottom: 4px;"><a href="${href}" target="_blank" style="color: #2563eb; text-decoration: none;">출처 ${idx + 1}: ${url}</a></div>`;
          })
          .join('');
      } else if (report.sourceUrl) {
        const href = report.sourceUrl.startsWith('http') ? report.sourceUrl : 'https://' + report.sourceUrl;
        linksContent = `<a href="${href}" target="_blank" style="color: #2563eb; text-decoration: none;">${report.sourceUrl}</a>`;
      }

      return `
        <div class="property-label">🔗 출처 링크</div>
        <div class="property-value">${linksContent}</div>
      `;
    })();

    const attachedPdfHtml = report.attachedPdfName ? `
      <div class="property-label">📄 첨부 파일</div>
      <div class="property-value">${report.attachedPdfName} (${report.attachedPdfSize || "Unknown size"})</div>
    ` : '';

    const sectorsHtml = (report.sectors && report.sectors.length > 0) ? `
      <div class="property-label">🏷️ 주요 섹터</div>
      <div class="property-value">
        ${report.sectors.map(sec => `<span style="background-color: #eef2ff; color: #4f46e5; border: 1px solid #e0e7ff; padding: 2px 8px; margin-right: 6px; border-radius: 4px; font-weight: bold;">#${sec}</span>`).join('')}
      </div>
    ` : '';

    const keyPointsHtml = report.keyPoints.map(p => `<li style="margin-bottom: 8px;">${p}</li>`).join('');

    const sectionsHtml = report.sections.map((sec, sIdx) => {
      const quoteHtml = sec.quote && sec.quote.text ? `
        <blockquote>
          "${sec.quote.text}"
          <span style="display: block; text-align: right; font-size: 0.85em; color: #64748b; margin-top: 6px; font-weight: 600;">— ${sec.quote.author}</span>
        </blockquote>
      ` : '';

      const tableHtml = sec.table && sec.table.headers && sec.table.headers.length > 0 ? `
        <table>
          <thead>
            <tr>
              ${sec.table.headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${sec.table.rows.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '';

      const calloutHtml = sec.callout && sec.callout.text ? `
        <div class="callout callout-${sec.callout.type}">
          <div style="font-size: 1.1em; line-height: 1;">
            ${sec.callout.type === "warning" ? "⚠️" : sec.callout.type === "positive" ? "✅" : "❌"}
          </div>
          <div>
            <strong>${
              sec.callout.type === "warning" ? "주의 사항 (Warning)" : 
              sec.callout.type === "positive" ? "체크 포인트 (Key Positive)" : "리스크 요인 (Risk Factors)"
            }</strong>
            <div style="margin-top: 4px; color: #475569;">${sec.callout.text}</div>
          </div>
        </div>
      ` : '';

      return `
        <div class="section-block">
          <h3 style="margin-top: 0; color: #0f172a; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; page-break-after: avoid; break-after: avoid;">
            <span>SEC ${sIdx + 1}. ${sec.title}</span>
            ${sec.source ? `<span style="font-size: 0.75em; font-weight: normal; color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 4px;">출처: ${sec.source}</span>` : ''}
          </h3>
          <div>${parseMarkdownToHtml(sec.content)}</div>
          ${quoteHtml}
          ${tableHtml}
          ${calloutHtml}
        </div>
      `;
    }).join('');

    const mentionedAssetsHtml = report.investmentView.mentionedAssets && report.investmentView.mentionedAssets.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>종목·섹터</th>
            <th>관계</th>
            <th>맥락 (Context)</th>
          </tr>
        </thead>
        <tbody>
          ${report.investmentView.mentionedAssets.map(asset => `
            <tr>
              <td style="font-weight: 700; color: #0f172a;">${asset.asset}</td>
              <td><span style="background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: 700; border: 1px solid #e2e8f0;">${asset.relation}</span></td>
              <td>${asset.context}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<p style="color: #64748b; font-size: 0.9em; font-style: italic;">분석된 관련 종목이 없습니다.</p>';

    const bullArgumentsHtml = report.investmentView.bullArguments.map(arg => `<li style="margin-bottom: 6px; color: #166534; font-weight: 550;">${arg}</li>`).join('');
    const caveatsHtml = report.investmentView.caveats.map(arg => `<li style="margin-bottom: 6px; color: #991b1b; font-weight: 550;">${arg}</li>`).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.title} - InvestInsight Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap');
    
    @page {
      size: A4;
      margin: 15mm 15mm 15mm 15mm;
    }

    body {
      font-family: 'Inter', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      color: #1a1a1a;
      background-color: #ffffff;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    /* Notion style elements */
    h1 {
      font-size: 2.2em;
      font-weight: 800;
      margin-top: 10px;
      margin-bottom: 24px;
      letter-spacing: -0.02em;
      color: #111111;
      page-break-after: avoid;
      break-after: avoid;
    }
    h2 {
      font-size: 1.4em;
      font-weight: 700;
      margin-top: 40px;
      margin-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
      color: #111111;
      page-break-after: avoid;
      break-after: avoid;
    }
    h3 {
      font-size: 1.15em;
      font-weight: 600;
      margin-top: 24px;
      margin-bottom: 12px;
      color: #2d3748;
      page-break-after: avoid;
      break-after: avoid;
    }
    p {
      margin-top: 0;
      margin-bottom: 16px;
      color: #334155;
    }
    ul, ol {
      margin-top: 0;
      margin-bottom: 16px;
      padding-left: 24px;
    }
    li {
      margin-bottom: 8px;
      color: #334155;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    blockquote {
      margin: 20px 0;
      padding: 12px 20px;
      border-left: 4px solid #1a1a1a;
      background-color: #f8fafc;
      font-style: italic;
      color: #475569;
      border-radius: 0 8px 8px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      font-size: 0.9em;
      page-break-inside: auto;
      break-inside: auto;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 10px 14px;
      text-align: left;
    }
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    th {
      background-color: #f8fafc;
      font-weight: 700;
      color: #1e293b;
    }
    td {
      color: #334155;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.75em;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: 1px solid;
    }
    .badge-youtube { background-color: #fef2f2; border-color: #fee2e2; color: #dc2626; }
    .badge-telegram { background-color: #f0f9ff; border-color: #e0f2fe; color: #0284c7; }
    .badge-report { background-color: #f0fdf4; border-color: #dcfce7; color: #16a34a; }
    .badge-webpage { background-color: #e0e7ff; border-color: #c7d2fe; color: #4f46e5; }
    
    .badge-verified-o { background-color: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
    .badge-verified-x { background-color: #fef2f2; border-color: #fecaca; color: #b91c1c; }
    
    .badge-status { background-color: #f1f5f9; border-color: #e2e8f0; color: #475569; }
    .badge-action { background-color: #e0e7ff; border-color: #c7d2fe; color: #4338ca; border-radius: 9999px; }

    /* Notion Grid */
    .properties-grid {
      display: grid;
      grid-template-cols: 140px 1fr;
      row-gap: 14px;
      margin-top: 24px;
      margin-bottom: 32px;
      padding: 24px 0;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.85em;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .property-label {
      color: #64748b;
      font-weight: 700;
      display: flex;
      align-items: center;
    }
    .property-value {
      color: #0f172a;
      font-weight: 600;
    }
    
    .summary-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .summary-title {
      font-size: 0.8em;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 0;
      margin-bottom: 14px;
      color: #0f172a;
    }
    
    .callout {
      display: flex;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid;
      margin: 16px 0;
      font-size: 0.9em;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .callout-warning { background-color: #fffbeb; border-color: #fef3c7; color: #78350f; }
    .callout-positive { background-color: #f0fdf4; border-color: #bbf7d0; color: #166534; }
    .callout-risk { background-color: #fef2f2; border-color: #fecaca; color: #991b1b; }
    
    .section-block {
      margin-bottom: 28px;
      border-left: 3px solid #cbd5e1;
      padding-left: 16px;
      margin-top: 24px;
      page-break-inside: auto;
      break-inside: auto;
    }

    .investment-dual-grid {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 20px;
      margin: 24px 0;
      page-break-inside: auto;
      break-inside: auto;
    }
    @media (max-width: 600px) {
      .investment-dual-grid {
        grid-template-cols: 1fr;
      }
    }
    .investment-box {
      border-radius: 12px;
      border: 1px solid;
      padding: 20px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .bull-box { background-color: #f0fdf4; border-color: #dcfce7; }
    .bear-box { background-color: #fef2f2; border-color: #fee2e2; }
    .investment-box-title {
      font-size: 0.85em;
      font-weight: 800;
      margin-top: 0;
      margin-bottom: 12px;
      letter-spacing: 0.05em;
      page-break-after: avoid;
      break-after: avoid;
    }
    
    /* Print Styles for PDF generation / printing */
    @media print {
      body {
        background-color: #ffffff;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .container {
        max-width: 100%;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .summary-box,
      .properties-grid,
      .callout,
      .investment-box,
      tr,
      blockquote {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        break-inside: avoid-page !important;
      }
      .section-block,
      .investment-dual-grid,
      table,
      ul,
      ol {
        page-break-inside: auto !important;
        break-inside: auto !important;
      }
      h1, h2, h3, h4, h5, h6,
      .summary-title,
      .investment-box-title {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      p, li {
        orphans: 2;
        widows: 2;
      }
    }
    
    .print-button-container {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: #1e293b;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.85em;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: background-color 0.2s;
    }
    .btn:hover { background-color: #0f172a; }
    .btn-secondary {
      background-color: #ffffff;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    .btn-secondary:hover { background-color: #f8fafc; }
  </style>
</head>
<body>
  <div class="container">
    <div class="print-button-container no-print">
      <button class="btn btn-secondary" onclick="window.print()">
        🖨️ PDF 파일로 저장 / 인쇄
      </button>
    </div>
    
    <div class="badge badge-${report.category}">${report.category}</div>
    <h1 style="margin-top: 12px;">${report.title}</h1>
    
    <div class="properties-grid">
      <div class="property-label">📁 카테고리</div>
      <div class="property-value">${report.category.toUpperCase()}</div>
      
      <div class="property-label">📅 정리 일자</div>
      <div class="property-value">${report.date}</div>
      
      <div class="property-label">⚙️ 상태</div>
      <div class="property-value">
        <span class="badge badge-status">${report.status || "요약완료"}</span>
      </div>
      
      <div class="property-label">⭐️ 중요도 등급</div>
      <div class="property-value">
        ${"★".repeat(report.importance || 0)}${"☆".repeat(5 - (report.importance || 0))} (${report.importance || 0} / 5 점)
      </div>
      
      ${sourceLinksHtml}
      ${attachedPdfHtml}
      ${sectorsHtml}
    </div>
    
    <div class="summary-box">
      <h3 class="summary-title">💡 요약 (Summary)</h3>
      <div>${parseMarkdownToHtml(report.summary)}</div>
    </div>
    
    <h2>📌 핵심 정리 (Key Points)</h2>
    <ul style="list-style-type: disc; padding-left: 20px; line-height: 1.8;">
      ${keyPointsHtml}
    </ul>
    
    <h2 style="margin-top: 40px;">상세 섹션 분석 (Section Analysis)</h2>
    ${sectionsHtml}
    
    <h2 style="margin-top: 48px;">📊 투자 관점 (Investment View)</h2>
    
    <h3 style="margin-top: 24px;">🔎 언급 종목 및 섹터</h3>
    ${mentionedAssetsHtml}
    
    <div class="investment-dual-grid">
      <div class="investment-box bull-box">
        <h4 class="investment-box-title" style="color: #166534;">🟢 강세 논거 (Bull Thesis)</h4>
        <ul style="padding-left: 20px; margin: 0; line-height: 1.8;">
          ${bullArgumentsHtml}
        </ul>
      </div>
      
      <div class="investment-box bear-box">
        <h4 class="investment-box-title" style="color: #991b1b;">🔴 주의 및 반론 (Bear Risks)</h4>
        <ul style="padding-left: 20px; margin: 0; line-height: 1.8;">
          ${caveatsHtml}
        </ul>
      </div>
    </div>
    
    <h3 style="margin-top: 28px;">⚖️ 중립적 종합 평가</h3>
    <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; font-weight: 500;">
      ${parseMarkdownToHtml(report.investmentView.neutralEvaluation)}
    </div>
    
    <div style="margin-top: 56px; border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center;">
      <p style="font-size: 0.75em; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">
        ※ 본 내용은 정보 제공 목적이며 투자 권유가 아닙니다. 모든 투자의 결과와 책임은 투자자 본인에게 귀속됩니다.
      </p>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.title.replace(/[/\\?%*:|"<>]/g, '_')}_notion_report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderStars = (rating?: number) => {
    if (rating === undefined || rating === null) return null;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-sm ${i <= rating ? "text-amber-500 font-bold" : "text-gray-200"}`}
        >
          ★
        </span>
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const getImportanceBadgeLabel = (rating?: number) => {
    if (!rating) return null;
    const labels: { [key: number]: { title: string; desc: string; bg: string; textCol: string } } = {
      5: {
        title: "투자판단에 직접 영향",
        desc: "원문 정독 + 검증 (보유종목과 직접 관련, 기존 투자 논리 변동 가능, 새로운 산업 프레임 제공, 중요한 숫자/수주/Capex/실적)",
        bg: "bg-rose-50 border-rose-200/50",
        textCol: "text-rose-700"
      },
      4: {
        title: "섹터/기업 Wiki 반영 후보",
        desc: "핵심 부분 정독 (내가 작성 중인 리포트에 반영 가능, 섹터 방향성 영향)",
        bg: "bg-amber-50 border-amber-200/50",
        textCol: "text-amber-700"
      },
      3: {
        title: "참고자료",
        desc: "요약만 저장 (매일 전개되는 일반 뉴스 브리핑 및 단기 코멘트 등)",
        bg: "bg-sky-50 border-sky-200/50",
        textCol: "text-sky-700"
      },
      2: {
        title: "흥미는 있으나 낮은 우선순위",
        desc: "링크만 보관 (설명문, 흥미로운 주장을 담았으나 우선순위가 낮은 배경지식 등)",
        bg: "bg-slate-50 border-slate-200/50",
        textCol: "text-slate-600"
      },
      1: {
        title: "저장 가치 낮음",
        desc: "폐기 가능 (중복 자료, 검증 불가 정보, 불필요한 단발성 가십성 정보 등)",
        bg: "bg-gray-50 border-gray-200/50",
        textCol: "text-gray-500"
      },
    };
    const config = labels[rating];
    if (!config) return null;
    return (
      <div className={`mt-0.5 p-2.5 rounded-lg border text-[11px] leading-relaxed max-w-md ${config.bg} ${config.textCol}`}>
        <p className="font-bold flex items-center gap-1">
          <span className="text-xs">🎯</span> {config.title} (중요도 {rating}점)
        </p>
        <p className="opacity-90 font-medium mt-1">{config.desc}</p>
      </div>
    );
  };

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50/20" id="detail-empty-state">
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-sm">
          <Layers className="w-10 h-10 text-black mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1A1A1A]">선택된 메모가 없습니다</h3>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            왼쪽 목록에서 메모를 선택하거나, <strong className="text-black font-bold">"+ Add Content"</strong> 버튼을 눌러 인텔리전트 AI 분석 요약을 받아보세요.
          </p>
        </div>
      </div>
    );
  }

  const handleCopyMarkdown = () => {
    let md = `# ${report.title}\n\n`;
    md += `* **날짜:** ${report.date}\n`;
    md += `* **구분:** ${report.category.toUpperCase()}\n`;
    if (report.sourceName) {
      md += `* **출처 / 기관:** ${report.sourceName}\n`;
    }
    if (report.sourceUrls && report.sourceUrls.length > 0) {
      md += `* **출처 목록:**\n`;
      report.sourceUrls.forEach((url, uidx) => {
        if (url.trim()) {
          md += `  - [출처 ${uidx + 1}](${url.trim()})\n`;
        }
      });
    } else if (report.sourceUrl) {
      md += `* **출처:** [링크](${report.sourceUrl})\n`;
    }

    if (report.oneLineConclusion) {
      md += `\n> 💬 **한 줄 결론:** ${report.oneLineConclusion}\n`;
    }

    md += `\n## 요약 (Summary)\n${report.summary}\n\n`;

    if (report.editorSynthesis) {
      md += `## ✍️ 에디터 종합 판단\n`;
      if (report.editorSynthesis.title) md += `### ${report.editorSynthesis.title}\n`;
      if (report.editorSynthesis.summary) md += `${report.editorSynthesis.summary}\n\n`;
      if (report.editorSynthesis.comparisons && report.editorSynthesis.comparisons.length > 0) {
        md += `**주요 비교 및 대조 포인트:**\n`;
        report.editorSynthesis.comparisons.forEach(cmp => md += `- ${cmp}\n`);
        md += `\n`;
      }
      if (report.editorSynthesis.portfolioImplication) {
        md += `**포트폴리오 대응:** ${report.editorSynthesis.portfolioImplication}\n\n`;
      }
    }

    if (report.checklist && report.checklist.length > 0) {
      md += `## ☑️ 투자 검증 체크리스트\n`;
      report.checklist.forEach(item => md += `- [x] ${item}\n`);
      md += `\n`;
    }

    md += `## 핵심 정리\n\n`;
    report.keyPoints.forEach((p) => (md += `- ${p}\n`));
    md += `\n---\n\n## 섹션 분석\n\n`;

    report.sections.forEach((sec, sIdx) => {
      md += `### ${String(sIdx + 1).padStart(2, "0")} | ${sec.title}${sec.source ? ` (출처: ${sec.source})` : ""}\n\n`;
      
      const hasStructuredFields = sec.summary || (sec.details && sec.details.length > 0) || (sec.bullArguments && sec.bullArguments.length > 0) || (sec.keyVariables && sec.keyVariables.length > 0) || (sec.riskFactors && sec.riskFactors.length > 0);
      
      if (hasStructuredFields) {
        if (sec.summary) {
          md += `${sec.summary}\n\n`;
        }
        if (sec.details && sec.details.length > 0) {
          sec.details.forEach(d => {
            md += `- ${d}\n`;
          });
          md += `\n`;
        }
        if (sec.bullArguments && sec.bullArguments.length > 0) {
          md += `> ✅ 강세 논거\n`;
          sec.bullArguments.forEach(b => {
            md += `- ${b}\n`;
          });
          md += `\n`;
        }
        if (sec.keyVariables && sec.keyVariables.length > 0) {
          md += `> ⚠️ 핵심 변수\n`;
          sec.keyVariables.forEach(v => {
            md += `- ${v}\n`;
          });
          md += `\n`;
        }
        if (sec.riskFactors && sec.riskFactors.length > 0) {
          md += `> ❌ 리스크\n`;
          sec.riskFactors.forEach(r => {
            md += `- ${r}\n`;
          });
          md += `\n`;
        }
      } else {
        md += `${sec.content}\n\n`;
      }

      if (sec.quote && sec.quote.text) {
        md += `> "${sec.quote.text}"\n> — *${sec.quote.author}*\n\n`;
      }
      if (sec.table && sec.table.headers && sec.table.headers.length > 0) {
        md += `| ${sec.table.headers.join(" | ")} |\n`;
        md += `| ${sec.table.headers.map(() => "---").join(" | ")} |\n`;
        sec.table.rows.forEach((row) => {
          md += `| ${row.join(" | ")} |\n`;
        });
        md += `\n`;
      }
      if (sec.callout && sec.callout.text) {
        const emoji =
          sec.callout.type === "positive"
            ? "✅"
            : (sec.callout.type === "negative" || sec.callout.type === "risk")
            ? "❌"
            : "⚠️";
        md += `> **${emoji}** ${sec.callout.text}\n\n`;
      }
    });

    md += `## 📊 투자 관점 (Investment View)\n\n`;
    md += `### 🔍 언급 종목 및 섹터\n`;
    if (report.investmentView.mentionedAssets && report.investmentView.mentionedAssets.length > 0) {
      md += `| 종목·섹터 | 관계 | 맥락 |\n`;
      md += `| --- | --- | --- |\n`;
      report.investmentView.mentionedAssets.forEach((asset) => {
        md += `| ${asset.asset} | ${asset.relation} | ${asset.context} |\n`;
      });
    } else {
      md += `언급된 종목이 없습니다.\n`;
    }
    md += `\n`;

    md += `### 🟢 강세 논거 (Bull Thesis)\n`;
    report.investmentView.bullArguments.forEach((arg) => (md += `- ${arg}\n`));
    md += `\n`;

    md += `### 🔴 주의 및 반론 (Bear Risks & Caveats)\n`;
    report.investmentView.caveats.forEach((arg) => (md += `- ${arg}\n`));
    md += `\n`;

    md += `### ⚖️ 중립적 종합 평가\n${report.investmentView.neutralEvaluation}\n\n`;
    md += `*※ 본 내용은 정보 제공 목적이며 투자 권유가 아닙니다.*\n`;

    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReEvaluate = async () => {
    if (!report) return;
    setIsReEvaluating(true);
    setReEvaluateError(null);
    try {
      const response = await fetch("/api/re-evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ report })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "재평가 중 오류가 발생했습니다.");
      }

      const data = await response.json();
      if (data.rating) {
        const updatedReport: StructuredReport = {
          ...report,
          rating: data.rating,
          importance: data.rating.importance !== undefined ? Number(data.rating.importance) : report.importance,
          updatedAt: Date.now()
        };
        if (onSave) {
          onSave(updatedReport);
        }
      } else {
        throw new Error("AI가 올바른 레이팅 정보를 반환하지 않았습니다.");
      }
    } catch (err: any) {
      console.error("Re-evaluation failed:", err);
      setReEvaluateError(err.message || "오류가 발생했습니다.");
    } finally {
      setIsReEvaluating(false);
    }
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case "youtube":
        return {
          bg: "bg-red-50/50 text-red-600 border-red-200/60",
          icon: <Video className="w-3.5 h-3.5" />
        };
      case "telegram":
        return {
          bg: "bg-blue-50/50 text-blue-600 border-blue-200/60",
          icon: <MessageSquare className="w-3.5 h-3.5" />
        };
      case "webpage":
        return {
          bg: "bg-indigo-50/50 text-indigo-600 border-indigo-200/60",
          icon: <Globe className="w-3.5 h-3.5" />
        };
      case "report":
      default:
        return {
          bg: "bg-emerald-50/50 text-emerald-600 border-emerald-200/60",
          icon: <FileText className="w-3.5 h-3.5" />
        };
    }
  };

  const catTheme = getCategoryTheme(report.category);

  return (
    <div className="flex flex-col h-full bg-white" id={`memo-detail-${report.id}`}>
      {/* Top sticky bar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold border rounded-lg ${catTheme.bg}`}>
            {catTheme.icon}
            <span className="uppercase tracking-wide">{report.category}</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-gray-550 bg-gray-100 px-3 py-1 rounded-lg uppercase tracking-wide">
            <Calendar className="w-3 h-3 text-gray-400" />
            {report.date}
          </span>
        </div>

        <div className="flex items-center gap-2 no-print">
          {/* 리포트 다운로드 드롭다운 */}
          <div className="relative no-print">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-black text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>리포트 다운로드</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>
            
            {showDownloadDropdown && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 z-30 animate-fade-in">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadPdf();
                    setShowDownloadDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-semibold cursor-pointer"
                >
                  <span>🖨️</span>
                  <span>PDF 파일로 저장 (인쇄)</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadHtml();
                    setShowDownloadDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-semibold cursor-pointer"
                >
                  <span>🌐</span>
                  <span>HTML 파일로 다운로드</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-black font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all no-print"
            title="Copy for Notion/Telegram"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600">복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>마크다운 복사</span>
              </>
            )}
          </button>
          
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-black font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all no-print"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>편집</span>
          </button>

          {showDeleteConfirm ? (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 p-1 rounded-lg text-xs animate-fade-in no-print">
              <span className="text-red-700 font-bold px-2">정말 삭제할까요?</span>
              <button
                onClick={() => {
                  onDelete(report.id);
                  setShowDeleteConfirm(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px]"
              >
                네, 삭제
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px]"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 border border-gray-200 font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer no-print"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>삭제</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Document Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-4xl mx-auto w-full space-y-8" id="document-body">
        {/* Title Block */}
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
            {report.title}
          </h1>

          {/* Notion-style Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 py-5 border-t border-b border-gray-150 text-xs">
            <div className="flex items-start gap-4">
              <span className="w-24 text-gray-400 font-bold flex items-center gap-1.5 pt-0.5">
                📁 카테고리
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-[11px] font-bold ${catTheme.bg}`}>
                {catTheme.icon}
                <span className="uppercase tracking-wide">{report.category}</span>
              </span>
            </div>
            
            <div className="flex items-start gap-4">
              <span className="w-24 text-gray-400 font-bold flex items-center gap-1.5 pt-0.5">
                📅 정리 일자
              </span>
              <span className="text-[#1A1A1A] font-semibold text-sm">{report.date}</span>
            </div>

            {report.sourceName && (
              <div className="flex items-start gap-4">
                <span className="w-24 text-gray-400 font-bold flex items-center gap-1.5 pt-0.5">
                  🏛️ 출처 / 기관
                </span>
                <span className="text-[#1A1A1A] font-semibold text-sm">{report.sourceName}</span>
              </div>
            )}

            <div className="flex items-start gap-4">
              <span className="w-24 text-gray-400 font-bold flex items-center gap-1.5 pt-0.5">
                ⚙️ 상태
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-[11px] font-bold bg-slate-55 border-slate-200 text-slate-700">
                {report.status || "요약완료"}
              </span>
            </div>

            {/* Multi-dimensional Rating Visualizer */}
            <div className="flex flex-col gap-4 col-span-1 md:col-span-2 border border-slate-150 bg-slate-50/40 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>스마트 다차원 리포트 등급 평가</span>
                </span>
                
                {report.rating && (
                  <button
                    onClick={handleReEvaluate}
                    disabled={isReEvaluating}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-100 rounded-md cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isReEvaluating ? "재평가 중..." : "🔄 다시 재평가"}
                  </button>
                )}
              </div>

              {/* Grid of Clickable Rating Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Importance Card */}
                {(() => {
                  const score = report.rating?.importance !== undefined ? report.rating.importance : (report.importance || 0);
                  const isActive = activeRatingTab === 'importance';
                  return (
                    <button
                      type="button"
                      onClick={() => setActiveRatingTab('importance')}
                      className={`text-left bg-white p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isActive 
                          ? "border-amber-500 ring-2 ring-amber-100/70 shadow-sm" 
                          : "border-slate-100 hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <span>⭐️ 투자 중요도</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                      </span>
                      <div className="flex items-center justify-between mt-1 w-full">
                        {renderStars(score)}
                        <span className="text-[11px] font-bold text-slate-800">
                          {score}점
                        </span>
                      </div>
                    </button>
                  );
                })()}

                {/* Read Priority Card */}
                {(() => {
                  const score = report.rating?.read_priority !== undefined ? report.rating.read_priority : 3;
                  const isActive = activeRatingTab === 'read_priority';
                  return (
                    <button
                      type="button"
                      onClick={() => setActiveRatingTab('read_priority')}
                      className={`text-left bg-white p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isActive 
                          ? "border-indigo-500 ring-2 ring-indigo-100/70 shadow-sm" 
                          : "border-slate-100 hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <span>📖 정독 우선순위</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>}
                      </span>
                      <div className="flex items-center justify-between mt-1 w-full">
                        {renderStars(score)}
                        <span className="text-[11px] font-bold text-indigo-650">
                          {score}점
                        </span>
                      </div>
                    </button>
                  );
                })()}

                {/* Verification Need Card */}
                {(() => {
                  const score = report.rating?.verification_need !== undefined ? report.rating.verification_need : (report.verified === "O" ? 4 : 2);
                  const isActive = activeRatingTab === 'verification_need';
                  return (
                    <button
                      type="button"
                      onClick={() => setActiveRatingTab('verification_need')}
                      className={`text-left bg-white p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isActive 
                          ? "border-emerald-500 ring-2 ring-emerald-100/70 shadow-sm" 
                          : "border-slate-100 hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <span>🛡️ 검증 필요성</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                      </span>
                      <div className="flex items-center justify-between mt-1 w-full">
                        {renderStars(score)}
                        <span className="text-[11px] font-bold text-emerald-650">
                          {score}점
                        </span>
                      </div>
                    </button>
                  );
                })()}
              </div>

              {/* Dynamic Rating Explanation Section */}
              {(() => {
                const currentScore = activeRatingTab === 'importance' 
                  ? (report.rating?.importance !== undefined ? report.rating.importance : (report.importance || 0))
                  : activeRatingTab === 'read_priority'
                  ? (report.rating?.read_priority !== undefined ? report.rating.read_priority : 3)
                  : (report.rating?.verification_need !== undefined ? report.rating.verification_need : (report.verified === "O" ? 4 : 2));

                const currentExplanation = ratingExplanations[activeRatingTab];
                const activeDescription = currentExplanation.descriptions[currentScore as 1|2|3|4|5] || currentExplanation.descriptions[3];
                const themeColor = activeRatingTab === 'importance' ? 'amber' : activeRatingTab === 'read_priority' ? 'indigo' : 'emerald';
                
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
                  <div className={`border p-3.5 rounded-xl transition-all duration-300 ${themeClasses.bg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                        <span>{currentExplanation.icon}</span>
                        <span>{currentExplanation.title} 점수별 안내</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${themeClasses.badge}`}>
                        현재 보고서 평가: {currentScore}점
                      </span>
                    </div>

                    {/* Explanatory Spectrum Slider/Grid */}
                    <div className="grid grid-cols-5 gap-1 mb-3">
                      {[5, 4, 3, 2, 1].map((level) => {
                        const isCurrent = level === currentScore;
                        const levelData = currentExplanation.descriptions[level as 1|2|3|4|5];
                        return (
                          <div
                            key={level}
                            className={`p-1.5 rounded-lg border text-center transition-all ${
                              isCurrent 
                                ? activeRatingTab === 'importance'
                                  ? "bg-amber-500 text-white border-amber-500 font-bold shadow-xs scale-102"
                                  : activeRatingTab === 'read_priority'
                                  ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs scale-102"
                                  : "bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs scale-102"
                                : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                            }`}
                            title={levelData.title}
                          >
                            <span className="block text-[11px] font-extrabold">{level}점</span>
                            <span className="block text-[8px] opacity-80 truncate hidden sm:block">
                              {levelData.title.split(" (")[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Selected Rating Detail text */}
                    <div className="bg-white/95 border border-slate-100 p-3 rounded-lg text-[11px] leading-relaxed">
                      <p className="font-extrabold text-slate-800 mb-1 flex items-center gap-1.5">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                          activeRatingTab === 'importance' ? 'bg-amber-500' : activeRatingTab === 'read_priority' ? 'bg-indigo-600' : 'bg-emerald-600'
                        }`}></span>
                        <span>{currentScore}점 - {activeDescription.title}</span>
                      </p>
                      <p className="text-slate-650 font-medium">
                        {activeDescription.text}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Save & Action Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-xl text-xs font-semibold text-slate-700">
                  <span className="text-slate-400">💾 노션 저장 여부</span>
                  <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                    (report.rating?.notion_save || (report.importance && report.importance >= 4 ? "저장" : "보류")) === "저장"
                      ? "bg-slate-900 text-white"
                      : (report.rating?.notion_save || "보류") === "보류"
                      ? "bg-amber-100 text-amber-800 border border-amber-200/50"
                      : "bg-rose-100 text-rose-800 border border-rose-200/50"
                  }`}>
                    {report.rating?.notion_save || (report.importance && report.importance >= 4 ? "저장" : "보류")}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-xl text-xs font-semibold text-slate-700">
                  <span className="text-slate-400">🎯 추천 후속 액션</span>
                  <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 px-2.5 py-0.5 rounded-md font-bold text-[11px]">
                    {report.rating?.recommended_action || "요약만 저장"}
                  </span>
                </div>
              </div>

              {/* Rationale Text */}
              {report.rating?.score_rationale && (
                <div className="bg-white border border-slate-100 p-3.5 rounded-xl text-[11px] leading-relaxed font-medium text-slate-600">
                  <span className="font-bold text-slate-800 block mb-1">💡 AI 평가 및 추천 행동 근거</span>
                  <p>{report.rating.score_rationale}</p>
                </div>
              )}

              {/* One-click AI Rating generator for legacy memos */}
              {!report.rating && (
                <div className="mt-2 p-3 bg-indigo-50/75 border border-indigo-100 rounded-xl text-center space-y-2">
                  <p className="text-[11px] font-bold text-indigo-900 leading-relaxed">
                    💡 이 자료는 기존에 등록되어 상세 다차원 평가(정독 우선순위, 검증 필요성 등)가 누락되어 있습니다.
                  </p>
                  <button
                    onClick={handleReEvaluate}
                    disabled={isReEvaluating}
                    className="w-full py-2 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:bg-indigo-400"
                  >
                    {isReEvaluating ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>AI 분석 등급 생성 중...</span>
                      </>
                    ) : (
                      <>
                        <span>🔄 AI 다차원 등급 평가 자동 실행하기</span>
                      </>
                    )}
                  </button>
                  {reEvaluateError && (
                    <p className="text-[10px] text-rose-650 font-bold">{reEvaluateError}</p>
                  )}
                </div>
              )}
            </div>

            {((report.sourceUrls && report.sourceUrls.filter(u => u.trim()).length > 0) || report.sourceUrl) && (
              <div className="flex items-start gap-4 col-span-1 md:col-span-2">
                <span className="w-24 text-gray-400 font-bold flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                  🔗 출처 링크
                </span>
                <div className="flex-1 flex flex-col gap-1.5">
                  {report.sourceUrls && report.sourceUrls.filter(u => u.trim()).length > 0 ? (
                    report.sourceUrls.filter(u => u.trim()).map((url, idx) => (
                      <a
                        key={idx}
                        href={url.startsWith('http') ? url : `https://${url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-black font-semibold hover:opacity-80 transition-all truncate hover:underline text-[13px] inline-flex items-center gap-1 w-fit"
                      >
                        <span className="bg-gray-100 text-[10px] text-gray-600 px-1.5 py-0.5 rounded font-mono">출처 {idx + 1}</span>
                        <span className="truncate max-w-[200px] sm:max-w-md">{url}</span>
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    ))
                  ) : (
                    <a
                      href={report.sourceUrl!.startsWith('http') ? report.sourceUrl! : `https://${report.sourceUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-black font-semibold hover:opacity-80 transition-all truncate hover:underline text-[13px] inline-flex items-center gap-1 w-fit"
                    >
                      <span className="truncate max-w-[200px] sm:max-w-md">{report.sourceUrl}</span>
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {report.attachedPdfName && (
              <div className="flex items-start gap-4 col-span-1 md:col-span-2">
                <span className="w-24 text-gray-400 font-bold flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                  📄 첨부 파일
                </span>
                <div className="inline-flex items-center gap-2 bg-rose-50/50 border border-rose-150 px-3 py-1 rounded-lg text-xs text-rose-700 font-medium">
                  <FileText className="w-3.5 h-3.5 text-rose-500 font-bold" />
                  <span className="font-bold">{report.attachedPdfName}</span>
                  <span className="text-[10px] text-rose-400">({report.attachedPdfSize || "Unknown size"})</span>
                </div>
              </div>
            )}

            {report.sectors && report.sectors.length > 0 && (
              <div className="flex items-start gap-4 col-span-1 md:col-span-2">
                <span className="w-24 text-gray-400 font-bold flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                  🏷️ 주요 섹터
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {report.sectors.map((sec, idx) => (
                    <span
                      key={idx}
                      onClick={() => onSelectSector && onSelectSector(sec)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100/50 px-2.5 py-0.5 rounded text-xs font-bold transition-colors cursor-pointer"
                    >
                      #{sec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 한 줄 결론 (One-Line Conclusion) */}
        {report.oneLineConclusion && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-4.5 rounded-r-xl shadow-2xs">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              💬 한 줄 결론 (Bottom Line)
            </span>
            <p className="text-sm md:text-base font-bold text-slate-900 leading-relaxed">
              {report.oneLineConclusion}
            </p>
          </div>
        )}

        {/* 요약 (Summary Box) */}
        <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-6 relative animate-fade-in" id="box-summary">
          <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-black" />
            요약 (Summary)
          </h3>
          <div className="markdown-body text-gray-800 text-sm md:text-base leading-relaxed font-medium prose max-w-none">
            <ReactMarkdown>{report.summary}</ReactMarkdown>
          </div>
        </div>

        {/* 에디터 종합 판단 (Editor Synthesis) */}
        {report.editorSynthesis && (report.editorSynthesis.title || report.editorSynthesis.summary || (report.editorSynthesis.comparisons && report.editorSynthesis.comparisons.length > 0) || report.editorSynthesis.portfolioImplication) && (
          <div className="bg-indigo-50/40 border border-indigo-150 rounded-xl p-5 space-y-3.5">
            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-200/60 pb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              {report.editorSynthesis.title || "에디터 종합 판단 (Editor Synthesis)"}
            </h3>
            {report.editorSynthesis.summary && (
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {report.editorSynthesis.summary}
              </p>
            )}
            {report.editorSynthesis.comparisons && report.editorSynthesis.comparisons.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-indigo-800 flex items-center gap-1">
                  🔍 주요 비교 및 대조 포인트
                </span>
                <ul className="list-disc pl-5 space-y-1 text-xs md:text-sm text-slate-700">
                  {report.editorSynthesis.comparisons.map((cmp, idx) => (
                    <li key={idx} className="leading-relaxed">{cmp}</li>
                  ))}
                </ul>
              </div>
            )}
            {report.editorSynthesis.portfolioImplication && (
              <div className="bg-white/80 p-3.5 rounded-lg border border-indigo-100/80 text-xs md:text-sm text-indigo-950 shadow-2xs">
                <span className="font-bold text-indigo-800 block mb-1 flex items-center gap-1">
                  💼 포트폴리오 대응 및 함의
                </span>
                <span className="leading-relaxed">{report.editorSynthesis.portfolioImplication}</span>
              </div>
            )}
          </div>
        )}

        {/* 투자 검증 체크리스트 (Checklist) */}
        {report.checklist && report.checklist.length > 0 && (
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Check className="w-4 h-4 text-emerald-600" />
              투자 검증 체크리스트 (Checklist)
            </h3>
            <div className="space-y-2">
              {report.checklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-emerald-600 font-bold mt-0.5">☑️</span>
                  <span className="leading-relaxed font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 핵심 정리 (Key Takeaways) */}
        <div className="space-y-3.5" id="box-keypoints">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200 pb-2">
            <Check className="w-4 h-4 text-black" />
            핵심 정리 (Key Points)
          </h3>
          <ul className="space-y-3">
            {report.keyPoints.map((point, index) => (
              <li key={index} className="flex gap-3 text-sm text-gray-800 leading-relaxed items-start">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 text-black text-xs font-bold mt-0.5">
                  {index + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 섹션 분석 (Thematic Sections) */}
        <div className="space-y-6 pt-2" id="box-sections">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200 pb-2">
            <Layers className="w-4 h-4 text-black" />
            상세 섹션 분석 (Section Analysis)
          </h3>

          <div className="space-y-8">
            {report.sections.map((sec, sIdx) => (
              <div key={sec.id || sIdx} className="section-block space-y-3.5 border-l-2 border-gray-200 pl-4 md:pl-5 py-0.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-base md:text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                    <span className="text-black font-mono text-[10px] tracking-wider uppercase bg-gray-100 px-2 py-0.5 rounded font-bold">
                      SEC {sIdx + 1}
                    </span>
                    {sec.title}
                  </h4>
                  {sec.source && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-200/60 px-2.5 py-1 rounded-lg shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      출처: {sec.source}
                    </span>
                  )}
                </div>
                <div className="markdown-body prose max-w-none text-sm text-slate-750 leading-relaxed text-justify space-y-4">
                  {(sec.summary || (sec.details && sec.details.length > 0) || (sec.bullArguments && sec.bullArguments.length > 0) || (sec.keyVariables && sec.keyVariables.length > 0) || (sec.riskFactors && sec.riskFactors.length > 0)) ? (
                    <div className="space-y-4">
                      {sec.summary && (
                        <p className="text-sm font-semibold text-gray-900 leading-relaxed">{sec.summary}</p>
                      )}
                      
                      {sec.details && sec.details.length > 0 && (
                        <ul className="list-disc pl-5 space-y-1">
                          {sec.details.map((detail, dIdx) => (
                            <li key={dIdx} className="text-gray-800 leading-relaxed">{detail}</li>
                          ))}
                        </ul>
                      )}

                      {sec.bullArguments && sec.bullArguments.length > 0 && (
                        <div className="bg-emerald-50/40 border-l-4 border-emerald-500 pl-4 py-2.5 my-3 rounded-r-lg">
                          <span className="font-bold text-emerald-800 flex items-center gap-1.5 text-xs mb-1.5 uppercase tracking-wider">
                            ✅ 강세 논거
                          </span>
                          <ul className="list-disc pl-5 space-y-1">
                            {sec.bullArguments.map((b, bIdx) => (
                              <li key={bIdx} className="text-emerald-950 text-sm leading-relaxed">{b}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {sec.keyVariables && sec.keyVariables.length > 0 && (
                        <div className="bg-amber-50/40 border-l-4 border-amber-500 pl-4 py-2.5 my-3 rounded-r-lg">
                          <span className="font-bold text-amber-800 flex items-center gap-1.5 text-xs mb-1.5 uppercase tracking-wider">
                            ⚠️ 핵심 변수
                          </span>
                          <ul className="list-disc pl-5 space-y-1">
                            {sec.keyVariables.map((v, vIdx) => (
                              <li key={vIdx} className="text-amber-950 text-sm leading-relaxed">{v}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {sec.riskFactors && sec.riskFactors.length > 0 && (
                        <div className="bg-rose-50/40 border-l-4 border-rose-500 pl-4 py-2.5 my-3 rounded-r-lg">
                          <span className="font-bold text-rose-800 flex items-center gap-1.5 text-xs mb-1.5 uppercase tracking-wider">
                            ❌ 리스크
                          </span>
                          <ul className="list-disc pl-5 space-y-1">
                            {sec.riskFactors.map((r, rIdx) => (
                              <li key={rIdx} className="text-rose-950 text-sm leading-relaxed">{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <ReactMarkdown>{sec.content}</ReactMarkdown>
                  )}
                </div>

                {/* Optional Quote */}
                {sec.quote && sec.quote.text && (
                  <div className="bg-gray-50/50 border-l-2 border-black pl-4 py-2.5 my-3 rounded-r-lg">
                    <p className="text-sm text-gray-800 italic font-medium leading-relaxed">
                      "{sec.quote.text}"
                    </p>
                    <span className="block text-xs text-gray-550 font-bold mt-1.5 text-right">
                      — {sec.quote.author}
                    </span>
                  </div>
                )}

                {/* Optional Table */}
                {sec.table && sec.table.headers && sec.table.headers.length > 0 && (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg my-4 bg-white">
                    <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {sec.table.headers.map((hdr, hIdx) => (
                            <th
                              key={hIdx}
                              className="px-4 py-2.5 text-left font-bold text-black tracking-wider border-r border-gray-200 last:border-r-0"
                            >
                              {hdr}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {sec.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-gray-50/30 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-4 py-2.5 text-gray-700 border-r border-gray-200 last:border-r-0">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Optional Callout Box */}
                {sec.callout && sec.callout.text && (
                  <div
                    className={`flex gap-2.5 p-4 rounded-lg border leading-relaxed text-xs md:text-sm my-3 ${
                      sec.callout.type === "positive"
                        ? "bg-emerald-50/50 border-emerald-200/40 text-emerald-900"
                        : (sec.callout.type === "negative" || sec.callout.type === "risk")
                        ? "bg-rose-50/50 border-rose-200/40 text-rose-900"
                        : "bg-amber-50/50 border-amber-200/40 text-amber-900"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {sec.callout.type === "positive" ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (sec.callout.type === "negative" || sec.callout.type === "risk") ? (
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <strong className="font-semibold block mb-0.5">
                        {sec.callout.type === "positive"
                          ? "강세 요소 (Positive)"
                          : (sec.callout.type === "negative" || sec.callout.type === "risk")
                          ? "리스크 요인 (Negative)"
                          : "체크 포인트 (Check Point)"}
                      </strong>
                      <span className="text-slate-600">{sec.callout.text}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 투자 관점 (Investment View) */}
        <div className="space-y-6 pt-6 border-t border-gray-200" id="box-investment-view">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-black" />
              투자 관점 (Investment View)
            </h3>
          </div>

          {/* Investment Thesis Block if available */}
          {report.investmentView.thesis && (
            <div className="bg-slate-900 text-white p-4.5 rounded-xl space-y-1.5 shadow-xs">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                핵심 투자 가설 (Investment Thesis)
              </span>
              <p className="text-sm md:text-base font-semibold leading-relaxed text-slate-100">
                {report.investmentView.thesis}
              </p>
            </div>
          )}

          {/* Implications / Risks / Key Tracking Variables Grid if available */}
          {((report.investmentView.implications && report.investmentView.implications.length > 0) ||
            (report.investmentView.risks && report.investmentView.risks.length > 0) ||
            (report.investmentView.keyTrackingVariables && report.investmentView.keyTrackingVariables.length > 0)) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-3">
              {report.investmentView.implications && report.investmentView.implications.length > 0 && (
                <div className="bg-emerald-50/50 border border-emerald-200/60 p-4 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
                    📈 실적 및 모멘텀 시사점
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-800 font-medium">
                    {report.investmentView.implications.map((imp, idx) => (
                      <li key={idx} className="leading-relaxed">{imp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.investmentView.risks && report.investmentView.risks.length > 0 && (
                <div className="bg-rose-50/50 border border-rose-200/60 p-4 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block flex items-center gap-1">
                    ⚠️ 핵심 리스크 요인
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-800 font-medium">
                    {report.investmentView.risks.map((r, idx) => (
                      <li key={idx} className="leading-relaxed">{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.investmentView.keyTrackingVariables && report.investmentView.keyTrackingVariables.length > 0 && (
                <div className="bg-indigo-50/50 border border-indigo-200/60 p-4 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block flex items-center gap-1">
                    🎯 주요 추적 지표 / 변수
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-800 font-medium">
                    {report.investmentView.keyTrackingVariables.map((v, idx) => (
                      <li key={idx} className="leading-relaxed">{v}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 언급 종목 및 섹터 */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-gray-450 uppercase tracking-widest">
              🔎 언급 종목 및 섹터
            </h4>
            {report.investmentView.mentionedAssets && report.investmentView.mentionedAssets.length > 0 ? (
              <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-bold text-black border-r border-gray-200 last:border-r-0">종목·섹터</th>
                      <th className="px-4 py-2 text-left font-bold text-black border-r border-gray-200 last:border-r-0">관계</th>
                      <th className="px-4 py-2 text-left font-bold text-black border-r border-gray-200 last:border-r-0">맥락 (Context)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {report.investmentView.mentionedAssets.map((asset, aIdx) => (
                      <tr key={aIdx} className="hover:bg-gray-50/20 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-[#1A1A1A] whitespace-nowrap border-r border-gray-200 last:border-r-0">
                          {asset.asset}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap border-r border-gray-200 last:border-r-0">
                          <span className="bg-black/5 text-black border border-black/10 text-[10px] font-bold px-2.5 py-1 rounded">
                            {asset.relation}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-700 leading-relaxed text-xs border-r border-gray-200 last:border-r-0">
                          {asset.context}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-450">분석된 관련 종목이 없습니다.</p>
            )}
          </div>

          {/* Bull vs Caveats Dual Column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            {/* Bull thesis */}
            <div className="bg-emerald-50/20 border border-emerald-150/50 rounded-xl p-5 space-y-2.5">
              <h4 className="text-[11px] font-bold text-emerald-850 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                🟢 강세 논거 (Bull Thesis)
              </h4>
              <ul className="space-y-1.5 text-xs md:text-sm text-gray-800">
                {report.investmentView.bullArguments.map((arg, idx) => (
                  <li key={idx} className="flex gap-2 items-start leading-relaxed font-medium">
                    <span className="text-emerald-500 font-bold mt-0.5">+</span>
                    <span>{arg}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Caveats */}
            <div className="bg-rose-50/20 border border-rose-150/50 rounded-xl p-5 space-y-2.5">
              <h4 className="text-[11px] font-bold text-rose-850 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                🔴 주의 및 반론 (Bear Risks)
              </h4>
              <ul className="space-y-1.5 text-xs md:text-sm text-gray-800">
                {report.investmentView.caveats.map((arg, idx) => (
                  <li key={idx} className="flex gap-2 items-start leading-relaxed font-medium">
                    <span className="text-rose-500 font-bold mt-0.5">-</span>
                    <span>{arg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Neutral Evaluation */}
          <div className="space-y-2" id="investment-neutral">
            <h4 className="text-[11px] font-bold text-gray-450 uppercase tracking-widest">
              ⚖️ 중립적 종합 평가 (Neutral Assessment)
            </h4>
            <div className="markdown-body text-sm text-gray-700 leading-relaxed font-medium prose max-w-none">
              <ReactMarkdown>{report.investmentView.neutralEvaluation}</ReactMarkdown>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="pt-4 border-t border-gray-200 text-center" id="investment-disclaimer">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              ※ 본 내용은 정보 제공 목적이며 투자 권유가 아닙니다. 모든 투자의 결과와 책임은 투자자 본인에게 귀속됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
