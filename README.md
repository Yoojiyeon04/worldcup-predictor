# 월드컵 승부 예측기

대한민국 vs 멕시코 경기 승률을 Poisson 분포 모델로 시뮬레이션하는 교육용 Streamlit 앱입니다.

## 아키텍처

```
로컬 개발 (Cursor)
    ↓ git push
GitHub (Yoojiyeon04/worldcup-predictor)
    ↓ 자동 배포
├── Vercel        → web/ 랜딩 페이지
├── Streamlit Cloud → worldcup-streamlit/app.py (메인 앱)
└── Supabase      → 성찰 답변 · 예측 스냅샷 저장
    ↑
Cursor MCP (Supabase) → AI가 DB/설정 상태 확인
```

## 로컬 실행

```powershell
cd worldcup-streamlit
py -m pip install -r requirements.txt
copy .env.example .env   # API 키 입력
py -m streamlit run app.py
```

## Supabase 설정

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. `.env`에 `SUPABASE_URL`, `SUPABASE_ANON_KEY` 입력

## 배포

### GitHub → Streamlit Cloud (앱)

1. [share.streamlit.io](https://share.streamlit.io) → GitHub 연동
2. Repository: `Yoojiyeon04/worldcup-predictor`
3. Main file: `worldcup-streamlit/app.py`
4. Secrets에 `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` 추가

### GitHub → Vercel (랜딩)

1. [vercel.com](https://vercel.com) → Import `worldcup-predictor`
2. Root Directory: `.` (vercel.json → web/)
3. push 시 자동 배포

### Cursor MCP

프로젝트 루트 `.mcp.json`에 Supabase MCP가 설정되어 있습니다.  
Cursor에서 Supabase MCP 인증 후 AI가 테이블·프로젝트 상태를 조회할 수 있습니다.

## 환경 변수

| 변수 | 용도 |
|------|------|
| `OPENAI_API_KEY` | GPT AI 비평 |
| `OPENAI_MODEL` | 기본 `gpt-5-mini` |
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
