import React, { useState } from "react";
import { StructuredReport } from "../types";
import { 
  Search, 
  Plus, 
  Video, 
  MessageSquare, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  Globe,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Star
} from "lucide-react";

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

  // Multi-dimensional rating sort and filter state
  const [sortBy, setSortBy] = useState<'date' | 'importance' | 'read_priority' | 'verification_need'>('date');
  const [minImportance, setMinImportance] = useState<number>(0);
  const [minReadPriority, setMinReadPriority] = useState<number>(0);
  const [minVerificationNeed, setMinVerificationNeed] = useState<number>(0);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);

  // Safe rating extractors (with fallback values for legacy data)
  const getReportImportance = (report: StructuredReport) => {
    return report.rating?.importance !== undefined ? report.rating.importance : (report.importance || 0);
  };

  const getReportReadPriority = (report: StructuredReport) => {
    return report.rating?.read_priority !== undefined ? report.rating.read_priority : 3;
  };

  const getReportVerificationNeed = (report: StructuredReport) => {
    return report.rating?.verification_need !== undefined ? report.rating.verification_need : (report.verified === "O" ? 4 : 2);
  };

  const filteredReports = reports.filter((report) => {
    const query = search.trim();
    const matchesCategory =
      categoryFilter === "all" || report.category === categoryFilter;

    // Rating filters
    const imp = getReportImportance(report);
    const readPri = getReportReadPriority(report);
    const verNeed = getReportVerificationNeed(report);

    const matchesImportance = minImportance === 0 || imp >= minImportance;
    const matchesReadPriority = minReadPriority === 0 || readPri >= minReadPriority;
    const matchesVerificationNeed = minVerificationNeed === 0 || verNeed >= minVerificationNeed;

    if (!matchesImportance || !matchesReadPriority || !matchesVerificationNeed) {
      return false;
    }

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

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'importance') {
      const diff = getReportImportance(b) - getReportImportance(a);
      if (diff !== 0) return diff;
    } else if (sortBy === 'read_priority') {
      const diff = getReportReadPriority(b) - getReportReadPriority(a);
      if (diff !== 0) return diff;
    } else if (sortBy === 'verification_need') {
      const diff = getReportVerificationNeed(b) - getReportVerificationNeed(a);
      if (diff !== 0) return diff;
    }
    
    // Default fallback: date descending
    const aDate = a.date || "";
    const bDate = b.date || "";
    return bDate.localeCompare(aDate);
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
      <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between bg-gray-50/20" id="filter-tabs">
        <div className="flex gap-1">
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

        {/* Sliders/Filter panel toggle */}
        <button
          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
            isFilterPanelOpen || minImportance > 0 || minReadPriority > 0 || minVerificationNeed > 0 || sortBy !== 'date'
              ? "bg-indigo-50 border-indigo-200 text-indigo-700 animate-pulse"
              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
          title="다차원 레이팅 필터 및 정렬 설정"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>필터 & 정렬</span>
          {(minImportance > 0 || minReadPriority > 0 || minVerificationNeed > 0 || sortBy !== 'date') && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-650 inline-block"></span>
          )}
        </button>
      </div>

      {/* Multi-Dimensional Rating Filter & Sorting Panel */}
      {(isFilterPanelOpen || minImportance > 0 || minReadPriority > 0 || minVerificationNeed > 0 || sortBy !== 'date') && (
        <div className="px-4 py-3 bg-indigo-50/30 border-b border-indigo-100/50 space-y-3" id="rating-filter-panel">
          {/* Row 1: Sorting Select */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-indigo-500" />
              <span>정렬 기준 (Sort By)</span>
            </span>
            <div className="flex flex-wrap gap-1">
              {[
                { key: 'date', label: '최신등록순' },
                { key: 'importance', label: '투자중요도' },
                { key: 'read_priority', label: '정독우선' },
                { key: 'verification_need', label: '검증필요' }
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key as any)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                    sortBy === opt.key
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Star Filter Selectors */}
          <div className="space-y-1.5 pt-1.5 border-t border-indigo-100/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                다차원 레이팅 최소 점수 필터
              </span>
              {(minImportance > 0 || minReadPriority > 0 || minVerificationNeed > 0) && (
                <button
                  onClick={() => {
                    setMinImportance(0);
                    setMinReadPriority(0);
                    setMinVerificationNeed(0);
                  }}
                  className="text-[9px] font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  필터 초기화
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 bg-white/70 p-2.5 rounded-lg border border-indigo-100/30">
              {/* Importance filter */}
              <div className="flex items-center justify-between text-[11px] font-medium text-gray-600">
                <span className="flex items-center gap-1">
                  <span>⭐️</span>
                  <span>투자 중요도 (Importance)</span>
                </span>
                <div className="flex gap-1">
                  {[0, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setMinImportance(num)}
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${
                        minImportance === num
                          ? "bg-amber-500 text-white font-bold"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {num === 0 ? "전체" : `${num}점+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Read Priority filter */}
              <div className="flex items-center justify-between text-[11px] font-medium text-gray-600">
                <span className="flex items-center gap-1">
                  <span>📖</span>
                  <span>정독 우선순위 (Read Priority)</span>
                </span>
                <div className="flex gap-1">
                  {[0, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setMinReadPriority(num)}
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${
                        minReadPriority === num
                          ? "bg-indigo-600 text-white font-bold"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {num === 0 ? "전체" : `${num}점+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verification Need filter */}
              <div className="flex items-center justify-between text-[11px] font-medium text-gray-600">
                <span className="flex items-center gap-1">
                  <span>🛡️</span>
                  <span>검증 필요성 (Verification Need)</span>
                </span>
                <div className="flex gap-1">
                  {[0, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setMinVerificationNeed(num)}
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${
                        minVerificationNeed === num
                          ? "bg-emerald-600 text-white font-bold"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {num === 0 ? "전체" : `${num}점+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Memo List Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/30" id="memo-list-items">
        {sortedReports.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-semibold">검색된 메모가 없습니다.</p>
            <p className="text-xs text-gray-400 mt-1">새로운 인사이트 메모를 등록해 보세요.</p>
          </div>
        ) : (
          sortedReports.map((report) => {
            const isSelected = report.id === selectedReportId;
            const imp = getReportImportance(report);
            const readPri = getReportReadPriority(report);
            const verNeed = getReportVerificationNeed(report);

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
                  {renderStars(imp)}
                </div>
                <h4 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
                  {report.title}
                </h4>

                {/* 3D Smart Rating Summary */}
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold mt-1.5 bg-slate-50 border border-slate-100/55 p-1 rounded-md max-w-max">
                  <span className="flex items-center gap-0.5" title="투자 중요도">
                    <span>⭐️</span>
                    <span className="text-slate-600 font-bold">{imp}</span>
                  </span>
                  <span className="text-gray-200">|</span>
                  <span className="flex items-center gap-0.5" title="정독 우선순위">
                    <span>📖</span>
                    <span className="text-indigo-600 font-bold">{readPri}</span>
                  </span>
                  <span className="text-gray-200">|</span>
                  <span className="flex items-center gap-0.5" title="팩트 검증 필요성">
                    <span>🛡️</span>
                    <span className="text-emerald-600 font-bold">{verNeed}</span>
                  </span>
                  {report.rating?.notion_save && (
                    <>
                      <span className="text-gray-200">|</span>
                      <span className={`px-1 rounded text-[8px] font-extrabold ${
                        report.rating.notion_save === "저장" ? "bg-slate-900 text-white" :
                        report.rating.notion_save === "보류" ? "bg-amber-100 text-amber-800" :
                        "bg-rose-100 text-rose-800"
                      }`}>
                        {report.rating.notion_save}
                      </span>
                    </>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                  {report.summary}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2.5 items-center">
                  {getImportanceBadge(imp)}
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
