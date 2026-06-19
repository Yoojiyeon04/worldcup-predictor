"""QC 이슈 추적 — Supabase qc_issues (Next.js 앱과 동일 테이블)."""

from __future__ import annotations

import os
from datetime import date

import streamlit as st

from qc_issues_db import (
    QC_CATEGORIES,
    QC_SEVERITIES,
    QC_STATUSES,
    admin_summary,
    compute_stats,
    create_qc_issue,
    list_qc_issues,
    qc_is_configured,
    update_qc_issue_status,
)

st.set_page_config(page_title="QC 이슈 추적", page_icon="📋", layout="wide")

st.title("📋 QC 이슈 추적")
st.caption("Supabase `qc_issues` · anon key · 교육용 RLS (`edu_all_access`)")

if not qc_is_configured():
    st.warning(
        "Supabase가 연결되지 않았습니다. `worldcup-streamlit/.env`에 "
        "`SUPABASE_URL`, `SUPABASE_ANON_KEY`를 설정하세요."
    )
    st.stop()

issues, err = list_qc_issues()
if err:
    st.error(f"데이터 조회 실패: {err}")
    st.stop()

stats = compute_stats(issues)
c1, c2, c3, c4 = st.columns(4)
c1.metric("전체 이슈", f"{stats['total']}건")
c2.metric("미해결", f"{stats['unresolved']}건", help="접수 + 검토중")
c3.metric("고위험", f"{stats['high_risk']}건", help="심각도 높음 · 미조치")
c4.metric("완료율", f"{stats['completion_rate']}%", help="조치완료 비율")

st.markdown("---")

with st.expander("➕ 새 이슈 등록", expanded=False):
    with st.form("new_qc_issue", clear_on_submit=True):
        title = st.text_input("제목 *", max_chars=200, placeholder="예: 피펫팅 정밀도 편차")
        description = st.text_area("설명", placeholder="이상 현상을 구체적으로 기재해 주세요.")
        col_a, col_b = st.columns(2)
        with col_a:
            category = st.selectbox("카테고리", QC_CATEGORIES)
            severity = st.selectbox("심각도", QC_SEVERITIES, index=1)
            assignee = st.text_input("담당자", placeholder="예: 연구원A")
        with col_b:
            equipment_name = st.text_input("장비명", placeholder="예: PPT-02")
            test_item = st.text_input("시험 항목", placeholder="예: 정밀도 점검")
            occurred_at = st.date_input("발생일", value=None, min_value=date(2000, 1, 1))
        submitted = st.form_submit_button("저장", type="primary")
        if submitted:
            ok, msg = create_qc_issue(
                title=title,
                description=description or None,
                category=category,
                severity=severity,
                assignee=assignee or None,
                equipment_name=equipment_name or None,
                test_item=test_item or None,
                occurred_at=occurred_at if isinstance(occurred_at, date) else None,
            )
            if ok:
                st.success(msg)
                st.rerun()
            else:
                st.error(msg)

st.subheader("이슈 목록")
st.caption("최신 등록순 · 상태는 행에서 바로 변경할 수 있습니다.")

if not issues:
    st.info("등록된 이슈가 없습니다. 위에서 새 이슈를 등록해 보세요.")
else:
    header = st.columns([3, 1.2, 1, 1, 1, 1.2])
    for col, label in zip(
        header,
        ["제목", "장비", "심각도", "상태", "담당", "발생일"],
    ):
        col.markdown(f"**{label}**")

    for row in issues:
        cols = st.columns([3, 1.2, 1, 1, 1, 1.2])
        cols[0].write(row.get("title") or "-")
        cols[1].write(row.get("equipment_name") or "-")
        sev = row.get("severity") or "-"
        if sev == "높음":
            cols[2].markdown(f":red[**{sev}**]")
        else:
            cols[2].write(sev)

        issue_id = str(row.get("id"))
        current = row.get("status") if row.get("status") in QC_STATUSES else "접수"
        new_status = cols[3].selectbox(
            "상태",
            QC_STATUSES,
            index=QC_STATUSES.index(current),
            key=f"qc_status_{issue_id}",
            label_visibility="collapsed",
        )
        if new_status != current:
            ok, msg = update_qc_issue_status(issue_id, new_status)
            if ok:
                st.rerun()
            else:
                st.error(msg)

        cols[4].write(row.get("assignee") or "-")
        occurred = row.get("occurred_at")
        cols[5].write(str(occurred)[:10] if occurred else "-")

st.markdown("---")
with st.expander("🔐 관리자 점검 패널"):
    st.caption("ADMIN_TOKEN 입력 시 전체 통계를 표시합니다. (service_role은 사용하지 않음)")
    token = st.text_input("ADMIN_TOKEN", type="password", key="qc_admin_token")
    expected = os.getenv("ADMIN_TOKEN", "")
    if st.button("전체 통계 조회", disabled=not token.strip()):
        if not expected:
            st.error("서버에 ADMIN_TOKEN이 설정되지 않았습니다. (.env 또는 Streamlit Secrets)")
        elif token.strip() != expected:
            st.error("관리자 확인값이 맞지 않습니다.")
        else:
            summary = admin_summary(issues)
            m1, m2, m3, m4, m5 = st.columns(5)
            m1.metric("전체", summary["total"])
            m2.metric("접수", summary["접수"])
            m3.metric("검토중", summary["검토중"])
            m4.metric("조치완료", summary["조치완료"])
            m5.metric("고위험", summary["고위험"])

st.caption("Next.js 버전: `qc-issues-next/` · 동일 Supabase 프로젝트")
