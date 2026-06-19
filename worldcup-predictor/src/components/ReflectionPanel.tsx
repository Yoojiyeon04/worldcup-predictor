import React, { useState, useEffect } from "react";
import { ReflectionQuestion } from "../types";
import { MessageSquare, Save, Eye, EyeOff, CheckCircle } from "lucide-react";

const INITIAL_QUESTIONS: ReflectionQuestion[] = [
  {
    id: "prob_35",
    question: "Q1. 확률 35%인 팀이 이기면 예측 모델은 정말 틀린 걸까요?",
    studentAnswer: "",
    guideAnswer:
      "아닙니다. 확률 35%는 대략 3경기 중 1경기는 실제로 일어남을 뜻하며 동전 뒤집기나 주사위 던지기처럼 스포츠 세계에서도 충분히 빈번하게 일어나는 사건입니다. 만약 35% 확률을 가진 팀이 이겼다고 해서 예측이 백퍼센트 '틀렸다'고 단정 짓는 것은 확률적 사고를 '단판 승부의 정답 맞히기(OX)'로 오해하는 이분법적 태도입니다. 참된 예측 모델은 언더독의 기적 같은 가능성도 스펙트럼 안에 온전히 표현할 수 있어야 합니다.",
  },
  {
    id: "evidence_vs_cheer",
    question: "Q2. 경기 예측에서 객관적인 '근거'와 주관적인 '응원'은 어떻게 구분해야 할까요?",
    studentAnswer: "",
    guideAnswer:
      "'근거'는 실제 관측 가능한 정량적 데이터(예: 패스 성공률, 슈팅 횟수, 김민재 선수의 출전력, 기후 고도 등)를 공정한 수식에 대입하는 것입니다. 반면 '응원'은 데이터와 무관하게 특정 팀의 승리 결과만을 염원해서 임의로 전력을 부풀리는 감정적 희망입니다. 과학적인 예측 모델링에서는 감정적 편향을 설계 단계에서 철저히 격리하며, 필요하다면 '홈 관중 응원 버프'처럼 실제 수치(역사적 홈 승률 격차 등)로 치환해 모델링해야 합니다.",
  },
  {
    id: "ai_trust",
    question: "Q3. AI가 '한국 승 80%'라고 매우 높은 수치로 자신 있게 추정했을 때, 우리는 이를 그냥 믿어도 될까요?",
    studentAnswer: "",
    guideAnswer:
      "결코 무조건 맹신해서는 안 됩니다. AI의 80% 추정은 오직 '해당 AI 모델에 주입된 데이터와 가중치 메카니즘 하에서의 계산 결과'일 뿐입니다. 만약 모델이 경기 중 돌발 변수(갑작스러운 퇴장, 심판 성향, 잔디 상태, 부상 이슈)를 고려할 수 없게 단순 설계되었다면, 80%라는 자신감은 극도의 과적합이나 단편적인 데이터 왜곡에서 비롯된 신기루일 수 있습니다. AI의 선언은 늘 비판적으로 질문되어야 합니다.",
  },
  {
    id: "first_show",
    question: "Q4. 더 좋은 예측 앱이 되기 위해, '최종 결과 확률'보다 먼저 사용자에게 투명하게 보여줘야 하는 것은 무엇일까요?",
    studentAnswer: "",
    guideAnswer:
      "자신들이 설계한 '기초 데이터 출처', '가중치 설계 원리(Assumptions)', 그리고 '이 모델이 가질 수밖에 없는 본질적인 한계점'을 먼저 명확히 보여줘야 합니다. 도출 과정의 비밀 장막을 걷어내고 논리 체계를 정직하게 관용하는 앱만이 사용자가 스스로 판단할 수 있는 이성적 도구로서의 가치를 가지기 때문입니다.",
  },
];

export function ReflectionPanel() {
  const [questions, setQuestions] = useState<ReflectionQuestion[]>(INITIAL_QUESTIONS);
  const [activeTab, setActiveTab] = useState<string>("prob_35");
  const [showGuide, setShowGuide] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Load answers from localStorage on mount
  useEffect(() => {
    try {
      const savedAnswers = localStorage.getItem("worldcup_prediction_reflection");
      if (savedAnswers) {
        const parsed = JSON.parse(savedAnswers) as Record<string, string>;
        setQuestions((prev) =>
          prev.map((q) => ({
            ...q,
            studentAnswer: parsed[q.id] || "",
          }))
        );
      }
    } catch (e) {
      console.error("Failed to load reflection answers", e);
    }
  }, []);

  const handleAnswerChange = (id: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, studentAnswer: text } : q))
    );
  };

  const handleSaveAnswers = () => {
    try {
      const answersMap: Record<string, string> = {};
      questions.forEach((q) => {
        answersMap[q.id] = q.studentAnswer;
      });
      localStorage.setItem("worldcup_prediction_reflection", JSON.stringify(answersMap));
      setSaveStatus("성공적으로 저장되었습니다!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      setSaveStatus("저장 중 오류 발생");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const toggleGuide = (id: string) => {
    setShowGuide((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentQ = questions.find((q) => q.id === activeTab) || questions[0];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">생각할 거리: 성찰과 에세이</h2>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-sm">
              <CheckCircle className="w-3.5 h-3.5" />
              {saveStatus}
            </span>
          )}
          <button
            onClick={handleSaveAnswers}
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-sm active:scale-95 transition-all cursor-pointer"
            id="btn-save-reflection"
          >
            <Save className="w-3.5 h-3.5" />
            작성 완료 후 저장
          </button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Navigation Tabs */}
        <div className="md:col-span-1 flex flex-col gap-1 border-r border-slate-200 pr-2">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setActiveTab(q.id)}
              className={`text-left text-xs p-2.5 rounded-sm transition-all font-semibold border ${
                activeTab === q.id
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs"
                  : "bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
              id={`tab-question-${q.id}`}
            >
              질문 {idx + 1}
              <div className="text-[10px] opacity-80 mt-1 truncate">{q.question.substring(4)}</div>
            </button>
          ))}
        </div>

        {/* Dynamic Detail Card */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-50 rounded-sm p-3.5 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">질문 상세 및 학습</h3>
            <p className="text-xs font-bold text-slate-800 leading-snug mt-1.5">{currentQ.question}</p>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1.5">
              나의 생각 쓰기 (수업 토론용):
            </label>
            <textarea
              value={currentQ.studentAnswer}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
              placeholder="여기에 자유롭게 당신의 논리적이고 솔직한 생각을 기록해 보세요. (예측의 본질, 확률의 의미, 감정 격리 방안 등)"
              className="w-full h-28 p-3 text-xs border border-slate-200 rounded-sm bg-slate-5/20 focus:outline-hidden focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all font-normal placeholder:text-slate-400 leading-relaxed resize-none text-slate-800"
              id={`textarea-${currentQ.id}`}
            />
          </div>

          <div className="border-t border-slate-200 pt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">데이터 과학 관점에서의 해설 포인트</span>
              <button
                onClick={() => toggleGuide(currentQ.id)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                id={`btn-toggle-guide-${currentQ.id}`}
              >
                {showGuide[currentQ.id] ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    해설 닫기
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    안내 해설 확인하기
                  </>
                )}
              </button>
            </div>

            {showGuide[currentQ.id] && (
              <div className="bg-indigo-50/40 border border-indigo-100 rounded-sm p-3.5 text-[11px] text-slate-600 leading-relaxed transition-all">
                <p className="font-bold text-indigo-700 mb-1 text-xs">💡 통계적 리터러시 클리닉:</p>
                {currentQ.guideAnswer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
