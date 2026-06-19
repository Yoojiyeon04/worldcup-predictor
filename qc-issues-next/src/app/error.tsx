"use client";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
      <h2 className="text-lg font-semibold text-rose-900">목록을 불러오지 못했습니다</h2>
      <p className="mt-2 text-sm text-rose-800">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
      >
        다시 시도
      </button>
    </div>
  );
}
