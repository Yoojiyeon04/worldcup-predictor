import { ModelVariables, PredictionResult } from "../types";

// Simple factorial helper for Poisson probability
function factorial(n: number): number {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

// Poisson probability density function P(X = k) = (lambda^k * exp(-lambda)) / k!
function poissonProb(k: number, lambda: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

export function calculatePrediction(variables: ModelVariables): PredictionResult {
  const {
    offenseWeight,
    defenseWeight,
    midfieldWeight,
    experienceWeight,
    conditionWeight,
    cheeringBias,
    koreaOffense,
    koreaDefense,
    koreaMidfield,
    koreaExperience,
    koreaCondition,
    mexicoOffense,
    mexicoDefense,
    mexicoMidfield,
    mexicoExperience,
    mexicoCondition,
  } = variables;

  const totalCustomWeight =
    offenseWeight + defenseWeight + midfieldWeight + experienceWeight + conditionWeight;

  // If all weights are 0, prevent division by zero
  const safeTotalWeight = totalCustomWeight === 0 ? 1 : totalCustomWeight;

  // Korea's base weighted score (out of 100)
  const baseScoreK =
    (koreaOffense * offenseWeight +
      koreaDefense * defenseWeight +
      koreaMidfield * midfieldWeight +
      koreaExperience * experienceWeight +
      koreaCondition * conditionWeight) /
    safeTotalWeight;

  // Mexico's base weighted score (out of 100)
  const baseScoreM =
    (mexicoOffense * offenseWeight +
      mexicoDefense * defenseWeight +
      mexicoMidfield * midfieldWeight +
      mexicoExperience * experienceWeight +
      mexicoCondition * conditionWeight) /
    safeTotalWeight;

  // Note: Cheering bias acts as a subjective "faith booster" for Korea.
  // It is explicitly separated so students can see how subjective bias distorts standard calculations.
  // In our model, cheering bias inflates Korea's offensive/defensive scores while leaving Mexico's untouched.
  const koreaBiasScore = baseScoreK + (cheeringBias * 0.18);

  // BASE EXPECTED GOALS (Poisson Lambdas)
  // Typically, a football team scores between 0.5 and 2.5 goals on average.
  // We can model this by scaling the rating differences.
  const goalDifferenceScale = 0.025; // 10 point difference = 0.25 goal difference
  const baseAverageGoals = 1.3; // Average goals scored in international play

  let koreaExpectedGoals = Math.max(
    0.2,
    baseAverageGoals + (koreaBiasScore - baseScoreM) * goalDifferenceScale
  );
  let mexicoExpectedGoals = Math.max(
    0.2,
    baseAverageGoals + (baseScoreM - koreaBiasScore) * goalDifferenceScale
  );

  // Apply some randomness and ceiling to keep values within football reality (0 to 5 goals)
  koreaExpectedGoals = parseFloat(Math.min(4.5, koreaExpectedGoals).toFixed(2));
  mexicoExpectedGoals = parseFloat(Math.min(4.5, mexicoExpectedGoals).toFixed(2));

  // Compute precise probabilities using Poisson Distribution (X and Y goals from 0 to 9)
  let koreaWinProb = 0;
  let drawProb = 0;
  let mexicoWinProb = 0;

  // Keep track of the highest joint probability to find the "Most Likely Scoreline"
  let maxProb = -1;
  let expectedKoreaScore = 1;
  let expectedMexicoScore = 1;

  for (let x = 0; x <= 9; x++) {
    for (let y = 0; y <= 9; y++) {
      const pX = poissonProb(x, koreaExpectedGoals);
      const pY = poissonProb(y, mexicoExpectedGoals);
      const jointP = pX * pY;

      if (x > y) {
        koreaWinProb += jointP;
      } else if (x === y) {
        drawProb += jointP;
      } else {
        mexicoWinProb += jointP;
      }

      if (jointP > maxProb) {
        maxProb = jointP;
        expectedKoreaScore = x;
        expectedMexicoScore = y;
      }
    }
  }

  // Normalize percentages to sum to exactly 100%
  const totalProb = koreaWinProb + drawProb + mexicoWinProb;
  const koreaWinPct = Math.round((koreaWinProb / totalProb) * 100);
  const drawPct = Math.round((drawProb / totalProb) * 100);
  const mexicoWinPct = 100 - koreaWinPct - drawPct; // Ensure exact 100% sum

  // CALCULATE KEY VARIABLE IMPACTS
  // Students need to see why the engine produced this result.
  // We compute the "Weighted rating difference" as the impact score for each variable.
  const variablesList = [
    {
      id: "offense",
      name: "공격 시너지 (Offense)",
      description: "양 팀 스트라이커 및 측면 윙어들의 슈팅 창출력과 골 결정력 격차입니다.",
      koreaValue: koreaOffense,
      mexicoValue: mexicoOffense,
      weight: offenseWeight,
      impact: ((koreaOffense - mexicoOffense) * offenseWeight) / 100,
    },
    {
      id: "defense",
      name: "수비 밀도 (Defense)",
      description: "김민재 vs 오초아 등의 월드코포급 최종 방어벽 및 팀 수비 가담률 격차입니다.",
      koreaValue: koreaDefense,
      mexicoValue: mexicoDefense,
      weight: defenseWeight,
      impact: ((koreaDefense - mexicoDefense) * defenseWeight) / 100,
    },
    {
      id: "midfield",
      name: "중원 점유력 (Midfield)",
      description: "패스 줄기, 볼 키핑 및 전환 패스로 찬스를 설계하는 하프라인 장악력 격차입니다.",
      koreaValue: koreaMidfield,
      mexicoValue: mexicoMidfield,
      weight: midfieldWeight,
      impact: ((koreaMidfield - mexicoMidfield) * midfieldWeight) / 100,
    },
    {
      id: "experience",
      name: "피파 랭킹 및 관록 (Experience)",
      description: "FIFA 랭킹 격차와 월드컵 본선 무대에서의 노련미 및 토너먼트 위기 극복 능력입니다.",
      koreaValue: koreaExperience,
      mexicoValue: mexicoExperience,
      weight: experienceWeight,
      impact: ((koreaExperience - mexicoExperience) * experienceWeight) / 100,
    },
    {
      id: "condition",
      name: "기후 적응 & 가용 체력 (Condition)",
      description: "경기가 치러지는 고산지대/더위 적응도 및 핵심 수식어들의 부상 상태 격차입니다.",
      koreaValue: koreaCondition,
      mexicoValue: mexicoCondition,
      weight: conditionWeight,
      impact: ((koreaCondition - mexicoCondition) * conditionWeight) / 100,
    },
    {
      id: "cheering",
      name: "응원 점수 & 감정 편향 (Cheering)",
      description: "객관적 지표와 무관하게, 한국의 기적을 염원하는 주관적 응원 척도입니다.",
      koreaValue: cheeringBias,
      mexicoValue: 0,
      weight: cheeringBias > 0 ? 50 : 0, // Cheering weight is simulated
      impact: cheeringBias * 0.18, // directly favors Korea
    },
  ];

  // Sort variables by their absolute impact size to present the TOP 3
  const topVariables = [...variablesList]
    .filter(v => v.weight > 0 || v.id === "cheering")
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 3)
    .map(v => ({
      name: v.name,
      description: v.description,
      impact: parseFloat(v.impact.toFixed(1)),
      koreaValue: v.koreaValue,
      mexicoValue: v.mexicoValue,
      weight: v.weight,
    }));

  return {
    koreaWinPct,
    drawPct,
    mexicoWinPct,
    koreaExpectedGoals,
    mexicoExpectedGoals,
    expectedKoreaScore,
    expectedMexicoScore,
    topVariables,
  };
}
