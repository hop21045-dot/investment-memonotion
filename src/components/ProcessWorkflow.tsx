import React, { useState } from "react";
import {
  Inbox,
  Database,
  Filter,
  Sparkles,
  RefreshCw,
  BookOpen,
  Network,
  ChevronRight,
  ArrowRight,
  ArrowDown,
  Info,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  X
} from "lucide-react";

interface StepDetails {
  purpose: string;
  action: string;
  techDetails: string[];
  tips: string;
}

interface WorkflowStep {
  id: number;
  title: string;
  subTitle: string;
  icon: React.ReactNode;
  color: string;
  bgLight: string;
  borderCol: string;
  badge: string;
  details: StepDetails;
}

interface ProcessWorkflowProps {
  onClose?: () => void;
}

export default function ProcessWorkflow({ onClose }: ProcessWorkflowProps) {
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"flow" | "guide">("flow");

  const steps: WorkflowStep[] = [
    {
      id: 1,
      title: "자료 유입",
      subTitle: "다양한 채널을 통한 핵심 리서치 수집",
      icon: <Inbox className="w-5 h-5 text-indigo-600" />,
      color: "border-indigo-500 text-indigo-750",
      bgLight: "bg-indigo-50/40",
      borderCol: "border-indigo-100",
      badge: "Telegram / YouTube / Report",
      details: {
        purpose: "노이즈가 많은 시장 정보 중 유의미한 가치를 지닌 투자 단서 및 리서치 자료의 일차적 포착",
        action: "텔레그램 핵심 채널 소식, 깊이 있는 유튜브 분석 영상, 기관 및 독립 리서치 센터의 공식 리포트를 선별 유입합니다.",
        techDetails: [
          "텔레그램 스크랩 코멘트 수집",
          "유튜브 영상 자막/텍스트 전사(Transcript) 추출",
          "산업/기업 분석 PDF 리포트 파일 준비"
        ],
        tips: "흥미 위주의 단발성 가십 정보는 유입 단계에서 과감하게 배제하고, 구체적인 수치나 비즈니스 모델 변화를 언급하는 소스 중심의 필터링이 중요합니다."
      }
    },
    {
      id: 2,
      title: "노션 저장",
      subTitle: "구조화 양식 기반의 1차 AI 요약 & 태그 지정",
      icon: <Database className="w-5 h-5 text-blue-600" />,
      color: "border-blue-500 text-blue-750",
      bgLight: "bg-blue-50/40",
      borderCol: "border-blue-100",
      badge: "verified: false (미검증)",
      details: {
        purpose: "긴 줄글 형태의 원문을 한눈에 가독할 수 있도록 노션 스타일의 표준 스키마 구조로 1차 가공",
        action: "AI 전용 요약 프롬프트를 활용해 제목, 요약 개요, 핵심 Takeaways, 상세 섹션 분석(줄글과 표의 분리), 언급 자산 리스트, 중요도를 일목요연하게 파싱하여 저장합니다.",
        techDetails: [
          "검증 상태(verified): 기본값 false (미검증 'X')",
          "상태값(status): 기본값 '요약완료' 지정",
          "sectors 태그: 관련 투자 섹터(예: AI, 반도체) 동적 생성"
        ],
        tips: "원문을 복사하여 'InvestInsight' 최적화 프롬프트에 넣으면 단 1초 만에 깔끔한 JSON 양식이 추출됩니다. 이를 노션 DB에 규격화하여 쌓는 단계입니다."
      }
    },
    {
      id: 3,
      title: "선별 (Filtering)",
      subTitle: "가치 집중을 위한 중요도 기반 핵심 선별",
      icon: <Filter className="w-5 h-5 text-amber-600" />,
      color: "border-amber-500 text-amber-750",
      bgLight: "bg-amber-50/40",
      borderCol: "border-amber-100",
      badge: "importance 4~5만 집중 검증",
      details: {
        purpose: "모든 유입 정보를 정독하는 시간 낭비를 방지하고, 투자판단 및 지식 누적 가치가 가장 높은 최정예 정보에 자원을 집중",
        action: "중요도가 4점(섹터/기업 Wiki 반영 후보) 또는 5점(투자판단에 직접 영향)인 핵심 메모만을 다음 검증 대상 리스트로 업로드하여 분리합니다.",
        techDetails: [
          "중요도 3점 이하는 단순 요약 아카이브로 보존 처리",
          "중요도 4점 이상: 정독 분석 및 팩트 체크 대상으로 자동 격상",
          "우선순위 기반의 정제 메트릭스 구축"
        ],
        tips: "중요도 평가는 시장의 단기 센티먼트가 아닌, '내가 보유하거나 관심을 둔 기업의 펀더멘털을 직접 뒤흔드는 정보인가?'를 기준으로 냉정하게 책정해야 합니다."
      }
    },
    {
      id: 4,
      title: "GPT 교차 검증",
      subTitle: "오류 수정 및 입체적 투자 논리 정리",
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      color: "border-purple-500 text-purple-750",
      bgLight: "bg-purple-50/40",
      borderCol: "border-purple-100",
      badge: "원문 + 요약 대조 / 오류 수정 / 투자포인트 정리",
      details: {
        purpose: "AI가 생성한 1차 요약 과정에서 발생할 수 있는 할루시네이션(환각)을 제거하고, 논리적 모순이나 빠진 핵심 수치를 보완",
        action: "상세 원문 텍스트 전체와 1차 노션 요약본을 비교 대조하여 수치 오기나 누락 사항을 교정하고, 강세 논거(Bull)와 약세 리스크(Caveats)의 정확한 인과적 관계 및 구체적인 파급력을 다듬습니다.",
        techDetails: [
          "원문 데이터와의 상호 팩트 대조 수행",
          "애널리스트 시각에서 투자 매력도 재작성",
          "핵심 경쟁 우위 및 장단기 촉매제 선명화"
        ],
        tips: "이 단계에서는 GPT에 '이 요약 내용 중 원문과 다른 숫자가 있거나 생략된 결정적 핵심 논거가 무엇인지 분석해줘'라는 대조 지시를 내리면 고밀도의 정교한 교정이 가능합니다."
      }
    },
    {
      id: 5,
      title: "노션 업데이트",
      subTitle: "검증이 완료된 정예 카드로 신뢰도 격상",
      icon: <RefreshCw className="w-5 h-5 text-emerald-600" />,
      color: "border-emerald-500 text-emerald-750",
      bgLight: "bg-emerald-50/40",
      borderCol: "border-emerald-100",
      badge: "verified: true | status: 검증완료 | action: Wiki 반영 후보",
      details: {
        purpose: "검증을 통과한 신뢰할 수 있는 데이터만 영구 지식창고로 이전하도록 디지털 이정표를 변경",
        action: "수정 보완된 최종 요약본을 노션 DB에 업데이트하고, 메타데이터의 지표를 변경하여 내부 스크리닝이 완료되었음을 공표합니다.",
        techDetails: [
          "verified 상태값: true ('O' 검증완료 마킹)",
          "status 상태값: '검증완료'로 변경",
          "action 조치: 'Wiki 반영 후보' 또는 구체적 액션 기입"
        ],
        tips: "노션에 저장된 수많은 자료 중에서 'verified = true' 필터 하나만 걸어두면, 언제든 신뢰도 100%의 알짜배기 리서치 데이터베이스만 즉시 검색하고 인용할 수 있습니다."
      }
    },
    {
      id: 6,
      title: "옵시디언 반영",
      subTitle: "로컬 영구 지식 카드(Verified Source Card)로 기록",
      icon: <BookOpen className="w-5 h-5 text-teal-600" />,
      color: "border-teal-500 text-teal-750",
      bgLight: "bg-teal-50/40",
      borderCol: "border-teal-100",
      badge: "Verified Source Card 포맷 저장",
      details: {
        purpose: "클라우드 서비스의 의존성을 줄이고 자신만의 로컬 마크다운 지식창고(Obsidian Vault)에 하이 퀄리티 원천 소스 카드를 소장",
        action: "중요도가 극도로 높은 핵심 검증 카드의 마크다운 코드를 복사하여 옵시디언의 'Sources/Verified' 폴더에 독립 노트로 생성 및 아카이빙합니다.",
        techDetails: [
          "옵시디언 전용 마크다운 템플릿 사용",
          "메타데이터 프런트매터(YAML) 동시 기입",
          "양방향 링크([[기업명]], [[산업명]]) 연결성 활성화"
        ],
        tips: "옵시디언에 소장하는 카드는 단순히 글을 쌓는 것이 목적이 아니라, 향후 특정 기업이나 섹터를 분석할 때 '양방향 연결성'을 통해 한 번에 엮어내기 위한 씨앗(Seed) 지식 역할을 합니다."
      }
    },
    {
      id: 7,
      title: "LLM Wiki 누적",
      subTitle: "최종 집대성: 기업/섹터별 핵심 투자 논리 고도화",
      icon: <Network className="w-5 h-5 text-rose-600" />,
      color: "border-rose-500 text-rose-750",
      bgLight: "bg-rose-50/40",
      borderCol: "border-rose-100",
      badge: "투자 원칙 및 기업별 투자 논리 동적 업데이트",
      details: {
        purpose: "개별 지식을 파편화된 리포트로 남겨두지 않고, 최종 산출물인 '기업/섹터별 단일 종합 투자 위키(Investor Wiki)'에 통합 및 업데이트",
        action: "새롭게 검증된 핵심 근거 및 리스크, 마일스톤 변화 수치들을 기존에 만들어 두었던 기업별 위키 노트의 해당 파트에 녹여 넣음으로써, 매순간 가장 정교하게 업데이트된 '단 하나의 정답 투자 바이블'을 유지합니다.",
        techDetails: [
          "섹터/종목별 위키 문서 업데이트 유도",
          "동적 투자 메인 논리(Thesis) 및 반론 리스크 업데이트",
          "LLM 컨텍스트 기반의 실시간 쿼리 대응 지식 기반 완성"
        ],
        tips: "이 단계가 자료 관리 프로세스의 최종 종착점입니다. 수십 개의 뉴스를 다 읽지 않고, 이 단일 Wiki만 보면 특정 기업의 최신 동향과 리스크가 완벽히 정리되어 있는 최강의 투자 지식 허브가 완성됩니다."
      }
    }
  ];

  const activeStep = steps.find((s) => s.id === activeStepId) || steps[0];

  return (
    <div className="flex flex-col h-full bg-white" id="process-workflow-container">
      {/* Header Panel */}
      <div className="p-6 border-b border-gray-200 bg-gray-50/30 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-black text-white text-[10px] font-bold uppercase tracking-wider">
              System Manual
            </span>
            <h2 className="text-base font-bold text-slate-850">자료 관리 프로세스 (Data Management Pipeline)</h2>
          </div>
          <p className="text-xs text-gray-550 mt-1">
            텔레그램 리서치 수집부터 위키 지식 고도화까지 일관된 팩트 검증 및 지식 자산화 사이클
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => setViewMode("flow")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                viewMode === "flow" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"
              }`}
            >
              인터랙티브 파이프라인
            </button>
            <button
              onClick={() => setViewMode("guide")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                viewMode === "guide" ? "bg-white text-black shadow-xs" : "text-gray-500 hover:text-black"
              }`}
            >
              전체 가이드 리스트
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
              title="Close Workflow Panel"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Panel layout */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row" id="workflow-main-layout">
        
        {viewMode === "flow" ? (
          <>
            {/* Interactive Flow visual on the left */}
            <div className="flex-1 overflow-y-auto p-6 border-r border-gray-150 space-y-3 bg-gray-50/20" id="flow-visual-pane">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  프로세스 흐름 (Pipeline Sequence)
                </span>
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">
                  단계를 클릭해 상세 가이드를 확인하세요
                </span>
              </div>

              <div className="space-y-2 max-w-lg mx-auto" id="flowchart-flow-steps">
                {steps.map((step, idx) => {
                  const isActive = step.id === activeStepId;
                  return (
                    <React.Fragment key={step.id}>
                      {/* Step Card */}
                      <button
                        onClick={() => setActiveStepId(step.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 cursor-pointer relative ${
                          isActive
                            ? "bg-white border-black ring-1 ring-black shadow-md translate-x-1"
                            : "bg-white border-gray-200 hover:border-black hover:shadow-xs"
                        }`}
                        id={`wf-step-${step.id}`}
                      >
                        {/* Step Number Badge */}
                        <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                          {step.id}
                        </div>

                        {/* Step Icon */}
                        <div className={`p-2.5 rounded-lg border flex-shrink-0 ${step.bgLight} ${step.borderCol}`}>
                          {step.icon}
                        </div>

                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                              {step.title}
                            </h4>
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/50 truncate max-w-[160px] sm:max-w-none">
                              {step.badge}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {step.subTitle}
                          </p>
                        </div>

                        <div className="flex-shrink-0 self-center">
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isActive ? "rotate-90 text-black" : ""}`} />
                        </div>
                      </button>

                      {/* Connection arrow (only if not the last step) */}
                      {idx < steps.length - 1 && (
                        <div className="flex justify-center py-0.5" id={`wf-arrow-${step.id}`}>
                          <div className="flex flex-col items-center">
                            <div className="w-0.5 h-4 bg-gray-200" />
                            <ArrowDown className="w-3.5 h-3.5 text-gray-300 -mt-1" />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Sidebar detailing active step */}
            <div className="w-full md:w-96 overflow-y-auto p-6 bg-white flex flex-col justify-between" id="flow-detail-pane">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold tracking-widest uppercase">
                    <span className="bg-black text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold">
                      {activeStep.id}
                    </span>
                    <span>상세 실행 지침</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-850 mt-1.5 flex items-center gap-2">
                    {activeStep.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-normal mt-0.5">
                    {activeStep.subTitle}
                  </p>
                  <div className="inline-block mt-2 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-gray-100 text-gray-700 border border-gray-200/50">
                    현 위치 상태값: {activeStep.badge}
                  </div>
                </div>

                {/* Purpose and goals */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-black" />
                    목표 및 목적 (Goal)
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 border border-slate-150 p-3 rounded-lg">
                    {activeStep.details.purpose}
                  </p>
                </div>

                {/* Practical action steps */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-black" />
                    실행 행동 강령 (Action Guide)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {activeStep.details.action}
                  </p>
                </div>

                {/* Technical checklist */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-black" />
                    데이터베이스 및 시스템 반영
                  </h4>
                  <ul className="space-y-1.5">
                    {activeStep.details.techDetails.map((td, tIdx) => (
                      <li key={tIdx} className="flex gap-2 items-start text-xs text-slate-600 font-medium">
                        <span className="text-slate-450 font-bold">•</span>
                        <span>{td}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Professional Tip box */}
                <div className="bg-amber-55 bg-opacity-30 border border-amber-200/50 p-4 rounded-xl space-y-1.5">
                  <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-amber-850 flex items-center gap-1.5">
                    💡 실전 투자 리포팅 노하우
                  </h5>
                  <p className="text-xs text-amber-900 font-medium leading-relaxed">
                    {activeStep.details.tips}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 text-center mt-6">
                <p className="text-[10px] text-gray-400 font-bold">
                  InvestInsight Workflow Engine v1.0
                </p>
              </div>
            </div>
          </>
        ) : (
          /* Guide list view mode */
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-gray-50/10" id="guide-list-pane">
            <div className="max-w-3xl mx-auto space-y-6">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs relative"
                  id={`guide-item-${step.id}`}
                >
                  <div className="absolute top-6 right-6 text-2xl font-black text-gray-150 select-none">
                    STEP 0{step.id}
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl border flex-shrink-0 ${step.bgLight} ${step.borderCol}`}>
                      {step.icon}
                    </div>
                    
                    <div className="space-y-4 flex-1">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900">{step.title}</h3>
                          <span className="text-[10px] font-extrabold uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded border">
                            {step.badge}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{step.subTitle}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-800 block">목표 및 개요</span>
                          <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
                            {step.details.purpose}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-800 block">동작 원칙 & 방법</span>
                          <p className="text-slate-600 leading-relaxed font-medium">
                            {step.details.action}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-3 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {step.details.techDetails.map((tech, tIdx) => (
                            <span key={tIdx} className="text-[11px] font-bold text-indigo-600 bg-indigo-50/50 px-2.5 py-0.5 rounded-full">
                              ✓ {tech}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-amber-700 font-bold bg-amber-50/50 px-3 py-1 rounded-lg border border-amber-100/40 max-w-md">
                          💡 <strong>Tip:</strong> {step.details.tips}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
