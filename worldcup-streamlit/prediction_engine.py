"""월드컵 승부 예측 Poisson 분포 엔진."""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import TypedDict


class TopVariable(TypedDict):
    name: str
    description: str
    impact: float
    korea_value: int
    mexico_value: int
    weight: int


@dataclass
class ModelVariables:
    offense_weight: int = 30
    defense_weight: int = 25
    midfield_weight: int = 20
    experience_weight: int = 15
    condition_weight: int = 10
    cheering_bias: int = 0
    korea_offense: int = 75
    korea_defense: int = 80
    korea_midfield: int = 72
    korea_experience: int = 62
    korea_condition: int = 80
    mexico_offense: int = 78
    mexico_defense: int = 74
    mexico_midfield: int = 76
    mexico_experience: int = 70
    mexico_condition: int = 68


@dataclass
class PredictionResult:
    korea_win_pct: int
    draw_pct: int
    mexico_win_pct: int
    korea_expected_goals: float
    mexico_expected_goals: float
    expected_korea_score: int
    expected_mexico_score: int
    top_variables: list[TopVariable] = field(default_factory=list)


def _factorial(n: int) -> int:
    if n <= 1:
        return 1
    return math.prod(range(2, n + 1))


def _poisson_prob(k: int, lam: float) -> float:
    return (lam**k * math.exp(-lam)) / _factorial(k)


def calculate_prediction(variables: ModelVariables) -> PredictionResult:
    total_weight = (
        variables.offense_weight
        + variables.defense_weight
        + variables.midfield_weight
        + variables.experience_weight
        + variables.condition_weight
    )
    safe_total = total_weight or 1

    base_k = (
        variables.korea_offense * variables.offense_weight
        + variables.korea_defense * variables.defense_weight
        + variables.korea_midfield * variables.midfield_weight
        + variables.korea_experience * variables.experience_weight
        + variables.korea_condition * variables.condition_weight
    ) / safe_total

    base_m = (
        variables.mexico_offense * variables.offense_weight
        + variables.mexico_defense * variables.defense_weight
        + variables.mexico_midfield * variables.midfield_weight
        + variables.mexico_experience * variables.experience_weight
        + variables.mexico_condition * variables.condition_weight
    ) / safe_total

    korea_bias = base_k + variables.cheering_bias * 0.18

    goal_scale = 0.025
    base_avg = 1.3

    korea_xg = max(0.2, base_avg + (korea_bias - base_m) * goal_scale)
    mexico_xg = max(0.2, base_avg + (base_m - korea_bias) * goal_scale)
    korea_xg = round(min(4.5, korea_xg), 2)
    mexico_xg = round(min(4.5, mexico_xg), 2)

    korea_win = draw = mexico_win = 0.0
    max_prob = -1.0
    exp_k, exp_m = 1, 1

    for x in range(10):
        for y in range(10):
            joint = _poisson_prob(x, korea_xg) * _poisson_prob(y, mexico_xg)
            if x > y:
                korea_win += joint
            elif x == y:
                draw += joint
            else:
                mexico_win += joint
            if joint > max_prob:
                max_prob = joint
                exp_k, exp_m = x, y

    total_prob = korea_win + draw + mexico_win
    korea_pct = round(korea_win / total_prob * 100)
    draw_pct = round(draw / total_prob * 100)
    mexico_pct = 100 - korea_pct - draw_pct

    var_defs = [
        ("offense", "공격 시너지 (Offense)", "양 팀 스트라이커 및 측면 윙어들의 슈팅 창출력과 골 결정력 격차입니다.",
         variables.korea_offense, variables.mexico_offense, variables.offense_weight,
         (variables.korea_offense - variables.mexico_offense) * variables.offense_weight / 100),
        ("defense", "수비 밀도 (Defense)", "김민재 vs 오초아 등의 월드코포급 최종 방어벽 및 팀 수비 가담률 격차입니다.",
         variables.korea_defense, variables.mexico_defense, variables.defense_weight,
         (variables.korea_defense - variables.mexico_defense) * variables.defense_weight / 100),
        ("midfield", "중원 점유력 (Midfield)", "패스 줄기, 볼 키핑 및 전환 패스로 찬스를 설계하는 하프라인 장악력 격차입니다.",
         variables.korea_midfield, variables.mexico_midfield, variables.midfield_weight,
         (variables.korea_midfield - variables.mexico_midfield) * variables.midfield_weight / 100),
        ("experience", "피파 랭킹 및 관록 (Experience)", "FIFA 랭킹 격차와 월드컵 본선 무대에서의 노련미 및 토너먼트 위기 극복 능력입니다.",
         variables.korea_experience, variables.mexico_experience, variables.experience_weight,
         (variables.korea_experience - variables.mexico_experience) * variables.experience_weight / 100),
        ("condition", "기후 적응 & 가용 체력 (Condition)", "경기가 치러지는 고산지대/더위 적응도 및 핵심 수식어들의 부상 상태 격차입니다.",
         variables.korea_condition, variables.mexico_condition, variables.condition_weight,
         (variables.korea_condition - variables.mexico_condition) * variables.condition_weight / 100),
        ("cheering", "응원 점수 & 감정 편향 (Cheering)", "객관적 지표와 무관하게, 한국의 기적을 염원하는 주관적 응원 척도입니다.",
         variables.cheering_bias, 0, variables.cheering_bias if variables.cheering_bias > 0 else 0,
         variables.cheering_bias * 0.18),
    ]

    top = sorted(
        [
            TopVariable(
                name=name,
                description=desc,
                impact=round(impact, 1),
                korea_value=kv,
                mexico_value=mv,
                weight=w,
            )
            for _, name, desc, kv, mv, w, impact in var_defs
            if w > 0 or _ == "cheering"
        ],
        key=lambda v: abs(v["impact"]),
        reverse=True,
    )[:3]

    return PredictionResult(
        korea_win_pct=korea_pct,
        draw_pct=draw_pct,
        mexico_win_pct=mexico_pct,
        korea_expected_goals=korea_xg,
        mexico_expected_goals=mexico_xg,
        expected_korea_score=exp_k,
        expected_mexico_score=exp_m,
        top_variables=top,
    )
