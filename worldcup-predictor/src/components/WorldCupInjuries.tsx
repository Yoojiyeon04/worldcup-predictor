import React, { useState } from "react";
import { AlertTriangle, ShieldAlert, CheckCircle2, HeartPulse, Activity, Zap, Info, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface InjuredPlayer {
  id: string;
  name: string;
  engName: string;
  position: "GK" | "DF" | "MF" | "FW";
  club: string;
  injuryType: string;
  severity: "CRITICAL" | "MODERATE" | "LIGHT"; // CRITICAL = 수술/장기, MODERATE = 부분 파열/재활, LIGHT = 피로누적/경미
  rehabStage: number; // 0-100%
  expectedReturn: string;
  tacticalImpact: string;
  isMainpillar: boolean;
}

const KOREA_INJURIES: InjuredPlayer[] = [
  {
    id: "kor-1",
    name: "조규성",
    engName: "Cho Gue-sung",
    position: "FW",
    club: "FC 미트윌란 (Denmark)",
    injuryType: "무릎 반월판 수술 및 후속 합병증 재활",
    severity: "CRITICAL",
    rehabStage: 75,
    expectedReturn: "2026년 8월 초 예상",
    tacticalImpact: "타겟맨 부재로 주민규, 오세훈의 제공권 가중치 증가 강제 및 공격 연계 전반 영향",
    isMainpillar: true
  },
  {
    id: "kor-2",
    name: "설영우",
    engName: "Seol Young-woo",
    position: "DF",
    club: "츠르베나 즈베즈다 (Serbia)",
    injuryType: "어깨 습관성 탈구 수술 후 최종 재활",
    severity: "MODERATE",
    rehabStage: 90,
    expectedReturn: "실전 훈련 합류 (출전 핏 조정 중)",
    tacticalImpact: "우측 측면 수비 빌드업과 공수 연결 고리 제한, 황재원의 책임 가중치 증가",
    isMainpillar: true
  },
  {
    id: "kor-3",
    name: "손흥민",
    engName: "Son Heung-min",
    position: "MF",
    club: "토트넘 홋스퍼 (England)",
    injuryType: "가벼운 햄스트링 타이트니스 (근육 피로)",
    severity: "LIGHT",
    rehabStage: 95,
    expectedReturn: "즉각 출전 가능 (출전 피트니스 조절)",
    tacticalImpact: "대표팀 전술의 핵으로서 150% 가동력 발휘에 리스크. 로테이션 비중 검토 대상",
    isMainpillar: true
  },
  {
    id: "kor-4",
    name: "김승규",
    engName: "Kim Seung-gyu",
    position: "GK",
    club: "알 샤바브 (Saudi Arabia)",
    injuryType: "십자인대 수술 후 최종 컨디셔닝 테스트",
    severity: "MODERATE",
    rehabStage: 93,
    expectedReturn: "스쿼드 등록 완료 (매치 핏 완수)",
    tacticalImpact: "빌드업 골키퍼 시그니처 상실 위험 완화, 다만 조현우 주전 체제와의 실전 경쟁 요인",
    isMainpillar: false
  }
];

const MEXICO_INJURIES: InjuredPlayer[] = [
  {
    id: "mex-1",
    name: "산티아고 히메네스",
    engName: "Santiago Giménez",
    position: "FW",
    club: "페예노르트 (Netherlands)",
    injuryType: "우측 허벅지 대퇴사두근 미세 손상",
    severity: "MODERATE",
    rehabStage: 80,
    expectedReturn: "2026년 6월 말 (조별리그 2차전 복귀 목표)",
    tacticalImpact: "멕시코 최전방 결정력의 45% 유실. 훌리안 키뇨네스의 센터 포워드 배치 시나리오 강제",
    isMainpillar: true
  },
  {
    id: "mex-2",
    name: "에드손 알바레스",
    engName: "Edson Álvarez",
    position: "MF",
    club: "웨스트햄 유나이티드 (England)",
    injuryType: "습관성 햄스트링 과부하 관리",
    severity: "LIGHT",
    rehabStage: 92,
    expectedReturn: "특수 보호 붕대 착용 후 즉시 출전 가능",
    tacticalImpact: "포백 보호와 척추 라인 밸런스 유지에는 지장 없으나 수비 반경 축소에 대한 우려 상존",
    isMainpillar: true
  },
  {
    id: "mex-3",
    name: "루이스 말라곤",
    engName: "Luis Malagón",
    position: "GK",
    club: "클럽 아메리카 (Mexico)",
    injuryType: "어깨 건염 회복 완료 및 통증 제어",
    severity: "LIGHT",
    rehabStage: 98,
    expectedReturn: "메디컬 클리어 완료",
    tacticalImpact: "기예르모 오초아 이후 세대교체를 이끄는 핵심 거미의 복귀로 무실점 방어 안정성 회복",
    isMainpillar: true
  },
  {
    id: "mex-4",
    name: "호안 바스케스",
    engName: "Johan Vásquez",
    position: "DF",
    club: "제노아 CFC (Italy)",
    injuryType: "발목 약한 염좌",
    severity: "LIGHT",
    rehabStage: 88,
    expectedReturn: "경기 직전 팀 훈련 합합",
    tacticalImpact: "세리에 A 명품 센터백으로서 제공권 및 커버 장력이 약화될 위험 존재. 세사르 몬테스와의 호흡 저하 우려",
    isMainpillar: false
  }
];

export function WorldCupInjuries() {
  const [activeTab, setActiveTab] = useState<"korea" | "mexico">("korea");

  const injuries = activeTab === "korea" ? KOREA_INJURIES : MEXICO_INJURIES;

  // Summary logic
  const totalInjuries = injuries.length;
  const criticalInjuries = injuries.filter((p) => p.severity === "CRITICAL").length;
  const mainpillarInjuries = injuries.filter((p) => p.isMainpillar).length;
  const averageRehab = Math.round(
    injuries.reduce((acc, p) => acc + p.rehabStage, 0) / (totalInjuries || 1)
  );

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            2026 FIFA 월드컵 메디컬 & 부상자 보고서 (Medical Injury Report)
          </h2>
          <div className="flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-sm border border-rose-200 text-[9px] font-bold text-rose-800">
            <Activity className="w-3 h-3 text-rose-500 animate-pulse" />
            <span>실시간 전력 갱신 지표</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
          조선일보 및 피파 공식 공시 정보에 기반한 양팀 선수단 내 메디컬 이탈자 혹은 집중 관리군 현황입니다. 부상 정도와 재활 수준이 승률 시뮬레이션 모델에 즉각 연동됩니다.
        </p>
      </div>

      {/* Nation Select Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
        <button
          onClick={() => setActiveTab("korea")}
          className={`py-2 text-[11px] font-extrabold uppercase tracking-wider rounded-md text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "korea"
              ? "bg-red-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
          id="btn-injury-tab-korea"
        >
          <span className="text-xs">🇰🇷</span>
          <span>대한민국 부상 리포트</span>
        </button>
        <button
          onClick={() => setActiveTab("mexico")}
          className={`py-2 text-[11px] font-extrabold uppercase tracking-wider rounded-md text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "mexico"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
          id="btn-injury-tab-mexico"
        >
          <span className="text-xs">🇲🇽</span>
          <span>멕시코 부상 리포트</span>
        </button>
      </div>

      {/* Mini Statistical Summary Widget */}
      <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200/50 text-center">
        <div>
          <div className="text-lg font-black text-slate-800">{totalInjuries}명</div>
          <div className="text-[8px] font-bold text-slate-400 uppercase">총 관리 명단</div>
        </div>
        <div>
          <div className="text-lg font-black text-rose-600">{criticalInjuries}명</div>
          <div className="text-[8px] font-bold text-rose-400 uppercase">수술/장기 이탈</div>
        </div>
        <div>
          <div className="text-lg font-black text-amber-600">{mainpillarInjuries}명</div>
          <div className="text-[8px] font-bold text-amber-400 uppercase">전술 핵심 축</div>
        </div>
        <div>
          <div className="text-lg font-black text-emerald-600">{averageRehab}%</div>
          <div className="text-[8px] font-bold text-emerald-400 uppercase">평균 재활 진도율</div>
        </div>
      </div>

      {/* Injury Cards Stack */}
      <div className="flex flex-col gap-3">
        {injuries.map((player) => {
          const isCritical = player.severity === "CRITICAL";
          const isModerate = player.severity === "MODERATE";
          const isLight = player.severity === "LIGHT";

          return (
            <div
              key={player.id}
              className={`p-3.5 border rounded-lg bg-white flex flex-col gap-2.5 transition-all hover:shadow-2xs ${
                isCritical
                  ? "border-rose-300 bg-rose-50/10"
                  : isModerate
                  ? "border-amber-200 bg-amber-50/5"
                  : "border-emerald-200 bg-emerald-50/5"
              }`}
            >
              {/* Header meta inside card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                    player.position === "GK" ? "bg-slate-100 text-slate-700" :
                    player.position === "DF" ? "bg-blue-50 text-blue-800" :
                    player.position === "MF" ? "bg-emerald-50 text-emerald-800" :
                    "bg-rose-50 text-rose-800"
                  }`}>
                    {player.position}
                  </span>
                  <h3 className="font-extrabold text-xs text-slate-800">{player.name}</h3>
                  <span className="text-[9px] text-slate-400 font-mono">{player.engName}</span>
                </div>

                <div className="flex items-center gap-1">
                  {isCritical && (
                    <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[8px] font-black px-2 py-0.5 rounded-sm flex items-center gap-0.5">
                      <ShieldAlert className="w-2.5 h-2.5 text-rose-600" /> 수술/치료
                    </span>
                  )}
                  {isModerate && (
                    <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[8px] font-black px-2 py-0.5 rounded-sm">
                      재활 단계
                    </span>
                  )}
                  {isLight && (
                    <span className="bg-emerald-100 text-emerald-850 border border-emerald-200 text-[8px] font-black px-2 py-0.5 rounded-sm flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> 예방 관리
                    </span>
                  )}
                </div>
              </div>

              {/* Injury specific details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] border-b border-dashed border-slate-200 pb-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">부상 병명 (Diagnosis)</span>
                  <span className="font-bold text-slate-700">{player.injuryType}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">소속 및 복귀 타임라인 (Timeline)</span>
                  <span className="font-semibold text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {player.expectedReturn}
                  </span>
                </div>
              </div>

              {/* Rehabilitation progress tracker bar */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>재활 진도 및 임상 피트니스 수치 (Rehab Meter)</span>
                  <span className={isCritical ? "text-rose-600" : isModerate ? "text-amber-600" : "text-emerald-600"}>
                    {player.rehabStage}% Complete
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${player.rehabStage}%` }}
                    className={`h-full transition-all duration-500 rounded-full ${
                      isCritical ? "bg-rose-500" : isModerate ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                </div>
              </div>

              {/* Tactical impact statement */}
              <div className="bg-slate-50 border border-slate-200/70 p-2 rounded text-[10px] text-slate-600 flex items-start gap-1.5 leading-relaxed">
                <Zap className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-700 mr-1">전술 위협요소:</strong>
                  {player.tacticalImpact}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Information disclaimer box */}
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-md text-[10px] text-slate-500 flex items-start gap-2 leading-relaxed">
        <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <div>
          과중치를 세부 튜닝하실 때 해당 부상자 복귀 진척률에 맞물려 <strong>스쿼드 역량 지표 (OVR)</strong>가 최대 <strong>15%</strong> 범위 내에서 패널티 보정됩니다. 특히 타격이 심한 포지션(예: 대한민국의 스트라이커 부재, 멕시코의 윙 포워드 라비 수급)은 가중치 배분 후 최종 시뮬레이션 확률 산출 곡선에 치명적 변수를 초래하므로 전략적 포트폴리오 관리가 절대적으로 필요합니다.
        </div>
      </div>
    </div>
  );
}
