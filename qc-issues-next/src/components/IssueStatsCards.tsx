import type { QcIssueStats } from "@/lib/qc-issues/stats";

type Props = {
  stats: QcIssueStats;
};

const CARDS: {
  key: keyof QcIssueStats;
  label: string;
  suffix?: string;
  className: string;
  valueClassName?: string;
}[] = [
  {
    key: "total",
    label: "전체 이슈",
    suffix: "건",
    className: "border-zinc-200 bg-white",
  },
  {
    key: "unresolved",
    label: "미해결",
    suffix: "건",
    className: "border-amber-200 bg-amber-50/50",
    valueClassName: "text-amber-800",
  },
  {
    key: "highRisk",
    label: "고위험",
    suffix: "건",
    className: "border-rose-200 bg-rose-50/60",
    valueClassName: "text-rose-700",
  },
  {
    key: "completionRate",
    label: "완료율",
    suffix: "%",
    className: "border-emerald-200 bg-emerald-50/50",
    valueClassName: "text-emerald-700",
  },
];

export default function IssueStatsCards({ stats }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map(({ key, label, suffix, className, valueClassName }) => (
        <div
          key={key}
          className={`rounded-xl border px-4 py-4 shadow-sm ${className}`}
        >
          <p className="text-xs font-medium text-zinc-500">{label}</p>
          <p className={`mt-1 text-2xl font-bold text-zinc-900 ${valueClassName ?? ""}`}>
            {stats[key]}
            {suffix && (
              <span className="ml-0.5 text-sm font-normal text-zinc-500">{suffix}</span>
            )}
          </p>
          {key === "unresolved" && (
            <p className="mt-1 text-[10px] text-zinc-400">접수 + 검토중</p>
          )}
          {key === "highRisk" && (
            <p className="mt-1 text-[10px] text-zinc-400">심각도 높음 · 미조치</p>
          )}
          {key === "completionRate" && (
            <p className="mt-1 text-[10px] text-zinc-400">조치완료 비율</p>
          )}
        </div>
      ))}
    </div>
  );
}
