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
  ChevronDown
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

interface MemoDetailProps {
  report: StructuredReport | null;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onSelectSector?: (sector: string) => void;
}

export default function MemoDetail({ report, onEdit, onDelete, onSelectSector }: MemoDetailProps) {
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);


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
        <div style="margin-bottom: 32px; border-left: 3px solid #cbd5e1; padding-left: 16px; margin-top: 24px;">
          <h3 style="margin-top: 0; color: #0f172a;">SEC ${sIdx + 1}. ${sec.title}</h3>
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
    body {
      font-family: 'Inter', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      color: #1a1a1a;
      background-color: #ffffff;
      line-height: 1.6;
      margin: 0;
      padding: 0;
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
    }
    h2 {
      font-size: 1.4em;
      font-weight: 700;
      margin-top: 40px;
      margin-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
      color: #111111;
    }
    h3 {
      font-size: 1.15em;
      font-weight: 600;
      margin-top: 24px;
      margin-bottom: 12px;
      color: #2d3748;
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
    }
    blockquote {
      margin: 20px 0;
      padding: 12px 20px;
      border-left: 4px solid #1a1a1a;
      background-color: #f8fafc;
      font-style: italic;
      color: #475569;
      border-radius: 0 8px 8px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      font-size: 0.9em;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 10px 14px;
      text-align: left;
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
    }
    .callout-warning { background-color: #fffbeb; border-color: #fef3c7; color: #78350f; }
    .callout-positive { background-color: #f0fdf4; border-color: #bbf7d0; color: #166534; }
    .callout-risk { background-color: #fef2f2; border-color: #fecaca; color: #991b1b; }
    
    .investment-dual-grid {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 20px;
      margin: 24px 0;
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
    }
    .bull-box { background-color: #f0fdf4; border-color: #dcfce7; }
    .bear-box { background-color: #fef2f2; border-color: #fee2e2; }
    .investment-box-title {
      font-size: 0.85em;
      font-weight: 800;
      margin-top: 0;
      margin-bottom: 12px;
      letter-spacing: 0.05em;
    }
    
    /* Print Styles */
    @media print {
      body {
        background-color: #ffffff;
      }
      .container {
        max-width: 100%;
        padding: 0;
      }
      .no-print {
        display: none !important;
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
      
      <div class="property-label">🛡️ 검증 여부</div>
      <div class="property-value">
        <span class="badge ${report.verified === "O" ? "badge-verified-o" : "badge-verified-x"}">
          ${report.verified === "O" ? "O (검증완료)" : "X (미검증)"}
        </span>
      </div>
      
      <div class="property-label">⚙️ 상태</div>
      <div class="property-value">
        <span class="badge badge-status">${report.status || "요약완료"}</span>
      </div>
      
      <div class="property-label">🎯 액션</div>
      <div class="property-value">
        <span class="badge badge-action">${report.action || "선택 안함"}</span>
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
    md += `\n## 📌 요약\n${report.summary}\n\n`;
    
    md += `## 🔑 핵심 정리\n`;
    report.keyPoints.forEach((p) => (md += `- ${p}\n`));
    md += `\n`;

    report.sections.forEach((sec) => {
      md += `## ${sec.title}\n\n`;
      md += `${sec.content}\n\n`;
      if (sec.quote) {
        md += `> "${sec.quote.text}"\n> — *${sec.quote.author}*\n\n`;
      }
      if (sec.table) {
        md += `| ${sec.table.headers.join(" | ")} |\n`;
        md += `| ${sec.table.headers.map(() => "---").join(" | ")} |\n`;
        sec.table.rows.forEach((row) => {
          md += `| ${row.join(" | ")} |\n`;
        });
        md += `\n`;
      }
      if (sec.callout) {
        const emoji =
          sec.callout.type === "warning"
            ? "⚠️"
            : sec.callout.type === "positive"
            ? "✅"
            : "❌";
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

            <div className="flex items-start gap-4">
              <span className="w-24 text-gray-400 font-bold flex items-center gap-1.5 pt-0.5">
                🛡️ 검증 여부
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-[11px] font-bold ${
                report.verified === "O"
                  ? "bg-emerald-50 border-emerald-200/50 text-emerald-700"
                  : "bg-rose-50 border-rose-200/50 text-rose-700"
              }`}>
                {report.verified === "O" ? "O (검증완료)" : "X (미검증)"}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <span className="w-24 text-gray-400 font-bold flex items-center gap-1.5 pt-0.5">
                ⚙️ 상태
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-[11px] font-bold bg-slate-55 border-slate-200 text-slate-700">
                {report.status || "요약완료"}
              </span>
            </div>

            <div className="flex items-start gap-4 col-span-1 md:col-span-2">
              <span className="w-24 text-gray-400 font-bold flex items-center gap-1.5 pt-0.5">
                🎯 액션
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-extrabold shadow-xs ${
                report.action
                  ? "bg-indigo-50/70 border-indigo-200 text-indigo-700"
                  : "bg-gray-50 border-gray-200 text-gray-400 font-medium"
              }`}>
                {report.action || "선택 안함 (공란)"}
              </span>
            </div>

            <div className="flex items-start gap-4 col-span-1 md:col-span-2">
              <span className="w-24 text-gray-400 font-bold flex items-center gap-1.5 pt-1 flex-shrink-0">
                ⭐️ 중요도 등급
              </span>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  {renderStars(report.importance)}
                  <span className="text-gray-900 font-bold text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {report.importance || 0} / 5 점
                  </span>
                </div>
                {getImportanceBadgeLabel(report.importance)}
              </div>
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
              <div key={sec.id || sIdx} className="space-y-3.5 border-l-2 border-gray-200 pl-4 md:pl-5 py-0.5">
                <h4 className="text-base md:text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                  <span className="text-black font-mono text-[10px] tracking-wider uppercase bg-gray-100 px-2 py-0.5 rounded font-bold">
                    SEC {sIdx + 1}
                  </span>
                  {sec.title}
                </h4>
                <div className="markdown-body prose max-w-none text-sm text-slate-750 leading-relaxed text-justify space-y-1">
                  <ReactMarkdown>{sec.content}</ReactMarkdown>
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
                      sec.callout.type === "warning"
                        ? "bg-amber-50/50 border-amber-200/40 text-amber-900"
                        : sec.callout.type === "positive"
                        ? "bg-emerald-50/50 border-emerald-200/40 text-emerald-900"
                        : "bg-rose-50/50 border-rose-200/40 text-rose-900"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {sec.callout.type === "warning" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : sec.callout.type === "positive" ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <strong className="font-semibold block mb-0.5">
                        {sec.callout.type === "warning"
                          ? "주의 사항 (Warning)"
                          : sec.callout.type === "positive"
                          ? "체크 포인트 (Key Positive)"
                          : "리스크 요인 (Risk Factors)"}
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
