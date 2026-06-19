-- qc_issues: trigger hardening + value CHECK constraints
-- Applied via Supabase MCP (2026-06-19)

CREATE OR REPLACE FUNCTION public.set_qc_issues_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

ALTER TABLE public.qc_issues
  DROP CONSTRAINT IF EXISTS qc_issues_status_check,
  DROP CONSTRAINT IF EXISTS qc_issues_severity_check,
  DROP CONSTRAINT IF EXISTS qc_issues_category_check;

ALTER TABLE public.qc_issues
  ADD CONSTRAINT qc_issues_status_check
    CHECK (status IS NULL OR status IN ('접수', '검토중', '조치완료')),
  ADD CONSTRAINT qc_issues_severity_check
    CHECK (severity IS NULL OR severity IN ('낮음', '중간', '높음')),
  ADD CONSTRAINT qc_issues_category_check
    CHECK (category IS NULL OR category IN ('장비', '시약', '공정', '환경', '문서'));
