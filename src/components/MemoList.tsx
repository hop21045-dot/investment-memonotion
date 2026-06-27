import React from "react";
import { StructuredReport } from "../types";
import { Search, Plus, Video, MessageSquare, FileText, Sparkles, TrendingUp, Globe } from "lucide-react";

interface MemoListProps {
  reports: StructuredReport[];
  selectedReportId: string | null;
  onSelectReport: (id: string) => void;
  onAddClick: () => void;
  search: string;
  setSearch: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
}

export default function MemoList({
  reports,
  selectedReportId,
  onSelectReport,
  onAddClick,
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
}: MemoListProps) {

  const filteredReports = reports.filter((report) => {
    const query = search.trim();
    const matchesCategory =
      categoryFilter === "all" || report.category === categoryFilter;

    if (!query) return matchesCategory;

    if (query.startsWith('#')) {
      const sectorQuery = query.slice(1).toLowerCase();
      const matchesSector = report.sectors && report.sectors.some(
        s => s.toLowerCase() === sectorQuery || s.toLowerCase().includes(sectorQuery)
      );
      return matchesSector && matchesCategory;
    }

    const matchesSearch =
      report.title.toLowerCase().includes(query.toLowerCase()) ||
      report.summary.toLowerCase().includes(query.toLowerCase()) ||
      (report.sectors && report.sectors.some(s => s.toLowerCase().includes(query.toLowerCase()))) ||
      (report.rawText && report.rawText.toLowerCase().includes(query.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "youtube":
        return <Video className="w-4 h-4 text-red-500" />;
      case "telegram":
        return <MessageSquare className="w-4 h-4 text-sky-500" />;
      case "webpage":
        return <Globe className="w-4 h-4 text-indigo-500" />;
      case "report":
      default:
        return <FileText className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "youtube":
        return "YouTube";
      case "telegram":
        return "Telegram";
      case "webpage":
        return "Webpage";
      case "report":
      default:
        return "Report";
    }
  };

  const youtubeCount = reports.filter((r) => r.category === "youtube").length;
  const telegramCount = reports.filter((r) => r.category === "telegram").length;
  const reportCount = reports.filter((r) => r.category === "report").length;
  const webpageCount = reports.filter((r) => r.category === "webpage").length;

  const renderStars = (rating?: number) => {
    if (rating === undefined || rating === null) return null;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-[11px] ${i <= rating ? "text-amber-500 font-bold" : "text-gray-200"}`}
        >
          ★
        </span>
      );
    }
    return <div className="flex items-center">{stars}</div>;
  };

  const getImportanceBadge = (rating?: number) => {
    if (!rating) return null;
    const labels: { [key: number]: { text: string; bg: string; textCol: string } } = {
      5: { text: "투자판단에 직접 영향", bg: "bg-rose-50 border-rose-200/50", textCol: "text-rose-700" },
      4: { text: "Wiki 반영 후보", bg: "bg-amber-50 border-amber-200/50", textCol: "text-amber-700" },
      3: { text: "참고자료", bg: "bg-sky-50 border-sky-200/50", textCol: "text-sky-700" },
      2: { text: "낮은 우선순위", bg: "bg-slate-50 border-slate-200/50", textCol: "text-slate-600" },
      1: { text: "저장 가치 낮음", bg: "bg-gray-50 border-gray-200/50", textCol: "text-gray-500" },
    };
    const config = labels[rating] || { text: `중요도 ${rating}`, bg: "bg-gray-50 border-gray-200", textCol: "text-gray-600" };
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold ${config.bg} ${config.textCol}`}>
        <span>{rating}점</span>
        <span>•</span>
        <span>{config.text}</span>
      </span>
    );
  };

  const getVerifiedBadge = (verified?: "O" | "X") => {
    if (!verified) return null;
    const isO = verified === "O";
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[9px] font-bold ${
        isO ? "bg-emerald-50 border-emerald-200/50 text-emerald-700" : "bg-rose-50 border-rose-200/50 text-rose-700"
      }`}>
        {isO ? "🛡️ 검증됨" : "🛡️ 미검증"}
      </span>
    );
  };

  const getStatusColorBadge = (status?: string) => {
    if (!status) return null;
    const colors: { [key: string]: string } = {
      "요약완료": "bg-blue-50 border-blue-200/50 text-blue-700",
      "정독필요": "bg-amber-50 border-amber-200/50 text-amber-700",
      "검증중": "bg-indigo-50 border-indigo-200/50 text-indigo-700",
      "검증완료": "bg-emerald-50 border-emerald-200/50 text-emerald-700",
      "Wiki반영": "bg-purple-50 border-purple-200/50 text-purple-700",
    };
    const cls = colors[status] || "bg-gray-50 border-gray-200 text-gray-700";
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[9px] font-bold ${cls}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200" id="memo-list-container">
      {/* Quick Stats Panel */}
      <div className="p-4 border-b border-gray-200 bg-gray-50/50" id="stats-panel">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">메모 요약 현황</span>
          <span className="flex items-center gap-1 text-xs font-bold text-black bg-gray-150 px-2 py-0.5 rounded-full">
            Total {reports.length}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <button
            onClick={() => setCategoryFilter(categoryFilter === "youtube" ? "all" : "youtube")}
            className={`p-2.5 rounded-xl transition-all ${
              categoryFilter === "youtube"
                ? "bg-red-50 border border-red-200/60 text-red-700 font-bold"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="text-[10px] text-gray-400 font-semibold tracking-wide uppercase">YouTube</div>
            <div className="text-base font-bold text-red-500 mt-0.5">{youtubeCount}</div>
          </button>
          <button
            onClick={() => setCategoryFilter(categoryFilter === "telegram" ? "all" : "telegram")}
            className={`p-2.5 rounded-xl transition-all ${
              categoryFilter === "telegram"
                ? "bg-blue-50 border border-blue-200/60 text-blue-700 font-bold"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="text-[10px] text-gray-400 font-semibold tracking-wide uppercase">Telegram</div>
            <div className="text-base font-bold text-blue-500 mt-0.5">{telegramCount}</div>
          </button>
          <button
            onClick={() => setCategoryFilter(categoryFilter === "report" ? "all" : "report")}
            className={`p-2.5 rounded-xl transition-all ${
              categoryFilter === "report"
                ? "bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-bold"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="text-[10px] text-gray-400 font-semibold tracking-wide uppercase">Report</div>
            <div className="text-base font-bold text-emerald-500 mt-0.5">{reportCount}</div>
          </button>
          <button
            onClick={() => setCategoryFilter(categoryFilter === "webpage" ? "all" : "webpage")}
            className={`p-2.5 rounded-xl transition-all ${
              categoryFilter === "webpage"
                ? "bg-indigo-50 border border-indigo-200/60 text-indigo-700 font-bold"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="text-[10px] text-gray-400 font-semibold tracking-wide uppercase">Webpage</div>
            <div className="text-base font-bold text-indigo-500 mt-0.5">{webpageCount}</div>
          </button>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="p-4 space-y-3 border-b border-gray-200" id="search-action-bar">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search your knowledge archive..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-10 pr-10 text-sm focus:ring-1 focus:ring-gray-300 outline-none text-[#1A1A1A] transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-2.5 p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button
          onClick={onAddClick}
          className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all group"
          id="btn-add-memo"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span>+ Add Content</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="px-4 py-2 border-b border-gray-200 flex gap-1 bg-gray-50/20" id="filter-tabs">
        {["all", "youtube", "telegram", "report"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-[11px] rounded-lg transition-all font-bold uppercase tracking-wider ${
              categoryFilter === cat
                ? "bg-black text-white"
                : "text-gray-500 hover:text-black hover:bg-gray-150"
            }`}
          >
            {cat === "all" ? "전체" : getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Memo List Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/30" id="memo-list-items">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-semibold">검색된 메모가 없습니다.</p>
            <p className="text-xs text-gray-400 mt-1">새로운 인사이트 메모를 등록해 보세요.</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isSelected = report.id === selectedReportId;
            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border text-left ${
                  isSelected
                    ? "bg-white border-black ring-1 ring-black shadow-sm"
                    : "bg-white border-gray-200 hover:border-black hover:shadow-sm"
                }`}
                id={`memo-item-${report.id}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded bg-slate-50 border border-slate-100">
                      {getCategoryIcon(report.category)}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{report.date}</span>
                  </div>
                  {renderStars(report.importance)}
                </div>
                <h4 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
                  {report.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                  {report.summary}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2.5 items-center">
                  {getImportanceBadge(report.importance)}
                  {getVerifiedBadge(report.verified)}
                  {getStatusColorBadge(report.status)}
                  {report.sectors && report.sectors.length > 0 && (
                    report.sectors.map((sec, idx) => (
                      <span
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card selection
                          setSearch(`#${sec}`);
                        }}
                        className="bg-indigo-50/70 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all"
                      >
                        #{sec}
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
