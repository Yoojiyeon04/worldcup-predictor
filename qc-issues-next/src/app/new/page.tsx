import Link from "next/link";
import CreateIssueForm from "@/components/CreateIssueForm";

export default function NewIssuePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/" className="text-sm text-teal-700 hover:underline">
          ← 목록으로
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">새 QC 이슈 등록</h1>
        <p className="mt-1 text-sm text-zinc-500">
          제목을 입력하고 저장하면 목록에 바로 반영됩니다.
        </p>
      </div>
      <CreateIssueForm />
    </div>
  );
}
