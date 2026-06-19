import React, { useState } from "react";
import { History, Trophy, Calendar, Sparkles, Filter, ChevronDown, ChevronUp } from "lucide-react";

interface MatchDetail {
  id: string;
  date: string;
  competition: string;
  score: string;
  winner: "Korea" | "Mexico" | "Draw";
  koreaGoals: string[];
  mexicoGoals: string[];
  description: string;
  highlightPlayer?: string;
  isWorldCup: boolean;
}

const HISTORICAL_MATCHES: MatchDetail[] = [
  {
    id: "match-2018",
    date: "2018년 6월 23일",
    competition: "2018 러시아 월드컵 조별리그 F조 2차전",
    score: "대한민국 1 : 2 멕시코",
    winner: "Mexico",
    koreaGoals: ["손흥민 90+3' (원더골)"],
    mexicoGoals: ["카를로스 벨라 26' (PK)", "하비에르 에르난데스 66'"],
    description: "손흥민 선수가 경기 후반 막판 환상적인 왼발 감아차기 만회골을 기록했으나, 카를로스 벨라에게 허용한 피케이 실점과 치차리토의 역습 골에 무릎을 꿇었습니다.",
    highlightPlayer: "손흥민",
    isWorldCup: true
  },
  {
    id: "match-2020",
    date: "2020년 11월 14일",
    competition: "국가대표 평가전 (A매치 친선경기)",
    score: "대한민국 2 : 3 멕시코",
    winner: "Mexico",
    koreaGoals: ["황의조 20'", "권경원 87'"],
    mexicoGoals: ["라울 히메네스 67'", "우리에 오르벨린 안투나 69'", "카를로스 살세도 70'"],
    description: "오스트리아에서 치러진 중립 친선매치입니다. 황의조 선수의 리얼 골로 먼저 득점했으나, 후반 수비진이 흔들리며 3분 동안 내리 3골을 허용해 한 골 차 패배를 당했습니다.",
    highlightPlayer: "황의조",
    isWorldCup: false
  },
  {
    id: "match-1998",
    date: "1998년 6월 13일",
    competition: "1998 프랑스 월드컵 조별리그 E조 1차전",
    score: "대한민국 1 : 3 멕시코",
    winner: "Mexico",
    koreaGoals: ["하석주 28' (프리킥)"],
    mexicoGoals: ["리카르도 펠라에스 50'", "루이스 에르난데스 75', 84'"],
    description: "대한민국 월드컵 역사상 첫 선제골을 터뜨렸던 경기입니다. 하석주 선수가 수비 벽 굴절 프리킥으로 선제골을 넣었으나, 2분 뒤 흥분으로 인한 백태클 퇴장을 당해 수적 열세 구도에서 멕시코의 루이스 에르난데스 등에게 역전 골 폭풍을 허용하며 눈물의 역전패를 당했습니다.",
    highlightPlayer: "하석주",
    isWorldCup: true
  },
  {
    id: "match-2014",
    date: "2014년 1월 29일",
    competition: "국가대표 평가전",
    score: "대한민국 0 : 4 멕시코",
    winner: "Mexico",
    koreaGoals: [],
    mexicoGoals: ["알란 풀리도 37', 58', 89'", "오리베 페랄타 40'"],
    description: "미국 샌안토니오에서 치러진 친선전에서 멕시코의 매서운 역습 전술과 알란 풀리도의 해트트릭 활약에 아쉬운 대패를 기록했습니다.",
    highlightPlayer: "알란 풀리도 (멕시코)",
    isWorldCup: false
  },
  {
    id: "match-2001",
    date: "2001년 6월 1일",
    competition: "2001 피파 컨페더레이션스컵 조별리그 A조",
    score: "대한민국 2 : 1 멕시코",
    winner: "Korea",
    koreaGoals: ["황선홍 56'", "유상철 90'"],
    mexicoGoals: ["빅토르 루이스 81'"],
    description: "유상철 선수가 코 부상(골절) 고통을 안고 경기 종료 직전 극적인 러닝 헤더 결승 골을 수확하며, 멕시코를 상대로 월드컵 카테고리(FIFA 공식 대회) 사상 첫 승리를 쟁취한 감동적인 드라마였습니다.",
    highlightPlayer: "유상철",
    isWorldCup: false
  },
  {
    id: "match-1948",
    date: "1948년 8월 2일",
    competition: "1948 런던 올림픽 8강전",
    score: "대한민국 5 : 3 멕시코",
    winner: "Korea",
    koreaGoals: ["최성곤 13'", "배종호 30'", "정국진 52', 67'", "정남식 77'"],
    mexicoGoals: ["카사린 8'", "루이스 15'", "코로나 85'"],
    description: "대한민국 축구 역사상 독립국 자격으로 진출했던 첫 공식 국제대회입니다. 당시 강호 멕시코를 상대로 소나기골 골잔치를 벌인 끝에 역사적인 5-3 대승을 연출하고 올림픽 4강 신화를 바라보는 최고 기록을 세웠습니다.",
    highlightPlayer: "정국진",
    isWorldCup: false
  }
];

