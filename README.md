# 월드컵 승부 예측기

대한민국 vs 멕시코 경기 승률을 Poisson 분포 모델로 시뮬레이션하는 교육용 Streamlit 앱입니다.

## 아키텍처

```
로컬 개발 (Cursor)
    ↓ git push
GitHub (Yoojiyeon04/worldcup-predictor)
    ↓ 자동 배포
├── Vercel        → web/ 랜딩 (빌드 → dist/)
├── Streamlit Cloud → worldcup-streamlit/app.py (메인 앱)
└── Supabase      → 성찰 답변 · 예측 스냅샷 저장
    ↑
Cursor MCP (Supabase / Vercel) → AI가 DB·배포 상태 확인
```

> `worldcup-predictor/`는 별도 React 프로토타입이며 Vercel 배포 대상이 아닙니다.

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

### GitHub → Streamlit Cloud (메인 앱)

1. [share.streamlit.io](https://share.streamlit.io) → GitHub 연동
2. Repository: `Yoojiyeon04/worldcup-predictor`
3. Main file: `worldcup-streamlit/app.py`
4. **Secrets**에 아래 변수 등록 (`worldcup-streamlit/.streamlit/secrets.toml.example` 참고)

### GitHub → Vercel (랜딩)

1. [vercel.com](https://vercel.com) → Import `worldcup-predictor`
2. Root Directory: `.`
3. Framework: **Other**
4. Build Command: `node scripts/build-landing.mjs`
5. Output Directory: `dist`
6. Environment: `STREAMLIT_APP_URL` (Streamlit Cloud URL)
7. `main` push 시 자동 재배포 (GitHub 연동 필요)

Production URL: https://worldcup-predictor-rosy.vercel.app

### Cursor MCP

프로젝트 루트 `.cursor/mcp.json`에 Supabase·Vercel MCP가 설정되어 있습니다.

## 환경 변수

### Streamlit Cloud (필수)

| 변수 | 용도 |
|------|------|
| `OPENAI_API_KEY` | GPT AI 비평 |
| `OPENAI_MODEL` | 기본 `gpt-5-mini` |
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |

### Vercel (랜딩 빌드)

| 변수 | 용도 |
|------|------|
| `STREAMLIT_APP_URL` | 랜딩 페이지 → Streamlit 앱 링크 |

OpenAI/Supabase 키는 **Streamlit Cloud Secrets**에만 등록하면 됩니다. Vercel 랜딩에서는 사용하지 않습니다.
