import type { QcIssueStatus } from "./types";

/** Supabase qc_issues.status — MCP 확인값 (2026-06-19) */
export const QC_ISSUE_STATUSES = ["접수", "검토중", "조치완료"] as const satisfies readonly QcIssueStatus[];

export function isQcIssueStatus(value: string | null | undefined): value is QcIssueStatus {
  return QC_ISSUE_STATUSES.includes(value as QcIssueStatus);
}

/** DB에 없는/null 값은 기본값 '접수'로 (컬럼 default와 동일) */
export function normalizeQcIssueStatus(value: string | null | undefined): QcIssueStatus {
  return isQcIssueStatus(value) ? value : "접수";
}

export function statusSelectClass(status: QcIssueStatus): string {
  switch (status) {
    case "접수":
      return "border-sky-300 bg-sky-50 text-sky-800";
    case "검토중":
      return "border-amber-300 bg-amber-50 text-amber-900";
    case "조치완료":
      return "border-emerald-300 bg-emerald-50 text-emerald-800";
  }
}
