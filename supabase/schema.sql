-- 월드컵 예측기 Supabase 스키마 (RLS: 본인 session_id만 접근)

create table if not exists reflection_answers (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  question_id text not null,
  answer text not null default '',
  updated_at timestamptz not null default now(),
  unique (session_id, question_id)
);

create table if not exists prediction_snapshots (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  variables jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_reflection_session on reflection_answers (session_id);
create index if not exists idx_prediction_session on prediction_snapshots (session_id);

alter table reflection_answers enable row level security;
alter table prediction_snapshots enable row level security;

-- 세션 컨텍스트 설정 (앱에서 RPC 호출 후 read/write)
create or replace function public.set_session_context(sid text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if sid is null or sid !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    raise exception 'invalid session_id';
  end if;
  perform set_config('app.session_id', sid, true);
end;
$$;

create or replace function public.health_check()
returns boolean
language sql
security definer
set search_path = public
as $$
  select true;
$$;

grant execute on function public.set_session_context(text) to anon, authenticated;
grant execute on function public.health_check() to anon, authenticated;

-- 기존 permissive 정책 제거 (재실행 안전)
drop policy if exists "reflection_anon_all" on reflection_answers;
drop policy if exists "prediction_anon_insert" on prediction_snapshots;
drop policy if exists "prediction_anon_select" on prediction_snapshots;
drop policy if exists "reflection_select_own" on reflection_answers;
drop policy if exists "reflection_insert_own" on reflection_answers;
drop policy if exists "reflection_update_own" on reflection_answers;
drop policy if exists "prediction_insert_own" on prediction_snapshots;
drop policy if exists "prediction_select_own" on prediction_snapshots;

create policy "reflection_select_own"
  on reflection_answers for select to anon
  using (session_id = current_setting('app.session_id', true));

create policy "reflection_insert_own"
  on reflection_answers for insert to anon
  with check (session_id = current_setting('app.session_id', true));

create policy "reflection_update_own"
  on reflection_answers for update to anon
  using (session_id = current_setting('app.session_id', true))
  with check (session_id = current_setting('app.session_id', true));

create policy "prediction_insert_own"
  on prediction_snapshots for insert to anon
  with check (session_id = current_setting('app.session_id', true));

create policy "prediction_select_own"
  on prediction_snapshots for select to anon
  using (session_id = current_setting('app.session_id', true));
