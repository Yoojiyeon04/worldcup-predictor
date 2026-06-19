# 배포 가이드

## 1. Supabase (데이터 저장)

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. **SQL Editor** → `supabase/schema.sql` 전체 붙여넣기 → **Run**
3. **Project Settings → API**에서 복사:
   - Project URL → `SUPABASE_URL`
   - anon public key → `SUPABASE_ANON_KEY`

### RLS 보안

- `public` 테이블은 RLS 활성 + `app.session_id` 기반 정책
- read/write RPC는 `SECURITY INVOKER`로 RLS를 우회하지 않음
- 세션 UUID를 아는 경우에만 해당 세션 데이터 접근 가능 (교육용 anon 앱)

---

## 2. GitHub Push

```powershell
cd c:\ict\test
git add .
git commit -m "your message"
git push origin main
```

저장소: https://github.com/Yoojiyeon04/worldcup-predictor

---

## 3. Streamlit Cloud (메인 앱)

1. [share.streamlit.io](https://share.streamlit.io) → **Sign in with GitHub**
2. **Create app**
3. 설정:

| 항목 | 값 |
|------|-----|
| Repository | `Yoojiyeon04/worldcup-predictor` |
| Branch | `main` |
| Main file path | `worldcup-streamlit/app.py` |

4. **Advanced settings → Python** → `3.11`
5. **Secrets** → `worldcup-streamlit/.streamlit/secrets.toml.example` 참고:

```
OPENAI_API_KEY = "..."
OPENAI_MODEL = "gpt-5-mini"
SUPABASE_URL = "https://xxx.supabase.co"
SUPABASE_ANON_KEY = "..."
```

6. **Deploy!** → URL 복사 (예: `https://worldcup-predictor-xxxxx.streamlit.app`)

---

## 4. Vercel (랜딩 페이지)

1. [vercel.com/new](https://vercel.com/new) → GitHub `worldcup-predictor` Import
2. GitHub Login Connection이 없으면 [Account Settings](https://vercel.com/account)에서 먼저 연결
3. Import 설정:

| 항목 | 값 |
|------|-----|
| Framework | **Other** |
| Build Command | `node scripts/build-landing.mjs` |
| Output Directory | `dist` |
| Install Command | *(비움)* |

4. **Environment Variables**:

| 변수 | 값 |
|------|-----|
| `STREAMLIT_APP_URL` | Streamlit Cloud 배포 URL |

5. Deploy → https://worldcup-predictor-rosy.vercel.app

`main` push 시 GitHub 연동이 되어 있으면 자동 재배포됩니다.

---

## 5. Cursor MCP

1. Cursor → Settings → MCP → Supabase / Vercel OAuth 인증
2. 프로젝트 루트 `.cursor/mcp.json` 확인
3. AI에게 "Supabase 테이블 상태 확인해줘" / "Vercel 배포 상태 확인해줘" 요청 가능

**MCP/AI에 공유 금지:** `service_role` 키, `.env` 파일
