import React from "react";
import { AlertCircle, ShieldAlert, CheckSquare } from "lucide-react";

export function ModelLimitations() {
  return (
    <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-amber-200pb-2 pb-1.5">
        <AlertCircle className="w-5 h-5 text-amber-700" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">⚠️ 분석 모델의 본질적 한계 및 가정 (Model Limitations)</h3>
      </div>
      
      <p className="text-xs text-amber-800 leading-relaxed font-light">
        본 예측 도구는 입력된 가중치와 축구 요소 간의 정량적 Poisson 결합 분포만을 기계 계산하므로, 다음과 같은 <strong>실제 유동적 변수</strong>를 시뮬레이션에 포함하지 않습니다.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-white/95 border border-amber-150 rounded-sm p-3 flex gap-2.5">
          <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-800 text-xs">1. 통제 불가능한 경기 중 무한 변수</p>
            <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">
              특정 전반 초반 선수의 퇴장(레드카드), 시합 중 입는 심각한 돌발 부상, VAR 실시간 취소 판정, 날씨 악화로 인한 극심한 미끄러짐 등 90분 내에 일어나는 카오스적 변화량은 정량 가중치만으로 도표화할 수 없습니다.
            </p>
          </div>
        </div>

        <div className="bg-white/95 border border-amber-150 rounded-sm p-3 flex gap-2.5">
          <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-800 text-xs">2. 메인 매커니즘의 수학적 한계</p>
            <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">
              본 독립 Poisson 분포 공식은 축구의 &apos;선제골 획득 후 지키기 전술&apos; 또는 &apos;팀 사기 저하&apos; 등의 상호 연관적 피드백을 계산하지 않습니다. 실제 축구 데이터는 동적이며 한 팀의 골 득점은 매분 상대편의 득점력을 요동치게 만듭니다.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-amber-200 pt-3.5 flex flex-col gap-2">
        <div className="flex items-start gap-1.5 text-xs text-amber-950 font-bold uppercase tracking-wider">
          <CheckSquare className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <span>[수업 수칙 - 인간의 검증 의무] 실제 비즈니스 및 연구 적용 조건:</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed pl-5 font-light">
          본 예측 도구를 실제 프로젝트나 의사결정에 차용하기 전에, <strong>데이터 소스(Data Source)의 최신성 정보와 수학 모델의 단순 가정이 타당한지 인간 기획자의 직접 교차 검증</strong>이 선행되어야 하며 기계의 편향 여부를 직접 판독해 주시기 바랍니다. (예측은 기계가 정답을 보장하는 상자가 아닌, 근거를 탐색하는 구조입니다.)
        </p>
      </div>
    </div>
  );
}
