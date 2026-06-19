# Streamlit Cloud 배포 체크리스트 (수동 1회)
#
# 1. https://share.streamlit.io → Continue with GitHub
# 2. New app → Repository: Yoojiyeon04/worldcup-predictor
#    Main file: worldcup-streamlit/app.py  Branch: main
# 3. Settings → Secrets (secrets.toml.example 참고)
# 4. 배포 URL 복사 후 아래 실행:
#
#   powershell -ExecutionPolicy Bypass -File scripts/set-streamlit-url.ps1 "https://YOUR-APP.streamlit.app"
