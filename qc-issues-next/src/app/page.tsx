import Link from "next/link";
import AdminSummaryPanel from "@/components/AdminSummaryPanel";
import IssueStatsCards from "@/components/IssueStatsCards";
import IssueTable from "@/components/IssueTable";
import { computeQcIssueStats } from "@/lib/qc-issues/stats";
import type { QcIssueRow } from "@/lib/qc-issues/types";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  let issues: QcIssueRow[] = [];
  let errorMessage: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("qc_issues")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      errorMessage = error.message;
    } else {
      issues = (data ?? []) as QcIssueRow[];
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.";
  }

  const stats = computeQcIssueStats(issues);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">QC 이슈 목록</h1>
          <p className="mt-1 text-sm text-zinc-500">최신 등록순</p>
        </div>
        <Link
          href="/new"
          className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          + 새 이슈 등록
        </Link>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          데이터 조회 실패: {errorMessage}
        </div>
      ) : (
        <>
          <IssueStatsCards stats={stats} />
          <IssueTable issues={issues} />
        </>
      )}

      <AdminSummaryPanel />
    </div>
  );
}
