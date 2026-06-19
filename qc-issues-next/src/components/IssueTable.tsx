import IssueStatusSelect from "@/components/IssueStatusSelect";
import type { QcIssueRow } from "@/lib/qc-issues/types";

function severityBadge(severity: string | null) {
  if (severity === "높음") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800 shadow-sm ring-2 ring-rose-200">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" aria-hidden />
        높음
      </span>
    );
  }
  if (severity === "중간") {
    return (
      <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
        중간
      </span>
    );
  }
  if (severity === "낮음") {
    return (
      <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
        낮음
      </span>
    );
  }
  return <span className="text-zinc-400">—</span>;
}

function formatOccurredAt(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("ko-KR");
}

type Props = {
  issues: QcIssueRow[];
};

export default function IssueTable({ issues }: Props) {
  if (issues.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center text-sm text-zinc-500">
        등록된 QC 이슈가 없습니다. 새 이슈를 등록해 보세요.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-500">
            <th className="px-4 py-3">제목</th>
            <th className="px-4 py-3">장비명</th>
            <th className="px-4 py-3">시험 항목</th>
            <th className="px-4 py-3">심각도</th>
            <th className="px-4 py-3">상태</th>
            <th className="px-4 py-3">담당자</th>
            <th className="px-4 py-3">발생일</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {issues.map((issue) => {
            const isHigh = issue.severity === "높음";
            return (
              <tr
                key={issue.id}
                className={
                  isHigh
                    ? "bg-rose-50/60 hover:bg-rose-50 border-l-4 border-l-rose-500"
                    : "hover:bg-zinc-50/80"
                }
              >
                <td className={`px-4 py-3 font-medium ${isHigh ? "text-rose-950" : "text-zinc-900"}`}>
                  {issue.title}
                </td>
                <td className="px-4 py-3 text-zinc-600">{issue.equipment_name || "—"}</td>
                <td className="px-4 py-3 text-zinc-600">{issue.test_item || "—"}</td>
                <td className="px-4 py-3">{severityBadge(issue.severity)}</td>
                <td className="px-4 py-3">
                  <IssueStatusSelect
                    key={`${issue.id}-${issue.status}`}
                    issueId={issue.id}
                    currentStatus={issue.status}
                  />
                </td>
                <td className="px-4 py-3 text-zinc-600">{issue.assignee || "—"}</td>
                <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">
                  {formatOccurredAt(issue.occurred_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
