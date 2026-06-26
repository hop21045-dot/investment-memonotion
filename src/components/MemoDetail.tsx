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
  Globe
} from "lucide-react";

interface MemoDetailProps {
  report: StructuredReport | null;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export default function MemoDetail({ report, onEdit, onDelete }: MemoDetailProps) {
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset delete confirmation when active report changes
  useEffect(() => {
    setShowDeleteConfirm(false);
  }, [report?.id]);

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
    if (report.sourceUrl) md += `* **출처:** [링크](${report.sourceUrl})\n`;
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

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-black font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all"
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
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-black font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>편집</span>
          </button>

          {showDeleteConfirm ? (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 p-1 rounded-lg text-xs animate-fade-in">
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
              className="flex items-center gap-1.5 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 border border-gray-200 font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
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

            {report.sourceUrl && (
              <div className="flex items-start gap-4 col-span-1 md:col-span-2">
                <span className="w-24 text-gray-400 font-bold flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                  🔗 출처 링크
                </span>
                <a
                  href={report.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-black font-semibold hover:opacity-80 transition-all truncate hover:underline text-[13px] flex items-center gap-1"
                >
                  <span>{report.sourceUrl}</span>
                  <ExternalLink className="w-3 h-3 inline" />
                </a>
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
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100/50 px-2.5 py-0.5 rounded text-xs font-bold transition-colors"
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
