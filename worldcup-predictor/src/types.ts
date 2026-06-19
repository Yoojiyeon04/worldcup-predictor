export interface TeamStats {
  name: string;
  flag: string;
  offense: number; // 0 to 100
  defense: number; // 0 to 100
  midfield: number; // 0 to 100
  experience: number; // 0 to 100 (FIFA ranking, major tournament experience)
  condition: number; // 0 to 100 (climate adaptation, recent injuries, morale)
}

export interface ModelVariables {
  offenseWeight: number; // 0 to 100
  defenseWeight: number; // 0 to 100
  midfieldWeight: number; // 0 to 100
  experienceWeight: number; // 0 to 100
  conditionWeight: number; // 0 to 100
  cheeringBias: number; // 0 to 100 (Korea-win booster)
  
  // Specific base characteristics the user can also tune
  koreaOffense: number;
  koreaDefense: number;
  koreaMidfield: number;
  koreaExperience: number;
  koreaCondition: number;

  mexicoOffense: number;
  mexicoDefense: number;
  mexicoMidfield: number;
  mexicoExperience: number;
  mexicoCondition: number;
}

export interface PredictionResult {
  koreaWinPct: number;
  drawPct: number;
  mexicoWinPct: number;
  koreaExpectedGoals: number;
  mexicoExpectedGoals: number;
  expectedKoreaScore: number;
  expectedMexicoScore: number;
  topVariables: Array<{
    name: string;
    description: string;
    impact: number; // positive or negative influence on Korea
    koreaValue: number;
    mexicoValue: number;
    weight: number;
  }>;
}

export interface ReflectionQuestion {
  id: string;
  question: string;
  studentAnswer: string;
  guideAnswer: string;
}
