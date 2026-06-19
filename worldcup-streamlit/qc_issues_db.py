"""Supabase public.qc_issues — QC 이슈 추적 (anon key, 교육용 RLS)."""

from __future__ import annotations

from datetime import date
from typing import Any

from supabase_db import get_client, is_configured

QC_STATUSES = ("접수", "검토중", "조치완료")
QC_SEVERITIES = ("낮음", "중간", "높음")
QC_CATEGORIES = ("장비", "시약", "공정", "환경", "문서")


def _normalize_status(value: str | None) -> str:
    if value in QC_STATUSES:
        return value
    return "접수"


def is_high_risk(severity: str | None, status: str | None) -> bool:
    if severity != "높음":
        return False
    return _normalize_status(status) != "조치완료"


def list_qc_issues() -> tuple[list[dict[str, Any]], str | None]:
    client = get_client()
    if not client:
        return [], "Supabase가 설정되지 않았습니다."
    try:
        res = (
            client.table("qc_issues")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        return list(res.data or []), None
    except Exception as exc:
        return [], str(exc)


def create_qc_issue(
    *,
    title: str,
    description: str | None = None,
    category: str | None = "장비",
    severity: str | None = "중간",
    assignee: str | None = None,
    equipment_name: str | None = None,
    test_item: str | None = None,
    occurred_at: date | None = None,
) -> tuple[bool, str]:
    client = get_client()
    if not client:
        return False, "Supabase가 설정되지 않았습니다."
    if not title.strip():
        return False, "제목을 입력해 주세요."

    row: dict[str, Any] = {
        "title": title.strip(),
        "description": description.strip() if description else None,
        "category": category,
        "severity": severity,
        "assignee": assignee.strip() if assignee else None,
        "equipment_name": equipment_name.strip() if equipment_name else None,
        "test_item": test_item.strip() if test_item else None,
        "occurred_at": occurred_at.isoformat() if occurred_at else None,
    }
    try:
        res = client.table("qc_issues").insert(row).execute()
        if not res.data:
            return False, "저장에 실패했습니다."
        return True, "이슈가 등록되었습니다."
    except Exception as exc:
        return False, str(exc)


def update_qc_issue_status(issue_id: str, status: str) -> tuple[bool, str]:
    if status not in QC_STATUSES:
        return False, "유효하지 않은 상태입니다."
    client = get_client()
    if not client:
        return False, "Supabase가 설정되지 않았습니다."
    try:
        res = (
            client.table("qc_issues")
            .update({"status": status})
            .eq("id", issue_id)
            .execute()
        )
        if not res.data:
            return False, "이슈를 찾을 수 없습니다."
        return True, "상태가 변경되었습니다."
    except Exception as exc:
        return False, str(exc)


def compute_stats(issues: list[dict[str, Any]]) -> dict[str, int]:
    total = len(issues)
    unresolved = 0
    high_risk = 0
    resolved = 0
    for row in issues:
        status = _normalize_status(row.get("status"))
        severity = row.get("severity")
        if status in ("접수", "검토중"):
            unresolved += 1
        if status == "조치완료":
            resolved += 1
        if is_high_risk(severity, status):
            high_risk += 1
    completion = round(resolved / total * 100) if total else 0
    return {
        "total": total,
        "unresolved": unresolved,
        "high_risk": high_risk,
        "completion_rate": completion,
    }


def admin_summary(issues: list[dict[str, Any]]) -> dict[str, int]:
    stats = compute_stats(issues)
    by_status = {s: 0 for s in QC_STATUSES}
    for row in issues:
        status = _normalize_status(row.get("status"))
        by_status[status] = by_status.get(status, 0) + 1
    return {
        "total": stats["total"],
        "접수": by_status["접수"],
        "검토중": by_status["검토중"],
        "조치완료": by_status["조치완료"],
        "고위험": stats["high_risk"],
    }


def qc_is_configured() -> bool:
    return is_configured()
