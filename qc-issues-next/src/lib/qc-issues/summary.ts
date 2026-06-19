import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isQcIssueHighRisk } from "./risk";
import type { QcIssuesAdminSummary } from "./types";

export type { QcIssuesAdminSummary } from "./types";

export async function fetchQcIssuesAdminSummary(): Promise<QcIssuesAdminSummary> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("qc_issues")
    .select("status, severity");

  if (error) {
    throw new Error("qc_issues 조회 실패");
  }

  const rows = data ?? [];

  let 접수 = 0;
  let 검토중 = 0;
  let 조치완료 = 0;
  let 고위험 = 0;

  for (const row of rows) {
    const status = row.status ?? "";
    const severity = row.severity ?? "";

    if (status === "접수") 접수 += 1;
    else if (status === "검토중") 검토중 += 1;
    else if (status === "조치완료") 조치완료 += 1;

    if (isQcIssueHighRisk(severity, status)) {
      고위험 += 1;
    }
  }

  return {
    total: rows.length,
    접수,
    검토중,
    조치완료,
    고위험,
  };
}
