"""Supabase 데이터 저장 (성찰 답변, 예측 스냅샷)."""

from __future__ import annotations

import os
import uuid
from typing import Any

from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parent / ".env")

_client = None
_available: bool | None = None


def is_configured() -> bool:
    return bool(os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_ANON_KEY"))


def get_client():
    global _client, _available
    if _available is False:
        return None
    if _client is not None:
        return _client
    if not is_configured():
        _available = False
        return None
    try:
        from supabase import create_client

        _client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_ANON_KEY"])
        _available = True
        return _client
    except Exception:
        _available = False
        return None


def _set_session(client, session_id: str) -> None:
    client.rpc("set_session_context", {"sid": session_id}).execute()


def check_connection() -> dict[str, Any]:
    client = get_client()
    if not client:
        return {"ok": False, "message": "SUPABASE_URL / SUPABASE_ANON_KEY 미설정"}
    try:
        client.rpc("health_check").execute()
        return {"ok": True, "message": "Supabase 연결됨 (RLS 활성)"}
    except Exception as exc:
        return {"ok": False, "message": str(exc)}


def save_reflection(session_id: str, question_id: str, answer: str) -> bool:
    client = get_client()
    if not client or not answer.strip():
        return False
    try:
        _set_session(client, session_id)
        client.table("reflection_answers").upsert(
            {
                "session_id": session_id,
                "question_id": question_id,
                "answer": answer,
            },
            on_conflict="session_id,question_id",
        ).execute()
        return True
    except Exception:
        return False


def load_reflections(session_id: str) -> dict[str, str]:
    client = get_client()
    if not client:
        return {}
    try:
        _set_session(client, session_id)
        rows = (
            client.table("reflection_answers")
            .select("question_id, answer")
            .eq("session_id", session_id)
            .execute()
            .data
            or []
        )
        return {r["question_id"]: r["answer"] for r in rows}
    except Exception:
        return {}


def save_prediction_snapshot(session_id: str, variables: dict, result: dict) -> bool:
    client = get_client()
    if not client:
        return False
    try:
        _set_session(client, session_id)
        client.table("prediction_snapshots").insert(
            {
                "session_id": session_id,
                "variables": variables,
                "result": result,
            }
        ).execute()
        return True
    except Exception:
        return False


def new_session_id() -> str:
    return str(uuid.uuid4())
