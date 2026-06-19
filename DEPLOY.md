# 배포 가이드

## 1. Supabase (데이터 저장)

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. **SQL Editor** → `supabase/schema.sql` 전체 붙여넣기 → **Run**
3. **Project Settings → API**에서 복사:
   - Project URL → `SUPABASE_URL`
   - anon public key → `SUPABASE_ANON_KEY`

### RLS 보안
- 다른 사용자의 성찰/스냅샷은 **읽을 수 없음** (본인 `session_id`만)
- 앱이 `set_session_context` RPC를 호출한 뒤에만 read/write 가능

---

## 2. GitHub Push

```powershell
cd c:\ict\test
& "C:\Program Files\Git\cmd\git.exe" add .
& "C:\Program Files\Git\cmd\git.exe" commit -m "Deploy: Supabase RLS + Streamlit Cloud"
& "C:\Program Files\Git\cmd\git.exe" push origin main
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
5. **Secrets** → `worldcup-streamlit/.streamlit/secrets.toml.example` 참고해 입력
6. **Deploy!**

배포 URL 예: `https://worldcup-predictor-xxxxx.streamlit.app`

---

## 4. Vercel (랜딩 페이지, 선택)

1. [vercel.com/new](https://vercel.com/new) → GitHub `worldcup-predictor` Import
2. Framework: **Other** (vercel.json 사용)
3. Deploy

`web/index.html`의 `STREAMLIT_APP_URL`에 Streamlit Cloud URL 입력 후 재배포.

---

## 5. Cursor MCP (Supabase)

1. Cursor → Settings → MCP → Supabase 인증
2. 프로젝트 루트 `.mcp.json` 확인
3. AI에게 "Supabase 테이블 상태 확인해줘" 요청 가능

**MCP/AI에 공유 금지:** `service_role` 키, `.env` 파일
