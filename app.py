import streamlit as st
import json
import os
from datetime import datetime

# 페이지 기본 설정
st.set_page_config(
    page_title="노션 스타일 투자 메모 & 리포트 요약기",
    page_icon="📝",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 파일 경로 정의
DATA_FILE = "memos.json"

# 초기 샘플 데이터 정의 (React 앱의 mock 데이터와 스키마 매칭)
SAMPLE_MEMOS = [
    {
        "id": "sample-1",
        "title": "[반도체] HBM4E 규격 변경 가능성 및 업계 동향 분석",
        "date": "2026-06-24",
        "category": "report",
        "sourceUrl": "https://example.com/report1",
        "summary": "NVIDIA의 차세대 AI 가속기 **Rubin Ultra**의 스펙 변경(384GB 축소안) 루머에 따른 한국 HBM 공급망(삼성전자, SK하이닉스) 영향 분석.",
        "keyPoints": [
            "Rubin Ultra의 당초 HBM4E 1TB 탑재 목표가 수율 및 패키징 한계로 384GB 축소 검토 중.",
            "메모리 레이어 적층 수가 16단에서 12단으로 하향 조정될 가능성 존재.",
            "이로 인해 단기 공급 부족(Shortage) 우려가 완화되고 수율 달성 난이도는 낮아짐."
        ],
        "sectors": ["반도체", "AI"],
        "sections": [
            {
                "title": "01 | Rubin Ultra HBM4E 용량 축소 가능성",
                "content": "리포트는 NVIDIA의 2027년 차세대 AI 가속기 **Rubin Ultra**가 당초 GPU 패키지당 **HBM4E 1TB**를 목표로 했으나, 현재는 **384GB 축소안**이 거론되고 있다고 설명합니다. 원안은 **4개 컴퓨터 레티클 × 레티클당 HBM 큐브 4개 × 큐브당 64GB** 구조로 총 **1,024GB**를 구현하는 방식입니다. 반면 축소안은 **2개 컴퓨터 레티클 × 레티클당 HBM 큐브 4개 × 큐브당 48GB** 구조로 총 **384GB**가 됩니다.\n\n즉 핵심 변화는 두 가지입니다.\n1. GPU 내 컴퓨터 레티클 수가 **4개 → 2개**로 감소\n2. HBM 큐브당 적층 수가 **16단 → 12단**으로 감소\n\n다만 리포트는 이 변화가 아직 공식 확정 스펙은 아니며, NVIDIA와 메모리 업체 간 협의가 진행 중인 사안으로 판단합니다.",
                "quote": {
                    "text": "공식 확정된 스펙은 아닌 것으로 판단된다.",
                    "author": "iM증권"
                },
                "callout": {
                    "type": "warning",
                    "text": "아직 확정 사안이 아니므로 16단 기술 개발을 선도하는 업체들의 단기 모멘텀 둔화 가능성에 유의할 필요가 있습니다."
                }
            }
        ],
        "investmentView": {
            "mentionedAssets": [
                {
                    "asset": "NVIDIA (NVDA)",
                    "relation": "차세대 AI 가속기 설계 주체",
                    "context": "Rubin Ultra의 스펙 조율은 향후 AI 가속기 시장의 성능 경쟁 구도와 메모리 탑재량을 결정짓는 핵심 변수입니다."
                },
                {
                    "asset": "삼성전자 (005930)",
                    "relation": "HBM4E 핵심 공급 후보",
                    "context": "12단 48GB HBM4E 샘플을 먼저 제출했으며, 16단 적층 시 요구되는 하이브리드 본딩 도입 부담이 이연되어 단기 수혜 가능성이 존재합니다."
                },
                {
                    "asset": "SK하이닉스 (000660)",
                    "relation": "HBM4E 핵심 공급 후보",
                    "context": "검증된 MR-MUF 공정을 16단까지 연장하려 했으나 수율 및 두께 제약이 있어, 스펙이 12단으로 낮아질 경우 시장 지배력 유지가 보다 수월할 수 있습니다."
                }
            ],
            "bullArguments": [
                "12단 규격으로 안착 시 메모리 제조사들의 수율 확보 가속화 및 조기 양산 가능성.",
                "무리한 16단 하이브리드 본딩 도입 연기로 기술적 리스크 분산 효과."
            ],
            "caveats": [
                "개별 패키지당 HBM 탑재 용량 감소에 따른 절대 비트 출하량(B/G) 성장률 둔화 가능성.",
                "중국 현지 레거시 생산 가동에 따른 범용 반도체 단가 인하 압력과의 병행 검토 필요."
            ],
            "neutralEvaluation": "기술 혁신의 패러다임 변화(AI 인프라 확장)는 거스를 수 없는 대세이므로 단기 스펙 조율에 따른 변동성은 저점 분할 매수의 기회입니다. 삼전과 하이닉스의 수혜 포인트를 분산하여 대응하는 전략이 유리합니다."
        }
    }
]

# 데이터 로드 및 저장 함수
def load_memos():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(SAMPLE_MEMOS, f, ensure_ascii=False, indent=2)
        return SAMPLE_MEMOS
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        st.error(f"데이터 파일 읽기 오류: {e}")
        return SAMPLE_MEMOS

def save_memos(memos):
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(memos, f, ensure_ascii=False, indent=2)
    except Exception as e:
        st.error(f"데이터 파일 저장 오류: {e}")

# 세션 상태 초기화
if "memos" not in st.session_state:
    st.session_state.memos = load_memos()
if "active_memo_id" not in st.session_state:
    if st.session_state.memos:
        st.session_state.memos = load_memos()
        st.session_state.active_memo_id = st.session_state.memos[0]["id"]
    else:
        st.session_state.active_memo_id = None
if "is_editing" not in st.session_state:
    st.session_state.is_editing = False
if "is_creating" not in st.session_state:
    st.session_state.is_creating = False

# 카테고리 아이콘 헬퍼
CATEGORY_ICONS = {
    "youtube": "📺 YouTube",
    "telegram": "✈️ Telegram",
    "report": "📄 Report",
    "webpage": "🌐 Webpage"
}

# AI 프롬프트 정의
EXTERNAL_AI_PROMPT = """당신은 뉴스 기사, 유튜브 자막, 웹페이지 글 등 다양한 원문 콘텐츠를 분석하여 최고의 '노션 스타일 구조화 메모'를 만들어 주는 투자 및 자료 리포팅 전문가입니다.

입력된 원문을 심도 있게 분석하여 다음 JSON 스키마를 만족하는 정확한 JSON 코드를 생성해 주세요. 부연 설명이나 다른 말은 일절 하지 말고, 오직 마크다운 코드 블록(```json ... ```) 안에 담긴 JSON 결과물만 반환하세요.

[JSON 스키마 규격]
{
  "title": "노션 스타일의 직관적이고 눈길을 끄는 메모 제목 (예: '[테크] TV 디스플레이 시장 전망 및 기술 트렌드')",
  "category": "webpage", // 'youtube', 'telegram', 'report', 'webpage' 중 원문에 가장 알맞은 카테고리 기입
  "sectors": ["AI", "반도체"], // 관련 있는 주요 투자 섹터/업종 태그들 기입 (예: 'AI', '반도체', '이차전지', '바이오', '매크로' 등 자유롭게 지정)
  "sourceUrl": "https://example.com/source (알 수 있는 경우 출처 URL, 모르면 빈 문자열)",
  "summary": "핵심 내용을 요약한 2~3줄 분량의 깔끔한 개요 (Markdown 볼드체나 서식을 적절히 가미하여 노션처럼 깔끔하게 작성)",
  "keyPoints": [
    "핵심 요약 내용 첫 번째 줄",
    "핵심 요약 내용 두 번째 줄",
    "핵심 요약 내용 세 번째 줄 (필요에 따라 더 늘리거나 3줄 정도로 제한)"
  ],
  "sections": [
    {
      "title": "01 | [핵심 주제 1] 가독성을 높인 대제목",
      "content": "이 섹션의 상세 분석 내용. 줄바꿈과 마크다운 서식을 사용하여 구조화하여 작성.",
      "quote": {
        "text": "본문에서 가장 핵심이 되는 중요한 인용구 또는 인상 깊은 강조 문장 (선택사항, 없으면 빈 문자열)",
        "author": "말한 사람 또는 기관 (선택사항, 없으면 빈 문자열)"
      },
      "callout": {
        "type": "warning", // 'warning', 'info', 'idea' 중 내용에 어울리는 타입 선택
        "text": "노션 스타일의 콜아웃 박스에 들어갈 중요 체크포인트 및 알림 내용"
      }
    }
  ],
  "investmentView": {
    "mentionedAssets": [
      {
        "asset": "예시 자산 또는 관련 종목/기업명 (예: 삼성전자 (005930))",
        "relation": "수혜주 / 핵심 공급사 / 경쟁사 등 관계 서술",
        "context": "어떤 연관성이나 호재가 있는지 구체적인 문맥 설명"
      }
    ],
    "bullArguments": [
      "긍정적 요인 (호재, 성장성 등)"
    ],
    "caveats": [
      "주의해야 할 리스크 및 우려 요인"
    ],
    "neutralEvaluation": "전체 내용을 냉철하게 종합한 최종 중립적 평가 및 향후 전망 예측"
  }
}"""

# --- SIDEBAR: 메모 리스트 및 검색/필터 ---
with st.sidebar:
    st.title("📝 투자 메모 Board")
    st.caption("Notion 스타일 구조화 메모 플랫폼 (Streamlit 에디션)")
    st.markdown("---")

    # 검색 창
    search_query = st.text_input("🔍 메모 검색 (제목, 요약, 섹터 등)", "")

    # 카테고리 필터
    cat_filter = st.selectbox("📁 카테고리 필터", ["전체보기", "YouTube", "Telegram", "Report", "Webpage"])

    # 새 메모 작성 버튼
    if st.button("➕ 새 구조화 메모 작성", use_container_width=True, type="primary"):
        st.session_state.is_creating = True
        st.session_state.is_editing = False
        st.rerun()

    st.markdown("### 📋 메모 목록")

    # 필터링 적용
    filtered_memos = st.session_state.memos
    if search_query:
        q = search_query.lower()
        filtered_memos = [
            m for m in filtered_memos
            if q in m["title"].lower() or q in m["summary"].lower() or any(q in s.lower() for s in m.get("sectors", []))
        ]

    if cat_filter != "전체보기":
        cat_key = cat_filter.lower()
        filtered_memos = [m for m in filtered_memos if m["category"] == cat_key]

    # 목록 출력
    if not filtered_memos:
        st.info("검색 또는 필터링 조건에 맞는 메모가 없습니다.")
    else:
        for memo in filtered_memos:
            is_active = memo["id"] == st.session_state.active_memo_id
            btn_style = "👉 " if is_active else ""
            category_icon = CATEGORY_ICONS.get(memo["category"], "🌐 Webpage").split(" ")[0]
            
            # 리스트 아이템 UI
            with st.container():
                cols = st.columns([1, 10])
                cols[0].write(category_icon)
                if cols[1].button(f"{memo['title'][:25]}...", key=f"select_{memo['id']}", use_container_width=True):
                    st.session_state.active_memo_id = memo["id"]
                    st.session_state.is_creating = False
                    st.session_state.is_editing = False
                    st.rerun()
                
                # 태그 표시
                if memo.get("sectors"):
                    tags_str = " ".join([f"`#{s}`" for s in memo["sectors"]])
                    st.markdown(f"<div style='margin-left: 25px; margin-top: -10px; margin-bottom: 10px; font-size:0.8em;'>{tags_str}</div>", unsafe_allow_html=True)

# --- MAIN CONTENT AREA ---

# 1. 메모 작성 모드
if st.session_state.is_creating or st.session_state.is_editing:
    st.subheader("🛠️ 구조화 메모 에디터")
    
    # 수정 대상 메모 가져오기
    target_memo = None
    if st.session_state.is_editing:
        target_memo = next((m for m in st.session_state.memos if m["id"] == st.session_state.active_memo_id), None)

    # ChatGPT/Gemini 스마트 폼 자동완성 패널
    with st.expander("⚡ ChatGPT / Gemini 스마트 폼 자동완성 도우미", expanded=True):
        st.markdown("""
        외부 AI(ChatGPT, Gemini 등)에게 원문 분석을 요청하여 나온 JSON 결과를 복사해 붙여넣으면 한 번에 폼을 자동으로 입력할 수 있습니다.
        """)
        col_p1, col_p2 = st.columns(2)
        with col_p1:
            st.markdown("**1단계: 최적화 프롬프트 복사**")
            st.code(EXTERNAL_AI_PROMPT, language="markdown")
            st.caption("위 프롬프트 박스의 전체 내용을 복사한 뒤, 분석할 원문과 함께 ChatGPT/Gemini에 던져주세요.")
        with col_p2:
            st.markdown("**2단계: AI가 출력해 준 JSON 붙여넣기**")
            ai_json_input = st.text_area("AI의 코드 블록 결과(JSON)를 여기에 붙여넣으세요:", height=150, placeholder='{"title": "[반도체] ...", ...}')
            if st.button("⚡ 1초 만에 폼 입력 자동 완성 적용", type="primary", use_container_width=True):
                if ai_json_input:
                    try:
                        # 마크다운 코드 블록 제거 및 JSON 파싱
                        cleaned = ai_json_input.strip()
                        if cleaned.startswith("```json"):
                            cleaned = cleaned.split("```json")[1]
                        elif cleaned.startswith("```"):
                            cleaned = cleaned.split("```")[1]
                        if "```" in cleaned:
                            cleaned = cleaned.split("```")[0]
                        
                        parsed_data = json.loads(cleaned.strip())
                        
                        # 파싱된 데이터 저장용 임시 상태 세팅
                        st.session_state.tmp_parsed_data = parsed_data
                        st.success("🎉 AI JSON 파싱 성공! 아래 입력 폼 필드들에 값이 자동 세팅되었습니다. 확인 후 저장해 주세요.")
                    except Exception as e:
                        st.error(f"JSON 파싱 실패: 입력된 텍스트가 유효한 형식이 아닙니다. (오류: {e})")
                else:
                    st.warning("붙여넣은 텍스트가 없습니다.")

    # 폼 임시 바인딩 데이터 확보
    default_title = target_memo["title"] if target_memo else ""
    default_cat = target_memo["category"] if target_memo else "webpage"
    default_url = target_memo["sourceUrl"] if target_memo else ""
    default_summary = target_memo["summary"] if target_memo else ""
    default_sectors = target_memo.get("sectors", ["AI", "반도체"]) if target_memo else ["AI", "반도체"]
    
    # AI 자동완성 임시 데이터 덮어쓰기
    if "tmp_parsed_data" in st.session_state:
        p = st.session_state.tmp_parsed_data
        default_title = p.get("title", default_title)
        default_cat = p.get("category", default_cat)
        default_url = p.get("sourceUrl", default_url)
        default_summary = p.get("summary", default_summary)
        default_sectors = p.get("sectors", default_sectors)

    # 에디터 UI 레이아웃
    with st.form("memo_editor_form"):
        col1, col2 = st.columns([2, 1])
        with col1:
            form_title = st.text_input("메모 제목", default_title, placeholder="예: [테크] 차세대 AI 트렌드 전망")
        with col2:
            form_cat = st.selectbox("카테고리", ["webpage", "youtube", "telegram", "report"], index=["webpage", "youtube", "telegram", "report"].index(default_cat))

        col3, col4 = st.columns([1, 1])
        with col3:
            form_url = st.text_input("출처 URL", default_url, placeholder="https://example.com/source")
        with col4:
            # 섹터 태그 멀티셀렉트와 직접 입력 지원
            form_sectors = st.multiselect("투자 섹터 태그", ["AI", "반도체", "이차전지", "바이오", "매크로", "인터넷", "엔터", "소부장", "우주항공", "자율주행"], default=default_sectors)
            extra_sector = st.text_input("추가할 신규 섹터 직접 입력 (콤마 , 로 구분)", "")

        st.markdown("### 💡 요약 (Summary)")
        form_summary = st.text_area("핵심 한줄 요약 및 가독성 높은 개요 (마크다운 지원)", default_summary, height=100)

        # 저장 및 취소 버튼
        submit_col1, submit_col2 = st.columns([6, 1])
        with submit_col1:
            st.info("💡 에디터 폼 작성이 완료되면 아래 '저장하기' 버튼을 눌러 메모 보드에 영구 반영해 주세요.")
        with submit_col2:
            save_clicked = st.form_submit_button("💾 저장하기", use_container_width=True)

    if save_clicked:
        # 추가 입력 섹터 파싱
        final_sectors = list(form_sectors)
        if extra_sector:
            for s in extra_sector.split(","):
                s_clean = s.strip()
                if s_clean and s_clean not in final_sectors:
                    final_sectors.append(s_clean)

        # 신규 ID 혹은 기존 ID 유지
        new_id = target_memo["id"] if st.session_state.is_editing else f"memo-{int(datetime.now().timestamp())}"
        
        # 바인딩된 JSON 형태로 메모 패킹
        new_memo = {
            "id": new_id,
            "title": form_title if form_title else "제목 없음",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "category": form_cat,
            "sourceUrl": form_url,
            "summary": form_summary,
            "sectors": final_sectors,
            "keyPoints": st.session_state.tmp_parsed_data.get("keyPoints", target_memo.get("keyPoints", ["첫 번째 핵심 요약", "두 번째 핵심 요약"])) if "tmp_parsed_data" in st.session_state else (target_memo.get("keyPoints", ["첫 번째 요약", "두 번째 요약"])),
            "sections": st.session_state.tmp_parsed_data.get("sections", target_memo.get("sections", [])) if "tmp_parsed_data" in st.session_state else (target_memo.get("sections", [])),
            "investmentView": st.session_state.tmp_parsed_data.get("investmentView", target_memo.get("investmentView", {})) if "tmp_parsed_data" in st.session_state else (target_memo.get("investmentView", {}))
        }

        # 목록 업데이트
        if st.session_state.is_editing:
            st.session_state.memos = [m if m["id"] != new_id else new_memo for m in st.session_state.memos]
        else:
            st.session_state.memos.insert(0, new_memo)
        
        save_memos(st.session_state.memos)
        
        # 상태 리셋 및 리런
        st.session_state.active_memo_id = new_id
        st.session_state.is_creating = False
        st.session_state.is_editing = False
        if "tmp_parsed_data" in st.session_state:
            del st.session_state.tmp_parsed_data
            
        st.success("메모가 성공적으로 저장되었습니다!")
        st.rerun()

    if st.button("❌ 작성 취소하고 돌아가기"):
        st.session_state.is_creating = False
        st.session_state.is_editing = False
        if "tmp_parsed_data" in st.session_state:
            del st.session_state.tmp_parsed_data
        st.rerun()

# 2. 메모 상세 보기 모드
else:
    active_memo = next((m for m in st.session_state.memos if m["id"] == st.session_state.active_memo_id), None)
    
    if not active_memo:
        st.title("📝 투자 메모 보드에 오신 것을 환영합니다!")
        st.write("왼쪽 사이드바에서 메모를 선택하거나 새 메모를 작성해 주세요.")
    else:
        # 타이틀 영역
        st.markdown(f"### {CATEGORY_ICONS.get(active_memo['category'], '🌐 Webpage')} | {active_memo['date']}")
        st.title(active_memo["title"])
        
        # 상단 액션 바 (수정, 삭제 기능 탑재)
        col_act1, col_act2, col_act3 = st.columns([1, 1, 6])
        with col_act1:
            if st.button("✏️ 메모 수정", use_container_width=True):
                st.session_state.is_editing = True
                st.rerun()
        with col_act2:
            # 삭제 버튼 클릭 시 더 안전하고 직관적인 인라인 확인 기능 추가
            if "delete_confirm_id" in st.session_state and st.session_state.delete_confirm_id == active_memo["id"]:
                st.markdown("**정말 삭제할까요?**")
                del_yes, del_no = st.columns(2)
                if del_yes.button("네", key="del_yes_btn", type="primary"):
                    st.session_state.memos = [m for m in st.session_state.memos if m["id"] != active_memo["id"]]
                    save_memos(st.session_state.memos)
                    st.session_state.active_memo_id = st.session_state.memos[0]["id"] if st.session_state.memos else None
                    del st.session_state.delete_confirm_id
                    st.success("메모가 삭제되었습니다.")
                    st.rerun()
                if del_no.button("아니오", key="del_no_btn"):
                    del st.session_state.delete_confirm_id
                    st.rerun()
            else:
                if st.button("🗑️ 메모 삭제", use_container_width=True, type="secondary"):
                    st.session_state.delete_confirm_id = active_memo["id"]
                    st.rerun()

        # 섹터 태그 표시
        if active_memo.get("sectors"):
            st.markdown("### 🏷️ 관련 투자 섹터")
            sectors_html = " ".join([f"<span style='background-color:#EEF2F6; color:#4F46E5; font-weight:bold; padding:4px 10px; border-radius:15px; margin-right:8px; font-size:14px; border:1px solid #E0E7FF;'>#{s}</span>" for s in active_memo["sectors"]])
            st.markdown(sectors_html, unsafe_allow_html=True)
            st.markdown("<br>", unsafe_allow_html=True)

        # 요약 (Summary Box) - 마크다운 지원
        st.info("💡 **요약 (Summary)**")
        st.markdown(active_memo["summary"])

        # 핵심 정리 (Key Takeaways)
        if active_memo.get("keyPoints"):
            st.markdown("### 📌 핵심 정리 (Key Takeaways)")
            for kp in active_memo["keyPoints"]:
                if kp.strip():
                    st.markdown(f"- {kp}")

        # 상세 분석 섹션들 (Sections)
        if active_memo.get("sections"):
            st.markdown("---")
            st.markdown("### 🔍 상세 분석 리포트")
            
            for idx, sec in enumerate(active_memo["sections"]):
                with st.expander(sec["title"], expanded=True):
                    # 본문 내용 (마크다운 포맷 지원 및 가독성 폰트)
                    st.markdown(sec["content"])
                    
                    # 인용구 표시
                    if sec.get("quote") and sec["quote"].get("text"):
                        st.markdown(f"""
                        > "{sec['quote']['text']}"
                        > — *{sec['quote'].get('author', '출처 미상')}*
                        """)
                    
                    # 콜아웃 박스
                    if sec.get("callout") and sec["callout"].get("text"):
                        st.warning(f"⚠️ **중요 포인트:** {sec['callout']['text']}")

        # 투자 관점 (Investment View)
        if active_memo.get("investmentView"):
            st.markdown("---")
            st.markdown("### 📈 투자 관점 (Investment View)")
            
            iv = active_memo["investmentView"]
            
            # 언급 종목 테이블
            if iv.get("mentionedAssets"):
                st.markdown("#### 🔍 언급 종목 및 관계망")
                assets_data = []
                for asset in iv["mentionedAssets"]:
                    assets_data.append({
                        "종목·섹터": asset.get("asset", ""),
                        "관계": asset.get("relation", ""),
                        "맥락 (Context)": asset.get("context", "")
                    })
                st.table(assets_data)

            # 호재/악재 2단 컬럼
            col_bull, col_bear = st.columns(2)
            with col_bull:
                st.success("🟢 긍정적 요인 (Bullish)")
                if iv.get("bullArguments"):
                    for b in iv["bullArguments"]:
                        st.markdown(f"- {b}")
            with col_bear:
                st.error("🔴 리스크 요인 (Caveats)")
                if iv.get("caveats"):
                    for c in iv["caveats"]:
                        st.markdown(f"- {c}")

            # 중립적 종합 평가
            if iv.get("neutralEvaluation"):
                st.markdown("#### ⚖️ 중립적 종합 평가")
                st.markdown(iv["neutralEvaluation"])
