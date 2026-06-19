import { normalizeQcIssueStatus } from "./status";

/** 심각도 높음 — 상단 통계·관리 API 공통 정의 */
export function isQcIssueHighRisk(
  severity: string | null | undefined,
  status?: string | null | undefined,
): boolean {
  if (severity !== "높음") return false;
  if (status === undefined) return true;
  return normalizeQcIssueStatus(status) !== "조치완료";
}
