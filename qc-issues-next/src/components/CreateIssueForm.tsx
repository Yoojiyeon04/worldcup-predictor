"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createQcIssueAction } from "@/app/actions/qc-issues";
import type { QcIssueCategory, QcIssueSeverity } from "@/lib/qc-issues/types";

const CATEGORIES: QcIssueCategory[] = ["장비", "시약", "공정", "환경", "문서"];
const SEVERITIES: QcIssueSeverity[] = ["낮음", "중간", "높음"];

export default function CreateIssueForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createQcIssueAction({
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? "") || null,
        category: (form.get("category") as QcIssueCategory) || null,
        severity: (form.get("severity") as QcIssueSeverity) || null,
        assignee: String(form.get("assignee") ?? "") || null,
        equipment_name: String(form.get("equipment_name") ?? "") || null,
        test_item: String(form.get("test_item") ?? "") || null,
        occurred_at: String(form.get("occurred_at") ?? "") || null,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      router.push("/");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">
            제목 <span className="text-rose-500">*</span>
          </span>
          <input
            name="title"
            required
            maxLength={200}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            placeholder="예: 피펫팅 정밀도 편차"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">설명</span>
          <textarea
            name="description"
            rows={4}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            placeholder="이상 현상을 구체적으로 기재해 주세요."
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">카테고리</span>
          <select
            name="category"
            defaultValue="장비"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">심각도</span>
          <select
            name="severity"
            defaultValue="중간"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">담당자</span>
          <input
            name="assignee"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            placeholder="예: 연구원A"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">장비명</span>
          <input
            name="equipment_name"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            placeholder="예: PPT-02"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">시험 항목</span>
          <input
            name="test_item"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            placeholder="예: 정밀도 점검"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-700">발생일</span>
          <input
            name="occurred_at"
            type="date"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </label>
      </div>

      <p className="text-xs text-zinc-400">
        저장 시 Supabase <code className="text-zinc-500">qc_issues</code>에 insert되며, 상태는 기본값 <strong>접수</strong>가 적용됩니다.
      </p>

      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        <button
          type="button"
          onClick={() => router.push("/")}
          disabled={pending}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {pending ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}
