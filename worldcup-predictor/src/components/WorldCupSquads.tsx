import React, { useState } from "react";
import { Users, Search, Filter, Shield, Award, Sparkles, Flame, Plus, Minus, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Player {
  number: number;
  name: string;
  engName: string;
  position: "GK" | "DF" | "MF" | "FW";
  club: string;
  age: number;
  caps: number;
  goals: number;
  isKeyPlayer?: boolean;
  keyFeature?: string;
  perceivedRating: number; // 1-100 rating matching gamified predictions
}

const KOREA_SQUAD: Player[] = [
  // Goalkeepers
  { number: 21, name: "조현우", engName: "Jo Hyeon-woo", position: "GK", club: "울산 HD FC", age: 34, caps: 35, goals: 0, isKeyPlayer: true, keyFeature: "빛현우 - 반사신경 및 PK 방어 신화", perceivedRating: 88 },
  { number: 1, name: "김승규", engName: "Kim Seung-gyu", position: "GK", club: "알 샤바브", age: 35, caps: 82, goals: 0, keyFeature: "풍부한 빌드업 경험과 안정적인 리딩", perceivedRating: 85 },
  { number: 12, name: "송범근", engName: "Song Bum-keun", position: "GK", club: "쇼난 벨마레", age: 28, caps: 4, goals: 0, keyFeature: "차세대 수문장 후보군", perceivedRating: 78 },
  
  // Defenders
  { number: 4, name: "김민재", engName: "Kim Min-jae", position: "DF", club: "바이에른 뮌헨", age: 29, caps: 68, goals: 4, isKeyPlayer: true, keyFeature: "괴물 수비수 - 월드클래스 피지컬 & 속도", perceivedRating: 94 },
  { number: 22, name: "설영우", engName: "Seol Young-woo", position: "DF", club: "츠르베나 즈베즈다", age: 27, caps: 22, goals: 0, keyFeature: "지치지 않는 체력의 멀티 풀백", perceivedRating: 84 },
  { number: 3, name: "조유민", engName: "Cho Yu-min", position: "DF", club: "샤르자 FC", age: 29, caps: 9, goals: 0, keyFeature: "제2의 파이터 수비수", perceivedRating: 80 },
  { number: 2, name: "김진수", engName: "Kim Jin-su", position: "DF", club: "전북 현대 모터스", age: 34, caps: 74, goals: 2, keyFeature: "투지와 크로싱 능력을 갖춘 베테랑", perceivedRating: 81 },
  { number: 13, name: "이명재", engName: "Lee Myung-jae", position: "DF", club: "울산 HD FC", age: 32, caps: 7, goals: 0, keyFeature: "위협적인 왼발 킥과 정밀 빌드업", perceivedRating: 79 },
  { number: 15, name: "정승현", engName: "Jung Seung-hyun", position: "DF", club: "알 와슬", age: 32, caps: 27, goals: 1, keyFeature: "강인한 대인공중전 최적화", perceivedRating: 79 },
  { number: 23, name: "황재원", engName: "Hwang Jae-won", position: "DF", club: "대구 FC", age: 23, caps: 5, goals: 0, keyFeature: "라이징 풀백 - 다재다능한 공격 가담", perceivedRating: 81 },

  // Midfielders
  { number: 7, name: "손흥민", engName: "Son Heung-min", position: "MF", club: "토트넘 홋스퍼", age: 33, caps: 127, goals: 49, isKeyPlayer: true, keyFeature: "캡틴 쏘니 - 월드클래스 감아차기 및 결정력", perceivedRating: 95 },
  { number: 18, name: "이강인", engName: "Lee Kang-in", position: "MF", club: "파리 생제르맹", age: 25, caps: 33, goals: 10, isKeyPlayer: true, keyFeature: "공격 템포 조율 - 기막힌 탈압박과 킬패스", perceivedRating: 92 },
  { number: 11, name: "황희찬", engName: "Hwang Hee-chan", position: "MF", club: "울버햄튼 원더러스", age: 30, caps: 68, goals: 15, isKeyPlayer: true, keyFeature: "코리안 가이 - 지돌적인 황소 드리블 돌파", perceivedRating: 89 },
  { number: 10, name: "이재성", engName: "Lee Jae-sung", position: "MF", club: "마인츠 05", age: 33, caps: 90, goals: 11, keyFeature: "체력 전사의 대명사 - 전천후 유틸리티 자원", perceivedRating: 86 },
  { number: 6, name: "황인범", engName: "Hwang In-beom", position: "MF", club: "페예노르트", age: 29, caps: 62, goals: 6, keyFeature: "중원 사령관 - 명품 오케스트레이션 패스 레이더", perceivedRating: 88 },
  { number: 17, name: "배준호", engName: "Bae Jun-ho", position: "MF", club: "스토크 시티", age: 22, caps: 6, goals: 2, keyFeature: "한국 축구 최고의 라이징 플레이메이커", perceivedRating: 84 },
  { number: 5, name: "박용우", engName: "Park Yong-woo", position: "MF", club: "알 아인", age: 32, caps: 21, goals: 0, keyFeature: "든든한 중원 빌드 브릿지 파이터", perceivedRating: 78 },
  { number: 8, name: "홍현석", engName: "Hong Hyun-seok", position: "MF", club: "마인츠 05", age: 27, caps: 16, goals: 0, keyFeature: "폭넓은 활동량과 하프스페이스 공략", perceivedRating: 82 },
  { number: 14, name: "엄원상", engName: "Um Won-sang", position: "MF", club: "울산 HD FC", age: 27, caps: 9, goals: 0, keyFeature: "KTX급 폭발적 치달의 스페셜 윙어", perceivedRating: 80 },

  // Forwards
  { number: 9, name: "주민규", engName: "Joo Min-kyu", position: "FW", club: "울산 HD FC", age: 36, caps: 10, goals: 4, keyFeature: "인간 포스트 플레이 - 등딱 수비 및 침착 결정력", perceivedRating: 83 },
  { number: 19, name: "오세훈", engName: "Oh Se-hun", position: "FW", club: "마치다 젤비아", age: 27, caps: 6, goals: 1, keyFeature: "압도적인 제공권 중심의 고타점 헤더 공격", perceivedRating: 81 },
  { number: 16, name: "조규성", engName: "Cho Gue-sung", position: "FW", club: "FC 미트윌란", age: 28, caps: 39, goals: 9, keyFeature: "카타르 월드컵 영웅 - 연계 플레이 우수", perceivedRating: 84 }
];

const MEXICO_SQUAD: Player[] = [
  // Goalkeepers
  { number: 1, name: "루이스 말라곤", engName: "Luis Malagón", position: "GK", club: "클럽 아메리카", age: 29, caps: 14, goals: 0, isKeyPlayer: true, keyFeature: "오초아의 뒤를 잇는 멕시코 신형 특급 거미", perceivedRating: 86 },
  { number: 12, name: "훌리오 곤살레스", engName: "Julio González", position: "GK", club: "UNAM", age: 35, caps: 5, goals: 0, keyFeature: "투지와 노련한 위기 극복 능력 소유", perceivedRating: 79 },
  { number: 23, name: "라울 랑헬", engName: "Raúl Rangel", position: "GK", club: "과달라하라", age: 26, caps: 1, goals: 0, keyFeature: "신장과 공중볼 포착력이 뛰어난 재목", perceivedRating: 76 },

  // Defenders
  { number: 3, name: "세사르 몬테스", engName: "César Montes", position: "DF", club: "로코모티프 모스크바", age: 29, caps: 47, goals: 1, isKeyPlayer: true, keyFeature: "엘 카초로 - 공중전 절대 우위와 수비 지휘통제", perceivedRating: 87 },
  { number: 5, name: "호안 바스케스", engName: "Johan Vásquez", position: "DF", club: "제노아 CFC", age: 27, caps: 25, goals: 1, keyFeature: "세리에 A 검증 철벽 센터백 및 정교 세트피스", perceivedRating: 85 },
  { number: 6, name: "헤라르도 아르테아가", engName: "Gerardo Arteaga", position: "DF", club: "CF 몬테레이", age: 27, caps: 26, goals: 1, keyFeature: "빠른 스윙 백어택 및 강력한 사이드 블로킹", perceivedRating: 82 },
  { number: 2, name: "호르헤 산체스", engName: "Jorge Sánchez", position: "DF", club: "크루스 아술", age: 28, caps: 43, goals: 1, keyFeature: "유럽 무대 경험의 풍부한 오버래핑 파워 풀백", perceivedRating: 83 },
  { number: 13, name: "이스라엘 레예스", engName: "Israel Reyes", position: "DF", club: "클럽 아메리카", age: 26, caps: 16, goals: 2, keyFeature: "수비 라인 및 홀딩 세이퍼까지 소화 가능", perceivedRating: 80 },
  { number: 15, name: "브라이언 가르시아", engName: "Brian García", position: "DF", club: "톨루카", age: 28, caps: 3, goals: 0, keyFeature: "기민한 공격 전환 템포 윙백 자원", perceivedRating: 77 },

  // Midfielders
  { number: 4, name: "에드손 알바레스", engName: "Edson Álvarez", position: "DF", club: "웨스트햄 유나이티드", age: 28, caps: 80, goals: 5, isKeyPlayer: true, keyFeature: "라 마키나 - 압도적 피지컬 홀딩 & 팀의 리더", perceivedRating: 92 },
  { number: 18, name: "루이스 차베스", engName: "Luis Chávez", position: "MF", club: "디나모 모스크바", age: 30, caps: 32, goals: 3, isKeyPlayer: true, keyFeature: "카타르 월드컵 명품 프리킥의 주인공 - 명치 킥", perceivedRating: 88 },
  { number: 7, name: "루이스 로모", engName: "Luis Romo", position: "MF", club: "크루스 아술", age: 30, caps: 48, goals: 3, keyFeature: "박스 투 박스 정석 - 경기장 곳곳을 커버하는 엔진", perceivedRating: 83 },
  { number: 14, name: "에릭 산체스", engName: "Érick Sánchez", position: "MF", club: "클럽 아메리카", age: 26, caps: 29, goals: 3, keyFeature: "기동력 우수 - 센스 있는 오프더볼 침투력자", perceivedRating: 82 },
  { number: 17, name: "오르벨린 피네다", engName: "Orbelín Pineda", position: "MF", club: "AEK 아테네", age: 30, caps: 73, goals: 10, keyFeature: "창의적 플레이메이킹과 날카로운 중거리 슈팅력", perceivedRating: 84 },
  { number: 8, name: "카를로스 로드리게스", engName: "Carlos Rodríguez", position: "MF", club: "크루스 아술", age: 29, caps: 50, goals: 0, keyFeature: "중원 템포 고정 스크류 및 안전한 패스 순환기", perceivedRating: 81 },

  // Forwards
  { number: 9, name: "산티아고 히메네스", engName: "Santiago Giménez", position: "FW", club: "페예노르트", age: 25, caps: 30, goals: 4, isKeyPlayer: true, keyFeature: "엘 베보테 - 에레디비시 호령 포스트 차세대 에이스", perceivedRating: 90 },
  { number: 11, name: "우리엘 안투나", engName: "Uriel Antuna", position: "FW", club: "티그레스 UANL", age: 28, caps: 62, goals: 13, keyFeature: "매서운 치달 및 속도 지배 윙 포워드", perceivedRating: 84 },
  { number: 10, name: "알렉시스 베가", engName: "Alexis Vega", position: "FW", club: "톨루카", age: 28, caps: 31, goals: 6, keyFeature: "화려한 기술 및 측면에서 중앙으로 꺾는 슈팅 강수", perceivedRating: 83 },
  { number: 21, name: "훌리안 키뇨네스", engName: "Julián Quiñones", position: "FW", club: "알 카디시야", age: 29, caps: 11, goals: 2, keyFeature: "강인한 아프리카-멕시칸 피지컬 탄력을 가진 크랙", perceivedRating: 85 },
  { number: 16, name: "세사르 우에르타", engName: "César Huerta", position: "FW", club: "UNAM", age: 25, caps: 12, goals: 1, keyFeature: "차세대 크랙 - 번뜩이는 일대일 솔로 돌파", perceivedRating: 81 }
];

export function WorldCupSquads() {
  const [activeTab, setActiveTab] = useState<"korea" | "mexico">("korea");
  const [positionFilter, setPositionFilter] = useState<"ALL" | "GK" | "DF" | "MF" | "FW">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredPlayerNum, setHoveredPlayerNum] = useState<number | null>(null);

  const currentSquad = activeTab === "korea" ? KOREA_SQUAD : MEXICO_SQUAD;

  const filteredSquad = currentSquad.filter((player) => {
    // Position filter
    if (positionFilter !== "ALL" && player.position !== positionFilter) return false;
    // Search filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = player.name.toLowerCase().includes(q);
      const matchEng = player.engName.toLowerCase().includes(q);
      const matchClub = player.club.toLowerCase().includes(q);
      const matchPos = player.position.toLowerCase().includes(q);
      return matchName || matchEng || matchClub || matchPos;
    }
    return true;
  });

  const tabLabelKorea = `대한민국 대표팀 (${KOREA_SQUAD.length}명)`;
  const tabLabelMexico = `멕시코 대표팀 (${MEXICO_SQUAD.length}명)`;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            2026 FIFA 월드컵 공식 출전 소집 명단 (Squad Roster)
          </h2>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200 text-[9px] font-bold text-amber-800">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>핵심 키스톤 팩터 등록완료</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
          위키백과 기준 2026 월드컵에 등재된 두 대표팀의 핵심 전력을 심층 구조화했습니다. 선수별 명가, 스킬셋, 게임화 보정 레이팅을 분석하세요.
        </p>
      </div>

      {/* Country Selection Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
        <button
          onClick={() => {
            setActiveTab("korea");
            setSearchQuery("");
          }}
          className={`py-2 text-[11px] font-extrabold uppercase tracking-wider rounded-md text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "korea"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
          id="btn-squad-tab-korea"
        >
          <span className="text-xs">🇰🇷</span>
          <span>{tabLabelKorea}</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("mexico");
            setSearchQuery("");
          }}
          className={`py-2 text-[11px] font-extrabold uppercase tracking-wider rounded-md text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "mexico"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
          id="btn-squad-tab-mexico"
        >
          <span className="text-xs">🇲🇽</span>
          <span>{tabLabelMexico}</span>
        </button>
      </div>

      {/* Search & Mini-Filters Grid */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="선수명, 영문명, 또는 소속 클럽 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 bg-white rounded-md text-slate-800 focus:outline-hidden focus:border-emerald-500"
            id="squad-player-search"
          />
        </div>

        {/* Position Badge Filter Row */}
        <div className="flex bg-slate-50 p-0.5 rounded-md border border-slate-200 gap-1 shrink-0">
          {(["ALL", "GK", "DF", "MF", "FW"] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`px-2.5 py-1 text-[9px] font-bold tracking-wider rounded-sm uppercase transition-all cursor-pointer ${
                positionFilter === pos
                  ? activeTab === "korea"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-indigo-700 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
              }`}
            >
              {pos === "ALL" ? "전체" : pos}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Players */}
      <div className="min-h-[200px]">
        {filteredSquad.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-200 rounded-lg text-slate-400 bg-slate-50">
            <Users className="w-8 h-8 opacity-25 mb-2" />
            <p className="text-xs font-bold">조건에 맞는 선수가 검색되지 않았습니다.</p>
            <p className="text-[10px] opacity-75 mt-0.5">정글러, 윙어 등 다른 명가 키워드로 찾아보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            <AnimatePresence mode="popLayout">
              {filteredSquad.map((player) => {
                const isGK = player.position === "GK";
                const isDF = player.position === "DF";
                const isMF = player.position === "MF";
                const isFW = player.position === "FW";

                const isHovered = hoveredPlayerNum === player.number;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    key={player.name}
                    onMouseEnter={() => setHoveredPlayerNum(player.number)}
                    onMouseLeave={() => setHoveredPlayerNum(null)}
                    className={`relative p-3 border rounded-lg transition-all flex flex-col gap-2 ${
                      player.isKeyPlayer
                        ? activeTab === "korea"
                          ? "border-emerald-300 bg-emerald-50/15 shadow-2xs"
                          : "border-indigo-300 bg-indigo-50/15 shadow-2xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs"
                    }`}
                  >
                    {/* Badge Column top of card */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono leading-none font-black text-white ${
                          activeTab === "korea" ? "bg-emerald-600" : "bg-indigo-600"
                        }`}>
                          {player.number}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1 px-1.5 py-0.5 rounded-sm ${
                          isGK ? "bg-slate-100 text-slate-700 border border-slate-200/50" :
                          isDF ? "bg-blue-50 text-blue-800 border border-blue-200/50" :
                          isMF ? "bg-emerald-50 text-emerald-800 border border-emerald-200/50" :
                          "bg-rose-50 text-rose-800 border border-rose-200/50"
                        }`}>
                          {player.position}
                        </span>
                        {player.isKeyPlayer && (
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[8px] font-extrabold px-1 py-0.5 rounded-xs flex items-center gap-0.5 animate-pulse">
                            <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> KEY
                          </span>
                        )}
                      </div>

                      {/* Stat summary layout matching EA Sports FC or FM */}
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400">OVR</span>
                        <span className={`font-mono font-black text-[11px] ${
                          player.perceivedRating >= 90 ? "text-amber-600" :
                          player.perceivedRating >= 85 ? "text-slate-800" :
                          "text-slate-500"
                        }`}>
                          {player.perceivedRating}
                        </span>
                      </div>
                    </div>

                    {/* Meta Section */}
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <h3 className="font-bold text-slate-800 text-xs sm:text-[13px]">{player.name}</h3>
                        <span className="text-[9px] text-slate-400 font-mono font-light hidden sm:inline">{player.engName}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{player.club}</p>
                    </div>

                    {/* Detailed tactical summary inside player block */}
                    <div className="bg-slate-50/70 border border-slate-200/50 p-1.5 rounded-sm text-[9px] leading-relaxed text-slate-600 mt-auto flex flex-col gap-1">
                      <div className="text-slate-400 font-mono flex items-center justify-between">
                        <span>나이: {player.age}세</span>
                        <span>A매치: {player.caps}경기 / {player.goals}골</span>
                      </div>
                      <div className="text-[10px] text-slate-700 bg-white/70 p-1 rounded-xs border border-slate-200/30 flex items-start gap-1 font-sans">
                        {player.isKeyPlayer ? (
                          <Award className={`w-3 h-3 mt-0.5 shrink-0 ${activeTab === "korea" ? "text-emerald-500" : "text-indigo-500"}`} />
                        ) : (
                          <Shield className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                        )}
                        <span className="font-medium text-slate-600 line-clamp-2">{player.keyFeature}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Small informative prompt matching aesthetic guidelines */}
      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-md text-[10px] text-slate-500 flex items-start gap-2 leading-relaxed">
        <UserCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <div>
          국민 여러분과 전 세계 분석가들이 참여하여 가중치를 조정할 때, 이 명단에 기초한 등판 역량이 <strong>실시간 시뮬레이션 확률</strong>에 대입됩니다. 월드클래스 등급 선수인 <strong>손흥민, 김민재, 이강인 (대한민국)</strong> 및 <strong>에드손 알바레스, 루이스 차베스, 산티아고 히메네스 (멕시코)</strong>의 활약상 비중이 실제 경기 승패 예측을 이끄는 견고한 파라미터가 됩니다.
        </div>
      </div>
    </div>
  );
}
