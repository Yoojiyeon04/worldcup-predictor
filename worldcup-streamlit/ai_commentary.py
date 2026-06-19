"""OpenAI GPT AI 비평 생성."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

from prediction_engine import ModelVariables, PredictionResult

load_dotenv(Path(__file__).resolve().parent / ".env")

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5-mini")


def build_prompt(variables: ModelVariables, result: PredictionResult, custom: str | None = None) -> str:
    return f"""
너는 데이터 과학과 스포츠 분석학을 가르치는 대학교 교수이자 축구 전문가이다.
학생이 설계한 월드컵 승부 예측 모델(대한민국 vs 멕시코)의 가중치와 변수를 보고,
날카로우면서도 배움이 있는 '피드백 시뮬레이션 비평'을 작성해줘.

[학생 입력값 (Rating out of 100)]:
- 공격력 가중치: {variables.offense_weight}%, 수비력: {variables.defense_weight}%, 미드필더: {variables.midfield_weight}%
- 경험/피파: {variables.experience_weight}%, 컨디션/기후: {variables.condition_weight}%
- 대한민국 공격 {variables.korea_offense} vs 멕시코 {variables.mexico_offense}
- 대한민국 수비 {variables.korea_defense} vs 멕시코 {variables.mexico_defense}
- 대한민국 중원 {variables.korea_midfield} vs 멕시코 {variables.mexico_midfield}
- 대한민국 경험 {variables.korea_experience} vs 멕시코 {variables.mexico_experience}
- 대한민국 컨디션 {variables.korea_condition} vs 멕시코 {variables.mexico_condition}
- 대한민국 응원 편향: {variables.cheering_bias}%

[계산 결과]:
- 승/무/패: {result.korea_win_pct}% / {result.draw_pct}% / {result.mexico_win_pct}%
- 예상 득점: {result.korea_expected_goals} : {result.mexico_expected_goals}
- 최빈 스코어: {result.expected_korea_score} - {result.expected_mexico_score}

{f'[추가 질문]: "{custom}"' if custom else ""}

다음 4가지 항목으로 Markdown 형식 한글 답변:
1. **가중치 설계 및 데이터 평가**
2. **확률적 리터러시** (35% 팀이 이기면 모델이 틀린가?)
3. **근거 vs 응원의 경계**
4. **모델의 한계와 제언**
"""


def generate_commentary(
    variables: ModelVariables,
    result: PredictionResult,
    custom: str | None = None,
) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return _fallback_commentary(variables, result)

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "당신은 데이터 과학과 축구 분석 전문 교수입니다. 한국어 Markdown으로 답변하세요.",
                },
                {"role": "user", "content": build_prompt(variables, result, custom)},
            ],
        )
        content = response.choices[0].message.content
        return content or _fallback_commentary(variables, result)
    except Exception as exc:
        return f"### ❌ AI 분석 실패\n\n{exc}\n\n---\n\n{_fallback_commentary(variables, result)}"


def _fallback_commentary(variables: ModelVariables, result: PredictionResult) -> str:
    bias_note = ""
    if variables.cheering_bias > 30:
        bias_note = f"\n- **응원 편향({variables.cheering_bias}%)** 이 높아 한국 승률이 객관 데이터보다 부풀려졌을 수 있습니다."

    top = result.top_variables[0] if result.top_variables else None
    top_note = ""
    if top:
        side = "한국" if top["impact"] > 0 else "멕시코"
        top_note = f"\n- 가장 큰 영향 변수: **{top['name']}** ({side} 우위 {abs(top['impact'])})"

    return f"""### 📊 로컬 분석 (AI API 미연결)

**.env** 파일에 **OPENAI_API_KEY** 를 설정하면 GPT AI 전문가 비평을 받을 수 있습니다.

#### 현재 모델 요약
- 대한민국 승률 **{result.korea_win_pct}%** | 무 **{result.draw_pct}%** | 멕시코 **{result.mexico_win_pct}%**
- 예상 득점 **{result.korea_expected_goals} : {result.mexico_expected_goals}** | 최빈 스코어 **{result.expected_korea_score}-{result.expected_mexico_score}**
{bias_note}{top_note}

#### 확률적 리터러시
35% 승률은 '3번 중 1번 이긴다'는 뜻이지, 패배가 정답이라는 뜻이 아닙니다.

#### 모델 한계
레드카드, VAR, 심판, 돌발 부상 등 경기 중 변수는 Poisson 모델에 포함되지 않습니다.
"""
