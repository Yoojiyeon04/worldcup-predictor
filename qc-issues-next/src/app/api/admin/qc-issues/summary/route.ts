import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { fetchQcIssuesAdminSummary } from "@/lib/qc-issues/summary";

function verifyAdminToken(provided: string | null): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!provided || !expected) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request.headers.get("x-admin-token"))) {
    return NextResponse.json(
      { error: "관리자 확인값이 맞지 않습니다." },
      { status: 401 },
    );
  }

  try {
    const summary = await fetchQcIssuesAdminSummary();
    return NextResponse.json(summary);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";

    if (message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json(
        { error: "서버에 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. .env.local을 확인하세요." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "통계 조회에 실패했습니다." },
      { status: 500 },
    );
  }
}
