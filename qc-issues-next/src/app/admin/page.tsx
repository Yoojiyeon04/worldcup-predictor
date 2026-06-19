"use client";

import { useEffect } from "react";

/** 목록 하단 관리자 점검 패널로 통합 — /admin 북마크 호환 */
export default function AdminPage() {
  useEffect(() => {
    window.location.replace("/#admin-check-panel-title");
  }, []);

  return (
    <p className="py-8 text-center text-sm text-zinc-500">관리자 점검 패널로 이동 중…</p>
  );
}
