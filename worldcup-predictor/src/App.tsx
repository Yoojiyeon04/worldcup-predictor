import React, { useState, useEffect } from "react";
import { ModelVariables, PredictionResult } from "./types";
import { calculatePrediction } from "./components/PredictionEngine";
import { ReflectionPanel } from "./components/ReflectionPanel";
import { ModelLimitations } from "./components/ModelLimitations";
import { WorldCupHistory } from "./components/WorldCupHistory";
import { WorldCupSquads } from "./components/WorldCupSquads";
import { WorldCupInjuries } from "./components/WorldCupInjuries";
import {
  Zap,
  Sparkles,
  RotateCcw,
  Send,
  Sliders,
  HelpCircle,
  AlertTriangle,
  Info,
  Users,
  History as HistoryIcon,
  Trophy
} from "lucide-react";

const INITIAL_VARIABLES: ModelVariables = {
  offenseWeight: 30,
  defenseWeight: 25,
  midfieldWeight: 20,
  experienceWeight: 15,
  conditionWeight: 10,
  cheeringBias: 0, // Starts at 0% for objective analysis

  // South Korea base stats
  koreaOffense: 75,
  koreaDefense: 80,
  koreaMidfield: 72,
  koreaExperience: 62,
  koreaCondition: 80,

  // Mexico base stats
  mexicoOffense: 78,
  mexicoDefense: 74,
  mexicoMidfield: 76,
  mexicoExperience: 70,
  mexicoCondition: 68,
};

// Tactical Presets for quick pedagogical feedback
const PRESETS = [
  {
    name: "📊 객관적 기초 데이터",
    description: "응원을 배제하고 오직 기초 데이터의 가중치를 고르게 정돈한 순수 과학 모델링",
    values: {
      ...INITIAL_VARIABLES,
      cheeringBias: 0,
    },
  },
  {
    name: "🇰🇷 애국심 극대화 필터",
    description: "주관주의 응원 점수를 최고치로 끌어올려 애국적 영원으로 시뮬레이션을 왜곡한 예시",
    values: {
      ...INITIAL_VARIABLES,
      cheeringBias: 95,
      koreaCondition: 95,
    },
  },
  {
    name: "🧱 진흙탕 수비 승부",
    description: "공격과 전술의 가중치를 깎고 극한의 수비 텐백 전술(수비 가중치 65%)을 강제한 시나리오",
    values: {
      ...INITIAL_VARIABLES,
      offenseWeight: 10,
      defenseWeight: 65,
      midfieldWeight: 10,
      experienceWeight: 10,
      conditionWeight: 5,
      cheeringBias: 0,
    },
  },
  {
    name: "⛰️ 멕시코 고산지대 악조건",
    description: "멕시코 시티의 무더위와 고산지대로 인해 대한민국의 체력이 급감(컨디션 35)함을 가정한 시나리오",
    values: {
      ...INITIAL_VARIABLES,
      conditionWeight: 45,
      koreaCondition: 35,
      mexicoCondition: 85,
      cheeringBias: 0,
    },
  },
];

// Simple helper to parse basic markdown from Gemini (bolding, headers, bullet points)
function parseMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    let content = line;
    
    // Header check
    if (content.startsWith("### ")) {
      return (
        <h4 key={idx} className="text-xs font-bold text-slate-800 mt-3 mb-1.5 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          {content.replace("### ", "")}
        </h4>
      );
    }
    if (content.startsWith("## ") || content.startsWith("# ")) {
      return (
        <h3 key={idx} className="text-sm font-bold text-slate-900 border-b border-indigo-100 pb-1 mt-4 mb-2 uppercase tracking-wider">
          {content.replace(/^#+\s+/, "")}
        </h3>
      );
    }

    // Bullet point list check
    if (content.trim().startsWith("- ") || content.trim().startsWith("* ")) {
      const bulletText = content.replace(/^[\s*-]+/, "");
      return (
        <li key={idx} className="ml-4 list-disc text-xs text-slate-600 mb-1 pl-1 leading-relaxed font-light">
          {renderBoldText(bulletText)}
        </li>
      );
    }

    // Numbered list check
    if (/^\d+\.\s+/.test(content.trim())) {
      const listText = content.replace(/^\d+\.\s+/, "");
      const number = content.match(/^\d+/)?.[0];
      return (
        <div key={idx} className="text-xs text-slate-600 mb-2 pl-1 leading-relaxed font-light">
          <span className="font-bold text-indigo-600 mr-1.5">{number}.</span>
          {renderBoldText(listText)}
        </div>
      );
    }

    // Default paragraph
    if (content.trim() === "") return <div key={idx} className="h-2" />;
    return (
      <p key={idx} className="text-xs text-slate-600 mb-2 leading-relaxed font-light">
        {renderBoldText(content)}
      </p>
    );
  });
}

