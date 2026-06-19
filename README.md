# 월드컵 승부 예측기

대한민국 vs 멕시코 경기 승률을 Poisson 분포 모델로 시뮬레이션하는 교육용 Streamlit 앱입니다.

## 실행

```powershell
cd worldcup-streamlit
py -m pip install -r requirements.txt
py -m streamlit run app.py
```

## 환경 변수

`worldcup-streamlit/.env.example`을 참고해 `.env` 파일을 만드세요.

```
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-5-mini
```
