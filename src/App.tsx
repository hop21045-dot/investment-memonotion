import React, { useState, useEffect } from "react";
import { StructuredReport } from "./types";
import { SAMPLE_REPORTS } from "./data";
import MemoList from "./components/MemoList";
import MemoDetail from "./components/MemoDetail";
import MemoEditor from "./components/MemoEditor";
import ProcessWorkflow from "./components/ProcessWorkflow";
import { Sparkles, Layers, BookOpen, ChevronLeft, Video, MessageSquare, FileText, ClipboardList, RefreshCw, Download } from "lucide-react";
import { getReportsFromFirestore, saveReportToFirestore, deleteReportFromFirestore, subscribeReports } from "./firebase";

export default function App() {
  const [reports, setReports] = useState<StructuredReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Cloud sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [cloudConnected, setCloudConnected] = useState<boolean>(false);

  const handleSelectSector = (sector: string) => {
    setSearch(`#${sector}`);
    // Show mobile list so mobile users see the filtered list of contents
    setIsMobileListVisible(true);
  };

  // Initialize and subscribe to real-time updates from Firestore
  useEffect(() => {
    // 1. Load initial cache from localStorage immediately so the UI is responsive
    let initialLocal: StructuredReport[] = [];
    const saved = localStorage.getItem("insight_memos");
    if (saved) {
      try {
        initialLocal = JSON.parse(saved);
        setReports(initialLocal);
        if (initialLocal.length > 0) {
          setSelectedReportId(initialLocal[0].id);
        }
      } catch (e) {
        console.error("Failed to parse saved memos on mount", e);
      }
    } else {
      setReports(SAMPLE_REPORTS);
      if (SAMPLE_REPORTS.length > 0) {
        setSelectedReportId(SAMPLE_REPORTS[0].id);
      }
    }

    // 2. Set up Firestore synchronization and real-time subscription
    let unsubscribe: (() => void) | null = null;

    const setupSync = async () => {
      setIsSyncing(true);
      try {
        const dbReports = await getReportsFromFirestore();
        setCloudConnected(true);

        // If the database is empty but we have local or sample data, populate it once
        if (dbReports.length === 0) {
          const toUpload = initialLocal.length > 0 ? initialLocal : SAMPLE_REPORTS;
          for (const report of toUpload) {
            await saveReportToFirestore(report);
          }
        }

        // Subscribe to real-time database modifications
        unsubscribe = subscribeReports(
          (updatedDbReports) => {
            setCloudConnected(true);
            setSyncError(null);
            setIsSyncing(false);
            
            if (updatedDbReports.length > 0) {
              setReports(updatedDbReports);
              localStorage.setItem("insight_memos", JSON.stringify(updatedDbReports));
              setSelectedReportId((prev) => {
                if (prev && updatedDbReports.some((r) => r.id === prev)) {
                  return prev;
                }
                return updatedDbReports[0].id;
              });
            } else {
              setReports([]);
              localStorage.setItem("insight_memos", JSON.stringify([]));
              setSelectedReportId(null);
            }
          },
          (err) => {
            console.error("Real-time subscription error:", err);
            setSyncError(err.message);
            setIsSyncing(false);
          }
        );
      } catch (error) {
        console.error("Initial Firestore sync setup error:", error);
        setCloudConnected(false);
        setSyncError(error instanceof Error ? error.message : "동기화 연결 실패");
        setIsSyncing(false);
      }
    };

    setupSync();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const triggerManualSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const dbReports = await getReportsFromFirestore();
      setCloudConnected(true);
      if (dbReports.length > 0) {
        setReports(dbReports);
        localStorage.setItem("insight_memos", JSON.stringify(dbReports));
        setSelectedReportId((prev) => {
          if (prev && dbReports.some((r) => r.id === prev)) {
            return prev;
          }
          return dbReports[0].id;
        });
      }
    } catch (error) {
      console.error("Manual sync error:", error);
      setCloudConnected(false);
      setSyncError(error instanceof Error ? error.message : "동기화 실패");
    } finally {
      setIsSyncing(false);
    }
  };

  const forcePullFromCloud = async () => {
    await triggerManualSync();
  };

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

  const handleSaveReport = async (report: StructuredReport) => {
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

    // Sync to Firestore in background
    setIsSyncing(true);
    try {
      await saveReportToFirestore(report);
      setCloudConnected(true);
      setSyncError(null);
    } catch (e) {
      console.error("Failed to save to Firestore:", e);
      setCloudConnected(false);
      setSyncError("저장 동기화 실패");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
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

    // Sync to Firestore in background
    setIsSyncing(true);
    try {
      await deleteReportFromFirestore(id);
      setCloudConnected(true);
      setSyncError(null);
    } catch (e) {
      console.error("Failed to delete from Firestore:", e);
      setCloudConnected(false);
      setSyncError("삭제 동기화 실패");
    } finally {
      setIsSyncing(false);
    }
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

        {/* Cloud Synchronization Status Indicator */}
        <div className="flex items-center gap-2 flex-wrap" id="cloud-sync-indicators">
          {isSyncing ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-100 bg-indigo-50/70 text-indigo-700 text-[11px] font-bold" id="syncing-indicator">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              동기화 진행 중...
            </div>
          ) : cloudConnected ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-100 bg-emerald-50/70 text-emerald-700 text-[11px] font-bold" id="connected-indicator">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              클라우드 동기화 완료
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-100 bg-amber-50/70 text-amber-700 text-[11px] font-bold" title={syncError || "클라우드 데이터베이스에 연결할 수 없습니다."} id="local-mode-indicator">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              로컬 저장 모드
            </div>
          )}

          <button
            onClick={triggerManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-[11px] text-gray-600 px-2.5 py-1.5 rounded-lg border border-gray-200/80 font-bold transition-all cursor-pointer disabled:opacity-50"
            title="실시간 클라우드 데이터 새로고침 및 동기화"
            id="manual-sync-button"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>동기화</span>
          </button>

          <button
            onClick={forcePullFromCloud}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-[11px] text-indigo-700 px-2.5 py-1.5 rounded-lg border border-indigo-200/80 font-bold transition-all cursor-pointer disabled:opacity-50"
            title="클라우드 데이터를 기기로 강제 덮어쓰기 (모바일-노트북 연동 보장)"
            id="force-sync-button"
          >
            <Download className="w-3 h-3" />
            <span>클라우드 강제덮어쓰기</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
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
        </div>
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
            search={search}
            setSearch={setSearch}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
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
              onSelectSector={handleSelectSector}
            />
          )}
        </div>

      </main>
    </div>
  );
}
