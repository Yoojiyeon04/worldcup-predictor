import { isQcIssueHighRisk } from "./risk";
import type { QcIssueRow } from "./types";
import { normalizeQcIssueStatus } from "./status";

export type QcIssueStats = {
  total: number;
  unresolved: number;
  highRisk: number;
  completionRate: number;
};

export function computeQcIssueStats(issues: QcIssueRow[]): QcIssueStats {
  const total = issues.length;
  let unresolved = 0;
  let highRisk = 0;
  let resolved = 0;

  for (const issue of issues) {
    const status = normalizeQcIssueStatus(issue.status);
    if (status === "접수" || status === "검토중") unresolved += 1;
    if (status === "조치완료") resolved += 1;
    if (isQcIssueHighRisk(issue.severity, issue.status)) highRisk += 1;
  }

  return {
    total,
    unresolved,
    highRisk,
    completionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
  };
}
