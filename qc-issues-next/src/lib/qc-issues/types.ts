/** Supabase public.qc_issues — MCP 확인 컬럼 기준 */

export type QcIssueSeverity = "낮음" | "중간" | "높음";
export type QcIssueCategory = "장비" | "시약" | "공정" | "환경" | "문서";
export type QcIssueStatus = "접수" | "검토중" | "조치완료";

export type QcIssueRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  severity: string | null;
  status: string | null;
  assignee: string | null;
  equipment_name: string | null;
  test_item: string | null;
  occurred_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CreateQcIssueInput = {
  title: string;
  description?: string | null;
  category?: QcIssueCategory | null;
  severity?: QcIssueSeverity | null;
  status?: QcIssueStatus | null;
  assignee?: string | null;
  equipment_name?: string | null;
  test_item?: string | null;
  occurred_at?: string | null;
};

export type UpdateQcIssueStatusInput = {
  id: string;
  status: QcIssueStatus;
};

/** GET /api/admin/qc-issues/summary 응답 */
export type QcIssuesAdminSummary = {
  total: number;
  접수: number;
  검토중: number;
  조치완료: number;
  고위험: number;
};
