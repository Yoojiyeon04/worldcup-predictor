"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateQcIssueStatusAction } from "@/app/actions/qc-issues";
import {
  QC_ISSUE_STATUSES,
  isQcIssueStatus,
  normalizeQcIssueStatus,
  statusSelectClass,
} from "@/lib/qc-issues/status";
import type { QcIssueStatus } from "@/lib/qc-issues/types";

type Props = {
  issueId: string;
  currentStatus: string | null;
};

export default function IssueStatusSelect({ issueId, currentStatus }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const normalized = normalizeQcIssueStatus(currentStatus);
  const [status, setStatus] = useState<QcIssueStatus>(normalized);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (next: QcIssueStatus) => {
    if (next === status) return;

    const prev = status;
    setStatus(next);
    setError(null);

    startTransition(async () => {
      const result = await updateQcIssueStatusAction(issueId, next);
      if (!result.ok) {
        setStatus(prev);
        setError(result.message);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-1">
      <select
        value={status}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value as QcIssueStatus)}
        aria-busy={pending}
        aria-label="상태 변경"
        className={`rounded-md border px-2 py-1 text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-50 ${statusSelectClass(status)}`}
      >
        {QC_ISSUE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {currentStatus && !isQcIssueStatus(currentStatus) && (
        <p className="text-[10px] text-amber-600">DB 값 &quot;{currentStatus}&quot; → 접수로 표시</p>
      )}
      {error && (
        <p className="text-[10px] text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
