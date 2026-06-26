import React, { useState, useEffect } from "react";
import { StructuredReport } from "./types";
import { SAMPLE_REPORTS } from "./data";
import MemoList from "./components/MemoList";
import MemoDetail from "./components/MemoDetail";
import MemoEditor from "./components/MemoEditor";
import ProcessWorkflow from "./components/ProcessWorkflow";
import { Sparkles, Layers, BookOpen, ChevronLeft, Video, MessageSquare, FileText, ClipboardList } from "lucide-react";

export default function App() {
  const [reports, setReports] = useState<StructuredReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [showWorkflow, setShowWorkflow] = useState(false);

  // Load initial reports from localStorage or sample data
  useEffect(() => {
    const saved = localStorage.getItem("insight_memos");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReports(parsed);
        if (parsed.length > 0) {
          setSelectedReportId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse saved memos, resetting to sample", e);
        setReports(SAMPLE_REPORTS);
        if (SAMPLE_REPORTS.length > 0) {
          setSelectedReportId(SAMPLE_REPORTS[0].id);
        }
      }
    } else {
      setReports(SAMPLE_REPORTS);
      if (SAMPLE_REPORTS.length > 0) {
        setSelectedReportId(SAMPLE_REPORTS[0].id);
      }
    }
  }, []);

  // Save to localStorage whenever reports state changes
  const saveReports = (updatedReports: StructuredReport[]) => {
    setReports(updatedReports);
    localStorage.setItem("insight_memos", JSON.stringify(updatedReports));
  };

  const handleSelectReport = (id: string) => {
    setSelectedReportId(id);
    setIsEditing(false);
    setShowWorkflow(false);
    // On mobile, hide the list to show details
    setIsMobileListVisible(false);
  };

  const handleCreateNew = () => {
    setSelectedReportId(null);
    setIsEditing(true);
    setShowWorkflow(false);
    setIsMobileListVisible(false);
  };

  const handleSaveReport = (report: StructuredReport) => {
    const exists = reports.some((r) => r.id === report.id);
    let updated: StructuredReport[];

    if (exists) {
      updated = reports.map((r) => (r.id === report.id ? report : r));
    } else {
      updated = [report, ...reports];
    }

    saveReports(updated);
    setSelectedReportId(report.id);
    setIsEditing(false);
  };

  const handleDeleteReport = (id: string) => {
    const updated = reports.filter((r) => r.id !== id);
    saveReports(updated);
    
    if (selectedReportId === id) {
      if (updated.length > 0) {
        setSelectedReportId(updated[0].id);
      } else {
        setSelectedReportId(null);
      }
    }
    setIsEditing(false);
    setIsMobileListVisible(true);
  };

  const activeReport = reports.find((r) => r.id === selectedReportId) || null;

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA]" id="app-root">
      
      {/* Sleek App Navigation Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-20 flex-shrink-0" id="main-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">AM</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1A1A1A] tracking-tight leading-tight">
              InvestInsight Station
            </h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
              AI-Powered Research Memo & Summary Hub
            </p>
          </div>
        </div>

        {/* Mobile back button if viewing detail of memos */}
        {!isMobileListVisible && (
          <button
            onClick={() => {
              setIsMobileListVisible(true);
              setShowWorkflow(false);
            }}
            className="md:hidden flex items-center gap-1.5 text-xs text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-semibold transition-all"
            id="mobile-back-button"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>목록 보기</span>
          </button>
        )}

        {/* Process workflow toggle button */}
        <button
          onClick={() => {
            setShowWorkflow(!showWorkflow);
            if (!showWorkflow) {
              setIsMobileListVisible(false); // hide list on mobile to focus on workflow
            }
          }}
          className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all border ${
            showWorkflow
              ? "bg-black text-white border-black shadow-sm"
              : "bg-white text-slate-700 hover:text-black hover:bg-slate-50 border-gray-200"
          }`}
          id="workflow-toggle-btn"
        >
          <ClipboardList className="w-4.5 h-4.5" />
          <span>📊 자료 관리 프로세스</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative" id="split-layout">
        
        {/* Left Side: Memo Search and List Pane */}
        <div
          className={`absolute md:relative inset-0 md:inset-auto md:flex w-full md:w-80 lg:w-96 flex-shrink-0 z-10 transition-transform duration-300 ${
            isMobileListVisible ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
          id="left-pane"
        >
          <MemoList
            reports={reports}
            selectedReportId={selectedReportId}
            onSelectReport={handleSelectReport}
            onAddClick={handleCreateNew}
          />
        </div>

        {/* Right Side: Memo Detail or Memo Editor Panel */}
        <div className="flex-1 h-full overflow-hidden relative bg-white" id="right-pane">
          {showWorkflow ? (
            <ProcessWorkflow onClose={() => setShowWorkflow(false)} />
          ) : isEditing ? (
            <MemoEditor
              report={activeReport}
              onSave={handleSaveReport}
              onCancel={() => {
                setIsEditing(false);
                if (!selectedReportId && reports.length > 0) {
                  setSelectedReportId(reports[0].id);
                }
              }}
            />
          ) : (
            <MemoDetail
              report={activeReport}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDeleteReport}
            />
          )}
        </div>

      </main>
    </div>
  );
}