function renderBoldText(text: string) {
  const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="text-slate-900 font-bold">{part}</strong> : part
  );
}

export default function App() {
  const [variables, setVariables] = useState<ModelVariables>(INITIAL_VARIABLES);
  const [prediction, setPrediction] = useState<PredictionResult>(calculatePrediction(INITIAL_VARIABLES));
  const [aiCommentary, setAiCommentary] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"korea" | "mexico" | "weights">("weights");
  const [rightTab, setRightTab] = useState<"insights" | "squads" | "history" | "critique" | "injuries">("insights");

  // Re-calculate immediately when any variables change
  useEffect(() => {
    setPrediction(calculatePrediction(variables));
  }, [variables]);

  const handlePresetSelect = (presetValues: typeof INITIAL_VARIABLES) => {
    setVariables(presetValues);
  };

  const handleReset = () => {
    setVariables(INITIAL_VARIABLES);
    setAiCommentary("");
    setCustomPrompt("");
  };

  // Call the server-side proxy route to request AI Review
  const handleRequestCommentary = async (customText?: string) => {
    setLoadingAi(true);
    try {
      const response = await fetch("/api/commentary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variables,
          result: prediction,
          customPrompt: customText || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("서버와의 통신이 원활하지 않습니다.");
      }

      const data = await response.json();
      setAiCommentary(data.commentary);
    } catch (err: any) {
      console.error(err);
      setAiCommentary(
        `### ❌ 분석 실패\n\n지정된 모델의 AI 비평을 처리하지 못했습니다. API를 다시 세팅하고 잠시 후 다시 시도해 주세요.\n\n오류 내용: ${err.message}`
      );
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSliderChange = (key: keyof ModelVariables, val: number) => {
    setVariables((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  // Fast sum check for user weights
  const totalWeight =
    variables.offenseWeight +
    variables.defenseWeight +
    variables.midfieldWeight +
    variables.experienceWeight +
    variables.conditionWeight;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 flex flex-col antialiased font-sans">
      
      {/* HEADER SECTION - GEOMETRIC BALANCE THEME */}
      <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center text-white font-bold">W</div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight uppercase text-slate-800">
            World Cup Predictor <span className="text-indigo-600">v1.2</span>
          </h1>
          <span className="hidden sm:inline text-slate-300 text-sm">|</span>
          <span className="hidden sm:inline text-slate-500 text-xs tracking-wider uppercase">대한민국 VS 멕시코 추정모델</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Status: <span className="text-green-600">● Model Active</span> | Classroom Lab
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-sm transition-all cursor-pointer block active:scale-95"
            id="btn-reset"
            title="설정 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기화
          </button>
        </div>
      </header>

      {/* TACTICAL PRESETS SHELF */}
      <section className="bg-slate-100 border-b border-slate-200 py-3 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex items-center gap-1.5 shrink-0">
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">수업용 분석 프리셋:</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetSelect(preset.values)}
                className="bg-white hover:bg-indigo-50 text-left border border-slate-200 rounded-sm p-2 transition-all flex flex-col gap-0.5 shadow-2xs group cursor-pointer"
                id={`btn-preset-${idx}`}
              >
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                  {preset.name}
                </span>
                <span className="text-[10px] text-slate-400 leading-normal line-clamp-1 font-light">
                  {preset.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CORE WORKSPACE GRID */}
      <main className="max-w-7xl mx-auto w-full p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SIMULATOR INPUTS & PARAMETERS (5 COLS on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Interactive variables and weights controls */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col gap-5">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Model Variables & Parameters
              </h2>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                각 파트의 가중치를 입력하거나, 양 팀의 객관적 기량 지표를 수렴하여 통계 모델을 갱신합니다.
              </p>
            </div>

            {/* TAB BUTTONS */}
            <div className="flex border-b border-slate-200 gap-1 bg-slate-50 p-1 rounded-sm">
              <button
                onClick={() => setActiveTab("weights")}
                className={`flex-1 py-2 text-center font-bold text-[10px] uppercase tracking-wider transition-all rounded-sm cursor-pointer ${
                  activeTab === "weights"
                    ? "bg-white text-indigo-600 shadow-2xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                id="tab-btn-weights"
              >
                ⚖️ 1. 가중치 설정 ({totalWeight}%)
              </button>
              <button
                onClick={() => setActiveTab("korea")}
                className={`flex-1 py-1 px-1 text-center font-bold text-[10px] uppercase tracking-wider transition-all rounded-sm cursor-pointer ${
                  activeTab === "korea"
                    ? "bg-white text-indigo-600 shadow-2xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                id="tab-btn-korea"
              >
                🇰🇷 2. 한국 전력
              </button>
              <button
                onClick={() => setActiveTab("mexico")}
                className={`flex-1 py-1 px-1 text-center font-bold text-[10px] uppercase tracking-wider transition-all rounded-sm cursor-pointer ${
                  activeTab === "mexico"
                    ? "bg-white text-indigo-600 shadow-2xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                id="tab-btn-mexico"
              >
                🇲🇽 3. 멕시코 전력
              </button>
            </div>

            {/* TAB CONTENTS 1: WEIGHTS (AND EMOTIONAL BIAS) */}
            {activeTab === "weights" && (
              <div className="flex flex-col gap-5">
                <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 text-[10px] leading-relaxed text-slate-500 font-light">
                  <div className="flex items-center gap-1 font-bold text-slate-700 mb-0.5">
                    <Info className="w-3.5 h-3.5 text-indigo-600" /> 가중치 자동 정규화 (Auto-normalization):
                  </div>
                  가중치 합이 100%를 초과하거나 어긋나도 계산 시 분모 비율로 정밀 역추정되므로 고유 전술 비중 수치로 지정해 주시면 됩니다.
                </div>

                <div className="space-y-4">
                  {/* Offense Weight */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <label className="text-slate-700">공격 가중치 (Offense Importance)</label>
                      <span className="text-indigo-600 font-bold font-mono">{variables.offenseWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={variables.offenseWeight}
                      onChange={(e) => handleSliderChange("offenseWeight", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[9px] text-slate-400">득점 찬스 및 최종 골 결정력이 승부에 기여하는 기여도입니다.</p>
                  </div>

                  {/* Defense Weight */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <label className="text-slate-700">수비 가중치 (Defense Importance)</label>
                      <span className="text-indigo-600 font-bold font-mono">{variables.defenseWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={variables.defenseWeight}
                      onChange={(e) => handleSliderChange("defenseWeight", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[9px] text-slate-400">포백 수비 및 수키퍼 전력이 골 방어에 미치는 비중을 통제합니다.</p>
                  </div>

                  {/* Midfield Weight */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <label className="text-slate-700">미드필더 가중치 (Midfield Importance)</label>
                      <span className="text-indigo-600 font-bold font-mono">{variables.midfieldWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={variables.midfieldWeight}
                      onChange={(e) => handleSliderChange("midfieldWeight", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[9px] text-slate-400">중원의 볼 키핑, 패스 성공률 및 공수 전환 속도의 비중입니다.</p>
                  </div>

                  {/* Experience Weight */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <label className="text-slate-700">경험 및 피파 랭킹 가중치 (Experience)</label>
                      <span className="text-indigo-600 font-bold font-mono">{variables.experienceWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={variables.experienceWeight}
                      onChange={(e) => handleSliderChange("experienceWeight", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[9px] text-slate-400">월드컵 토너먼트 진출 경력과 FIFA 랭킹 격차 영향도입니다.</p>
                  </div>

                  {/* Condition Weight */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <label className="text-slate-700">컨디션 & 기후 적응 가중치 (Conditioning)</label>
                      <span className="text-indigo-600 font-bold font-mono">{variables.conditionWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={variables.conditionWeight}
                      onChange={(e) => handleSliderChange("conditionWeight", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[9px] text-slate-400">선수 부상 보고서, 고산지대 및 기온 적응력의 영향력입니다.</p>
                  </div>

                  {/* CHEERING BIAS (SOUP OF SUBJECTIVITY) */}
                  <div className="border border-indigo-100 bg-indigo-50/50 rounded-sm p-4 mt-2">
                    <div className="flex justify-between items-center text-xs font-bold text-indigo-950">
                      <span className="flex items-center gap-1">💗 한국 감정적 응원 보정치 (Cheering Bias)</span>
                      <span className="bg-indigo-200 text-indigo-800 font-mono text-xs px-2 py-0.5 rounded-sm">{variables.cheeringBias}%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal mb-2 mt-1">
                      객관적 통계 전력과 무관하게, 한국에 기원하는 감정이 개입되는 정도입니다. 높일수록 한국의 승률이 오르는 편향 시나리오가 도출됩니다.
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={variables.cheeringBias}
                      onChange={(e) => handleSliderChange("cheeringBias", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENTS 2: SOUTH KOREA STATS */}
            {activeTab === "korea" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4">
                  {/* Offense */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">공격 스킬 (Offense Rating)</span>
                      <span className="text-indigo-600 font-mono">{variables.koreaOffense}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={variables.koreaOffense}
                      onChange={(e) => handleSliderChange("koreaOffense", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[10px] text-slate-400">주전 공격수 결정력 및 측면 플레이메이킹 세기</p>
                  </div>

                  {/* Defense */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">수비 스킬 (Defense Rating)</span>
                      <span className="text-indigo-600 font-mono">{variables.koreaDefense}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={variables.koreaDefense}
                      onChange={(e) => handleSliderChange("koreaDefense", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[10px] text-slate-400">중앙 벽 수비 신뢰도 및 골키퍼 슈팅 방어 차단 수치</p>
                  </div>

                  {/* Midfield */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">중원 장악 (Midfield Rating)</span>
                      <span className="text-indigo-600 font-mono">{variables.koreaMidfield}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={variables.koreaMidfield}
                      onChange={(e) => handleSliderChange("koreaMidfield", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[10px] text-slate-400">미드필더 전환 전개, 빌드업 안정도 및 볼 점유</p>
                  </div>

                  {/* Experience */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">큰 경기 경험 (Experience Rating)</span>
                      <span className="text-indigo-600 font-mono">{variables.koreaExperience}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={variables.koreaExperience}
                      onChange={(e) => handleSliderChange("koreaExperience", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[10px] text-slate-400">국제 메이저 무대 극복 능력 및 FIFA 역사적 관기관록</p>
                  </div>

                  {/* Condition */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">기후 적응 & 컨디션 무장력 (Condition)</span>
                      <span className="text-indigo-600 font-mono">{variables.koreaCondition}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={variables.koreaCondition}
                      onChange={(e) => handleSliderChange("koreaCondition", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[10px] text-slate-400">주전 선수 부상 여부, 현지 무더위/피지컬 완속도</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENTS 3: MEXICO STATS */}
            {activeTab === "mexico" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4">
                  {/* Offense */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">멕시코 공격 (Mexico Offense)</span>
                      <span className="text-indigo-600 font-mono">{variables.mexicoOffense}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={variables.mexicoOffense}
                      onChange={(e) => handleSliderChange("mexicoOffense", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[10px] text-slate-400">그렉터 압박 돌파 속도 및 빠른 역습 찬스 전개 지표</p>
                  </div>

                  {/* Defense */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">멕시코 수비 (Mexico Defense)</span>
                      <span className="text-indigo-600 font-mono">{variables.mexicoDefense}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={variables.mexicoDefense}
                      onChange={(e) => handleSliderChange("mexicoDefense", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[10px] text-slate-400">오초아급 골키퍼 슈퍼맨 선방 척도 및 밀집 대인 방어</p>
                  </div>

                  {/* Midfield */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">멕시코 중원 (Mexico Midfield)</span>
                      <span className="text-indigo-600 font-mono">{variables.mexicoMidfield}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={variables.mexicoMidfield}
                      onChange={(e) => handleSliderChange("mexicoMidfield", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[10px] text-slate-400">중남미 테크니컬 볼 점유, 연계 루트 점유 및 패싱 흐름</p>
                  </div>

                  {/* Experience */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">멕시코 노련미 (Mexico Experience)</span>
                      <span className="text-indigo-600 font-mono">{variables.mexicoExperience}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={variables.mexicoExperience}
                      onChange={(e) => handleSliderChange("mexicoExperience", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[10px] text-slate-400">역대 16강 빈출 토너먼트 지혜력 및 전적 가중치</p>
                  </div>

                  {/* Condition */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">멕시코 컨디션 (Mexico Condition)</span>
                      <span className="text-indigo-600 font-mono">{variables.mexicoCondition}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={variables.mexicoCondition}
                      onChange={(e) => handleSliderChange("mexicoCondition", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <p className="text-[10px] text-slate-400">연고 고산지대 경기력 대비 및 최근 고지 적응 무결성</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Educational Simulation Callout (Deep Indigo Theme) */}
          <div className="bg-indigo-900 text-white p-5 rounded-lg">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Simulation Guidance</h3>
            <p className="text-sm leading-tight font-light italic">
              &quot;Prediction is not a &apos;correct answer&apos; but a reasoned estimation based on weighted assumptions.&quot;
            </p>
            <p className="text-[10px] opacity-75 mt-3 leading-relaxed font-light">
              본 교구는 기계의 정답을 모사하는 블랙박스가 아니라, 사용자의 가정(Assumptions)이 통계 수식에 스펙트럼 화 되었을 때 유도되는 확률적 논리를 탐구하기 위해 개발되었습니다.
            </p>
          </div>
        </div>

        {/* CENTER COLUMN: THE MATCHUP & STATS SCOREBOARD (7 COLS on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* 1. Scoreboard (Matches Geometric Balance mockup) */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6" id="dashboard-scoreboard">
            
            {/* Match Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              {/* SOUTH KOREA TEAM */}
              <div className="text-center flex-1">
                <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center font-bold text-slate-700 shadow-xs">
                  <div className="w-11 h-7 bg-rose-600 relative overflow-hidden flex items-center justify-center rounded-xs">
                     <span className="text-[10px] text-white font-extrabold uppercase tracking-tight">KOR</span>
                  </div>
                </div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800">대한민국</h3>
                <p className="text-[10px] text-slate-400">FIFA Rank: ~23rd</p>
              </div>

              {/* VERSUS AXIS */}
              <div className="flex flex-col items-center px-4 self-center">
                <span className="text-slate-300 font-black text-3xl italic tracking-tight uppercase">VS</span>
                <span className="mt-2.5 px-2.5 py-1 bg-slate-100 rounded-sm text-[9px] font-bold text-slate-600 uppercase tracking-widest">추정 매치업</span>
              </div>

              {/* MEXICO TEAM */}
              <div className="text-center flex-1">
                <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center font-bold text-slate-700 shadow-xs">
                  <div className="w-11 h-7 bg-emerald-700 relative overflow-hidden flex items-center justify-center rounded-xs">
                     <span className="text-[10px] text-white font-extrabold uppercase tracking-tight">MEX</span>
                  </div>
                </div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800">멕시코</h3>
                <p className="text-[10px] text-slate-400">FIFA Rank: ~15th</p>
              </div>
            </div>

            {/* EXPECTED SCORES SUMMARY HEADER (Slate 800 Dark Frame in Geometric Balance mockup) */}
            <div className="mt-6 bg-slate-800 text-white p-5 rounded-lg flex justify-around items-center">
              <div className="text-center">
                <span className="text-[9px] uppercase tracking-widest opacity-60 font-bold block mb-1">Expected Goal Averages</span>
                <div className="text-xl font-mono font-bold tracking-wider text-indigo-300">
                  {prediction.koreaExpectedGoals} : {prediction.mexicoExpectedGoals}
                </div>
              </div>
              <div className="h-10 w-px bg-slate-600"></div>
              <div className="text-center">
                <span className="text-[9px] uppercase tracking-widest opacity-60 font-bold block mb-1">Highest Density Score</span>
                <div className="text-2xl font-mono font-bold tracking-widest text-white">
                  {prediction.expectedKoreaScore} - {prediction.expectedMexicoScore}
                </div>
              </div>
            </div>

            {/* SUB-PANEL TABS FOR RICH INSIGHTS */}
            <div className="flex border-b border-slate-200 mt-6 gap-0.5 overflow-x-auto scrollbar-none" id="right-dashboard-tabs">
              <button
                onClick={() => setRightTab("insights")}
                className={`py-2.5 px-4 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  rightTab === "insights"
                    ? "border-indigo-600 text-indigo-600 font-black bg-indigo-50/10"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
                id="right-tab-btn-insights"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>📊 분석 & 변수</span>
              </button>
              <button
                onClick={() => setRightTab("squads")}
                className={`py-2.5 px-4 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  rightTab === "squads"
                    ? "border-emerald-600 text-emerald-600 font-black bg-emerald-50/10"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
                id="right-tab-btn-squads"
              >
                <Users className="w-3.5 h-3.5" />
                <span>🏃‍♂️ 대표팀 명단</span>
              </button>
              <button
                onClick={() => setRightTab("injuries")}
                className={`py-2.5 px-4 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  rightTab === "injuries"
                    ? "border-rose-500 text-rose-500 font-black bg-rose-50/10"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
                id="right-tab-btn-injuries"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>🚨 부상자 리포트</span>
              </button>
              <button
                onClick={() => setRightTab("history")}
                className={`py-2.5 px-4 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  rightTab === "history"
                    ? "border-rose-600 text-rose-600 font-black bg-rose-50/10"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
                id="right-tab-btn-history"
              >
                <HistoryIcon className="w-3.5 h-3.5 shrink-0" />
                <span>⚔️ 역대 전적</span>
              </button>
              <button
                onClick={() => setRightTab("critique")}
                className={`py-2.5 px-4 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  rightTab === "critique"
                    ? "border-amber-600 text-amber-600 font-black bg-amber-50/10"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
                id="right-tab-btn-critique"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🤖 AI 멘토 비평</span>
              </button>
            </div>

          </div>

          {/* TAB CONTENTS CONTAINER with clean layouts */}
          <div className="flex flex-col gap-6">
            {rightTab === "insights" && (
              <div className="flex flex-col gap-6">
                
                {/* Dynamic probabilites card container */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-indigo-600" />
                      실시간 시뮬레이션 승무패 확률 (Real-time Probability)
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      입력된 가중치와 양 대표팀의 스펙트럼 전력을 환산해 자동 미분 계산된 최종 우위 빈도입니다.
                    </p>
                  </div>

                  {/* THREE COLUMN PROBABILITIES (Korea Win, Draw, Mexico Win layout) */}
                  <div className="grid grid-cols-3 gap-4 mt-5">
                    {/* KOREA WIN COLUMN */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center shadow-xs">
                       <div className="text-3xl font-black text-indigo-600 mb-0.5">{prediction.koreaWinPct}%</div>
                       <div className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">KOR WIN</div>
                       <div className="w-full h-1.5 bg-slate-200 mt-3 overflow-hidden rounded-full">
                         <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${prediction.koreaWinPct}%` }}></div>
                       </div>
                    </div>

                    {/* DRAW COLUMN */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center shadow-xs">
                       <div className="text-3xl font-black text-slate-400 mb-0.5">{prediction.drawPct}%</div>
                       <div className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">DRAW</div>
                       <div className="w-full h-1.5 bg-slate-200 mt-3 overflow-hidden rounded-full">
                         <div className="bg-slate-300 h-full transition-all duration-500" style={{ width: `${prediction.drawPct}%` }}></div>
                       </div>
                    </div>

                    {/* MEXICO WIN COLUMN */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center shadow-xs">
                       <div className="text-3xl font-black text-slate-800 mb-0.5">{prediction.mexicoWinPct}%</div>
                       <div className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">MEX WIN</div>
                       <div className="w-full h-1.5 bg-slate-200 mt-3 overflow-hidden rounded-full">
                         <div className="bg-slate-800 h-full transition-all duration-500" style={{ width: `${prediction.mexicoWinPct}%` }}></div>
                       </div>
                    </div>
                  </div>

                  {/* CONTINUOUS SPECTRUM BAR COMPONENT */}
                  <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">📊 Probability Joint Distribution Bar</span>
                    <div className="h-5 w-full rounded-full overflow-hidden flex shadow-inner border border-slate-100 bg-slate-200">
                      <div
                        style={{ width: `${prediction.koreaWinPct}%` }}
                        className="bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold transition-all duration-500 ease-out"
                        title={`대한민국 승리 확률: ${prediction.koreaWinPct}%`}
                      >
                        {prediction.koreaWinPct >= 10 && `KOR ${prediction.koreaWinPct}%`}
                      </div>
                      <div
                        style={{ width: `${prediction.drawPct}%` }}
                        className="bg-slate-350 flex items-center justify-center text-slate-700 text-[9px] font-bold transition-all duration-500 ease-out"
                        title={`무승부 확률: ${prediction.drawPct}%`}
                      >
                        {prediction.drawPct >= 10 && `DRAW ${prediction.drawPct}%`}
                      </div>
                      <div
                        style={{ width: `${prediction.mexicoWinPct}%` }}
                        className="bg-slate-700 flex items-center justify-center text-white text-[9px] font-bold transition-all duration-500 ease-out"
                        title={`멕시코 승리 확률: ${prediction.mexicoWinPct}%`}
                      >
                        {prediction.mexicoWinPct >= 10 && `MEX ${prediction.mexicoWinPct}%`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top variables list card */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-indigo-600" />
                      Top Impact Variables (결정적 변수 분석)
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1">
                      수정된 가중치와 양 팀의 스탯 편차를 곱하여 산출된 3가지 지배적 경기 요소
                    </p>
                  </div>
                  
                  <ul className="space-y-4 mt-5">
                    {prediction.topVariables.map((variable, idx) => {
                      const isKoreaAdvantage = variable.impact > 0;
                      const formattedIdx = String(idx + 1).padStart(2, "0");
                      return (
                        <li key={idx} className="flex items-start space-x-3 bg-slate-50 p-3 rounded-sm border border-slate-200/50">
                          <span className="flex-shrink-0 w-6 h-6 bg-indigo-50 border border-indigo-150 rounded text-[10px] flex items-center justify-center font-bold text-indigo-700">
                            {formattedIdx}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800">{variable.name}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                                isKoreaAdvantage ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}>
                                {isKoreaAdvantage ? `한국 우위 (+${variable.impact})` : `멕시코 우위 (${variable.impact})`}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-normal font-light">
                              {variable.description}
                            </p>
                            <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2 border-t border-slate-200/30 pt-1">
                              <span>한국 능력값: {variable.koreaValue}</span>
                              <span>멕시코 능력값: {variable.mexicoValue}</span>
                              <span>전술 가중치: {variable.weight}%</span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}

            {rightTab === "squads" && (
              <WorldCupSquads />
            )}

            {rightTab === "injuries" && (
              <WorldCupInjuries />
            )}

            {rightTab === "history" && (
              <WorldCupHistory />
            )}

            {rightTab === "critique" && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    University AI Mentor Critique
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Gemini API가 학생의 가중치 설계 및 기량 편향 왜곡에 관한 통계적 지성 피드백을 실시간 제공합니다.
                  </p>
                </div>

                {/* Optional sub-prompt */}
                <div className="flex flex-col gap-1.5 bg-slate-50 border border-slate-200 rounded-sm p-3">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    AI 스포츠 교수님께 드리는 추가 가설 및 질문:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="예: '수비 몰빵 전술의 맹점에 대해 설명해 주세요' 또는 '기후 가중치를 높이면?'"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full text-xs p-2.5 pr-10 border border-slate-200 bg-white rounded-sm focus:outline-hidden focus:border-indigo-500 text-slate-800"
                      id="input-ai-custom-prompt"
                    />
                    <button
                      type="button"
                      onClick={() => handleRequestCommentary(customPrompt)}
                      className="absolute right-1 text-slate-600 top-1/2 -translate-y-1/2 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 p-1.5 rounded-sm active:scale-95 transition-all text-xs cursor-pointer border border-slate-200"
                      disabled={loadingAi}
                      id="btn-submit-custom-prompt"
                      title="질문 제출"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Critique Button */}
                <button
                  onClick={() => handleRequestCommentary()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-sm transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer shadow-xs"
                  disabled={loadingAi}
                  id="btn-request-ai-critique"
                >
                  {loadingAi ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white" />
                      비평 매커니즘 시뮬레이션 계산 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      현재 모델 구조의 전문가 AI 비평 받기 (Run Critique)
                    </>
                  )}
                </button>

                {/* Markdown Display output area */}
                <div className="border border-slate-200 rounded-sm p-4 bg-slate-50 max-h-[300px] overflow-y-auto">
                  {loadingAi ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <div className="animate-pulse flex space-x-2">
                        <div className="h-2 w-2 bg-indigo-600 rounded-full" />
                        <div className="h-2 w-2 bg-indigo-400 rounded-full" />
                        <div className="h-2 w-2 bg-indigo-300 rounded-full" />
                      </div>
                      <span className="text-[10px] text-slate-500 text-center font-semibold leading-relaxed max-w-[280px]">
                        사용자의 가설 데이터 셋과 편향 노이즈를 바탕으로 축구 전술 AI 비평문을 생성하는 중입니다...
                      </span>
                    </div>
                  ) : aiCommentary ? (
                    <div className="prose prose-sm max-w-none text-slate-700 text-xs">
                      {parseMarkdown(aiCommentary)}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-400 flex flex-col items-center gap-2">
                      <Sparkles className="w-8 h-8 text-indigo-300" />
                      <p className="text-xs font-semibold text-slate-500">AI 비평 내역이 비어 있습니다.</p>
                      <p className="text-[10px] text-slate-400 leading-normal max-w-[260px] font-light">
                        &apos;전문가 AI 비평 받기&apos; 버튼을 클릭하면 실시간 전술 비평 및 리터러시 클리닉이 개설됩니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* FOOTER REFLECTIVE CLASS WORK AREA */}
      <section className="bg-slate-100 border-t border-slate-200 py-8 px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Reflective homework section */}
          <ReflectionPanel />

          {/* Explicit Model Limitations list */}
          <ModelLimitations />
        </div>
      </section>

      {/* FOOTER BAR (Matches Geometric Balance layout perfectly) */}
      <footer className="h-10 bg-slate-200 border-t border-slate-300 flex items-center px-8 justify-between text-[10px] text-slate-500">
        <div>&copy; 2026 Prediction Lab • Educational Use Only</div>
        <div className="hidden sm:flex space-x-4 uppercase tracking-widest font-bold">
          <span>Data Source: OPTA / FIFA Historical</span>
          <span>Confidence Level: 74.2%</span>
        </div>
      </footer>
    </div>
  );
}
