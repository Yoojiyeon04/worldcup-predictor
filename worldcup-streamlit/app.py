"""월드컵 승부 예측기 — Streamlit 앱."""

from __future__ import annotations

from dataclasses import asdict

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

from ai_commentary import generate_commentary
from data import (
    HISTORICAL_MATCHES,
    INITIAL,
    KOREA_INJURIES,
    KOREA_SQUAD,
    MEXICO_INJURIES,
    MEXICO_SQUAD,
    PRESETS,
    REFLECTION_QUESTIONS,
    SEVERITY_LABEL,
    Player,
)
from prediction_engine import ModelVariables, calculate_prediction

st.set_page_config(
    page_title="월드컵 승부 예측기",
    page_icon="⚽",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown(
    """
<style>
    .block-container { padding-top: 1.5rem; }
    div[data-testid="stMetricValue"] { font-size: 1.8rem; }
    p.header-status {
        text-align: center;
        margin: 0 0 0.35rem 0;
        font-size: 0.7rem;
        color: #64748b;
        font-weight: 600;
    }
    div[data-testid="column"]:has(p.header-status) div[data-testid="stButton"] > button {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 0.15rem !important;
        white-space: pre-line !important;
        line-height: 1.2 !important;
    }
</style>
""",
    unsafe_allow_html=True,
)


def _sync_sliders(variables: ModelVariables) -> None:
    for field, val in asdict(variables).items():
        st.session_state[f"sl_{field}"] = val


def _init_state() -> None:
    if "vars" not in st.session_state:
        st.session_state.vars = INITIAL
        _sync_sliders(INITIAL)
    if "ai_commentary" not in st.session_state:
        st.session_state.ai_commentary = ""
    if "reflection" not in st.session_state:
        st.session_state.reflection = {q["id"]: "" for q in REFLECTION_QUESTIONS}

def _build_variables() -> ModelVariables:
    """슬라이더 session_state 값으로 ModelVariables 생성."""
    d = asdict(st.session_state.vars)
    for field in ModelVariables.__dataclass_fields__:
        sk = f"sl_{field}"
        if sk in st.session_state:
            d[field] = st.session_state[sk]
    return ModelVariables(**d)


def _slider(label: str, field: str, value: int, min_v: int = 0, max_v: int = 100, help_text: str = "") -> None:
    sk = f"sl_{field}"
    if sk not in st.session_state:
        st.session_state[sk] = value
    st.slider(label, min_v, max_v, key=sk, help=help_text or None)


def _render_header() -> None:
    col1, col2 = st.columns([4, 1])
    with col1:
        st.title("⚽ World Cup Predictor v2.0")
        st.caption("대한민국 🇰🇷 vs 멕시코 🇲🇽 — 교육용 데이터 시뮬레이터")
    with col2:
        st.markdown('<p class="header-status">● Model Active</p>', unsafe_allow_html=True)
        if st.button("🔄\n초기화", key="btn_reset", use_container_width=True):
            st.session_state.vars = INITIAL
            _sync_sliders(INITIAL)
            st.session_state.ai_commentary = ""
            st.rerun()


def _render_presets() -> None:
    st.subheader("📚 수업용 분석 프리셋")
    cols = st.columns(len(PRESETS))
    for col, preset in zip(cols, PRESETS):
        with col:
            if st.button(preset.name, use_container_width=True, help=preset.description):
                st.session_state.vars = preset.variables
                _sync_sliders(preset.variables)
                st.rerun()


def _render_input_panel() -> ModelVariables:
    v = _build_variables()
    total_w = (
        v.offense_weight + v.defense_weight + v.midfield_weight
        + v.experience_weight + v.condition_weight
    )

    tab_w, tab_k, tab_m = st.tabs([
        f"⚖️ 가중치 ({total_w}%)",
        "🇰🇷 한국 전력",
        "🇲🇽 멕시코 전력",
    ])

    with tab_w:
        st.info("가중치 합이 100%가 아니어도 비율로 자동 정규화되어 계산됩니다.")
        _slider("공격 가중치", "offense_weight", v.offense_weight, help_text="득점 찬스·골 결정력 기여도")
        _slider("수비 가중치", "defense_weight", v.defense_weight, help_text="포백·골키퍼 방어 기여도")
        _slider("미드필더 가중치", "midfield_weight", v.midfield_weight, help_text="볼 키핑·공수 전환 기여도")
        _slider("경험/피파 가중치", "experience_weight", v.experience_weight, help_text="월드컵 경험·FIFA 랭킹")
        _slider("컨디션/기후 가중치", "condition_weight", v.condition_weight, help_text="부상·고산지대·기온 적응")
        st.markdown("##### 💗 한국 감정적 응원 보정치")
        _slider("응원 편향 (Cheering Bias)", "cheering_bias", v.cheering_bias,
                help_text="높을수록 한국 승률이 주관적으로 상승")

    with tab_k:
        _slider("공격 스킬", "korea_offense", v.korea_offense, 10, 100)
        _slider("수비 스킬", "korea_defense", v.korea_defense, 10, 100)
        _slider("중원 장악", "korea_midfield", v.korea_midfield, 10, 100)
        _slider("큰 경기 경험", "korea_experience", v.korea_experience, 10, 100)
        _slider("컨디션", "korea_condition", v.korea_condition, 10, 100)

    with tab_m:
        _slider("공격 스킬", "mexico_offense", v.mexico_offense, 10, 100)
        _slider("수비 스킬", "mexico_defense", v.mexico_defense, 10, 100)
        _slider("중원 장악", "mexico_midfield", v.mexico_midfield, 10, 100)
        _slider("큰 경기 경험", "mexico_experience", v.mexico_experience, 10, 100)
        _slider("컨디션", "mexico_condition", v.mexico_condition, 10, 100)

    return _build_variables()


def _render_scoreboard(result) -> None:
    c1, c2, c3 = st.columns([2, 1, 2])
    with c1:
        st.markdown(
            """
            <div style="text-align: center;">
                <h3 style="text-align: center; margin: 0 0 0.25rem 0;">🇰🇷 대한민국</h3>
                <p style="text-align: center; color: rgb(128, 128, 128); font-size: 0.875rem; margin: 0;">
                    FIFA Rank: ~23rd
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with c2:
        st.markdown(
            """
            <div style="text-align: center;">
                <h2 style="text-align: center; margin: 0 0 0.25rem 0;">VS</h2>
                <p style="text-align: center; color: rgb(128, 128, 128); font-size: 0.875rem; margin: 0;">
                    추정 매치업
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with c3:
        st.markdown(
            """
            <div style="text-align: center;">
                <h3 style="text-align: center; margin: 0 0 0.25rem 0;">🇲🇽 멕시코</h3>
                <p style="text-align: center; color: rgb(128, 128, 128); font-size: 0.875rem; margin: 0;">
                    FIFA Rank: ~15th
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.markdown("---")
    m1, m2 = st.columns(2)
    with m1:
        st.metric("예상 평균 득점", f"{result.korea_expected_goals} : {result.mexico_expected_goals}")
    with m2:
        st.metric("최빈 스코어", f"{result.expected_korea_score} - {result.expected_mexico_score}")


def _render_probability(result) -> None:
    st.subheader("📊 실시간 승무패 확률")

    cols = st.columns(3)
    labels = [("🇰🇷 KOR WIN", result.korea_win_pct, "#4F46E5"),
              ("DRAW", result.draw_pct, "#94A3B8"),
              ("🇲🇽 MEX WIN", result.mexico_win_pct, "#1E293B")]
    for col, (label, pct, color) in zip(cols, labels):
        with col:
            st.metric(label, f"{pct}%")
            st.progress(pct / 100)

    fig = go.Figure(go.Bar(
        x=["한국 승", "무승부", "멕시코 승"],
        y=[result.korea_win_pct, result.draw_pct, result.mexico_win_pct],
        marker_color=["#4F46E5", "#94A3B8", "#1E293B"],
        text=[f"{v}%" for v in [result.korea_win_pct, result.draw_pct, result.mexico_win_pct]],
        textposition="outside",
    ))
    fig.update_layout(height=280, margin=dict(t=20, b=20), yaxis_range=[0, 100], showlegend=False)
    st.plotly_chart(fig, use_container_width=True)


def _render_top_variables(result) -> None:
    st.subheader("⚡ Top Impact Variables")
    for i, var in enumerate(result.top_variables, 1):
        side = "한국 우위" if var["impact"] > 0 else "멕시코 우위"
        with st.expander(f"{i:02d}. {var['name']} — {side} ({var['impact']:+.1f})"):
            st.write(var["description"])
            c1, c2, c3 = st.columns(3)
            c1.metric("한국", var["korea_value"])
            c2.metric("멕시코", var["mexico_value"])
            c3.metric("가중치", f"{var['weight']}%")


def _squad_to_df(squad: list[Player]) -> pd.DataFrame:
    return pd.DataFrame([
        {
            "번호": p.number,
            "이름": p.name,
            "영문": p.eng_name,
            "포지션": p.position,
            "클럽": p.club,
            "나이": p.age,
            "A매치": p.caps,
            "골": p.goals,
            "OVR": p.perceived_rating,
            "KEY": "⭐" if p.is_key else "",
            "특징": p.key_feature,
        }
        for p in squad
    ])


TEAM_OPTIONS = {
    "korea": "🇰🇷 대한민국",
    "mexico": "🇲🇽 멕시코",
}


def _render_squads() -> None:
    st.subheader("🏃‍♂️ 2026 FIFA 월드컵 대표팀 명단")
    team_key = st.radio(
        "팀 선택",
        options=list(TEAM_OPTIONS.keys()),
        format_func=lambda k: TEAM_OPTIONS[k],
        horizontal=True,
        key="squad_team",
    )
    squad = KOREA_SQUAD if team_key == "korea" else MEXICO_SQUAD

    search = st.text_input("선수/클럽 검색", key="squad_search")
    pos = st.selectbox("포지션 필터", ["전체", "GK", "DF", "MF", "FW"], key="squad_pos")

    df = _squad_to_df(squad)
    if search:
        mask = df.apply(lambda r: search.lower() in " ".join(str(x).lower() for x in r), axis=1)
        df = df[mask]
    if pos != "전체":
        df = df[df["포지션"] == pos]

    if df.empty:
        st.warning("조건에 맞는 선수가 없습니다.")
    else:
        st.dataframe(df, use_container_width=True, hide_index=True)
    st.caption(f"{TEAM_OPTIONS[team_key]} — 총 {len(squad)}명 등록")


def _render_injuries() -> None:
    st.subheader("🚨 부상자 리포트")
    team_key = st.radio(
        "팀",
        options=list(TEAM_OPTIONS.keys()),
        format_func=lambda k: TEAM_OPTIONS[k],
        horizontal=True,
        key="injury_team",
    )
    injuries = KOREA_INJURIES if team_key == "korea" else MEXICO_INJURIES

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("총 관리", f"{len(injuries)}명")
    c2.metric("수술/장기", f"{sum(1 for p in injuries if p.severity == 'CRITICAL')}명")
    c3.metric("전술 핵심", f"{sum(1 for p in injuries if p.is_mainpillar)}명")
    c4.metric("평균 재활", f"{round(sum(p.rehab_stage for p in injuries) / len(injuries))}%")

    for p in injuries:
        with st.expander(f"{SEVERITY_LABEL[p.severity]} {p.name} ({p.position})"):
            st.write(f"**부상:** {p.injury_type}")
            st.write(f"**복귀:** {p.expected_return}")
            st.progress(p.rehab_stage / 100, text=f"재활 {p.rehab_stage}%")
            st.info(f"전술 영향: {p.tactical_impact}")


def _render_history() -> None:
    st.subheader("⚔️ 역대 전적 (Head-to-Head)")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("통산", "14전")
    c2.metric("한국 승", "4승")
    c3.metric("무", "2무")
    c4.metric("멕시코 승", "8패")

    st.warning("⚠️ 월드컵 본선: 2전 2패 (1998, 2018) — 멕시코 절대 강세")

    filt = st.radio("필터", ["전체 매치", "월드컵 전적"], horizontal=True)
    matches = HISTORICAL_MATCHES if filt == "전체 매치" else [m for m in HISTORICAL_MATCHES if m.is_worldcup]

    for m in matches:
        badge = "🏆 WC" if m.is_worldcup else ""
        winner = {"Korea": "🇰🇷 한국 승", "Mexico": "🇲🇽 멕시코 승", "Draw": "무승부"}[m.winner]
        with st.expander(f"{badge} {m.date} — {m.score} ({winner})"):
            st.write(f"**{m.competition}**")
            st.write(m.description)
            st.write(f"🇰🇷 득점: {', '.join(m.korea_goals) or '없음'}")
            st.write(f"🇲🇽 득점: {', '.join(m.mexico_goals) or '없음'}")
            st.caption(f"하이라이트: {m.highlight}")


def _render_ai(variables, result) -> None:
    st.subheader("🤖 AI 멘토 비평")
    custom = st.text_input("추가 질문 (선택)", placeholder="예: 수비 몰빵 전술의 맹점은?")
    if st.button("전문가 AI 비평 받기", type="primary"):
        with st.spinner("AI 비평 생성 중..."):
            st.session_state.ai_commentary = generate_commentary(variables, result, custom or None)

    if st.session_state.ai_commentary:
        st.markdown(st.session_state.ai_commentary)
    else:
        st.info("버튼을 누르면 GPT AI 분석 결과가 표시됩니다. (.env에 OPENAI_API_KEY 설정)")


def _render_reflection() -> None:
    st.subheader("💭 생각할 거리: 성찰과 에세이")
    q_labels = [q["question"] for q in REFLECTION_QUESTIONS]
    idx = st.selectbox("질문 선택", range(len(q_labels)), format_func=lambda i: q_labels[i])
    q = REFLECTION_QUESTIONS[idx]

    st.markdown(f"**{q['question']}**")
    answer = st.text_area("나의 생각", st.session_state.reflection.get(q["id"], ""), height=120, key=f"ans_{q['id']}")
    st.session_state.reflection[q["id"]] = answer

    if st.button("작성 내용 저장"):
        st.session_state.reflection[q["id"]] = answer
        st.success("저장되었습니다!")

    with st.expander("💡 통계적 리터러시 해설"):
        st.write(q["guide"])


def _render_limitations() -> None:
    st.subheader("⚠️ 모델의 본질적 한계")
    st.markdown("""
본 도구는 **Poisson 분포** 기반 가중치 계산만 수행하며, 다음 변수는 포함하지 않습니다:

1. **경기 중 무한 변수** — 레드카드, VAR, 돌발 부상, 날씨 악화 등
2. **수학적 한계** — 선제골 후 수비 전환, 팀 사기 저하 등 동적 피드백 미반영

> 예측은 정답 상자가 아니라, **근거를 탐색하는 구조**입니다. 데이터 출처와 가정을 반드시 교차 검증하세요.
""")


def main() -> None:
    _init_state()
    _render_header()
    _render_presets()

    left, right = st.columns([5, 7], gap="large")

    with left:
        st.markdown("### 🎛️ Model Variables")
        variables = _render_input_panel()
        st.markdown(
            "> *\"Prediction is not a correct answer but a reasoned estimation "
            "based on weighted assumptions.\"*"
        )

    with right:
        result = calculate_prediction(variables)
        _render_scoreboard(result)

        tab1, tab2, tab3, tab4, tab5 = st.tabs([
            "📊 분석", "🏃 명단", "🚨 부상", "⚔️ 전적", "🤖 AI",
        ])
        with tab1:
            _render_probability(result)
            _render_top_variables(result)
        with tab2:
            _render_squads()
        with tab3:
            _render_injuries()
        with tab4:
            _render_history()
        with tab5:
            _render_ai(variables, result)

    st.markdown("---")
    _render_reflection()
    _render_limitations()
    st.caption("© 2026 Prediction Lab • Educational Use Only | Data: OPTA / FIFA Historical")


if __name__ == "__main__":
    main()
