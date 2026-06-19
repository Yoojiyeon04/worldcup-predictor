"use client";

import { useState } from "react";
import type { QcIssuesAdminSummary } from "@/lib/qc-issues/types";

const STAT_LABELS: { key: keyof QcIssuesAdminSummary; label: string }[] = [
  { key: "total", label: "전체" },
  { key: "접수", label: "접수" },
  { key: "검토중", label: "검토중" },
  { key: "조치완료", label: "조치완료" },
  { key: "고위험", label: "고위험" },
];

const WRONG_TOKEN_MESSAGE = "관리자 확인값이 맞지 않습니다.";

type Props = {
  /** 목록 하단 임베드 vs /admin 전용 페이지 */
  variant?: "embedded" | "page";
};

export default function AdminSummaryPanel({ variant = "embedded" }: Props) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<QcIssuesAdminSummary | null>(null);

  const handleFetch = async () => {
    if (!token.trim()) {
      setError("ADMIN_TOKEN을 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const res = await fetch("/api/admin/qc-issues/summary", {
        headers: { "x-admin-token": token.trim() },
      });
      const data = (await res.json()) as QcIssuesAdminSummary & { error?: string };

      if (res.status === 401) {
        setError(WRONG_TOKEN_MESSAGE);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? `요청 실패 (${res.status})`);
        return;
      }

      setSummary(data);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const isPage = variant === "page";
  const TitleTag = isPage ? "h1" : "h2";

  return (
    <section
      className={
        isPage
          ? "space-y-6"
          : "mt-10 border-t border-zinc-200 pt-8 space-y-5"
      }
      aria-labelledby="admin-check-panel-title"
    >
      <div>
        <TitleTag
          id="admin-check-panel-title"
          className={
            isPage
              ? "text-2xl font-bold text-zinc-900"
              : "text-lg font-semibold text-zinc-800"
          }
        >
          관리자 점검 패널
        </TitleTag>
        <p className="mt-1 text-sm text-zinc-500">
          ADMIN_TOKEN 입력 후 서버 API로 전체 통계를 조회합니다.
          {!isPage && (
            <span className="block text-xs text-zinc-400 mt-0.5">
              토큰은 입력값으로만 전송되며 코드에 저장되지 않습니다.
            </span>
          )}
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-5 shadow-sm space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">ADMIN_TOKEN</span>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="관리자 확인값"
            autoComplete="off"
            className="w-full max-w-md rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </label>
        <button
          type="button"
          onClick={handleFetch}
          disabled={loading || !token.trim()}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "조회 중…" : "전체 통계 조회"}
        </button>
        {error && (
          <p className="text-sm text-rose-600" role="alert">
            {error}
          </p>
        )}
      </div>

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STAT_LABELS.map(({ key, label }) => (
            <div
              key={key}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="text-xs font-medium text-zinc-500">{label}</div>
              <div className="mt-1 text-2xl font-bold text-zinc-900">
                {summary[key]}
                <span className="ml-1 text-sm font-normal text-zinc-500">건</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
