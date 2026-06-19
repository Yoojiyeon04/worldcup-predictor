export default function Loading() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      <p className="text-sm text-zinc-500">QC 이슈 목록을 불러오는 중…</p>
    </div>
  );
}
