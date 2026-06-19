# QC 이슈 추적 (Next.js)

Supabase `public.qc_issues` 테이블을 사용하는 QC 이슈 추적 웹앱입니다.

## 기능

- 이슈 목록 조회 (테이블, 최신순)
- 상단 통계 카드 (전체 / 미해결 / 고위험 / 완료율)
- 새 이슈 등록 (`/new`)
- 목록에서 상태 변경 (`접수` / `검토중` / `조치완료`)
- 관리자 점검 패널 (목록 하단) — `/admin`은 목록 하단 패널로 리다이렉트
  - `GET /api/admin/qc-issues/summary`
  - 요청 헤더: `x-admin-token: <ADMIN_TOKEN>`
  - 서버에서 `SUPABASE_SERVICE_ROLE_KEY`로 Supabase 접속 후 전체 집계

## 환경변수

`.env.example`을 복사해 `.env.local`을 만듭니다.

```bash
cp .env.example .env.local
```

| 변수 | 공개 여부 | 설명 |
|------|-----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 공개 | `https://yhejcjnvkaormbfkrynb.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 공개 | `eyJhbGci...` 또는 `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | **서버 전용** | `eyJhbGci...` 또는 `sb_secret_...` — **관리 API 필수** |
| `ADMIN_TOKEN` | **서버 전용** | 관리자 점검 패널·API 인증용 임의 문자열 |

> `SUPABASE_SERVICE_ROLE_KEY`·`ADMIN_TOKEN`은 서버 코드에서만 사용합니다. 클라이언트 번들에 넣지 마세요.

## 실행

```bash
npm install
cp .env.example .env.local   # Supabase URL·anon key·서버 키 입력
npm run dev
```

http://localhost:3001 (기본 포트 — `qc-issue-tracker`와 3000 충돌 방지)

## Vercel 배포 (별도 프로젝트)

1. Vercel → Import → Root Directory: `qc-issues-next`
2. Framework: Next.js (자동 감지)
3. Environment Variables (공개):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Environment Variables (서버 전용, **Preview/Production**):
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_TOKEN`

## 폴더 구조

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # 목록 + 통계 카드 + 관리 패널
│   ├── new/page.tsx
│   ├── admin/page.tsx              # → /#admin-check-panel-title 리다이렉트
│   ├── actions/qc-issues.ts        # 등록·상태변경 Server Actions
│   └── api/admin/qc-issues/summary/route.ts
├── components/
│   ├── IssueTable.tsx
│   ├── IssueStatsCards.tsx
│   ├── IssueStatusSelect.tsx
│   ├── CreateIssueForm.tsx
│   └── AdminSummaryPanel.tsx
└── lib/
    ├── supabase-admin.ts           # service_role (server-only)
    ├── supabase/server.ts          # anon key
    └── qc-issues/
        ├── types.ts
        ├── schema.ts
        ├── status.ts
        ├── risk.ts                 # 고위험 판정 (통계·관리 API 공통)
        ├── stats.ts
        └── summary.ts
```

## 통계 정의

| 지표 | 계산 |
|------|------|
| 전체 | 행 수 |
| 미해결 | `접수` + `검토중` |
| 고위험 | `severity = 높음` 이고 `조치완료` 아님 |
| 완료율 | `조치완료 / 전체 × 100` (반올림) |

## DB 참고

- `qc_issues` RLS: 교육용 `edu_all_access` (anon 전체 CRUD 허용) — 운영 전 정책 분리 필요
- `status` / `severity` / `category` CHECK 제약 (잘못된 값 INSERT/UPDATE 시 DB 거부)
- `updated_at`은 DB trigger + 앱에서 상태 변경 시 갱신