export function WorldCupHistory() {
  const [filter, setFilter] = useState<"all" | "worldcup">("all");
  const [expandedId, setExpandedId] = useState<string | null>("match-2018");

  const filteredMatches = HISTORICAL_MATCHES.filter((m) => {
    if (filter === "worldcup") return m.isWorldCup;
    return true;
  });

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
            <History className="w-4 h-4 text-emerald-600" />
            대한민국 vs 멕시코 역대전적 (Head-to-Head)
          </h2>
          <div className="flex bg-slate-100 p-0.5 rounded-sm border border-slate-200">
            <button
              onClick={() => setFilter("all")}
              className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-xs transition-all ${
                filter === "all"
                  ? "bg-white text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/50"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              전체 매치
            </button>
            <button
              onClick={() => setFilter("worldcup")}
              className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-xs transition-all ${
                filter === "worldcup"
                  ? "bg-white text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/50"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              월드컵 전적
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
          위키백과 및 피파(FIFA) A매치 공식 기준 대한민국 vs 멕시코 통산 역대전적 국부 요약입니다.
        </p>
      </div>

      {/* Overview stats block (Aesthetic bento grid style matching Geometric Balance) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
        <div className="border-r border-slate-200/60 last:border-0">
          <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">통산 전적</p>
          <p className="text-base font-extrabold text-slate-800 mt-0.5">14전</p>
        </div>
        <div className="border-r border-slate-200/60 last:border-0 sm:border-r">
          <p className="text-[9px] uppercase tracking-wider font-bold text-emerald-600">대한민국 승</p>
          <p className="text-base font-extrabold text-emerald-600 mt-0.5">4승</p>
        </div>
        <div className="border-r border-slate-200/60 last:border-0">
          <p className="text-[9px] uppercase tracking-wider font-bold text-slate-500">무승부</p>
          <p className="text-base font-extrabold text-slate-600 mt-0.5">2무</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider font-bold text-indigo-600">멕시코 승</p>
          <p className="text-base font-extrabold text-indigo-600 mt-0.5">8패</p>
        </div>
      </div>

      {/* World Cup Only emphasis flag banner */}
      <div className="bg-amber-50/70 border border-amber-200/60 rounded-sm p-2.5 flex items-start gap-2">
        <Trophy className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-[10px] text-amber-800 leading-normal">
          <strong>⚠️ 핀포인트 월드컵 상대전적:</strong> 피파 월드컵 본선 무대에서는 <strong>2전 2패</strong>로 멕시코가 절대 강세를 보이고 있습니다. (1998년 1-3 패, 2018년 1-2 패). 평균 득점력을 뒤흔드는 핵심 데이터 셋으로서 예측 가중치를 설계할 때 강력한 역량 보정치로 참작되어야 합니다.
        </div>
      </div>

      {/* Interactive Match Timeline List */}
      <div className="flex flex-col gap-2">
        {filteredMatches.map((m) => {
          const isWinnerKorea = m.winner === "Korea";
          const isWinnerMexico = m.winner === "Mexico";
          const isDraw = m.winner === "Draw";

          return (
            <div
              key={m.id}
              className={`border rounded-md transition-all ${
                expandedId === m.id
                  ? "border-emerald-200 bg-emerald-50/10 shadow-xs"
                  : "border-slate-200 bg-white hover:bg-slate-50/60"
              }`}
            >
              <button
                onClick={() => toggleExpand(m.id)}
                className="w-full text-left p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 grow">
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 shrink-0">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {m.date}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {m.isWorldCup && (
                      <span className="bg-amber-100 text-amber-800 border border-amber-200 font-extrabold text-[8px] px-1 py-0.5 rounded-xs tracking-wider uppercase">
                        월드컵
                      </span>
                    )}
                    <span className="font-bold text-slate-800 text-[11px] sm:text-xs">
                      {m.competition}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200/50">
                    {m.score}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs shrink-0 ${
                      isWinnerKorea
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : m.winner === "Mexico"
                        ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {isWinnerKorea ? "한국 승" : isWinnerMexico ? "멕시코 승" : "무승부"}
                  </span>
                  {expandedId === m.id ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {expandedId === m.id && (
                <div className="px-3 pb-3 pt-1 border-t border-slate-100 text-[11px] text-slate-600 flex flex-col gap-2.5">
                  <p className="leading-relaxed font-light text-slate-600 p-2 bg-slate-50/50 rounded-sm border border-slate-100">
                    {m.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
                    <div>
                      <p className="font-bold text-slate-500 mb-1">🇰🇷 대한민국 득점 현역:</p>
                      {m.koreaGoals.length > 0 ? (
                        <ul className="list-disc pl-3.5 space-y-0.5 text-slate-700 font-mono">
                          {m.koreaGoals.map((g, idx) => (
                            <li key={idx}>{g}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-400 font-mono italic">득점 없음</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-500 mb-1">🇲🇽 멕시코 득점 현역:</p>
                      {m.mexicoGoals.length > 0 ? (
                        <ul className="list-disc pl-3.5 space-y-0.5 text-slate-700 font-mono">
                          {m.mexicoGoals.map((g, idx) => (
                            <li key={idx}>{g}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-400 font-mono italic">득점 없음</span>
                      )}
                    </div>
                  </div>

                  {m.highlightPlayer && (
                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-emerald-700 mt-0.5">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      <span>하이라이트 활약상: {m.highlightPlayer}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
